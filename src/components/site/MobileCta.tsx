"use client";
// Phones: a slim bar at the bottom with the main action, once the visitor has scrolled past the top of the page.
// Not on sign-in / sign-up (they're the action already); signed-in visitors get their dashboard instead.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function MobileCta() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const hidden = pathname === "/signup" || pathname === "/signin";

  useEffect(() => { fetch("/api/me").then((r) => setSignedIn(r.ok)).catch(() => {}); }, []);
  useEffect(() => {
    if (hidden) return;
    const onScroll = () => {
      // Hide again near the bottom, where the footer has its own links
      const nearEnd = innerHeight + scrollY > document.documentElement.scrollHeight - 220;
      setShow(scrollY > 520 && !nearEnd);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [hidden]);
  useEffect(() => { document.body.classList.toggle("has-mcta", !hidden); return () => document.body.classList.remove("has-mcta"); }, [hidden]);

  if (hidden) return null;
  return (
    <div className={"m-cta" + (show ? " show" : "")} aria-hidden={!show}>
      {signedIn ? (
        <a className="m-cta-main" href="/admin" tabIndex={show ? 0 : -1}>Open your dashboard<span aria-hidden="true">→</span></a>
      ) : (
        <Link className="m-cta-main bn" href="/signup" tabIndex={show ? 0 : -1}>আজই শুরু করুন<span aria-hidden="true">→</span></Link>
      )}
    </div>
  );
}
