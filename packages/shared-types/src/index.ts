export type PublicProfileSummary = {
  id: string;
  displayName: string;
  slug: string;
  age: number;
  languages: string[];
  shortIntro: string;
  primaryLocation?: { city: string; citySlug: string; state: string; stateSlug: string };
  primaryMedia?: { secureUrl: string; altText: string; width?: number; height?: number };
};

export type ApiError = {
  statusCode: number;
  message: string | string[];
  error: string;
  requestId?: string;
};

export type AnalyticsEventName =
  | "PAGE_VIEW"
  | "PROFILE_VIEW"
  | "CALL_CLICK"
  | "WHATSAPP_CLICK"
  | "FORM_SUBMIT"
  | "GALLERY_OPEN"
  | "VIDEO_PLAY"
  | "SEARCH"
  | "FILTER";
