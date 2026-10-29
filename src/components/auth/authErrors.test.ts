import { describe, expect, it } from "vitest";
import { ApiError } from "../../api/errors";
import { authErrorKey, signUpEmailProblem } from "./authErrors";

const passwordSignIn = { mode: "signin", method: "password" } as const;
const passwordSignUp = { mode: "signup", method: "password" } as const;
const googleSignIn = { mode: "signin", method: "google" } as const;
const googleSignUp = { mode: "signup", method: "google" } as const;

describe("authErrorKey", () => {
  it("says a password sign-in's 401 is the email or the password, or Google", () => {
    expect(authErrorKey(new ApiError(401, "Invalid email or password"), passwordSignIn)).toBe(
      "auth.wrongDetails",
    );
    expect(
      authErrorKey(
        new ApiError(401, "This account signs in with Google or Apple. Use that option instead."),
        passwordSignIn,
      ),
    ).toBe("auth.wrongDetails");
  });

  it("never calls Google's refused token a wrong password", () => {
    expect(authErrorKey(new ApiError(401, "Invalid token"), googleSignIn)).toBe("auth.error");
    expect(authErrorKey(new ApiError(401, "Invalid token"), googleSignUp)).toBe("auth.signUpError");
  });

  it("names a weak password only from its code", () => {
    expect(
      authErrorKey(new ApiError(422, "This password is too common.", "weak_password"), passwordSignUp),
    ).toBe("auth.weakPassword");
    expect(authErrorKey(new ApiError(422, "Unprocessable Entity"), passwordSignUp)).toBe(
      "auth.signUpError",
    );
  });

  it("keeps the registered address, the throttle and the offline line", () => {
    const taken = new ApiError(409, "Email already registered", "email_already_registered");
    expect(authErrorKey(taken, passwordSignUp)).toBe("onboarding.account.alreadyRegistered");
    expect(authErrorKey(new ApiError(429, "Too many requests"), passwordSignIn)).toBe(
      "onboarding.account.throttled",
    );
    expect(authErrorKey(new TypeError("Failed to fetch"), passwordSignIn)).toBe("auth.offline");
  });

  it("falls back to the mode's own generic line, never the server's words", () => {
    expect(authErrorKey(new ApiError(500, "Internal server error"), passwordSignIn)).toBe("auth.error");
    expect(authErrorKey(new ApiError(500, "Internal server error"), passwordSignUp)).toBe(
      "auth.signUpError",
    );
    expect(authErrorKey(new Error("boom"), googleSignIn)).toBe("auth.error");
  });
});

describe("signUpEmailProblem", () => {
  it("takes an address with a name, an @ and a domain with a dot", () => {
    expect(signUpEmailProblem("roee@gmail.com")).toBeNull();
    expect(signUpEmailProblem("first.last+billing@sub.example.co.il")).toBeNull();
    expect(signUpEmailProblem("  a@b.co  ")).toBeNull();
  });

  it("refuses the typos an account can't come back from", () => {
    expect(signUpEmailProblem("roee@gmail")).toBe("auth.emailIncomplete");
    expect(signUpEmailProblem("roee.gmail.com")).toBe("auth.emailIncomplete");
    expect(signUpEmailProblem("roee@gmail.")).toBe("auth.emailIncomplete");
    expect(signUpEmailProblem("roee@.com")).toBe("auth.emailIncomplete");
    expect(signUpEmailProblem("roee @gmail.com")).toBe("auth.emailIncomplete");
    expect(signUpEmailProblem("")).toBe("auth.emailIncomplete");
  });
});
