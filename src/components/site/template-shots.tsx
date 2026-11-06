import type { ReactNode } from "react";
import TemplateThumb from "./TemplateThumb";

// The template previews shown on the Templates page and in the preview popup (mock storefronts drawn with CSS and SVG).
// "live" adds the phone-size menu button the popup shows.
const Burger = () => (
  <span className="s-burger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg></span>
);

// A template's real storefront: on the card at desktop and phone width side by side, or full size in the preview popup
const RealShot = ({ id, name, live }: { id: string; name: string; live: boolean }) => (
  live
    ? <iframe className="shot-live-frame" src={`/templates/preview/${id}`} title={`${name} preview`} />
    : <TemplateThumb id={id} name={name} />
);

// desc is shown on the card in Bangla; search covers the English keywords and the Bangla description
export type TemplateCard = { id: string; name: string; desc: string; pop: number; newest: number; search: string; shot: (live: boolean) => ReactNode };

export const TEMPLATE_CARDS: TemplateCard[] = [
  {
    id: "luxe-store",
    name: "Fashion & Clothing",
    desc: "টি-শার্ট ও পোশাকের জন্য বাংলা অনলাইন দোকান, কালেকশন, অফার আর দ্রুত চেকআউটসহ।",
    pop: 0,
    newest: 0,
    search: "fashion & clothing a bangla clothing store for t-shirts and apparel, with collections, offers and a quick checkout. fashion clothing t-shirt tshirt polo hoodie saree boutique dress apparel bangla shotiq টি-শার্ট পোশাক",
    // The real storefront (see /templates/preview/luxe-store), so the card and the popup show the website you get
    shot: (live) => <RealShot id="luxe-store" name="Fashion & Clothing" live={live} />,
  },
  {
    id: "saas-landing",
    name: "Electronics & Gadgets",
    desc: "ফোন, গ্যাজেট ও এক্সেসরিজের জন্য ঝকঝকে আধুনিক দোকান, ওয়ারেন্টির তথ্যসহ।",
    pop: 1,
    newest: 2,
    search: "electronics & gadgets a clean, modern store for phones, gadgets and accessories, with warranty details. electronics gadgets phone mobile earbuds smart watch power bank tech accessories",
    shot: (live) => <RealShot id="saas-landing" name="Electronics & Gadgets" live={live} />,
  },
  {
    id: "bistro-restaurant",
    name: "Grocery & Food",
    desc: "মুদি, তাজা খাবার আর নিত্যপ্রয়োজনীয় পণ্যের দোকান, একই দিনে ডেলিভারিসহ।",
    pop: 3,
    newest: 5,
    search: "grocery & food a bold store for groceries, fresh food and daily essentials with same-day delivery. grocery food fresh fish vegetables rice oil bakery sweets restaurant cafe bazar",
    shot: (live) => <RealShot id="bistro-restaurant" name="Grocery & Food" live={live} />,
  },
  {
    id: "nova-portfolio",
    name: "Jewelry & Accessories",
    desc: "গয়না, ঘড়ি ও এক্সেসরিজের জন্য মিনিমাল, প্রিমিয়াম দোকান।",
    pop: 5,
    newest: 3,
    search: "jewelry & accessories a minimal, premium store for jewelry, watches and accessories. jewelry jewellery gold silver pearl necklace earrings bracelet watch accessories minimal",
    shot: (live) => <RealShot id="nova-portfolio" name="Jewelry & Accessories" live={live} />,
  },
  {
    id: "growify-agency",
    name: "Home & Furniture",
    desc: "ফার্নিচার, লাইটিং আর ঘর সাজানোর পণ্যের জন্য শান্ত, খোলামেলা দোকান।",
    pop: 4,
    newest: 6,
    search: "home & furniture a calm, spacious store for furniture, lighting and home decor. furniture home decor sofa chair table lamp lighting interior",
    shot: (live) => <RealShot id="growify-agency" name="Home & Furniture" live={live} />,
  },
  {
    id: "writely-blog",
    name: "Single Product",
    desc: "একটি প্রোডাক্টের গল্প বলা এক পেজের দোকান, ফিচার আর রিভিউসহ।",
    pop: 6,
    newest: 1,
    search: "single product a story-led one-page shop for a single hero product, with features and reviews. single product one product landing page backpack travel outdoor story trailo",
    shot: (live) => <RealShot id="writely-blog" name="Single Product" live={live} />,
  },
  {
    id: "fixly-services",
    name: "Single Product",
    desc: "একটি প্রোডাক্ট বিক্রির এক পেজের দোকান, ভেতরে কী আছে, ওয়ারেন্টি আর FAQ-সহ।",
    pop: 7,
    newest: 7,
    search: "single product a one-page shop that sells one product, with what's inside, a warranty and faq. single product one product landing page tool kit tools hardware fixkit",
    shot: (live) => <RealShot id="fixly-services" name="Single Product" live={live} />,
  },
  {
    id: "launchly-landing",
    name: "Single Product",
    desc: "নতুন প্রোডাক্ট লঞ্চের জন্য সাহসী পেজ, প্রি-অর্ডার আর আর্লি-বার্ড দামসহ।",
    pop: 8,
    newest: 8,
    search: "single product a bold launch page for one product, with pre-orders and early-bird pricing. single product one product launch pre-order waitlist earbuds gadget nova buds",
    shot: (live) => <RealShot id="launchly-landing" name="Single Product" live={live} />,
  },
  {
    id: "mia-personal",
    name: "Beauty & Cosmetics",
    desc: "স্কিনকেয়ার, কসমেটিকস ও বিউটি পণ্যের জন্য উষ্ণ, বন্ধুত্বপূর্ণ দোকান।",
    pop: 2,
    newest: 9,
    search: "beauty & cosmetics a warm, friendly store for skincare, cosmetics and beauty products. beauty cosmetics skincare makeup serum cream perfume glow",
    shot: (live) => <RealShot id="mia-personal" name="Beauty & Cosmetics" live={live} />,
  },
];
