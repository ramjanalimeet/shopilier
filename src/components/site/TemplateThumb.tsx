"use client";
// A template card's picture: the real storefront at desktop width, then at phone width, side by side.
// Plain iframes (no device frames), each laid out at its real screen width and scaled down to its pane.
// They load only when the card comes near the screen, show a soft placeholder until the page has drawn,
// and gently scroll down the page while the card is hovered.
import { useEffect, useRef, useState } from "react";

const DESKTOP = 1280, PHONE = 390;

function Pane({ src, title, width, kind, show, scrollTo }: { src: string; title: string; width: number; kind: "desk" | "phone"; show: boolean; scrollTo: number }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [size, setSize] = useState<{ s: number; h: number } | null>(null);
  const [ready, setReady] = useState(false);

  // Scale the real-width page down to the pane
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => { const s = el.clientWidth / width; if (s > 0) setSize({ s, h: el.clientHeight / s }); };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  // Hover: glide down part of the page, and back up when the pointer leaves (same-origin, so we can scroll it)
  useEffect(() => {
    const win = frame.current?.contentWindow;
    if (!ready || !win || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    try {
      const doc = win.document.scrollingElement || win.document.documentElement;
      const from = doc.scrollTop, max = Math.max(0, doc.scrollHeight - win.innerHeight);
      const to = Math.min(max, scrollTo * max), dur = scrollTo ? 2600 : 700, t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        win.scrollTo(0, from + (to - from) * e);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    } catch { /* not reachable: leave it */ }
    return () => cancelAnimationFrame(raf);
  }, [scrollTo, ready]);

  return (
    <div ref={box} className={`tshot-pane tshot-${kind}${ready ? " is-ready" : ""}`}>
      {show && size && (
        <iframe ref={frame} src={src} title={title} tabIndex={-1} aria-hidden="true" scrolling="no" onLoad={() => setReady(true)}
          style={{ width, height: size.h, transform: `scale(${size.s})` }} />
      )}
    </div>
  );
}

export default function TemplateThumb({ id, name }: { id: string; name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [hover, setHover] = useState(false);

  // Load the previews only when the card is about to be seen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setShow(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setShow(true); io.disconnect(); }
    }, { rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const src = `/templates/preview/${id}`;
  return (
    <div ref={root} className="tshot" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Pane src={src} title={`${name} on a computer`} width={DESKTOP} kind="desk" show={show} scrollTo={hover ? 0.45 : 0} />
      <Pane src={src} title={`${name} on a phone`} width={PHONE} kind="phone" show={show} scrollTo={hover ? 0.3 : 0} />
    </div>
  );
}
