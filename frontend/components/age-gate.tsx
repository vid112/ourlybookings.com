"use client";

import { ShieldCheck } from "lucide-react";
import { useSyncExternalStore } from "react";

const consentKey = "ourly_age_consent_v1";

export function AgeGate() {
  const accepted = useSyncExternalStore(
    (notify) => {
      window.addEventListener("ourly-age-consent", notify);
      return () => window.removeEventListener("ourly-age-consent", notify);
    },
    () => window.sessionStorage.getItem(consentKey) === "accepted",
    () => false,
  );

  if (accepted) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="surface-border w-full max-w-lg rounded-[28px] bg-surface p-7 shadow-2xl sm:p-10">
        <div className="mb-7 grid size-14 place-items-center rounded-2xl border border-gold/35 bg-gold/10 text-gold">
          <ShieldCheck aria-hidden="true" />
        </div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-brand">Adults only</p>
        <h2
          id="age-gate-title"
          className="font-display text-3xl font-bold tracking-[-0.04em] text-paper"
        >
          Please confirm before you continue
        </h2>
        <p className="mt-4 leading-7 text-muted">
          I confirm that I am 18 or above and agree to view adult classifieds. Profiles are
          independently managed, and all lawful arrangements require informed consent between
          adults.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              window.sessionStorage.setItem(consentKey, "accepted");
              window.dispatchEvent(new Event("ourly-age-consent"));
            }}
            className="brand-gradient rounded-xl px-5 py-3.5 font-bold text-white"
          >
            I am 18+
          </button>
          <a
            href="https://www.google.com"
            className="rounded-xl border border-white/15 px-5 py-3.5 text-center font-bold text-muted hover:text-paper"
          >
            Exit website
          </a>
        </div>
        <p className="mt-5 text-xs leading-5 text-muted">
          By entering, you also agree to our Terms, Privacy Policy and Content Policy.
        </p>
      </div>
    </div>
  );
}
