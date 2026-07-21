"use client";

import { LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/lib/site";

type FormKind = "contact" | "post-ad" | "report";

export function SubmissionForm({ kind }: { kind: FormKind }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const endpoint = kind === "report" ? "public/content-reports" : "public/leads";

  return (
    <form
      className="surface-border rounded-[24px] bg-surface p-6 sm:p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus("submitting");
        const form = new FormData(event.currentTarget);
        const payload = Object.fromEntries(form.entries());
        const requestBody =
          kind === "report"
            ? payload
            : {
                ...payload,
                type: kind === "post-ad" ? "AD_SUBMISSION" : "ENQUIRY",
                sourcePage: window.location.pathname,
              };
        try {
          const response = await fetch(`${siteConfig.apiUrl}/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
          if (!response.ok) throw new Error("Submission failed");
          event.currentTarget.reset();
          setStatus("success");
        } catch {
          setStatus("error");
        }
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field
          label={kind === "report" ? "Email" : "Phone or WhatsApp"}
          name={kind === "report" ? "email" : "phone"}
          type={kind === "report" ? "email" : "tel"}
          required
        />
        {kind !== "report" ? (
          <Field label="City" name="city" required />
        ) : (
          <Field label="Page or profile URL" name="reportedUrl" type="url" required />
        )}
        {kind === "post-ad" ? <Field label="Profile category" name="category" required /> : null}
      </div>
      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-bold text-paper">
          {kind === "report"
            ? "Why should this content be reviewed?"
            : kind === "post-ad"
              ? "Tell us about your lawful advertisement"
              : "How can we help?"}
        </span>
        <textarea
          name="message"
          required
          minLength={20}
          rows={6}
          className="w-full rounded-xl border border-white/15 bg-surface-2 px-4 py-3 text-paper placeholder:text-muted/60"
          placeholder="Provide enough detail for our team to respond."
        />
      </label>
      <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-muted">
        <input
          type="checkbox"
          name="consent"
          value="true"
          required
          className="mt-1 size-4 accent-brand"
        />
        <span>
          {kind === "post-ad"
            ? "I confirm that I am 18+, the advertisement is lawful, and I own or have written permission to use every submitted detail and media file."
            : "I agree to the privacy policy and consent to this submission being processed for support and safety purposes."}
        </span>
      </label>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="brand-gradient mt-7 inline-flex min-h-13 items-center justify-center gap-2 rounded-xl px-7 font-bold disabled:opacity-60"
      >
        {status === "submitting" ? (
          <LoaderCircle className="animate-spin" size={19} />
        ) : (
          <Send size={19} />
        )}
        {kind === "report"
          ? "Submit report"
          : kind === "post-ad"
            ? "Submit for review"
            : "Send enquiry"}
      </button>
      {status === "success" ? (
        <p
          role="status"
          className="mt-5 flex items-center gap-2 rounded-xl border border-success/35 bg-success/10 p-4 text-sm text-success"
        >
          <ShieldCheck size={18} /> Your submission was securely received.
        </p>
      ) : null}
      {status === "error" ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-brand/35 bg-brand/10 p-4 text-sm text-paper"
        >
          The API could not receive this submission. Please try again after the backend is running
          or use the configured support contact.
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-paper">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="min-h-12 w-full rounded-xl border border-white/15 bg-surface-2 px-4 text-paper placeholder:text-muted/60"
      />
    </label>
  );
}
