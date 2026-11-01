"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV = [["/", "Home"], ["/templates", "Templates"], ["/pricing", "Pricing"], ["/demo", "Demo"]] as const;
// Phones get a few more links in the menu sheet (the desktop has them in the footer)
const MORE = [["/resources", "Resources"], ["/contact", "Contact us"]] as const;

const Chevron = () => <svg className="m-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>;

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  // Signed-in visitors get a Dashboard button instead of Sign in / Sign up
  useEffect(() => {
    fetch("/api/me").then((r) => setSignedIn(r.ok)).catch(() => {});
  }, []);

  // A soft shadow under the header once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 8);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // The phone menu is a sheet over the page: the page behind doesn't scroll, Escape or growing past phone width closes it
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    const mq = matchMedia("(min-width: 761px)");
    const onChange = (e: MediaQueryListEvent) => { if (e.matches) setOpen(false); };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => { document.removeEventListener("keydown", onKey); mq.removeEventListener("change", onChange); document.body.classList.remove("menu-open"); };
  }, [open]);

  const close = () => setOpen(false);
  return (
    <header className={"site-header" + (open ? " open" : "") + (scrolled ? " scrolled" : "")}>
      <div className="container">
        <Link className="brand" href="/" onClick={close}><img className="brand-mark" src="/assets/logo.webp" width="34" height="34" alt="" />Shopilier</Link>
        <div className="nav-panel">
          <nav className="main-nav" aria-label="Main">
            {NAV.map(([href, label]) => {
              const active = pathname === href;
              return <Link key={href} href={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined} onClick={close}>{label}<Chevron /></Link>;
            })}
            {MORE.map(([href, label]) => {
              const active = pathname === href;
              return <Link key={href} href={href} className={"m-only" + (active ? " active" : "")} aria-current={active ? "page" : undefined} onClick={close}>{label}<Chevron /></Link>;
            })}
          </nav>
          <div className="auth">
            {signedIn ? (
              <a className="btn btn-dark" href="/admin" onClick={close}>Dashboard</a>
            ) : (
              <>
                <Link className="btn btn-outline" href="/signin" onClick={close}>Sign in</Link>
                <Link className="btn btn-dark" href="/signup" onClick={close}>Sign up</Link>
              </>
            )}
            <p className="m-only m-menu-note">Plans from ৳149 a month · bKash, Nagad &amp; cash on delivery</p>
          </div>
        </div>
        <button ref={toggle} className="menu-toggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}
