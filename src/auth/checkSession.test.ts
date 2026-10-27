import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/errors";
import { checkSession } from "./checkSession";

const owner = { id: 7, email: "owner@example.test" };
type Owner = typeof owner;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function start(read: () => Promise<Owner>, { online = true } = {}) {
  const events = new EventTarget();
  let isOnline = online;
  const calls = {
    onUser: vi.fn(),
    onEnded: vi.fn(),
    onUnreachable: vi.fn(),
    onTrying: vi.fn(),
  };
  const check = checkSession({ read, ...calls, events, isOnline: () => isOnline });
  const goOnline = () => {
    isOnline = true;
    events.dispatchEvent(new Event("online"));
  };
  return { ...calls, check, goOnline };
}

/** A read whose every try stays out until the test answers it. */
function heldRead() {
  const tries: { answer: (user: Owner) => void; fail: (failure: unknown) => void }[] = [];
  const read = vi.fn(
    () =>
      new Promise<Owner>((answer, fail) => {
        tries.push({ answer, fail });
      }),
  );
  return { read, tries };
}

const offline = () => new TypeError("Failed to fetch");

describe("checkSession", () => {
  it("hands over the user when the server answers, and asks no more", async () => {
    const read = vi.fn(async () => owner);
    const { onUser, onEnded, onUnreachable } = start(read);

    await vi.advanceTimersByTimeAsync(120_000);
    expect(onUser).toHaveBeenCalledWith(owner);
    expect(onEnded).not.toHaveBeenCalled();
    expect(onUnreachable).not.toHaveBeenCalled();
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("ends on a 401 and never tries again", async () => {
    const read = vi.fn().mockRejectedValue(new ApiError(401, "Token is blacklisted"));
    const { onEnded, onUnreachable } = start(read);

    await vi.advanceTimersByTimeAsync(120_000);
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(onUnreachable).not.toHaveBeenCalled();
    expect(read).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["no answer", offline()],
    ["a request cut off", new DOMException("The user aborted a request.", "AbortError")],
    ["the throttle's 429", new ApiError(429, "Too many requests.")],
    ["a 500", new ApiError(500, "Internal Server Error")],
  ])("keeps the session through %s, and tries again at 5 s", async (_, failure) => {
    const read = vi.fn().mockRejectedValue(failure);
    const { onUnreachable, onEnded } = start(read);

    await vi.advanceTimersByTimeAsync(0);
    expect(onUnreachable).toHaveBeenCalled();
    expect(onEnded).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(4_999);
    expect(read).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(read).toHaveBeenCalledTimes(2);
  });

  it("lets the pages stop waiting after 4 s with no answer", async () => {
    const { onUnreachable, onTrying } = start(() => new Promise(() => {}));
    expect(onTrying).toHaveBeenLastCalledWith(true);

    await vi.advanceTimersByTimeAsync(3_999);
    expect(onUnreachable).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onUnreachable).toHaveBeenCalledTimes(1);
    expect(onTrying).toHaveBeenLastCalledWith(false);
  });

  it("still takes a user who answers after the 4 s", async () => {
    const { read, tries } = heldRead();
    const { onUser, onUnreachable } = start(read);

    await vi.advanceTimersByTimeAsync(4_500);
    expect(onUnreachable).toHaveBeenCalled();
    tries[0].answer(owner);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(onUser).toHaveBeenCalledWith(owner);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("doesn't let a try it gave up on move the next one when it fails late", async () => {
    const { read, tries } = heldRead();
    start(read);

    // Given up on at 4 s, so the next try is due at 9 s.
    await vi.advanceTimersByTimeAsync(6_000);
    tries[0].fail(offline());
    await vi.advanceTimersByTimeAsync(2_999);
    expect(read).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(read).toHaveBeenCalledTimes(2);
  });

  it("tries again at 5, 10, 20 and 40 s, then every 60 s", async () => {
    const read = vi.fn().mockRejectedValue(offline());
    start(read);
    await vi.advanceTimersByTimeAsync(0);
    expect(read).toHaveBeenCalledTimes(1);

    const waits: [number, number][] = [
      [5_000, 2],
      [10_000, 3],
      [20_000, 4],
      [40_000, 5],
      [60_000, 6],
      [60_000, 7],
    ];
    for (const [wait, tries] of waits) {
      await vi.advanceTimersByTimeAsync(wait - 1);
      expect(read, `before try ${tries}`).toHaveBeenCalledTimes(tries - 1);
      await vi.advanceTimersByTimeAsync(1);
      expect(read, `try ${tries}`).toHaveBeenCalledTimes(tries);
    }
  });

  it("makes no tries on the clock while offline, and one at once when the browser is back", async () => {
    const read = vi.fn().mockRejectedValue(offline());
    const { goOnline } = start(read, { online: false });

    await vi.advanceTimersByTimeAsync(300_000);
    expect(read).toHaveBeenCalledTimes(1);
    goOnline();
    expect(read).toHaveBeenCalledTimes(2);
  });

  it("tries at once on retry() and starts the waits over, one try at a time", async () => {
    const { read, tries } = heldRead();
    const { check } = start(read);
    tries[0].fail(offline());
    await vi.advanceTimersByTimeAsync(5_000);
    tries[1].fail(offline());
    // The second failure puts the next try 10 s away, at 15 s.
    await vi.advanceTimersByTimeAsync(3_000);

    check.retry();
    expect(read).toHaveBeenCalledTimes(3);
    check.retry();
    expect(read).toHaveBeenCalledTimes(3);

    tries[2].fail(offline());
    await vi.advanceTimersByTimeAsync(4_999);
    expect(read).toHaveBeenCalledTimes(3);
    await vi.advanceTimersByTimeAsync(1);
    expect(read).toHaveBeenCalledTimes(4);

    // At 13 s; the try that was due at 15 s went with the retry.
    tries[3].fail(offline());
    await vi.advanceTimersByTimeAsync(2_000);
    expect(read).toHaveBeenCalledTimes(4);
    await vi.advanceTimersByTimeAsync(8_000);
    expect(read).toHaveBeenCalledTimes(5);
  });

  it("reports nothing after cancel()", async () => {
    const { read, tries } = heldRead();
    const { check, onUser, onUnreachable, onTrying, goOnline } = start(read);
    check.cancel();
    onTrying.mockClear();

    tries[0].answer(owner);
    await vi.advanceTimersByTimeAsync(300_000);
    goOnline();
    await vi.advanceTimersByTimeAsync(0);
    expect(onUser).not.toHaveBeenCalled();
    expect(onUnreachable).not.toHaveBeenCalled();
    expect(onTrying).not.toHaveBeenCalled();
    expect(read).toHaveBeenCalledTimes(1);
  });
});
