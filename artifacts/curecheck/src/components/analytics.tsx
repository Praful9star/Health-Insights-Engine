import { useEffect } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Analytics() {
  useEffect(() => {
    const gaId: string = typeof __GA_ID__ !== "undefined" ? __GA_ID__ : "";
    const osId: string = typeof __ONESIGNAL_ID__ !== "undefined" ? __ONESIGNAL_ID__ : "";

    if (gaId) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s);
      (window as any).dataLayer = (window as any).dataLayer ?? [];
      const gtag = (...args: unknown[]) => { (window as any).dataLayer.push(args); };
      gtag("js", new Date());
      gtag("config", gaId);
      (window as any).gtag = gtag;
    }

    if (osId) {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
      document.head.appendChild(s);
      s.onload = () => {
        (window as any).OneSignal = (window as any).OneSignal ?? [];
        (window as any).OneSignal.push(() => {
          (window as any).OneSignal.init({
            appId: osId,
            allowLocalhostAsSecureOrigin: true,
            welcomeNotification: { disable: true },
            notifyButton: { enable: false },
          });
        });
      };
    }
  }, []);

  return null;
}
