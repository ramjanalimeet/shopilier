"use client";
// Phones: a sticky bar at the bottom with the offer and the main action, once the visitor has scrolled past the
// hero's own button. It steps aside while a form field is being typed in (the keyboard is up) and near the footer.
// Not on sign-in / sign-up (they're the action already); signed-in visitors get their dashboard instead.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function MobileCta() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [typing, setTyping] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const hidden = pathname === "/signup" || pathname === "/signin";

  useEffect(() => { fetch("/api/me").then((r) => setSignedIn(r.ok)).catch(() => {}); }, []);
  useEffect(() => {
    if (hidden) return;
    const onScroll = () => {
      // Hide again near the bottom, where the footer has its own links
      const nearEnd = innerHeight + scrollY > document.documentElement.scrollHeight - 220;
      setShow(scrollY > 380 && !nearEnd);
    };
    const isField = (t: EventTarget | null) => t instanceof HTMLElement && t.matches("input, textarea, select, [contenteditable]");
    const onFocusIn = (e: FocusEvent) => { if (isField(e.target)) setTyping(true); };
    const onFocusOut = (e: FocusEvent) => { if (isField(e.target)) setTyping(false); };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [hidden]);
  useEffect(() => { document.body.classList.toggle("has-mcta", !hidden); return () => document.body.classList.remove("has-mcta"); }, [hidden]);

  if (hidden) return null;
  const visible = show && !typing;
  const tab = visible ? 0 : -1;
  return (
    <div className={"m-cta" + (visible ? " show" : "")} aria-hidden={!visible}>
      {signedIn ? (
        <a className="m-cta-main" href="/admin" tabIndex={tab}>Open your dashboard<span aria-hidden="true">→</span></a>
      ) : (
        <>
          <Link className="m-cta-offer bn" href="/pricing" tabIndex={tab}>
            <span className="m-cta-price">মাত্র <b>৳১৪৯</b>/মাস</span>
            <span className="m-cta-perks"><i aria-hidden="true" />ফ্রি ওয়েবসাইট সহ</span>
          </Link>
          <Link className="m-cta-main bn" href="/signup" tabIndex={tab}>আজই শুরু করুন<span aria-hidden="true">→</span></Link>
        </>
      )}
    </div>
  );
}
