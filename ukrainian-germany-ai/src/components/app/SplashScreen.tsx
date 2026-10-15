import { useEffect, useRef, useState } from "react";
import logoAsset from "@/assets/ug-ai-logo.webp.asset.json";
import backgroundAsset from "@/assets/ukrainian-wave-background.jpg.asset.json";

const SHOWN_KEY = "ugai-splash-shown";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const alreadyShown = useRef<boolean | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      alreadyShown.current ??= Boolean(window.sessionStorage.getItem(SHOWN_KEY));
      if (alreadyShown.current) {
        setVisible(false);
        return;
      }
      window.sessionStorage.setItem(SHOWN_KEY, "1");
    } catch {
      // ignore
    }
    const fadeTimer = window.setTimeout(() => setLeaving(true), 2500);
    const hideTimer = window.setTimeout(() => setVisible(false), 3000);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Ukrainian Germany AI"
      className={`splash-overlay letter-shell ${leaving ? "splash-leave" : ""}`}
    >
      <img src={backgroundAsset.url} alt="" aria-hidden="true" className="letter-mesh" />
      <div className="splash-emblem">
        <img src={logoAsset.url} alt="Ukrainian Germany AI" className="splash-logo" />
        <div className="splash-title">Ukrainian Germany AI</div>
        <div className="splash-flags" aria-hidden="true">
          <span className="letter-flag-uk" />
          <span className="letter-flag-de" />
        </div>
      </div>
    </div>
  );
}
