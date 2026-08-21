"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type GoogleCredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            ux_mode: "popup";
            use_fedcm_for_prompt: boolean;
          }) => void;
          renderButton: (
            container: HTMLElement,
            options: {
              type: "standard";
              theme: "filled_black";
              size: "large";
              text: "continue_with";
              shape: "pill";
              logo_alignment: "left";
              width: number;
            },
          ) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({
  onCredential,
}: {
  onCredential: (credential: string) => void;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [loaded, setLoaded] = useState(
    () => typeof window !== "undefined" && Boolean(window.google?.accounts.id),
  );

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId || !loaded || !containerRef.current || !window.google) return;
    const container = containerRef.current;
    container.replaceChildren();
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) callbackRef.current(response.credential);
      },
      ux_mode: "popup",
      use_fedcm_for_prompt: true,
    });
    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      text: "continue_with",
      shape: "pill",
      logo_alignment: "left",
      width: 320,
    });
  }, [clientId, loaded]);

  if (!clientId) {
    return (
      <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-center text-xs text-amber-200">
        Google sign-in needs the production OAuth client ID.
      </p>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />
      <div
        ref={containerRef}
        className="flex min-h-11 justify-center"
        aria-label="Continue with Google"
      />
    </>
  );
}
