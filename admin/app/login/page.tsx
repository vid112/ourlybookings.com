import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center p-5">
      <section className="w-full max-w-md rounded-[28px] border border-white/12 bg-surface p-8 shadow-2xl">
        <div className="grid size-14 place-items-center rounded-2xl border border-brand/40 bg-brand/10 text-brand">
          <ShieldCheck />
        </div>
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.16em] text-brand">
          Ourly Bookings
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Admin sign in</h1>
        <p className="mt-3 leading-7 text-muted">
          Access is restricted to authorized publishing, safety and analytics staff.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
