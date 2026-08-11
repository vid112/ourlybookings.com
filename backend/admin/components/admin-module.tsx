"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

type ModuleName =
  | "profiles"
  | "users"
  | "categories"
  | "media"
  | "locations"
  | "seo"
  | "leads"
  | "analytics"
  | "settings";
type City = {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  _count: { profiles: number };
};
type State = { id: string; name: string; slug: string; isPublished: boolean; cities: City[] };
type Profile = {
  id: string;
  displayName: string;
  slug: string;
  age: number;
  status: string;
  verificationStatus: string;
  moderationStatus: string;
  paymentStatus: string;
  promotionAmount: number;
  adminPriority: number;
  moderationMessage?: string;
  owner?: { email: string; displayName: string };
  updatedAt: string;
  locations: { city: { name: string; state: { name: string } } }[];
  media: { media: { secureUrl: string; altText: string } }[];
};
type Media = {
  id: string;
  secureUrl: string;
  altText: string;
  title?: string;
  folder: string;
  usageStatus: string;
  description?: string;
  _count: { profiles: number };
};
type Lead = {
  id: string;
  name: string;
  message: string;
  status: string;
  phone?: string;
  email?: string;
  createdAt: string;
};
type Report = {
  id: string;
  reason: string;
  details: string;
  status: string;
  reportedUrl: string;
  priority: number;
};
type Setting = { id: string; key: string; value: unknown; isPublic: boolean };
type SeoData = {
  metadata: {
    id: string;
    entityType: string;
    entityId: string;
    seoTitle: string;
    metaDescription: string;
  }[];
  missingAlt: { id: string; secureUrl: string; altText: string }[];
  redirects: { id: string; sourcePath: string; targetPath: string; statusCode: number }[];
};
type Analytics = {
  since: string;
  total: number;
  byType: { type: string; _count: { _all: number } }[];
};
type AdvertiserUser = {
  id: string;
  displayName: string;
  email: string;
  mobile?: string;
  emailVerifiedAt?: string;
  mobileVerifiedAt?: string;
  accountStatus: string;
  isActive: boolean;
  credits: number;
  lastLoginAt?: string;
  createdAt: string;
  roles: { role: { name: string } }[];
  profiles: {
    id: string;
    displayName: string;
    slug: string;
    status: string;
    moderationStatus: string;
    paymentStatus: string;
    createdAt: string;
  }[];
};
type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  isPublished: boolean;
  sortOrder: number;
};

async function request(path: string, method = "GET", body?: unknown) {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    const message = Array.isArray(payload?.message) ? payload.message.join(", ") : payload?.message;
    throw new Error(message || `Request failed (${response.status})`);
  }
  return payload;
}

function useAction() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const run = (work: () => Promise<unknown>, success: string) => {
    setMessage("");
    startTransition(async () => {
      try {
        await work();
        setMessage(success);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Action failed");
      }
    });
  };
  return { pending, message, run };
}

function Notice({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="mt-4 rounded-xl border border-white/12 bg-surface-2 px-4 py-3 text-sm">
      {message}
    </p>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 rounded-[18px] border border-dashed border-white/15 p-8 text-muted">
      {children}
    </div>
  );
}

function ProfilesModule({ data }: { data: unknown }) {
  const payload = (data ?? {}) as { profiles?: Profile[]; locations?: State[] };
  const profiles = payload.profiles ?? [];
  const states = payload.locations ?? [];
  const { pending, message, run } = useAction();
  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const intro = String(form.get("shortIntro") ?? "");
    run(
      () =>
        request("/admin/profiles", "POST", {
          displayName: form.get("displayName"),
          slug: form.get("slug"),
          age: Number(form.get("age")),
          languages: String(form.get("languages") ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          shortIntro: intro,
          fullBio: String(form.get("fullBio") ?? ""),
          cityId: form.get("cityId") || undefined,
        }),
      "Draft profile created.",
    );
  }
  return (
    <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)]">
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{profiles.length} profiles</h2>
          <span className="text-sm text-muted">Published records appear on the public site</span>
        </div>
        <div className="space-y-3">
          {profiles.map((profile) => (
            <article
              key={profile.id}
              className="flex flex-wrap items-center gap-4 rounded-[18px] border border-white/12 bg-surface p-4"
            >
              {profile.media[0] ? (
                // Source URLs are stored as authorized provenance records by the importer.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.media[0].media.secureUrl}
                  alt={profile.media[0].media.altText}
                  className="h-20 w-16 rounded-xl object-cover"
                />
              ) : (
                <div className="h-20 w-16 rounded-xl bg-surface-2" />
              )}
              <div className="min-w-[200px] flex-1">
                <h3 className="font-bold">
                  {profile.displayName}, {profile.age}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {profile.locations[0]
                    ? `${profile.locations[0].city.name}, ${profile.locations[0].city.state.name}`
                    : "No primary city"}
                </p>
                {profile.owner ? (
                  <p className="mt-1 text-xs text-muted">Advertiser: {profile.owner.email}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white/8 px-2.5 py-1">{profile.status}</span>
                  <span className="rounded-full bg-white/8 px-2.5 py-1">
                    {profile.verificationStatus}
                  </span>
                  <span className="rounded-full bg-white/8 px-2.5 py-1">
                    {profile.moderationStatus}
                  </span>
                  <span className="rounded-full bg-white/8 px-2.5 py-1">
                    Payment: {profile.paymentStatus}
                  </span>
                  <span className="rounded-full bg-white/8 px-2.5 py-1">
                    ₹{profile.promotionAmount} · Priority {profile.adminPriority}
                  </span>
                </div>
                {profile.moderationMessage ? (
                  <p className="mt-2 text-xs text-muted">Message: {profile.moderationMessage}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                {profile.moderationStatus === "PENDING" ||
                profile.moderationStatus === "CHANGES_REQUESTED" ||
                profile.moderationStatus === "REJECTED" ? (
                  <button
                    disabled={pending}
                    onClick={() =>
                      run(
                        () =>
                          request(`/admin/profiles/${profile.id}/moderate`, "POST", {
                            decision: "APPROVED",
                            paymentStatus: "PAID",
                            message: "Approved and published",
                          }),
                        "Advertisement approved and published.",
                      )
                    }
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold disabled:opacity-50"
                  >
                    Approve
                  </button>
                ) : null}
                {profile.moderationStatus === "PENDING" ? (
                  <button
                    disabled={pending}
                    onClick={() => {
                      const reason = window.prompt(
                        "Rejection/payment message for advertiser",
                        "Your payment is pending. Contact support by WhatsApp, Telegram or email.",
                      );
                      if (reason)
                        run(
                          () =>
                            request(`/admin/profiles/${profile.id}/moderate`, "POST", {
                              decision: "REJECTED",
                              paymentStatus: "PENDING",
                              message: reason,
                            }),
                          "Advertisement rejected and advertiser notified.",
                        );
                    }}
                    className="rounded-lg border border-amber-400/40 px-3 py-2 text-sm font-bold text-amber-200 disabled:opacity-50"
                  >
                    Reject
                  </button>
                ) : null}
                <button
                  disabled={pending}
                  onClick={() => {
                    const amount = window.prompt(
                      "Promotion amount in INR",
                      String(profile.promotionAmount),
                    );
                    if (amount === null) return;
                    const priority = window.prompt(
                      "Admin priority (higher appears first)",
                      String(profile.adminPriority),
                    );
                    if (priority === null) return;
                    run(
                      () =>
                        request(`/admin/profiles/${profile.id}/rank`, "PATCH", {
                          promotionAmount: Number(amount),
                          adminPriority: Number(priority),
                        }),
                      "Ranking updated.",
                    );
                  }}
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm font-bold disabled:opacity-50"
                >
                  Rank
                </button>
                {profile.status !== "PUBLISHED" ? (
                  <button
                    disabled={pending}
                    onClick={() =>
                      run(
                        () => request(`/admin/profiles/${profile.id}/publish`, "POST"),
                        "Profile published.",
                      )
                    }
                    className="rounded-lg bg-brand px-3 py-2 text-sm font-bold disabled:opacity-50"
                  >
                    Publish
                  </button>
                ) : null}
                {profile.status !== "ARCHIVED" ? (
                  <button
                    disabled={pending}
                    onClick={() =>
                      run(
                        () =>
                          request(`/admin/profiles/${profile.id}`, "PATCH", { status: "ARCHIVED" }),
                        "Profile archived.",
                      )
                    }
                    className="rounded-lg border border-white/15 px-3 py-2 text-sm font-bold disabled:opacity-50"
                  >
                    Archive
                  </button>
                ) : null}
              </div>
            </article>
          ))}
          {!profiles.length ? (
            <Empty>No profiles yet. Create a draft or run the authorized importer.</Empty>
          ) : null}
        </div>
      </section>
      <aside className="h-fit rounded-[20px] border border-white/12 bg-surface p-5">
        <h2 className="text-xl font-bold">Create draft</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Publication stays blocked until verification, consent, media and location checks pass.
        </p>
        <form onSubmit={create} className="mt-5 space-y-3">
          <input
            required
            minLength={2}
            name="displayName"
            placeholder="Display name"
            className="min-h-11 w-full rounded-xl border border-white/12 bg-surface-2 px-3"
          />
          <input
            required
            minLength={3}
            name="slug"
            placeholder="profile-slug"
            className="min-h-11 w-full rounded-xl border border-white/12 bg-surface-2 px-3"
          />
          <input
            required
            min={18}
            max={99}
            type="number"
            name="age"
            placeholder="Age"
            className="min-h-11 w-full rounded-xl border border-white/12 bg-surface-2 px-3"
          />
          <input
            required
            name="languages"
            placeholder="Hindi, English"
            className="min-h-11 w-full rounded-xl border border-white/12 bg-surface-2 px-3"
          />
          <select
            name="cityId"
            className="min-h-11 w-full rounded-xl border border-white/12 bg-surface-2 px-3"
          >
            <option value="">Choose primary city</option>
            {states.flatMap((state) =>
              state.cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {state.name}
                </option>
              )),
            )}
          </select>
          <textarea
            required
            minLength={20}
            maxLength={500}
            name="shortIntro"
            placeholder="Short introduction"
            className="min-h-24 w-full rounded-xl border border-white/12 bg-surface-2 p-3"
          />
          <textarea
            required
            minLength={50}
            maxLength={10000}
            name="fullBio"
            placeholder="Full profile details"
            className="min-h-32 w-full rounded-xl border border-white/12 bg-surface-2 p-3"
          />
          <button
            disabled={pending}
            className="min-h-11 w-full rounded-xl bg-brand font-bold disabled:opacity-50"
          >
            {pending ? "Saving…" : "Create profile"}
          </button>
        </form>
        <Notice message={message} />
      </aside>
    </div>
  );
}

function MediaCard({ media }: { media: Media }) {
  const [altText, setAltText] = useState(media.altText);
  const [title, setTitle] = useState(media.title ?? "");
  const { pending, message, run } = useAction();
  return (
    <article className="overflow-hidden rounded-[18px] border border-white/12 bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.secureUrl}
        alt={media.altText}
        className="aspect-[4/3] w-full bg-surface-2 object-cover"
      />
      <div className="p-4">
        <div className="mb-3 flex justify-between gap-3 text-xs font-bold text-muted">
          <span>{media.folder}</span>
          <span>{media._count.profiles} usage(s)</span>
        </div>
        <label className="text-xs font-bold text-muted">Alternative text</label>
        <input
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          className="mt-1 min-h-10 w-full rounded-lg border border-white/12 bg-surface-2 px-3"
        />
        <label className="mt-3 block text-xs font-bold text-muted">Title</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 min-h-10 w-full rounded-lg border border-white/12 bg-surface-2 px-3"
        />
        <button
          disabled={pending || altText.trim().length < 3}
          onClick={() =>
            run(
              () => request(`/admin/media/${media.id}`, "PATCH", { altText, title }),
              "Media metadata saved.",
            )
          }
          className="mt-4 min-h-10 w-full rounded-lg bg-brand text-sm font-bold disabled:opacity-50"
        >
          Save metadata
        </button>
        <Notice message={message} />
      </div>
    </article>
  );
}

function MediaModule({ data }: { data: unknown }) {
  const media = Array.isArray(data) ? (data as Media[]) : [];
  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-xl font-bold">{media.length} media assets</h2>
        <p className="text-sm text-muted">Source and usage metadata are retained</p>
      </div>
      {media.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      ) : (
        <Empty>
          No media assets yet. The source importer adds authorized images automatically.
        </Empty>
      )}
    </section>
  );
}

function LocationsModule({ data }: { data: unknown }) {
  const states = Array.isArray(data) ? (data as State[]) : [];
  const { pending, message, run } = useAction();
  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(
      () =>
        request("/admin/locations/cities", "POST", {
          stateId: form.get("stateId"),
          name: form.get("name"),
          isPublished: true,
        }),
      "City created.",
    );
  }
  const cityCount = states.reduce((total, state) => total + state.cities.length, 0);
  return (
    <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section>
        <h2 className="mb-5 text-xl font-bold">
          {states.length} states · {cityCount} cities
        </h2>
        <div className="space-y-3">
          {states.map((state) => (
            <details
              key={state.id}
              className="rounded-[18px] border border-white/12 bg-surface p-5"
            >
              <summary className="cursor-pointer list-none font-bold">
                {state.name}{" "}
                <span className="ml-2 text-sm font-normal text-muted">
                  {state.cities.length} cities
                </span>
              </summary>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {state.cities.map((city) => (
                  <div
                    key={city.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 p-3"
                  >
                    <div>
                      <p className="font-semibold">{city.name}</p>
                      <p className="text-xs text-muted">{city._count.profiles} profiles</p>
                    </div>
                    <button
                      disabled={pending}
                      onClick={() =>
                        run(
                          () =>
                            request(`/admin/locations/cities/${city.id}`, "PATCH", {
                              isPublished: !city.isPublished,
                            }),
                          city.isPublished ? "City hidden." : "City published.",
                        )
                      }
                      className={`h-3 w-3 rounded-full ${city.isPublished ? "bg-emerald-400" : "bg-slate-500"}`}
                      aria-label={city.isPublished ? `Hide ${city.name}` : `Publish ${city.name}`}
                    />
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
      <aside className="h-fit rounded-[20px] border border-white/12 bg-surface p-5">
        <h2 className="text-xl font-bold">Add city</h2>
        <form onSubmit={create} className="mt-5 space-y-3">
          <select
            required
            name="stateId"
            className="min-h-11 w-full rounded-xl border border-white/12 bg-surface-2 px-3"
          >
            <option value="">Choose state</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
          <input
            required
            minLength={2}
            name="name"
            placeholder="City name"
            className="min-h-11 w-full rounded-xl border border-white/12 bg-surface-2 px-3"
          />
          <button
            disabled={pending}
            className="min-h-11 w-full rounded-xl bg-brand font-bold disabled:opacity-50"
          >
            Add and publish
          </button>
        </form>
        <Notice message={message} />
      </aside>
    </div>
  );
}

function SeoModule({ data }: { data: unknown }) {
  const seo = (data ?? { metadata: [], missingAlt: [], redirects: [] }) as SeoData;
  return (
    <div className="mt-10 space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Metadata records" value={seo.metadata.length} />
        <Metric label="Missing alt text" value={seo.missingAlt.length} />
        <Metric label="Redirects" value={seo.redirects.length} />
      </div>
      <section>
        <h2 className="mb-4 text-xl font-bold">Recent metadata</h2>
        {seo.metadata.length ? (
          <div className="overflow-x-auto rounded-[18px] border border-white/12">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-muted">
                <tr>
                  <th className="p-4">Entity</th>
                  <th className="p-4">SEO title</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {seo.metadata.map((item) => (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="p-4 font-bold">{item.entityType}</td>
                    <td className="p-4">{item.seoTitle}</td>
                    <td className="max-w-xl p-4 text-muted">{item.metaDescription}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Imported profiles automatically create SEO metadata.</Empty>
        )}
      </section>
    </div>
  );
}

function LeadsModule({ data }: { data: unknown }) {
  const payload = (data ?? {}) as { leads?: Lead[]; reports?: Report[] };
  const { pending, message, run } = useAction();
  return (
    <div className="mt-10 grid gap-8 xl:grid-cols-2">
      <section>
        <h2 className="mb-4 text-xl font-bold">Enquiries ({payload.leads?.length ?? 0})</h2>
        <div className="space-y-3">
          {payload.leads?.map((lead) => (
            <article key={lead.id} className="rounded-[18px] border border-white/12 bg-surface p-5">
              <div className="flex justify-between gap-3">
                <h3 className="font-bold">{lead.name}</h3>
                <select
                  disabled={pending}
                  value={lead.status}
                  onChange={(event) =>
                    run(
                      () =>
                        request(`/admin/leads/${lead.id}`, "PATCH", { status: event.target.value }),
                      "Lead status updated.",
                    )
                  }
                  className="rounded-lg border border-white/12 bg-surface-2 px-2 text-sm"
                >
                  {["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "SPAM"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{lead.message}</p>
            </article>
          ))}
          {!payload.leads?.length ? <Empty>No enquiries.</Empty> : null}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-bold">Safety reports ({payload.reports?.length ?? 0})</h2>
        <div className="space-y-3">
          {payload.reports?.map((report) => (
            <article
              key={report.id}
              className="rounded-[18px] border border-white/12 bg-surface p-5"
            >
              <div className="flex justify-between gap-3">
                <h3 className="font-bold">{report.reason}</h3>
                <select
                  disabled={pending}
                  value={report.status}
                  onChange={(event) =>
                    run(
                      () =>
                        request(`/admin/content-reports/${report.id}`, "PATCH", {
                          status: event.target.value,
                        }),
                      "Report status updated.",
                    )
                  }
                  className="rounded-lg border border-white/12 bg-surface-2 px-2 text-sm"
                >
                  {["OPEN", "TRIAGED", "ACTIONED", "DISMISSED"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{report.details}</p>
            </article>
          ))}
          {!payload.reports?.length ? <Empty>No open reports.</Empty> : null}
        </div>
      </section>
      <Notice message={message} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[18px] border border-white/12 bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function AnalyticsModule({ data }: { data: unknown }) {
  const analytics = (data ?? { total: 0, byType: [] }) as Analytics;
  return (
    <section className="mt-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Events · 30 days" value={analytics.total} />
        {analytics.byType.slice(0, 7).map((item) => (
          <Metric key={item.type} label={item.type.replaceAll("_", " ")} value={item._count._all} />
        ))}
      </div>
      {!analytics.total ? <Empty>No analytics events recorded yet.</Empty> : null}
    </section>
  );
}

function SettingEditor({ setting }: { setting: Setting }) {
  const [value, setValue] = useState(JSON.stringify(setting.value, null, 2));
  const [isPublic, setIsPublic] = useState(setting.isPublic);
  const { pending, message, run } = useAction();
  return (
    <article className="rounded-[18px] border border-white/12 bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold">{setting.key}</h2>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
          />{" "}
          Public
        </label>
      </div>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-4 min-h-40 w-full rounded-xl border border-white/12 bg-surface-2 p-3 font-mono text-sm"
      />
      <button
        disabled={pending}
        onClick={() =>
          run(
            async () =>
              request(`/admin/settings/${setting.key}`, "PUT", {
                value: JSON.parse(value) as unknown,
                isPublic,
              }),
            "Setting saved.",
          )
        }
        className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-bold disabled:opacity-50"
      >
        Save setting
      </button>
      <Notice message={message} />
    </article>
  );
}

function SettingsModule({ data }: { data: unknown }) {
  const settings = Array.isArray(data) ? (data as Setting[]) : [];
  return (
    <section className="mt-10">
      {settings.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {settings.map((setting) => (
            <SettingEditor key={setting.id} setting={setting} />
          ))}
        </div>
      ) : (
        <Empty>No settings found. Run the database seed once.</Empty>
      )}
    </section>
  );
}

function UsersModule({ data }: { data: unknown }) {
  const users = Array.isArray(data) ? (data as AdvertiserUser[]) : [];
  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{users.length} registered users</h2>
        <span className="text-sm text-muted">
          Account and advert ownership is stored permanently
        </span>
      </div>
      <div className="space-y-4">
        {users.map((user) => (
          <article key={user.id} className="rounded-[18px] border border-white/12 bg-surface p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{user.displayName}</h3>
                <p className="mt-1 text-sm text-muted">
                  {user.email}
                  {user.mobile ? ` · ${user.mobile}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-white/8 px-3 py-1">{user.accountStatus}</span>
                <span className="rounded-full bg-white/8 px-3 py-1">
                  Email: {user.emailVerifiedAt ? "VERIFIED" : "PENDING"}
                </span>
                <span className="rounded-full bg-white/8 px-3 py-1">
                  Mobile: {user.mobileVerifiedAt ? "VERIFIED" : "PENDING"}
                </span>
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
              <p>
                <span className="text-muted">Joined</span>
                <br />
                {new Date(user.createdAt).toLocaleString()}
              </p>
              <p>
                <span className="text-muted">Last login</span>
                <br />
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
              </p>
              <p>
                <span className="text-muted">Roles</span>
                <br />
                {user.roles.map((item) => item.role.name).join(", ")}
              </p>
              <p>
                <span className="text-muted">Advertisements</span>
                <br />
                {user.profiles.length}
              </p>
            </div>
            {user.profiles.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted">
                    <tr>
                      <th className="py-2">Advert</th>
                      <th>Status</th>
                      <th>Moderation</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.profiles.map((profile) => (
                      <tr key={profile.id} className="border-t border-white/10">
                        <td className="py-3 font-semibold">{profile.displayName}</td>
                        <td>{profile.status}</td>
                        <td>{profile.moderationStatus}</td>
                        <td>{profile.paymentStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">No advertisements posted yet.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function CategoryEditor({ category }: { category: CategoryRow }) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [imageUrl, setImageUrl] = useState(category.imageUrl ?? "");
  const [published, setPublished] = useState(category.isPublished);
  const { pending, message, run } = useAction();
  return (
    <article className="rounded-[18px] border border-white/12 bg-surface p-5">
      {imageUrl ? (
        // Category URLs are entered by an administrator and displayed as a preview only.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`${name} category preview`}
          className="mb-5 aspect-[16/8] w-full rounded-xl object-cover"
        />
      ) : (
        <div className="mb-5 grid aspect-[16/8] place-items-center rounded-xl bg-surface-2 text-sm text-muted">
          Upload an image in Media, then paste its URL below
        </div>
      )}
      <label className="block text-sm font-bold">
        Name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 min-h-11 w-full rounded-xl border border-white/12 bg-surface-2 px-3"
        />
      </label>
      <label className="mt-4 block text-sm font-bold">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-2 min-h-24 w-full rounded-xl border border-white/12 bg-surface-2 p-3"
        />
      </label>
      <label className="mt-4 block text-sm font-bold">
        Homepage image URL
        <input
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://…"
          className="mt-2 min-h-11 w-full rounded-xl border border-white/12 bg-surface-2 px-3"
        />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={published}
          onChange={(event) => setPublished(event.target.checked)}
        />{" "}
        Published
      </label>
      <button
        disabled={pending}
        onClick={() =>
          run(
            () =>
              request(`/admin/categories/${category.id}`, "PATCH", {
                name,
                description,
                imageUrl: imageUrl || undefined,
                isPublished: published,
              }),
            "Category saved.",
          )
        }
        className="mt-5 rounded-xl bg-brand px-5 py-2.5 font-bold disabled:opacity-50"
      >
        Save category
      </button>
      <Notice message={message} />
    </article>
  );
}

function CategoriesModule({ data }: { data: unknown }) {
  const categories = Array.isArray(data) ? (data as CategoryRow[]) : [];
  return (
    <section className="mt-10">
      <div className="grid gap-5 lg:grid-cols-2">
        {categories.map((category) => (
          <CategoryEditor key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}

export function AdminModule({ module, initialData }: { module: ModuleName; initialData: unknown }) {
  if (initialData === null)
    return (
      <Empty>
        The API did not respond. Confirm PostgreSQL and the API on port 4000 are running, then
        reload.
      </Empty>
    );
  if (module === "profiles") return <ProfilesModule data={initialData} />;
  if (module === "users") return <UsersModule data={initialData} />;
  if (module === "categories") return <CategoriesModule data={initialData} />;
  if (module === "media") return <MediaModule data={initialData} />;
  if (module === "locations") return <LocationsModule data={initialData} />;
  if (module === "seo") return <SeoModule data={initialData} />;
  if (module === "leads") return <LeadsModule data={initialData} />;
  if (module === "analytics") return <AnalyticsModule data={initialData} />;
  return <SettingsModule data={initialData} />;
}
