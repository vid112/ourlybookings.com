"use client";

import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setState("loading");
        const form = new FormData(event.currentTarget);
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
        }).catch(() => null);
        if (!response?.ok) {
          setState("error");
          return;
        }
        router.push("/");
        router.refresh();
      }}
    >
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="min-h-12 w-full rounded-xl border border-white/15 bg-surface-2 px-4"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={12}
          required
          className="min-h-12 w-full rounded-xl border border-white/15 bg-surface-2 px-4"
        />
      </label>
      <button
        disabled={state === "loading"}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 font-bold disabled:opacity-60"
      >
        {state === "loading" ? (
          <LoaderCircle className="animate-spin" size={18} />
        ) : (
          <LockKeyhole size={18} />
        )}{" "}
        Sign in securely
      </button>
      {state === "error" ? (
        <p role="alert" className="rounded-xl border border-brand/40 bg-brand/10 p-4 text-sm">
          Sign-in failed. Check the API, email and password.
        </p>
      ) : null}
    </form>
  );
}
