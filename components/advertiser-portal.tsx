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
    });
  }, []);

  if (!ready) return <Panel>Loading advertiser account…</Panel>;
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
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  return <Panel><h2 className="text-2xl font-bold">{mode === "login" ? "Advertiser login" : "Create advertiser account"}</h2>
    <p className="mt-2 text-muted">Login ke baad aap ads aur photos manage kar sakte hain.</p>
    <form className="mt-6 grid gap-4" onSubmit={async (event) => { event.preventDefault(); setBusy(true); setMessage(""); const form = new FormData(event.currentTarget); try { const result = await api<{ user: User }>(`/auth/${mode}`, { method: "POST", body: JSON.stringify({ displayName: form.get("displayName"), email: form.get("email"), password: form.get("password") }) }); onAuthenticated(result.user); } catch (error) { setMessage(error instanceof Error ? error.message : "Authentication failed"); } finally { setBusy(false); } }}>
      {mode === "register" ? <Input name="displayName" label="Display name" minLength={2} required /> : null}
      <Input name="email" label="Email" type="email" required /><Input name="password" label="Password" type="password" minLength={10} required />
      <button disabled={busy} className="brand-gradient min-h-12 rounded-xl px-5 font-bold disabled:opacity-60">{busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}</button>
    </form>{message ? <Notice>{message}</Notice> : null}
    <button className="mt-5 text-sm font-bold text-brand" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "New advertiser? Create account" : "Already registered? Login"}</button>
  </Panel>;
}

function AdForm({ options, existing, busy, message, onSubmit, onCancel }: { options: { countries: Country[]; categories: Category[] }; existing: Ad | null; busy: boolean; message: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel?: () => void }) {
  const initialStateId = existing?.locations[0]?.city.state.id ?? options.countries[0]?.states[0]?.id ?? "";
  const [stateId, setStateId] = useState(initialStateId);
  const states = options.countries[0]?.states ?? [];
  const cities = states.find((state) => state.id === stateId)?.cities ?? [];
  return <form onSubmit={onSubmit} className="surface-border rounded-[24px] bg-surface p-6 sm:p-8">
    <div className="mb-7 flex items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">{existing ? "Edit advertisement" : "Advertisement details"}</h2><p className="mt-1 text-sm text-muted">All fields are reviewed before publication.</p></div>{onCancel ? <button type="button" onClick={onCancel} className="text-sm font-bold text-brand">Cancel</button> : null}</div>
    <div className="grid gap-5 sm:grid-cols-2">
      <Input name="displayName" label="Profile/display name" defaultValue={existing?.displayName} required minLength={2} />
      <Input name="age" label="Age (18+)" type="number" defaultValue={existing?.age} required min={18} max={99} />
      <label><Label>Country</Label><select className={fieldClass} disabled><option>India</option></select></label>
      <label><Label>State</Label><select className={fieldClass} value={stateId} onChange={(e) => setStateId(e.target.value)} required>{states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}</select></label>
      <label><Label>City</Label><select name="cityId" className={fieldClass} defaultValue={existing?.locations[0]?.city.id} required><option value="">Choose city</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label>
      <label><Label>Category</Label><select name="categoryId" className={fieldClass} defaultValue={existing?.categories[0]?.category.id} required><option value="">Choose category</option>{options.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <Input name="languages" label="Languages (comma separated)" defaultValue={existing?.languages.join(", ")} required />
      <Input name="nationality" label="Nationality" defaultValue={existing?.nationality} />
      <Input name="contactPhone" label="Phone" type="tel" defaultValue={existing?.contactPhone} />
      <Input name="contactWhatsapp" label="WhatsApp" type="tel" defaultValue={existing?.contactWhatsapp} />
      <Input name="contactTelegram" label="Telegram username/link" defaultValue={existing?.contactTelegram} />
      <Input name="contactEmail" label="Public contact email" type="email" defaultValue={existing?.contactEmail} />
      <Input name="availability" label="Availability" defaultValue={existing?.availability} />
      <Input name="pricingNotes" label="Pricing notes" defaultValue={existing?.pricingNotes} />
    </div>
    <TextArea name="shortIntro" label="Short introduction" defaultValue={existing?.shortIntro} minLength={20} rows={3} />
    <TextArea name="fullBio" label="Full advertisement" defaultValue={existing?.fullBio} minLength={50} rows={7} />
    <label className="mt-5 block"><Label>Photos (up to 8, JPG/PNG/WebP)</Label><input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required={!existing?.media.length} className={`${fieldClass} py-3`} /></label>
    <label className="mt-5 flex gap-3 text-sm leading-6 text-muted"><input type="checkbox" required className="mt-1 size-4 accent-brand" /><span>I confirm I am 18+, this ad is lawful, and I own or have written permission for every detail and image.</span></label>
    {message ? <Notice>{message}</Notice> : null}
    <button disabled={busy} className="brand-gradient mt-7 min-h-13 rounded-xl px-7 font-bold disabled:opacity-60">{busy ? "Uploading and submitting…" : "Save & send for approval"}</button>
  </form>;
}

const fieldClass = "min-h-12 w-full rounded-xl border border-white/15 bg-surface-2 px-4 text-paper";
function Label({ children }: { children: React.ReactNode }) { return <span className="mb-2 block text-sm font-bold">{children}</span>; }
function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { const { label, ...rest } = props; return <label><Label>{label}</Label><input {...rest} className={fieldClass} /></label>; }
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) { const { label, ...rest } = props; return <label className="mt-5 block"><Label>{label}</Label><textarea {...rest} required className={`${fieldClass} py-3`} /></label>; }
function Panel({ children }: { children: React.ReactNode }) { return <div className="surface-border rounded-[24px] bg-surface p-6 sm:p-8">{children}</div>; }
function Notice({ children }: { children: React.ReactNode }) { return <p className="mt-5 rounded-xl border border-white/15 bg-surface-2 p-4 text-sm text-muted">{children}</p>; }
function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-white/8 px-3 py-1">{children}</span>; }
