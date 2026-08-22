"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeIndianRupee,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Crown,
  Eye,
  EyeOff,
  FileText,
  LogOut,
  PlusCircle,
  QrCode,
  Sparkles,
  Upload,
  WalletCards,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
const supportWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "");
const supportTelegram = process.env.NEXT_PUBLIC_TELEGRAM;
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
const paymentQrUrl = process.env.NEXT_PUBLIC_PAYMENT_QR_URL || "/images/payment-qr.jpeg";
const paymentUpiId = process.env.NEXT_PUBLIC_PAYMENT_UPI_ID || "7317097363@pthdfc";
const paymentAccountName = process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME || "Abhishek Kumar Pandey";

type User = { id: string; email: string; displayName?: string; roles: string[] };
type Area = { id: string; name: string; slug: string };
type City = { id: string; name: string; slug: string; areas: Area[] };
type State = { id: string; name: string; slug: string; cities: City[]; country?: Country };
type Country = { id: string; name: string; code: string; slug: string; states: State[] };
type Category = { id: string; name: string; slug: string; description?: string; imageUrl?: string };
type Service = { id: string; name: string; slug: string };
type DashboardData = {
  user: {
    id: string;
    displayName: string;
    email: string;
    mobile?: string;
    emailVerifiedAt?: string;
    mobileVerifiedAt?: string;
    credits: number;
    createdAt: string;
  };
  counts: { active: number; expired: number; unpublished: number };
};
type Ad = {
  id: string;
  adTitle?: string;
  displayName: string;
  age: number;
  gender?: string;
  ethnicity?: string;
  languages: string[];
  shortIntro: string;
  fullBio: string;
  nationality?: string;
  eyeColor?: string;
  hairColor?: string;
  weightKg?: number;
  heightCm?: number;
  bodyType?: string;
  bust?: string;
  attentionTo?: string;
  placeOfService?: string;
  availability?: string;
  availabilitySlots: string[];
  pricingNotes?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactTelegram?: string;
  contactEmail?: string;
  status: string;
  moderationStatus: string;
  paymentStatus: string;
  promotionPlan?: "PRIME" | "VIP" | "HIGHLIGHT";
  promotionAmount: number;
  promotionDurationDays: number;
  promotionWindow?: string;
  paymentProofMediaId?: string;
  paymentProofUrl?: string;
  paymentReference?: string;
  paymentSubmittedAt?: string;
  paymentVerifiedAt?: string;
  moderationMessage?: string;
  categories: { category: Category }[];
  services: { service: Service }[];
  locations: { city: City & { state: State & { country: Country } }; area?: Area }[];
  media: { mediaId: string; media: { secureUrl: string; altText: string } }[];
};
type AdOptions = { countries: Country[]; categories: Category[]; services: Service[] };

const apiTimeoutMessage =
  "Backend response nahi de raha. Please kuch seconds baad dobara try karein.";

async function api<T>(path: string, options?: RequestInit, timeoutMs = 15_000): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const externalSignal = options?.signal;
  const abortFromCaller = () => controller.abort();
  externalSignal?.addEventListener("abort", abortFromCaller, { once: true });

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers:
        options?.body instanceof FormData
          ? options.headers
          : { "content-type": "application/json", ...options?.headers },
    });
  } catch {
    if (controller.signal.aborted) throw new Error(apiTimeoutMessage);
    throw new Error("Backend API se connection nahi ho pa raha. Please dobara try karein.");
  } finally {
    window.clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", abortFromCaller);
  }
  const payload = (await response.json().catch(() => null)) as
    (T & { message?: string | string[] }) | null;
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Bahut zyada attempts ho gaye. Kuch minutes wait karke dobara try karein.");
    }
    const message = Array.isArray(payload?.message) ? payload.message.join(", ") : payload?.message;
    if (response.status >= 500) {
      throw new Error("Backend service temporarily unavailable hai. Please dobara try karein.");
    }
    throw new Error(message || `Request failed (${response.status})`);
  }
  return payload as T;
}

export function AdvertiserPortal({ dashboard = false }: { dashboard?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [ready, setReady] = useState(false);
  const [options, setOptions] = useState<AdOptions>({
    countries: [],
    categories: [],
    services: [],
  });
  const [ads, setAds] = useState<Ad[]>([]);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [optionsReady, setOptionsReady] = useState(false);
  const [busy, setBusy] = useState(false);
  // Keep an unsuccessfully submitted draft so a retry does not create duplicate ads.
  const pendingAdId = useRef<string | null>(null);

  const refreshAccount = async () => {
    const [nextAds, nextDashboard] = await Promise.all([
      api<Ad[]>("/advertiser/ads"),
      api<DashboardData>("/advertiser/dashboard"),
    ]);
    setAds(nextAds);
    setDashboardData(nextDashboard);
  };

  useEffect(() => {
    let active = true;

    void api<AdOptions>("/public/ad-options", undefined, 10_000)
      .then((adOptions) => {
        if (!active) return;
        setOptions(adOptions);
        setOptionsReady(true);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "API is unavailable");
        setOptionsReady(true);
      });

    void api<{ user: User }>("/auth/me", undefined, 5_000)
      .catch(() => null)
      .then((session) => {
        if (!active) return;
        setUser(session?.user ?? null);
        setReady(true);
        if (session) void refreshAccount().catch(() => undefined);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!ready) return <Panel>Loading advertiser account…</Panel>;
  if (user && loadError) {
    return (
      <Panel>
        <h2 className="text-2xl font-bold">Advertiser service unavailable</h2>
        <p className="mt-3 leading-7 text-muted">Backend API connection failed: {loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="brand-gradient mt-6 rounded-xl px-6 py-3 font-bold"
        >
          Retry
        </button>
      </Panel>
    );
  }
  if (!user) {
    return (
      <AuthPanel
        onAuthenticated={(next) => {
          setUser(next);
          void refreshAccount();
        }}
      />
    );
  }

  if (!optionsReady) return <Panel>Preparing your ad form…</Panel>;

  if (dashboard && !editing) {
    return (
      <Dashboard
        data={dashboardData}
        ads={ads}
        message={message}
        onEdit={setEditing}
        onDelete={async (ad) => {
          if (!confirm(`Delete ${ad.displayName}'s advertisement?`)) return;
          await api(`/advertiser/ads/${ad.id}`, { method: "DELETE" });
          await refreshAccount();
          setMessage("Advertisement deleted.");
        }}
        onLogout={async () => {
          await api("/auth/logout", { method: "POST" });
          setUser(null);
          setAds([]);
          setDashboardData(null);
        }}
      />
    );
  }

  return (
    <AdForm
      options={options}
      existing={editing}
      busy={busy}
      message={message}
      onCancel={editing ? () => setEditing(null) : undefined}
      onSubmit={async (event, turnstileToken) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        setBusy(true);
        setMessage("");
        try {
          const form = new FormData(formElement);
          const optionalNumber = (name: string) => {
            const value = String(form.get(name) ?? "").trim();
            return value ? Number(value) : undefined;
          };
          const optionalText = (name: string) => String(form.get(name) ?? "").trim() || undefined;
          const body = {
            adTitle: optionalText("adTitle"),
            displayName: String(form.get("displayName")),
            age: Number(form.get("age")),
            cityId: String(form.get("cityId")),
            areaId: optionalText("areaId"),
            categoryId: String(form.get("categoryId")),
            serviceIds: form.getAll("serviceIds").map(String),
            availabilitySlots: form.getAll("availabilitySlots").map(String),
            languages: String(form.get("languages"))
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
            shortIntro: String(form.get("shortIntro")),
            fullBio: String(form.get("fullBio")),
            gender: optionalText("gender"),
            ethnicity: optionalText("ethnicity"),
            nationality: optionalText("nationality"),
            eyeColor: optionalText("eyeColor"),
            hairColor: optionalText("hairColor"),
            weightKg: optionalNumber("weightKg"),
            heightCm: optionalNumber("heightCm"),
            bodyType: optionalText("bodyType"),
            bust: optionalText("bust"),
            attentionTo: optionalText("attentionTo"),
            placeOfService: optionalText("placeOfService"),
            availability: optionalText("availability"),
            pricingNotes: optionalText("pricingNotes"),
            contactPhone: optionalText("contactPhone"),
            contactWhatsapp: optionalText("contactWhatsapp"),
            contactTelegram: optionalText("contactTelegram"),
            contactEmail: optionalText("contactEmail"),
          };
          const draftId = editing?.id ?? pendingAdId.current;
          const ad = draftId
            ? await api<Ad>(`/advertiser/ads/${draftId}`, {
                method: "PATCH",
                body: JSON.stringify(body),
              })
            : await api<Ad>("/advertiser/ads", { method: "POST", body: JSON.stringify(body) });
          pendingAdId.current = ad.id;
          const files = form
            .getAll("images")
            .filter((item): item is File => item instanceof File && item.size > 0);
          for (const file of files) await uploadImage(ad.id, file, body.displayName);
          const paymentProofFile = form.get("paymentProof");
          let paymentProofMediaId = editing?.paymentProofMediaId;
          if (paymentProofFile instanceof File && paymentProofFile.size > 0) {
            const proof = await uploadPaymentProof(ad.id, paymentProofFile);
            paymentProofMediaId = proof.id;
          }
          if (!paymentProofMediaId)
            throw new Error("Payment screenshot upload karna required hai.");
          const submitOptions = {
            method: "POST",
            body: JSON.stringify({
              turnstileToken: turnstileToken || undefined,
              promotionPlan: String(form.get("promotionPlan")),
              paymentProofMediaId,
              paymentReference: optionalText("paymentReference"),
            }),
          } satisfies RequestInit;
          try {
            await api(`/advertiser/ads/${ad.id}/submit`, submitOptions, 30_000);
          } catch (firstError) {
            // The final update is idempotent. Retry once because production database cold starts
            // can briefly fail after the larger media upload has completed.
            await api(`/advertiser/ads/${ad.id}/submit`, submitOptions, 30_000).catch(() => {
              throw firstError;
            });
          }
          pendingAdId.current = null;
          await refreshAccount();
          setMessage("Ad aur payment proof admin verification ke liye submit ho gaya hai.");
          setEditing(null);
          formElement.reset();
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Submission failed");
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

function Dashboard({
  data,
  ads,
  message,
  onEdit,
  onDelete,
  onLogout,
}: {
  data: DashboardData | null;
  ads: Ad[];
  message: string;
  onEdit: (ad: Ad) => void;
  onDelete: (ad: Ad) => Promise<void>;
  onLogout: () => Promise<void>;
}) {
  if (!data) return <Panel>Loading dashboard…</Panel>;
  const joined = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(data.user.createdAt),
  );
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#f7f4f1] text-[#171717] shadow-2xl">
      <div className="bg-[linear-gradient(135deg,#b64131,#8f2924)] px-6 py-12 text-center text-white sm:px-10">
        <h2 className="font-display text-4xl font-bold">Dashboard</h2>
        <p className="mt-3">Welcome {data.user.displayName}</p>
      </div>
      <div className="p-5 sm:p-8">
        <div className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Note:</strong> Every advert remains private until admin approval. Draft and review
          status is always visible below.
        </div>
        {message ? <LightNotice>{message}</LightNotice> : null}
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <DashboardCard title="My Adverts" icon={<FileText size={20} />}>
            <Metric label="Active" value={data.counts.active} tone="green" />
            <Metric label="Expired" value={data.counts.expired} tone="red" />
            <Metric label="Not Published" value={data.counts.unpublished} tone="amber" />
            <Link href="/post-ad" className="rust-button mt-4 flex justify-center gap-2">
              <PlusCircle size={17} /> Post Your Ad
            </Link>
          </DashboardCard>
          <DashboardCard title="My Points" icon={<WalletCards size={20} />}>
            <div className="my-4 rounded-2xl bg-[#fbf7f5] p-8 text-center">
              <p className="text-xs uppercase text-stone-500">Available points</p>
              <p className="mt-2 text-5xl font-bold text-[#48a863]">{data.user.credits}</p>
              <p className="text-sm text-stone-600">Points</p>
            </div>
            <a
              href={supportEmail ? `mailto:${supportEmail}` : "/contact"}
              className="rust-button flex justify-center"
            >
              Contact support
            </a>
          </DashboardCard>
          <DashboardCard title="Profile" icon={<CircleUserRound size={20} />}>
            <div className="py-4 text-center">
              <p className="text-xl font-bold">{data.user.displayName}</p>
              <p className="mt-2 text-sm text-stone-500">{data.user.email}</p>
              <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                Email verified
              </span>
              <p className="mt-2 text-xs text-stone-500">
                Mobile: {data.user.mobileVerifiedAt ? "Verified" : "Verification available later"}
              </p>
              <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm">
                Registered: {joined}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="rust-button flex w-full justify-center gap-2"
            >
              <LogOut size={17} /> Logout
            </button>
          </DashboardCard>
        </div>

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-bold">Your advertisements</h3>
            <span className="text-sm text-stone-500">{ads.length} total</span>
          </div>
          <div className="mt-4 space-y-3">
            {ads.length ? (
              ads.map((ad) => (
                <article
                  key={ad.id}
                  className="flex flex-wrap gap-4 rounded-2xl border border-stone-200 bg-white p-4"
                >
                  {ad.media[0] ? (
                    <Image
                      src={ad.media[0].media.secureUrl}
                      alt={ad.media[0].media.altText}
                      width={84}
                      height={104}
                      className="h-26 w-21 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-26 w-21 rounded-xl bg-stone-100" />
                  )}
                  <div className="min-w-[220px] flex-1">
                    <h4 className="font-bold">{ad.adTitle || ad.displayName}</h4>
                    <p className="mt-1 text-sm text-stone-500">
                      {ad.locations[0]?.city.name} · {ad.categories[0]?.category.name}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                      <LightTag>{ad.moderationStatus}</LightTag>
                      <LightTag>{ad.status}</LightTag>
                      <LightTag>Payment: {ad.paymentStatus}</LightTag>
                      {ad.promotionPlan ? (
                        <LightTag>
                          {ad.promotionPlan} · ₹{ad.promotionAmount} / {ad.promotionDurationDays}{" "}
                          days
                        </LightTag>
                      ) : null}
                    </div>
                    {ad.moderationMessage ? (
                      <p className="mt-3 rounded-xl bg-stone-50 p-3 text-sm text-stone-600">
                        Admin: {ad.moderationMessage}
                      </p>
                    ) : null}
                    {ad.moderationStatus === "REJECTED" || ad.paymentStatus === "PENDING" ? (
                      <SupportLinks />
                    ) : null}
                  </div>
                  <div className="flex gap-2 self-start">
                    {ad.status !== "PUBLISHED" ? (
                      <button onClick={() => onEdit(ad)} className="light-outline-button">
                        Edit
                      </button>
                    ) : null}
                    <button
                      onClick={() => void onDelete(ad)}
                      className="light-outline-button text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
                No advertisements yet. Create your first listing.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-lg shadow-stone-300/25">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="grid size-10 place-items-center rounded-xl bg-[#fcf0ed] text-[#b64131]">
          {icon}
        </span>
      </div>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "red" | "amber";
}) {
  const tones = { green: "text-emerald-600", red: "text-red-600", amber: "text-amber-600" };
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
      <span className="text-sm text-stone-600">{label}</span>
      <strong className={tones[tone]}>{value}</strong>
    </div>
  );
}

async function uploadMedia(adId: string, file: File, altText: string) {
  const signed = await api<
    | { provider: "local" }
    | {
        provider: "cloudinary";
        uploadUrl: string;
        apiKey: string;
        signature: string;
        timestamp: number;
        params: Record<string, string | number>;
      }
  >("/admin/media/signature", {
    method: "POST",
    body: JSON.stringify({ resourceType: "image", folder: `profiles/${adId}/images` }),
  });
  if (signed.provider === "local") {
    const localData = new FormData();
    localData.set("file", file);
    localData.set("altText", altText);
    return api<{ id: string }>("/admin/media/local-upload", {
      method: "POST",
      body: localData,
    });
  }
  const data = new FormData();
  data.set("file", file);
  data.set("api_key", signed.apiKey);
  data.set("signature", signed.signature);
  data.set("timestamp", String(signed.timestamp));
  Object.entries(signed.params).forEach(([key, value]) => data.set(key, String(value)));
  const uploadedResponse = await fetch(signed.uploadUrl, { method: "POST", body: data });
  const uploaded = await uploadedResponse.json();
  if (!uploadedResponse.ok) throw new Error(uploaded?.error?.message || "Image upload failed");
  return api<{ id: string }>("/admin/media/complete", {
    method: "POST",
    body: JSON.stringify({
      cloudinaryPublicId: uploaded.public_id,
      assetId: uploaded.asset_id,
      secureUrl: uploaded.secure_url,
      resourceType: "image",
      format: uploaded.format,
      width: uploaded.width,
      height: uploaded.height,
      bytes: uploaded.bytes,
      folder: uploaded.folder,
      version: String(uploaded.version),
      signature: uploaded.signature,
      altText,
    }),
  });
}

async function uploadImage(adId: string, file: File, altText: string) {
  const media = await uploadMedia(adId, file, `${altText} advertisement image`);
  await api(`/advertiser/ads/${adId}/media`, {
    method: "POST",
    body: JSON.stringify({ mediaId: media.id }),
  });
}

async function uploadPaymentProof(adId: string, file: File) {
  return uploadMedia(adId, file, "Promotion payment screenshot");
}

function AuthPanel({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [view, setView] = useState<"login" | "register" | "verify" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [googleConsent, setGoogleConsent] = useState(false);

  useEffect(() => {
    if (!countdown) return;
    const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const switchView = (next: typeof view) => {
    setView(next);
    setMessage("");
    setSuccess("");
    setTurnstileToken("");
  };
  const title =
    view === "login"
      ? "Welcome Back"
      : view === "register"
        ? "Create Your Account"
        : view === "verify"
          ? "Verify Your Email"
          : view === "forgot"
            ? "Forgot Password"
            : "Reset Password";
  const subtitle =
    view === "login"
      ? "Login to manage your listings and connect with clients"
      : view === "register"
        ? "Create a secure advertiser account to publish and manage listings"
        : view === "verify"
          ? `Enter the 6-digit OTP sent to ${maskEmail(email)}`
          : "Recover access using your registered email address";

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-[#d64f7b]/65 bg-[radial-gradient(circle_at_top_right,rgba(214,79,123,0.18),transparent_34%),linear-gradient(145deg,#1b171d,#0e0c10)] text-[#f8f3f5] shadow-[0_28px_90px_rgba(0,0,0,0.48)]">
      <div className="border-b border-[#d64f7b]/45 bg-[linear-gradient(135deg,#2a1720,#151218)] px-6 py-10 text-center text-white">
        <h2 className="font-display text-4xl font-bold">{title}</h2>
        <p className="mt-3 text-white/90">{subtitle}</p>
      </div>
      <div className="mx-auto max-w-xl p-5 sm:p-9">
        <div className="rounded-2xl border border-[#d64f7b]/45 bg-[#151219]/95 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.38)] sm:p-8">
          {success ? (
            <p className="mb-5 rounded-xl border border-emerald-400/35 bg-emerald-500/10 p-4 text-center text-sm text-emerald-200">
              {success}
            </p>
          ) : null}

          {view === "login" ? (
            <form
              className="grid gap-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setMessage("");
                const form = new FormData(event.currentTarget);
                const loginEmail = String(form.get("email"));
                setEmail(loginEmail);
                try {
                  const result = await api<{ user: User }>("/auth/login", {
                    method: "POST",
                    body: JSON.stringify({
                      email: loginEmail,
                      password: form.get("password"),
                      turnstileToken: turnstileToken || undefined,
                    }),
                  });
                  onAuthenticated(result.user);
                } catch (error) {
                  const text = error instanceof Error ? error.message : "Login failed";
                  setMessage(text);
                  if (text.toLowerCase().includes("verification")) setView("verify");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <LightInput
                name="email"
                label="Email Address"
                type="email"
                required
                placeholder="Enter your email"
                defaultValue={email}
              />
              <label>
                <LightLabel>Password</LightLabel>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    minLength={10}
                    required
                    placeholder="Enter your password"
                    className={`${lightFieldClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </label>
              <TurnstileWidget action="advertiser_login" theme="dark" onToken={setTurnstileToken} />
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" className="accent-[#b64131]" /> Remember me
              </label>
              <button disabled={busy} className="rust-button min-h-12 disabled:opacity-60">
                {busy ? "Please wait…" : "Login"}
              </button>
              <button
                type="button"
                onClick={() => switchView("forgot")}
                className="text-sm font-semibold text-[#f06a91]"
              >
                Forgot Password?
              </button>
              <div className="flex items-center gap-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                <span className="h-px flex-1 bg-white/15" />
                or
                <span className="h-px flex-1 bg-white/15" />
              </div>
              <label className="flex gap-3 text-sm leading-6 text-white/65">
                <input
                  type="checkbox"
                  checked={googleConsent}
                  onChange={(event) => setGoogleConsent(event.target.checked)}
                  className="mt-1 size-4 accent-[#b64131]"
                />
                <span>I am 18+ and agree to the Terms and Privacy Policy.</span>
              </label>
              {googleConsent ? (
                <GoogleSignInButton
                  onCredential={async (credential) => {
                    setBusy(true);
                    setMessage("");
                    try {
                      const result = await api<{ user: User }>("/auth/google", {
                        method: "POST",
                        body: JSON.stringify({ credential, termsAccepted: googleConsent }),
                      });
                      onAuthenticated(result.user);
                    } catch (error) {
                      setMessage(error instanceof Error ? error.message : "Google sign-in failed");
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="min-h-11 rounded-full border border-white/20 bg-white/5 text-sm font-semibold text-white/45"
                >
                  Confirm 18+ to continue with Google
                </button>
              )}
            </form>
          ) : null}

          {view === "register" ? (
            <form
              className="grid gap-5 sm:grid-cols-2"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setMessage("");
                const form = new FormData(event.currentTarget);
                const password = String(form.get("password"));
                const confirmPassword = String(form.get("confirmPassword"));
                const registerEmail = String(form.get("email"));
                if (password !== confirmPassword) {
                  setMessage("Passwords do not match");
                  setBusy(false);
                  return;
                }
                try {
                  await api("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({
                      firstName: form.get("firstName"),
                      lastName: form.get("lastName"),
                      email: registerEmail,
                      mobile: form.get("mobile") || undefined,
                      password,
                      termsAccepted: form.get("termsAccepted") === "true",
                      turnstileToken: turnstileToken || undefined,
                    }),
                  });
                  setEmail(registerEmail);
                  setCountdown(600);
                  setView("verify");
                  setSuccess("OTP sent. Please check your inbox and spam folder.");
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Registration failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <LightInput name="firstName" label="First Name" minLength={2} required />
              <LightInput name="lastName" label="Last Name" minLength={1} required />
              <LightInput name="email" label="Email Address" type="email" required />
              <LightInput
                name="mobile"
                label="Mobile Number"
                type="tel"
                placeholder="Saved now, verified later"
              />
              <LightInput
                name="password"
                label="Password"
                type="password"
                minLength={10}
                required
              />
              <LightInput
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                minLength={10}
                required
              />
              <div className="sm:col-span-2">
                <TurnstileWidget
                  action="advertiser_register"
                  theme="dark"
                  onToken={setTurnstileToken}
                />
              </div>
              <label className="flex gap-3 text-sm leading-6 text-white/65 sm:col-span-2">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  value="true"
                  required
                  className="mt-1 size-4 accent-[#b64131]"
                />
                <span>
                  I am 18+ and agree to the Terms, Privacy Policy and lawful-content rules.
                </span>
              </label>
              <button
                disabled={busy}
                className="rust-button min-h-12 sm:col-span-2 disabled:opacity-60"
              >
                {busy ? "Sending OTP…" : "Create Account"}
              </button>
            </form>
          ) : null}

          {view === "verify" ? (
            <form
              className="grid gap-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setMessage("");
                const form = new FormData(event.currentTarget);
                try {
                  await api("/auth/verify-otp", {
                    method: "POST",
                    body: JSON.stringify({
                      email,
                      code: form.get("code"),
                      purpose: "REGISTRATION",
                    }),
                  });
                  setView("login");
                  setSuccess(
                    "Account created successfully! Your email has been verified. Please login.",
                  );
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "OTP verification failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="rounded-xl border border-[#d64f7b]/35 bg-white/[0.04] p-5 text-center">
                <p className="text-sm text-white/55">OTP expires in</p>
                <p className="mt-2 text-2xl font-bold text-[#f06a91]">
                  {formatCountdown(countdown)}
                </p>
              </div>
              <LightInput
                name="code"
                label="Enter OTP"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                required
                placeholder="Enter 6-digit OTP"
              />
              <p className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-4 text-xs leading-5 text-sky-200">
                Email verification is required before login. Mobile verification will be added later
                without changing your account.
              </p>
              <button disabled={busy} className="rust-button min-h-12 disabled:opacity-60">
                {busy ? "Verifying…" : "Verify OTP"}
              </button>
              <button
                type="button"
                disabled={countdown > 540 || busy}
                onClick={async () => {
                  setBusy(true);
                  setMessage("");
                  try {
                    await api("/auth/resend-otp", {
                      method: "POST",
                      body: JSON.stringify({ email, purpose: "REGISTRATION" }),
                    });
                    setCountdown(600);
                    setSuccess("A new OTP has been sent.");
                  } catch (error) {
                    setMessage(error instanceof Error ? error.message : "Could not resend OTP");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="mx-auto rounded-xl border border-[#d64f7b] bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-[#f06a91] disabled:opacity-40"
              >
                {countdown > 540 ? `Resend in ${countdown - 540}s` : "Resend OTP"}
              </button>
            </form>
          ) : null}

          {view === "forgot" ? (
            <form
              className="grid gap-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setMessage("");
                const form = new FormData(event.currentTarget);
                const resetEmail = String(form.get("email"));
                try {
                  await api("/auth/forgot-password", {
                    method: "POST",
                    body: JSON.stringify({ email: resetEmail }),
                  });
                  setEmail(resetEmail);
                  setCountdown(600);
                  setView("reset");
                  setSuccess("If the account exists, a reset OTP has been sent.");
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Request failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <LightInput name="email" label="Registered Email" type="email" required />
              <button disabled={busy} className="rust-button min-h-12">
                {busy ? "Sending…" : "Send Password Reset OTP"}
              </button>
            </form>
          ) : null}

          {view === "reset" ? (
            <form
              className="grid gap-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setMessage("");
                const form = new FormData(event.currentTarget);
                const password = String(form.get("password"));
                if (password !== String(form.get("confirmPassword"))) {
                  setMessage("Passwords do not match");
                  setBusy(false);
                  return;
                }
                try {
                  await api("/auth/reset-password", {
                    method: "POST",
                    body: JSON.stringify({
                      email,
                      code: form.get("code"),
                      purpose: "PASSWORD_RESET",
                      password,
                    }),
                  });
                  setView("login");
                  setSuccess("Password reset successful. You can now login.");
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Password reset failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <LightInput
                name="code"
                label="6-digit Reset OTP"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
              />
              <LightInput
                name="password"
                label="New Password"
                type="password"
                minLength={10}
                required
              />
              <LightInput
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                minLength={10}
                required
              />
              <button disabled={busy} className="rust-button min-h-12">
                {busy ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          ) : null}

          {message ? <LightNotice>{message}</LightNotice> : null}
          {view === "login" || view === "register" ? (
            <button
              className="mt-6 w-full text-center text-sm font-semibold text-[#f06a91]"
              onClick={() => switchView(view === "login" ? "register" : "login")}
            >
              {view === "login"
                ? "Don't have an account? Create Account"
                : "Already registered? Login"}
            </button>
          ) : (
            <button
              className="mt-6 w-full text-center text-sm font-semibold text-[#f06a91]"
              onClick={() => switchView("login")}
            >
              Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AdForm({
  options,
  existing,
  busy,
  message,
  onSubmit,
  onCancel,
}: {
  options: AdOptions;
  existing: Ad | null;
  busy: boolean;
  message: string;
  onSubmit: (event: FormEvent<HTMLFormElement>, turnstileToken: string) => void;
  onCancel?: () => void;
}) {
  const existingCountryId = existing?.locations[0]?.city.state.country.id;
  const existingStateId = existing?.locations[0]?.city.state.id;
  const existingCityId = existing?.locations[0]?.city.id;
  const existingAreaId = existing?.locations[0]?.area?.id;
  const [countryId, setCountryId] = useState(existingCountryId ?? options.countries[0]?.id ?? "");
  const countries = options.countries;
  const states = countries.find((country) => country.id === countryId)?.states ?? [];
  const [stateId, setStateId] = useState(existingStateId ?? states[0]?.id ?? "");
  const availableStates = countries.find((country) => country.id === countryId)?.states ?? [];
  const cities = availableStates.find((state) => state.id === stateId)?.cities ?? [];
  const [cityId, setCityId] = useState(existingCityId ?? cities[0]?.id ?? "");
  const areas = cities.find((city) => city.id === cityId)?.areas ?? [];
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [paymentPreview, setPaymentPreview] = useState(existing?.paymentProofUrl ?? "");
  const [formMessage, setFormMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<"PRIME" | "VIP" | "HIGHLIGHT">(
    existing?.promotionPlan ?? "PRIME",
  );
  const formRef = useRef<HTMLFormElement>(null);

  const goToStep = (nextStep: 1 | 2 | 3) => {
    if (nextStep > step && formRef.current) {
      const fields = Array.from(
        formRef.current.querySelectorAll<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >(
          `[data-wizard-step="${step}"] input, [data-wizard-step="${step}"] select, [data-wizard-step="${step}"] textarea`,
        ),
      );
      const invalid = fields.find((field) => !field.checkValidity());
      if (invalid) {
        invalid.reportValidity();
        return;
      }
    }
    setFormMessage("");
    setStep(nextStep);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectedServices = useMemo(
    () => new Set(existing?.services.map((item) => item.service.id) ?? []),
    [existing],
  );
  const selectedAvailability = useMemo(
    () => new Set(existing?.availabilitySlots ?? []),
    [existing],
  );

  return (
    <form
      ref={formRef}
      onSubmit={(event) => onSubmit(event, turnstileToken)}
      className="overflow-hidden rounded-[30px] border border-[#d64f7b]/65 bg-[radial-gradient(circle_at_top_right,rgba(214,79,123,0.16),transparent_32%),linear-gradient(145deg,#1b171d,#0f0d11)] text-[#f8f3f5] shadow-[0_28px_90px_rgba(0,0,0,0.48)]"
    >
      <div className="border-b border-[#d64f7b]/45 bg-[linear-gradient(135deg,#2b1721,#151218)] px-6 py-8 text-center text-white">
        <h2 className="font-display text-3xl font-bold">
          {existing ? "Edit Your Ad" : "Post Your Ad"}
        </h2>
        <p className="mt-2 text-sm text-white/85">
          Fill in the details to submit your listing for admin approval
        </p>
      </div>
      <div className="space-y-8 p-5 sm:p-8">
        <ol className="grid grid-cols-3 gap-2 rounded-2xl border border-[#d64f7b]/45 bg-black/30 p-2 shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
          {[
            [1, "Details"],
            [2, "Photos"],
            [3, "Payment"],
          ].map(([number, label]) => (
            <li
              key={number}
              className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-bold sm:text-sm ${
                step === number
                  ? "bg-[linear-gradient(135deg,#d64f7b,#9d3157)] text-white shadow-lg"
                  : Number(number) < step
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "text-white/50"
              }`}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full border border-current/30">
                {Number(number) < step ? <Check size={14} /> : number}
              </span>
              <span className="truncate">{label}</span>
            </li>
          ))}
        </ol>
        <div data-wizard-step="1" className={step === 1 ? "space-y-8" : "hidden"}>
          <FormSection title="Category & Location">
            <label className="sm:col-span-2">
              <LightLabel>Category *</LightLabel>
              <select
                name="categoryId"
                className={lightFieldClass}
                defaultValue={existing?.categories[0]?.category.id}
                required
              >
                <option value="">Select Category</option>
                {options.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <LightLabel>Country *</LightLabel>
              <select
                className={lightFieldClass}
                value={countryId}
                onChange={(event) => {
                  const nextCountry = event.target.value;
                  const nextStates =
                    countries.find((country) => country.id === nextCountry)?.states ?? [];
                  const nextState = nextStates[0];
                  setCountryId(nextCountry);
                  setStateId(nextState?.id ?? "");
                  setCityId(nextState?.cities[0]?.id ?? "");
                }}
                required
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <LightLabel>State / Region *</LightLabel>
              <select
                className={lightFieldClass}
                value={stateId}
                onChange={(event) => {
                  const nextStateId = event.target.value;
                  const nextState = availableStates.find((state) => state.id === nextStateId);
                  setStateId(nextStateId);
                  setCityId(nextState?.cities[0]?.id ?? "");
                }}
                required
              >
                <option value="">Select State / Region</option>
                {availableStates.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <LightLabel>City *</LightLabel>
              <select
                name="cityId"
                className={lightFieldClass}
                value={cityId}
                onChange={(event) => setCityId(event.target.value)}
                required
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <LightLabel>Area</LightLabel>
              <select name="areaId" className={lightFieldClass} defaultValue={existingAreaId ?? ""}>
                <option value="">All Areas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </label>
          </FormSection>

          <div className="rounded-xl border border-amber-400/35 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
            <strong>Please note — prohibited:</strong> minors, coercion, trafficking, stolen media,
            abusive language, third-party contact details, explicit photos or unlawful services.
          </div>

          <FormSection title="Ad Details">
            <LightInput
              name="adTitle"
              label="Title *"
              defaultValue={existing?.adTitle}
              minLength={5}
              maxLength={100}
              required
              placeholder="e.g. Premium independent listing in Mumbai"
              wrapperClass="sm:col-span-2"
            />
            <LightInput
              name="displayName"
              label="Model / Display Name *"
              defaultValue={existing?.displayName}
              minLength={2}
              maxLength={100}
              required
            />
            <LightInput
              name="languages"
              label="Languages *"
              defaultValue={existing?.languages.join(", ")}
              required
              placeholder="Hindi, English"
            />
            <LightTextArea
              name="shortIntro"
              label="Short Introduction *"
              defaultValue={existing?.shortIntro}
              minLength={20}
              maxLength={500}
              rows={3}
              required
              wrapperClass="sm:col-span-2"
            />
            <LightTextArea
              name="fullBio"
              label="Description *"
              defaultValue={existing?.fullBio}
              minLength={50}
              maxLength={10000}
              rows={7}
              required
              wrapperClass="sm:col-span-2"
              placeholder="Describe your advertisement, availability, boundaries and relevant details"
            />
            <LightInput
              name="pricingNotes"
              label="Rates / Pricing Notes"
              defaultValue={existing?.pricingNotes}
              wrapperClass="sm:col-span-2"
            />
          </FormSection>

          <FormSection title="Contact">
            <LightInput
              name="contactPhone"
              label="Phone Number"
              type="tel"
              defaultValue={existing?.contactPhone}
            />
            <LightInput
              name="contactWhatsapp"
              label="WhatsApp Number"
              type="tel"
              defaultValue={existing?.contactWhatsapp}
            />
            <LightInput
              name="contactTelegram"
              label="Telegram Username / Link"
              defaultValue={existing?.contactTelegram}
            />
            <LightInput
              name="contactEmail"
              label="Public Contact Email"
              type="email"
              defaultValue={existing?.contactEmail}
            />
            <p className="text-xs leading-5 text-white/50 sm:col-span-2">
              At least one contact method is required. Only entered contact details appear publicly.
            </p>
          </FormSection>

          <FormSection title="Personal Details">
            <label>
              <LightLabel>Gender</LightLabel>
              <select
                name="gender"
                className={lightFieldClass}
                defaultValue={existing?.gender ?? ""}
              >
                <option value="">Select Gender</option>
                <option>Woman</option>
                <option>Man</option>
                <option>Trans Woman</option>
                <option>Trans Man</option>
                <option>Non-binary</option>
              </select>
            </label>
            <LightInput
              name="age"
              label="Age *"
              type="number"
              min={18}
              max={99}
              defaultValue={existing?.age}
              required
            />
            <LightInput
              name="nationality"
              label="Nationality"
              defaultValue={existing?.nationality}
            />
            <LightInput name="ethnicity" label="Ethnicity" defaultValue={existing?.ethnicity} />
            <LightInput name="eyeColor" label="Eye Color" defaultValue={existing?.eyeColor} />
            <LightInput name="hairColor" label="Hair Color" defaultValue={existing?.hairColor} />
            <LightInput
              name="weightKg"
              label="Weight (kg)"
              type="number"
              min={25}
              max={300}
              defaultValue={existing?.weightKg}
            />
            <LightInput
              name="heightCm"
              label="Height (cm)"
              type="number"
              min={100}
              max={250}
              defaultValue={existing?.heightCm}
            />
            <label>
              <LightLabel>Body Type</LightLabel>
              <select
                name="bodyType"
                className={lightFieldClass}
                defaultValue={existing?.bodyType ?? ""}
              >
                <option value="">Select Body Type</option>
                <option>Slim</option>
                <option>Athletic</option>
                <option>Average</option>
                <option>Curvy</option>
                <option>Plus Size</option>
              </select>
            </label>
            <LightInput
              name="bust"
              label="Bust"
              defaultValue={existing?.bust}
              placeholder="Optional"
            />
            <label>
              <LightLabel>Attention To</LightLabel>
              <select
                name="attentionTo"
                className={lightFieldClass}
                defaultValue={existing?.attentionTo ?? ""}
              >
                <option value="">Select</option>
                <option>Men</option>
                <option>Women</option>
                <option>Couples</option>
                <option>Everyone</option>
              </select>
            </label>
            <label className="sm:col-span-2">
              <LightLabel>Place of Service</LightLabel>
              <select
                name="placeOfService"
                className={lightFieldClass}
                defaultValue={existing?.placeOfService ?? ""}
              >
                <option value="">Select</option>
                <option>Incalls</option>
                <option>Outcalls</option>
                <option>Incalls and Outcalls</option>
                <option>Online</option>
              </select>
            </label>
          </FormSection>

          <FormSection title="Availability">
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {["Morning", "Afternoon", "Evening", "Night", "Overnight", "24 Hours"].map((slot) => (
                <ChipCheckbox
                  key={slot}
                  name="availabilitySlots"
                  value={slot}
                  defaultChecked={selectedAvailability.has(slot)}
                />
              ))}
            </div>
            <LightInput
              name="availability"
              label="Availability Notes"
              defaultValue={existing?.availability}
              wrapperClass="sm:col-span-2"
              placeholder="Add schedule, notice period or special timing"
            />
          </FormSection>

          <FormSection title="Services Included">
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {options.services.map((service) => (
                <ChipCheckbox
                  key={service.id}
                  name="serviceIds"
                  value={service.id}
                  label={service.name}
                  defaultChecked={selectedServices.has(service.id)}
                />
              ))}
            </div>
          </FormSection>

          <div className="flex justify-end border-t border-[#d64f7b]/25 pt-6">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="rust-button flex min-h-12 items-center gap-2 px-7"
            >
              Continue to photos <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div data-wizard-step="2" className={step === 2 ? "space-y-8" : "hidden"}>
          <FormSection title="Photos">
            <label className="block rounded-2xl border border-dashed border-[#d64f7b]/65 bg-white/[0.035] p-8 text-center transition hover:bg-white/[0.06] sm:col-span-2">
              <span className="text-3xl">📷</span>
              <span className="mt-2 block font-bold text-[#f06a91]">
                Click to upload or drag and drop
              </span>
              <span className="mt-1 block text-xs text-white/50">
                PNG, JPG, WEBP — max 8 MB per photo; 1–8 images
              </span>
              <input
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                required={!existing?.media.length}
                className="sr-only"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  if (files.length > 8) {
                    event.target.value = "";
                    setPhotoPreviews([]);
                    setFormMessage("Maximum 8 photos upload kar sakte hain.");
                    return;
                  }
                  if (files.some((file) => file.size > 8 * 1024 * 1024)) {
                    event.target.value = "";
                    setPhotoPreviews([]);
                    setFormMessage("Each photo must be 8 MB or smaller.");
                    return;
                  }
                  setFormMessage("");
                  setPhotoPreviews(files.map((file) => URL.createObjectURL(file)));
                }}
              />
            </label>
            {existing?.media.length || photoPreviews.length ? (
              <div className="grid grid-cols-3 gap-3 sm:col-span-2 sm:grid-cols-5">
                {existing?.media.map((item) => (
                  <Image
                    key={item.mediaId}
                    src={item.media.secureUrl}
                    alt={item.media.altText}
                    width={150}
                    height={180}
                    className="aspect-[4/5] w-full rounded-xl object-cover"
                  />
                ))}
                {photoPreviews.map((url) => (
                  <Image
                    key={url}
                    src={url}
                    alt="Selected advertisement preview"
                    width={150}
                    height={180}
                    unoptimized
                    className="aspect-[4/5] w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            ) : null}
          </FormSection>

          <label className="flex gap-3 rounded-xl border border-[#d64f7b]/35 bg-white/[0.035] p-4 text-sm leading-6 text-white/65">
            <input type="checkbox" required className="mt-1 size-4 accent-[#b64131]" />
            <span>
              I confirm I am an independent adult service provider, or I am authorized to post on
              their behalf. I agree to the Terms, Content Policy and Advertiser Guidelines and
              confirm I own or license every image.
            </span>
          </label>
          {formMessage ? <LightNotice>{formMessage}</LightNotice> : null}
          <div className="flex flex-wrap justify-between gap-3 border-t border-[#d64f7b]/25 pt-6">
            <button type="button" onClick={() => goToStep(1)} className={darkOutlineButtonClass}>
              <ChevronLeft size={18} /> Back
            </button>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="rust-button flex min-h-12 items-center gap-2 px-7"
            >
              Continue to payment <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div data-wizard-step="3" className={step === 3 ? "space-y-8" : "hidden"}>
          <section className="rounded-3xl border border-[#d64f7b]/65 bg-[#171318] p-5 text-white shadow-xl sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#b64131]">
                <Crown size={22} />
              </span>
              <div>
                <h3 className="font-display text-2xl font-bold">Choose promotion</h3>
                <p className="mt-1 text-sm leading-6 text-white/65">
                  Every plan runs for 3 days with the daily promotion window from 6 PM to 3 PM.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {(
                [
                  { id: "PRIME", name: "Prime", price: "₹450", icon: Sparkles },
                  { id: "VIP", name: "VIP", price: "₹750", icon: Crown },
                  { id: "HIGHLIGHT", name: "Highlight", price: "₹1,000+", icon: BadgeIndianRupee },
                ] as const
              ).map((plan) => {
                const Icon = plan.icon;
                const active = selectedPlan === plan.id;
                return (
                  <label
                    key={plan.id}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      active
                        ? "border-[#f06a91] bg-[#d64f7b]/20 shadow-[0_0_0_2px_rgba(240,106,145,0.16)]"
                        : "border-[#d64f7b]/30 bg-white/[0.04] hover:border-[#d64f7b]/55"
                    }`}
                  >
                    <input
                      type="radio"
                      name="promotionPlan"
                      value={plan.id}
                      required
                      checked={active}
                      onChange={() => setSelectedPlan(plan.id)}
                      className="sr-only"
                    />
                    <span className="flex items-center justify-between gap-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-[#f1b37b]">
                        <Icon size={18} />
                      </span>
                      {active ? <Check size={18} className="text-emerald-400" /> : null}
                    </span>
                    <strong className="mt-4 block text-lg">{plan.name}</strong>
                    <span className="mt-1 block text-2xl font-black text-[#f1b37b]">
                      {plan.price}
                    </span>
                    <span className="mt-2 block text-xs text-white/55">3 days · 6 PM–3 PM</span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="grid gap-5 rounded-3xl border border-[#d64f7b]/55 bg-[#171318]/95 p-5 shadow-[0_20px_55px_rgba(0,0,0,0.35)] sm:p-7 md:grid-cols-[260px_1fr]">
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-[#d64f7b]/55 bg-white/[0.035] p-4 text-center">
              {paymentQrUrl ? (
                // QR URL is merchant-configured and may be hosted outside Next.js image domains.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={paymentQrUrl}
                  alt={`${paymentAccountName} payment QR code`}
                  className="mx-auto aspect-square w-full max-w-56 rounded-xl bg-white object-contain p-2 shadow-md"
                />
              ) : (
                <div>
                  <QrCode className="mx-auto text-[#b64131]" size={82} strokeWidth={1.4} />
                  <p className="mt-3 text-sm font-bold text-white">Merchant QR awaiting setup</p>
                  <p className="mt-2 text-xs leading-5 text-white/50">
                    Admin must configure the real payment QR before accepting a payment.
                  </p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f06a91]">
                Step 3 · Pay and upload proof
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold">
                Pay {selectedPlan.toLowerCase()} plan
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Scan the QR, complete payment, then upload a clear screenshot. Admin verifies the
                payment first and publishes the ad only after content approval.
              </p>
              <div className="mt-4 rounded-xl border border-[#d64f7b]/30 bg-white/[0.035] p-4 text-sm text-white/75">
                <p>
                  <strong>Account:</strong> {paymentAccountName}
                </p>
                {paymentUpiId ? (
                  <p className="mt-1">
                    <strong>UPI ID:</strong> {paymentUpiId}
                  </p>
                ) : null}
              </div>
              <label className="mt-5 block cursor-pointer rounded-2xl border border-dashed border-[#d64f7b]/60 bg-white/[0.035] p-5 text-center transition hover:bg-white/[0.06]">
                <Upload className="mx-auto text-[#f06a91]" size={28} />
                <span className="mt-2 block font-bold text-[#f06a91]">
                  Upload payment screenshot *
                </span>
                <span className="mt-1 block text-xs text-white/50">
                  PNG, JPG or WEBP · max 8 MB
                </span>
                <input
                  name="paymentProof"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required={!existing?.paymentProofMediaId}
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 8 * 1024 * 1024) {
                      event.target.value = "";
                      setPaymentPreview(existing?.paymentProofUrl ?? "");
                      setFormMessage("Payment screenshot must be 8 MB or smaller.");
                      return;
                    }
                    setFormMessage("");
                    setPaymentPreview(URL.createObjectURL(file));
                  }}
                />
              </label>
              {paymentPreview ? (
                // Object URLs and existing payment proof URLs are temporary review previews.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={paymentPreview}
                  alt="Selected payment screenshot preview"
                  className="mt-4 max-h-48 w-full rounded-xl border border-[#d64f7b]/35 bg-black/30 object-contain p-2"
                />
              ) : null}
              <label className="mt-5 block">
                <LightLabel>Payment reference / UTR (optional)</LightLabel>
                <input
                  name="paymentReference"
                  maxLength={100}
                  defaultValue={existing?.paymentReference}
                  className={lightFieldClass}
                  placeholder="Enter UTR or transaction reference"
                />
              </label>
            </div>
          </section>

          <TurnstileWidget action="advertiser_submit" theme="dark" onToken={setTurnstileToken} />
          {formMessage ? <LightNotice>{formMessage}</LightNotice> : null}
          {message ? <LightNotice>{message}</LightNotice> : null}
          <div className="flex flex-wrap justify-between gap-3 border-t border-[#d64f7b]/25 pt-6">
            <button type="button" onClick={() => goToStep(2)} className={darkOutlineButtonClass}>
              <ChevronLeft size={18} /> Back
            </button>
            <button disabled={busy} className="rust-button min-h-12 px-8 disabled:opacity-60">
              {busy ? "Uploading and submitting…" : "Submit Payment & Ad"}
            </button>
            {onCancel ? (
              <button type="button" onClick={onCancel} className={darkOutlineButtonClass}>
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5 border-t border-[#d64f7b]/25 pt-6 sm:grid-cols-2">
      <legend className="mb-5 block w-full text-sm font-bold uppercase tracking-[0.08em] text-[#f06a91]">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function ChipCheckbox({
  name,
  value,
  label = value,
  defaultChecked,
}: {
  name: string;
  value: string;
  label?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="inline-flex rounded-full border border-[#d64f7b]/40 bg-white/[0.035] px-4 py-2 text-sm text-white/70 transition peer-checked:border-[#f06a91] peer-checked:bg-[#d64f7b] peer-checked:text-white">
        {label}
      </span>
    </label>
  );
}

function SupportLinks() {
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
      {supportWhatsapp ? (
        <a
          className="text-emerald-700"
          target="_blank"
          rel="noreferrer"
          href={`https://wa.me/${supportWhatsapp}`}
        >
          WhatsApp support
        </a>
      ) : null}
      {supportTelegram ? (
        <a
          className="text-sky-700"
          target="_blank"
          rel="noreferrer"
          href={
            supportTelegram.startsWith("http")
              ? supportTelegram
              : `https://t.me/${supportTelegram.replace(/^@/, "")}`
          }
        >
          Telegram support
        </a>
      ) : null}
      {supportEmail ? (
        <a className="text-[#b64131]" href={`mailto:${supportEmail}`}>
          Email support
        </a>
      ) : null}
    </div>
  );
}

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");
  if (!domain) return email;
  const name = localPart ?? "";
  return `${name.slice(0, 2)}${"*".repeat(Math.max(3, name.length - 2))}@${domain}`;
}
function formatCountdown(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
const darkOutlineButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d64f7b]/65 bg-white/[0.035] px-4 py-2.5 font-bold text-[#f4b0c4] transition hover:bg-white/[0.08]";
const lightFieldClass =
  "min-h-12 w-full rounded-xl border border-[#d64f7b]/45 bg-[#201b22] px-4 text-[#fff7fa] outline-none [color-scheme:dark] placeholder:text-white/35 transition focus:border-[#f06a91] focus:ring-2 focus:ring-[#d64f7b]/20";
function LightLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-sm font-bold text-[#f4dbe3]">{children}</span>;
}
function LightInput({
  label,
  wrapperClass = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; wrapperClass?: string }) {
  return (
    <label className={wrapperClass}>
      <LightLabel>{label}</LightLabel>
      <input {...props} className={lightFieldClass} />
    </label>
  );
}
function LightTextArea({
  label,
  wrapperClass = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; wrapperClass?: string }) {
  return (
    <label className={wrapperClass}>
      <LightLabel>{label}</LightLabel>
      <textarea {...props} className={`${lightFieldClass} py-3`} />
    </label>
  );
}
function LightNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      {children}
    </p>
  );
}
function LightTag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">{children}</span>;
}
function Panel({ children }: { children: React.ReactNode }) {
  return <div className="surface-border rounded-[24px] bg-surface p-6 sm:p-8">{children}</div>;
}
