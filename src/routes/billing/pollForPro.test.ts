import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pollForPro } from "./pollForPro";

const free = { plan: "free" };
const pro = { plan: "pro" };

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function wait(
  read: () => Promise<{ plan: string }>,
  confirm: () => Promise<{ plan: string } | null> = async () => pro,
) {
  const onPro = vi.fn();
  const onGiveUp = vi.fn();
  const cancel = pollForPro({ read, confirm, onPro, onGiveUp });
  return { onPro, onGiveUp, cancel };
}

describe("pollForPro", () => {
  it("gives up at 30 s on the clock, even while a try never answers", async () => {
    const { onPro, onGiveUp } = wait(() => new Promise(() => {}));
    await vi.advanceTimersByTimeAsync(29_999);
    expect(onGiveUp).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onGiveUp).toHaveBeenCalledWith({ unreachable: true });
    expect(onPro).not.toHaveBeenCalled();
  });

  it("tries again 2 s after a try that failed", async () => {
    const read = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    wait(read);
    await vi.advanceTimersByTimeAsync(0);
    expect(read).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(2_000);
    expect(read).toHaveBeenCalledTimes(2);
  });

  it("says the checks couldn't get through when the last one failed", async () => {
    const { onGiveUp } = wait(vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await vi.advanceTimersByTimeAsync(30_000);
    expect(onGiveUp).toHaveBeenCalledWith({ unreachable: true });
  });

  it("says Stripe is late, not that it couldn't check, when every read answered Free", async () => {
    const { onGiveUp } = wait(vi.fn().mockResolvedValue(free));
    await vi.advanceTimersByTimeAsync(30_000);
    expect(onGiveUp).toHaveBeenCalledWith({ unreachable: false });
  });

  it("hands over once the subscription and then the business read Pro", async () => {
    const read = vi.fn().mockResolvedValueOnce(free).mockResolvedValueOnce(free).mockResolvedValue(pro);
    const confirm = vi.fn().mockResolvedValue(pro);
    const { onPro, onGiveUp } = wait(read, confirm);
    await vi.advanceTimersByTimeAsync(4_000);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(onPro).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(read).toHaveBeenCalledTimes(3);
    expect(onGiveUp).not.toHaveBeenCalled();
  });

  it("counts a business read that failed as a failed try", async () => {
    const { onPro, onGiveUp } = wait(vi.fn().mockResolvedValue(pro), vi.fn().mockResolvedValue(null));
    await vi.advanceTimersByTimeAsync(30_000);
    expect(onPro).not.toHaveBeenCalled();
    expect(onGiveUp).toHaveBeenCalledWith({ unreachable: true });
  });

  it("lets a try that answers after the wait ended change nothing", async () => {
    let answer: (value: { plan: string }) => void = () => {};
    const confirm = vi.fn().mockResolvedValue(pro);
    const { onPro, onGiveUp } = wait(() => new Promise((resolve) => (answer = resolve)), confirm);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(onGiveUp).toHaveBeenCalledTimes(1);
    answer(pro);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(confirm).not.toHaveBeenCalled();
    expect(onPro).not.toHaveBeenCalled();
  });

  it("stops everything once cancelled, a try already out included", async () => {
    let answer: (value: { plan: string }) => void = () => {};
    const confirm = vi.fn().mockResolvedValue(pro);
    const { onPro, onGiveUp, cancel } = wait(() => new Promise((resolve) => (answer = resolve)), confirm);
    cancel();
    answer(pro);
    await vi.advanceTimersByTimeAsync(40_000);
    expect(confirm).not.toHaveBeenCalled();
    expect(onPro).not.toHaveBeenCalled();
    expect(onGiveUp).not.toHaveBeenCalled();
  });
});
