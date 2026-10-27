import { useEffect, useState } from "react";
import type { CardPublic } from "../../../api/loyalty";
import { joinAnswer, phoneProblem, type JoinAnswer } from "./joinRules";

const RESEND_SECONDS = 60;

/** What the customer typed. The page turns it into its own call's payload. */
export interface JoinDetails {
  /** Trimmed. */
  phone: string;
  name: string;
  birthday: string;
  optIn: boolean;
  /** Only when there is a code step. */
  code?: string;
}

/** The card a join handed back, with its public face already read. */
export interface Joined {
  serial: string;
  card: CardPublic;
  /** The friend's join's `already_member`; `/join` doesn't say. */
  alreadyMember?: boolean;
}

/**
 * Each page brings its own calls, so every payload stays exactly as
 * `docs/public-pages.md` lists it: `/join` asks by design id, the friend's
 * join by the member's token, with its device id.
 */
export interface JoinCalls {
  otpRequired: boolean;
  requestCode: (phone: string) => Promise<unknown>;
  join: (details: JoinDetails) => Promise<Joined>;
}

export type JoinStep =
  | { kind: "sign" }
  | { kind: "form" }
  | { kind: "code" }
  | { kind: "card"; joined: Joined }
  /** The sign comes back holding the answer: no button, nothing to type. */
  | { kind: "held"; answer: "dead" | "notTaking" };

export interface JoinErrors {
  phone?: string;
  code?: string;
  form?: string;
}

/**
 * The join, written once for `/join` and the friend's join: the sign, the
 * form, the code step when there is one, and the card. A change of state on
 * the same route, never a navigation, so the phone's Back leaves the page.
 * "Edit number" goes back to the form with everything still in it.
 *
 * `errors.seq` moves on every refusal, so a step can put focus on the field
 * that was refused even when the same refusal comes twice.
 */
export function useJoinFlow(calls: JoinCalls) {
  const [step, setStep] = useState<JoinStep>({ kind: "sign" });
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<JoinErrors & { seq: number }>({ seq: 0 });
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  function refuse(next: JoinErrors) {
    setErrors((e) => ({ ...next, seq: e.seq + 1 }));
  }

  function apply(answer: JoinAnswer) {
    if (answer.kind === "dead" || answer.kind === "notTaking") {
      setErrors((e) => ({ seq: e.seq }));
      setStep({ kind: "held", answer: answer.kind });
    } else if (answer.kind === "field" && answer.field === "phone") {
      setStep({ kind: "form" });
      refuse({ phone: answer.key });
    } else if (answer.kind === "field") {
      refuse({ code: answer.key });
    } else {
      refuse({ form: answer.key });
    }
  }

  async function join(withCode?: string) {
    setErrors((e) => ({ seq: e.seq }));
    setBusy(true);
    try {
      const joined = await calls.join({ phone: phone.trim(), name, birthday, optIn, code: withCode });
      setStep({ kind: "card", joined });
    } catch (err) {
      apply(joinAnswer(err));
    } finally {
      setBusy(false);
    }
  }

  async function sendCode(): Promise<boolean> {
    setErrors((e) => ({ seq: e.seq }));
    setBusy(true);
    try {
      await calls.requestCode(phone.trim());
      setCode("");
      setResendIn(RESEND_SECONDS);
      return true;
    } catch (err) {
      apply(joinAnswer(err));
      return false;
    } finally {
      setBusy(false);
    }
  }

  return {
    step,
    phone,
    setPhone,
    name,
    setName,
    birthday,
    setBirthday,
    optIn,
    setOptIn,
    code,
    setCode,
    busy,
    errors,
    resendIn,
    otpRequired: calls.otpRequired,
    /** The sign's "Join": the form takes its place. */
    open: () => setStep({ kind: "form" }),
    /** The form's submit: the phone checked here first, then a code, or
     * straight to the join when there is no code step (asking for a code
     * anyway would spend the number's allowance for nothing). */
    submitDetails: async () => {
      if (busy) return;
      const problem = phoneProblem(phone);
      if (problem) {
        refuse({ phone: problem });
        return;
      }
      if (!calls.otpRequired) {
        await join();
        return;
      }
      if (await sendCode()) setStep({ kind: "code" });
    },
    submitCode: async (value = code) => {
      if (busy) return;
      await join(value.trim());
    },
    resend: async () => {
      if (busy || resendIn > 0) return;
      await sendCode();
    },
    /** Back to the form, everything still in it. */
    editPhone: () => {
      setErrors((e) => ({ seq: e.seq }));
      setStep({ kind: "form" });
    },
  };
}

export type JoinFlow = ReturnType<typeof useJoinFlow>;
