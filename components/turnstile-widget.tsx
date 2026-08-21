"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action: string;
          theme: "light" | "dark";
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({
  action,
  theme = "light",
  onToken,
}: {
  action: string;
  theme?: "light" | "dark";
  onToken: (token: string) => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onToken);
  const [loaded, setLoaded] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile),
  );
  useEffect(() => {
    callbackRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey || !loaded || !containerRef.current || !window.turnstile) return;
    const container = containerRef.current;
    container.replaceChildren();
    const widgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      action,
      theme,
      callback: (token) => callbackRef.current(token),
      "expired-callback": () => callbackRef.current(""),
      "error-callback": () => callbackRef.current(""),
    });
    return () => window.turnstile?.remove(widgetId);
  }, [action, loaded, siteKey, theme]);

  if (!siteKey) {
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />
      <div ref={containerRef} className="min-h-[65px]" aria-label="Cloudflare security check" />
    </>
  );
}
