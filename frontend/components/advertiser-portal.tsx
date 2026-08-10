"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
const supportWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "");
const supportTelegram = process.env.NEXT_PUBLIC_TELEGRAM;
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

type User = { id: string; email: string; roles: string[] };
type City = { id: string; name: string; slug: string };
type State = { id: string; name: string; slug: string; cities: City[] };
type Country = { id: string; name: string; code: string; states: State[] };
type Category = { id: string; name: string; slug: string };
type Ad = {
  id: string;
  displayName: string;
  age: number;
  languages: string[];
  shortIntro: string;
  fullBio: string;
  nationality?: string;
  availability?: string;
  pricingNotes?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactTelegram?: string;
  contactEmail?: string;
  status: string;
  moderationStatus: string;
  paymentStatus: string;
  moderationMessage?: string;
  categories: { category: Category }[];
  locations: { city: City & { state: State } }[];
  media: { mediaId: string; media: { secureUrl: string; altText: string } }[];
};

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: options?.body instanceof FormData ? options.headers : { "content-type": "application/json", ...options?.headers },
  });
  const payload = (await response.json().catch(() => null)) as (T & { message?: string | string[] }) | null;
  if (!response.ok) {
    const message = Array.isArray(payload?.message) ? payload.message.join(", ") : payload?.message;
    throw new Error(message || `Request failed (${response.status})`);
  }
  return payload as T;
}

export function AdvertiserPortal({ dashboard = false }: { dashboard?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [options, setOptions] = useState<{ countries: Country[]; categories: Category[] }>({ countries: [], categories: [] });
  const [ads, setAds] = useState<Ad[]>([]);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  const refreshAds = async () => setAds(await api<Ad[]>("/advertiser/ads"));
  useEffect(() => {
    Promise.all([
      api<{ user: User }>("/auth/me").catch(() => null),
      api<{ countries: Country[]; categories: Category[] }>("/public/ad-options"),
    ]).then(async ([session, adOptions]) => {
      setOptions(adOptions);
      setUser(session?.user ?? null);
      if (session) await refreshAds().catch(() => setAds([]));
      setReady(true);
    }).catch((error) => {
      setLoadError(error instanceof Error ? error.message : "API is unavailable");
      setReady(true);
    });
  }, []);

  if (!ready) return <Panel>Loading advertiser account…</Panel>;
  if (loadError) return <Panel><h2 className="text-2xl font-bold">Advertiser service unavailable</h2><p className="mt-3 leading-7 text-muted">Backend API se connection nahi ho pa raha: {loadError}</p><button type="button" onClick={() => window.location.reload()} className="brand-gradient mt-6 rounded-xl px-6 py-3 font-bold">Retry</button></Panel>;
  if (!user) return <AuthPanel mode={authMode} setMode={setAuthMode} onAuthenticated={(next) => { setUser(next); void refreshAds(); }} />;

  if (dashboard && !editing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-2xl font-bold">My advertisements</h2><p className="mt-1 text-sm text-muted">{user.email}</p></div>
          <Link href="/post-ad" className="brand-gradient rounded-xl px-5 py-3 font-bold">Post a new ad</Link>
        </div>
        {message ? <Notice>{message}</Notice> : null}
        {ads.length ? ads.map((ad) => (
          <article key={ad.id} className="surface-border rounded-[20px] bg-surface p-5">
            <div className="flex flex-wrap gap-5">
              {ad.media[0] ? <Image src={ad.media[0].media.secureUrl} alt={ad.media[0].media.altText} width={96} height={112} className="h-28 w-24 rounded-xl object-cover" /> : <div className="h-28 w-24 rounded-xl bg-surface-2" />}
              <div className="min-w-[220px] flex-1">
                <h3 className="text-xl font-bold">{ad.displayName}, {ad.age}</h3>
                <p className="mt-1 text-sm text-muted">{ad.locations[0]?.city.name} · {ad.categories[0]?.category.name}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <Tag>{ad.moderationStatus}</Tag><Tag>Payment: {ad.paymentStatus}</Tag>
                </div>
                {ad.moderationMessage ? <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-muted">Admin: {ad.moderationMessage}</p> : null}
                {ad.moderationStatus === "REJECTED" || ad.paymentStatus === "PENDING" ? (
                  <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
                    {supportWhatsapp ? <a className="text-emerald-300" target="_blank" rel="noreferrer" href={`https://wa.me/${supportWhatsapp}`}>Contact WhatsApp</a> : null}
                    {supportTelegram ? <a className="text-sky-300" target="_blank" rel="noreferrer" href={supportTelegram.startsWith("http") ? supportTelegram : `https://t.me/${supportTelegram.replace(/^@/, "")}`}>Contact Telegram</a> : null}
                    {supportEmail ? <a className="text-brand" href={`mailto:${supportEmail}`}>Contact Email</a> : null}
                  </div>
                ) : null}
              </div>
              <div className="flex gap-2 self-start">
                {ad.status !== "PUBLISHED" ? <button onClick={() => setEditing(ad)} className="rounded-xl border border-white/15 px-4 py-2 font-bold">Edit</button> : null}
                <button onClick={async () => { if (!confirm("Delete this advertisement?")) return; await api(`/advertiser/ads/${ad.id}`, { method: "DELETE" }); await refreshAds(); setMessage("Advertisement deleted."); }} className="rounded-xl border border-brand/40 px-4 py-2 font-bold text-brand">Delete</button>
              </div>
            </div>
          </article>
        )) : <Panel>No advertisements yet. Create your first listing.</Panel>}
      </div>
    );
  }

  return (
    <AdForm
      options={options}
      existing={editing}
      busy={busy}
      message={message}
      onCancel={editing ? () => setEditing(null) : undefined}
      onSubmit={async (event) => {
        event.preventDefault(); setBusy(true); setMessage("");
        try {
          const form = new FormData(event.currentTarget);
          const body = {
            displayName: String(form.get("displayName")), age: Number(form.get("age")),
            cityId: String(form.get("cityId")), categoryId: String(form.get("categoryId")),
            languages: String(form.get("languages")).split(",").map((v) => v.trim()).filter(Boolean),
            shortIntro: String(form.get("shortIntro")), fullBio: String(form.get("fullBio")),
            nationality: String(form.get("nationality") || "") || undefined,
            availability: String(form.get("availability") || "") || undefined,
            pricingNotes: String(form.get("pricingNotes") || "") || undefined,
            contactPhone: String(form.get("contactPhone") || "") || undefined,
            contactWhatsapp: String(form.get("contactWhatsapp") || "") || undefined,
            contactTelegram: String(form.get("contactTelegram") || "") || undefined,
            contactEmail: String(form.get("contactEmail") || "") || undefined,
          };
          const ad = editing
            ? await api<Ad>(`/advertiser/ads/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) })
            : await api<Ad>("/advertiser/ads", { method: "POST", body: JSON.stringify(body) });
          const files = form.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
          for (const file of files) await uploadImage(ad.id, file, body.displayName);
          await api(`/advertiser/ads/${ad.id}/submit`, { method: "POST" });
          await refreshAds();
          setMessage("Advertisement admin approval ke liye submit ho gaya hai.");
          setEditing(null);
          event.currentTarget.reset();
        } catch (error) { setMessage(error instanceof Error ? error.message : "Submission failed"); }
        finally { setBusy(false); }
      }}
    />
  );
}

async function uploadImage(adId: string, file: File, altText: string) {
  const signed = await api<{ uploadUrl: string; apiKey: string; signature: string; timestamp: number; params: Record<string, string | number> }>("/admin/media/signature", {
    method: "POST", body: JSON.stringify({ resourceType: "image", folder: `profiles/${adId}/images` }),
  });
  const data = new FormData(); data.set("file", file); data.set("api_key", signed.apiKey); data.set("signature", signed.signature); data.set("timestamp", String(signed.timestamp));
  Object.entries(signed.params).forEach(([key, value]) => data.set(key, String(value)));
  const uploadedResponse = await fetch(signed.uploadUrl, { method: "POST", body: data });
  const uploaded = await uploadedResponse.json();
  if (!uploadedResponse.ok) throw new Error(uploaded?.error?.message || "Image upload failed");
  const media = await api<{ id: string }>("/admin/media/complete", { method: "POST", body: JSON.stringify({
    cloudinaryPublicId: uploaded.public_id, assetId: uploaded.asset_id, secureUrl: uploaded.secure_url,
    resourceType: "image", format: uploaded.format, width: uploaded.width, height: uploaded.height,
    bytes: uploaded.bytes, folder: uploaded.folder, version: String(uploaded.version), signature: uploaded.signature,
    altText: `${altText} advertisement image`,
  }) });
  await api(`/advertiser/ads/${adId}/media`, { method: "POST", body: JSON.stringify({ mediaId: media.id }) });
}

function AuthPanel({ mode, setMode, onAuthenticated }: { mode: "login" | "register"; setMode: (mode: "login" | "register") => void; onAuthenticated: (user: User) => void }) {
  const [view, setView] = useState<"login" | "register" | "verify" | "forgot" | "reset">(mode);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (!countdown) return;
    const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const switchView = (next: typeof view) => { setView(next); setMessage(""); };
  const title = view === "login" ? "Advertiser login" : view === "register" ? "Create advertiser account" : view === "verify" ? "Verify your email" : view === "forgot" ? "Forgot password" : "Reset password";

  return <Panel>
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Secure advertiser account</p>
    <h2 className="mt-2 text-2xl font-bold">{title}</h2>
    <p className="mt-2 text-muted">{view === "verify" ? `6-digit OTP ${email} par bheja gaya hai.` : view === "reset" ? `Password reset OTP ${email} par bheja gaya hai.` : "Verified account se ads aur photos manage karein."}</p>

    {view === "login" ? <form className="mt-6 grid gap-4" onSubmit={async (event) => { event.preventDefault(); setBusy(true); setMessage(""); const form = new FormData(event.currentTarget); const loginEmail = String(form.get("email")); setEmail(loginEmail); try { const result = await api<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email: loginEmail, password: form.get("password") }) }); onAuthenticated(result.user); } catch (error) { const text = error instanceof Error ? error.message : "Login failed"; setMessage(text); if (text.toLowerCase().includes("verification")) { setCountdown(0); setView("verify"); } } finally { setBusy(false); } }}>
      <Input name="email" label="Email" type="email" required />
      <Input name="password" label="Password" type="password" minLength={10} required />
      <button disabled={busy} className="brand-gradient min-h-12 rounded-xl px-5 font-bold disabled:opacity-60">{busy ? "Please wait…" : "Login"}</button>
      <button type="button" onClick={() => switchView("forgot")} className="text-sm font-bold text-brand">Forgot password?</button>
    </form> : null}

    {view === "register" ? <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={async (event) => { event.preventDefault(); setBusy(true); setMessage(""); const form = new FormData(event.currentTarget); const password = String(form.get("password")); const confirm = String(form.get("confirmPassword")); const registerEmail = String(form.get("email")); if (password !== confirm) { setMessage("Passwords do not match"); setBusy(false); return; } try { await api("/auth/register", { method: "POST", body: JSON.stringify({ firstName: form.get("firstName"), lastName: form.get("lastName"), email: registerEmail, mobile: form.get("mobile") || undefined, password, termsAccepted: form.get("termsAccepted") === "true" }) }); setEmail(registerEmail); setCountdown(60); setView("verify"); setMessage("OTP sent. Please check inbox and spam folder."); } catch (error) { setMessage(error instanceof Error ? error.message : "Registration failed"); } finally { setBusy(false); } }}>
      <Input name="firstName" label="First name" minLength={2} required />
      <Input name="lastName" label="Last name" minLength={1} required />
      <Input name="email" label="Email" type="email" required />
      <Input name="mobile" label="Mobile number (optional)" type="tel" />
      <Input name="password" label="Password" type="password" minLength={10} required />
      <Input name="confirmPassword" label="Confirm password" type="password" minLength={10} required />
      <label className="flex gap-3 text-sm leading-6 text-muted sm:col-span-2"><input type="checkbox" name="termsAccepted" value="true" required className="mt-1 size-4 accent-brand" /><span>I am 18+ and agree to the Terms, Privacy Policy and lawful-content rules.</span></label>
      <button disabled={busy} className="brand-gradient min-h-12 rounded-xl px-5 font-bold disabled:opacity-60 sm:col-span-2">{busy ? "Sending OTP…" : "Create account & send OTP"}</button>
    </form> : null}

    {view === "verify" ? <form className="mt-6 grid gap-4" onSubmit={async (event) => { event.preventDefault(); setBusy(true); setMessage(""); const form = new FormData(event.currentTarget); try { const result = await api<{ user: User }>("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, code: form.get("code"), purpose: "REGISTRATION" }) }); onAuthenticated(result.user); } catch (error) { setMessage(error instanceof Error ? error.message : "OTP verification failed"); } finally { setBusy(false); } }}>
      <Input name="code" label="6-digit OTP" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" required />
      <button disabled={busy} className="brand-gradient min-h-12 rounded-xl px-5 font-bold disabled:opacity-60">{busy ? "Verifying…" : "Verify & continue"}</button>
      <button type="button" disabled={countdown > 0 || busy} onClick={async () => { setBusy(true); setMessage(""); try { await api("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email, purpose: "REGISTRATION" }) }); setCountdown(60); setMessage("A new OTP has been sent."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not resend OTP"); } finally { setBusy(false); } }} className="text-sm font-bold text-brand disabled:text-muted">{countdown ? `Resend OTP in ${countdown}s` : "Resend OTP"}</button>
    </form> : null}

    {view === "forgot" ? <form className="mt-6 grid gap-4" onSubmit={async (event) => { event.preventDefault(); setBusy(true); setMessage(""); const form = new FormData(event.currentTarget); const resetEmail = String(form.get("email")); try { await api("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: resetEmail }) }); setEmail(resetEmail); setCountdown(60); setView("reset"); setMessage("If the account exists, a reset OTP has been sent."); } catch (error) { setMessage(error instanceof Error ? error.message : "Request failed"); } finally { setBusy(false); } }}>
      <Input name="email" label="Registered email" type="email" required />
      <button disabled={busy} className="brand-gradient min-h-12 rounded-xl px-5 font-bold disabled:opacity-60">{busy ? "Sending…" : "Send password reset OTP"}</button>
    </form> : null}

    {view === "reset" ? <form className="mt-6 grid gap-4" onSubmit={async (event) => { event.preventDefault(); setBusy(true); setMessage(""); const form = new FormData(event.currentTarget); const password = String(form.get("password")); if (password !== String(form.get("confirmPassword"))) { setMessage("Passwords do not match"); setBusy(false); return; } try { await api("/auth/reset-password", { method: "POST", body: JSON.stringify({ email, code: form.get("code"), purpose: "PASSWORD_RESET", password }) }); setView("login"); setMessage("Password reset successful. You can now login."); } catch (error) { setMessage(error instanceof Error ? error.message : "Password reset failed"); } finally { setBusy(false); } }}>
      <Input name="code" label="6-digit reset OTP" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" required />
      <Input name="password" label="New password" type="password" minLength={10} required />
      <Input name="confirmPassword" label="Confirm new password" type="password" minLength={10} required />
      <button disabled={busy} className="brand-gradient min-h-12 rounded-xl px-5 font-bold disabled:opacity-60">{busy ? "Resetting…" : "Reset password"}</button>
      <button type="button" disabled={countdown > 0 || busy} onClick={async () => { setBusy(true); setMessage(""); try { await api("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email, purpose: "PASSWORD_RESET" }) }); setCountdown(60); setMessage("A new password reset OTP has been sent."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not resend OTP"); } finally { setBusy(false); } }} className="text-sm font-bold text-brand disabled:text-muted">{countdown ? `Resend OTP in ${countdown}s` : "Resend reset OTP"}</button>
    </form> : null}

    {message ? <Notice>{message}</Notice> : null}
    {view === "login" || view === "register" ? <button className="mt-5 text-sm font-bold text-brand" onClick={() => { const next = view === "login" ? "register" : "login"; setMode(next); switchView(next); }}>{view === "login" ? "New advertiser? Create account" : "Already registered? Login"}</button> : <button className="mt-5 text-sm font-bold text-brand" onClick={() => switchView("login")}>Back to login</button>}
  </Panel>;
}

function AdForm({ options, existing, busy, message, onSubmit, onCancel }: { options: { countries: Country[]; categories: Category[] }; existing: Ad | null; busy: boolean; message: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel?: () => void }) {
  const initialStateId = existing?.locations[0]?.city.state.id ?? options.countries[0]?.states[0]?.id ?? "";
  const [stateId, setStateId] = useState(initialStateId);
  const [step, setStep] = useState(1);
  const [stepMessage, setStepMessage] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const states = options.countries[0]?.states ?? [];
  const cities = states.find((state) => state.id === stateId)?.cities ?? [];
  const steps = ["Category & location", "Profile details", "Contact details", "Photos & review"];

  const nextStep = () => {
    const section = document.querySelector<HTMLElement>(`[data-ad-step="${step}"]`);
    const fields = Array.from(section?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea") ?? []);
    for (const field of fields) {
      if (!field.checkValidity()) { field.reportValidity(); return; }
    }
    if (step === 3 && !fields.some((field) => field.value.trim())) {
      setStepMessage("Phone, WhatsApp, Telegram ya email mein se kam se kam ek contact method bharein.");
      return;
    }
    setStepMessage("");
    setStep((value) => Math.min(4, value + 1));
  };

  return <form onSubmit={onSubmit} className="surface-border rounded-[24px] bg-surface p-6 sm:p-8">
    <div className="mb-7 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Step {step} of 4</p><h2 className="mt-2 text-2xl font-bold">{steps[step - 1]}</h2><p className="mt-1 text-sm text-muted">Ad publish hone se pehle admin review karega.</p></div>{onCancel ? <button type="button" onClick={onCancel} className="text-sm font-bold text-brand">Cancel</button> : null}</div>
    <div className="mb-8 grid grid-cols-4 gap-2" aria-label="Advertisement progress">
      {steps.map((label, index) => <button key={label} type="button" onClick={() => index + 1 < step && setStep(index + 1)} className={`rounded-xl border px-2 py-3 text-left text-xs font-bold ${index + 1 <= step ? "border-brand/50 bg-brand/10 text-paper" : "border-white/10 text-muted"}`}><span className="block text-brand">{index + 1}</span><span className="hidden sm:block">{label}</span></button>)}
    </div>

    <section data-ad-step="1" className={step === 1 ? "grid gap-5 sm:grid-cols-2" : "hidden"}>
      <label><Label>Country</Label><select className={fieldClass} disabled><option>India</option></select></label>
      <label><Label>Advertisement category</Label><select name="categoryId" className={fieldClass} defaultValue={existing?.categories[0]?.category.id} required><option value="">Choose category</option>{options.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label><Label>State</Label><select className={fieldClass} value={stateId} onChange={(event) => setStateId(event.target.value)} required>{states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}</select></label>
      <label><Label>City</Label><select name="cityId" className={fieldClass} defaultValue={existing?.locations[0]?.city.id} required><option value="">Choose city</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label>
    </section>

    <section data-ad-step="2" className={step === 2 ? "space-y-5" : "hidden"}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="displayName" label="Ad title / profile name" defaultValue={existing?.displayName} required minLength={2} maxLength={100} />
        <Input name="age" label="Age (18+)" type="number" defaultValue={existing?.age} required min={18} max={99} />
        <Input name="languages" label="Languages (comma separated)" defaultValue={existing?.languages.join(", ")} required placeholder="Hindi, English" />
        <Input name="nationality" label="Nationality" defaultValue={existing?.nationality} placeholder="Indian" />
        <Input name="availability" label="Availability" defaultValue={existing?.availability} placeholder="Available daily, 10 AM–10 PM" />
        <Input name="pricingNotes" label="Rates / pricing information" defaultValue={existing?.pricingNotes} placeholder="Add rates or ask users to contact you" />
      </div>
      <TextArea name="shortIntro" label="Short headline/intro" defaultValue={existing?.shortIntro} minLength={20} maxLength={500} rows={3} placeholder="Short summary shown on listing cards" />
      <TextArea name="fullBio" label="Complete advertisement description" defaultValue={existing?.fullBio} minLength={50} maxLength={10000} rows={7} placeholder="Describe the advertisement, availability, rules and relevant details" />
    </section>

    <section data-ad-step="3" className={step === 3 ? "grid gap-5 sm:grid-cols-2" : "hidden"}>
      <Input name="contactPhone" label="Phone number" type="tel" defaultValue={existing?.contactPhone} placeholder="+91…" />
      <Input name="contactWhatsapp" label="WhatsApp number" type="tel" defaultValue={existing?.contactWhatsapp} placeholder="+91…" />
      <Input name="contactTelegram" label="Telegram username/link" defaultValue={existing?.contactTelegram} placeholder="@username" />
      <Input name="contactEmail" label="Public contact email" type="email" defaultValue={existing?.contactEmail} placeholder="contact@example.com" />
      <p className="sm:col-span-2 text-sm leading-6 text-muted">Visitors ko sirf wahi contact options dikhaye jayenge jo aap yahan bharte hain.</p>
    </section>

    <section data-ad-step="4" className={step === 4 ? "space-y-6" : "hidden"}>
      <label className="block"><Label>Photos (1–8, JPG/PNG/WebP)</Label><input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required={!existing?.media.length} className={`${fieldClass} py-3`} onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length > 8) { event.target.value = ""; setPhotoPreviews([]); setStepMessage("Maximum 8 photos upload kar sakte hain."); return; } setStepMessage(""); setPhotoPreviews(files.map((file) => URL.createObjectURL(file))); }} /></label>
      {existing?.media.length || photoPreviews.length ? <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">{existing?.media.map((item) => <Image key={item.mediaId} src={item.media.secureUrl} alt={item.media.altText} width={160} height={190} className="aspect-[4/5] w-full rounded-xl object-cover" />)}{photoPreviews.map((url) => <Image key={url} src={url} alt="Selected advertisement preview" width={160} height={190} unoptimized className="aspect-[4/5] w-full rounded-xl object-cover" />)}</div> : null}
      <div className="rounded-2xl border border-white/12 bg-surface-2 p-5"><h3 className="font-bold">Final review</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-muted"><li>• Location and category determine where the ad appears.</li><li>• Admin checks details, images, consent and payment status.</li><li>• Approval ke baad ad automatically city/state pages par publish hoga.</li><li>• Rejection ya changes request ka reason My Ads dashboard mein milega.</li></ul></div>
      <label className="flex gap-3 text-sm leading-6 text-muted"><input type="checkbox" required className="mt-1 size-4 accent-brand" /><span>I confirm I am 18+, this ad is lawful, and I own or have written permission for every submitted detail and image.</span></label>
    </section>

    {stepMessage ? <Notice>{stepMessage}</Notice> : null}
    {message ? <Notice>{message}</Notice> : null}
    <div className="mt-8 flex flex-wrap justify-between gap-3">
      {step > 1 ? <button type="button" onClick={() => { setStepMessage(""); setStep((value) => value - 1); }} className="min-h-12 rounded-xl border border-white/15 px-6 font-bold">Back</button> : <span />}
      {step < 4 ? <button type="button" onClick={nextStep} className="brand-gradient min-h-12 rounded-xl px-7 font-bold">Continue</button> : <button disabled={busy} className="brand-gradient min-h-13 rounded-xl px-7 font-bold disabled:opacity-60">{busy ? "Uploading and submitting…" : "Submit ad for approval"}</button>}
    </div>
  </form>;
}

const fieldClass = "min-h-12 w-full rounded-xl border border-white/15 bg-surface-2 px-4 text-paper";
function Label({ children }: { children: React.ReactNode }) { return <span className="mb-2 block text-sm font-bold">{children}</span>; }
function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { const { label, ...rest } = props; return <label><Label>{label}</Label><input {...rest} className={fieldClass} /></label>; }
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) { const { label, ...rest } = props; return <label className="mt-5 block"><Label>{label}</Label><textarea {...rest} required className={`${fieldClass} py-3`} /></label>; }
function Panel({ children }: { children: React.ReactNode }) { return <div className="surface-border rounded-[24px] bg-surface p-6 sm:p-8">{children}</div>; }
function Notice({ children }: { children: React.ReactNode }) { return <p className="mt-5 rounded-xl border border-white/15 bg-surface-2 p-4 text-sm text-muted">{children}</p>; }
function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-white/8 px-3 py-1">{children}</span>; }
