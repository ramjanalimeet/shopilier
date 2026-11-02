// Plans and the template catalog as visitors see them (sign-up, pricing). Mirrors Dash.PLANS() and
// Dash.TEMPLATES() in public/assets/dash.js, which the dashboards use, and the Worker's rules in plans.ts.
export type PlanId = "starter" | "business" | "pro";
export type Billing = "monthly" | "yearly";

export type Plan = { id: PlanId; name: string; price: number; blurb: string; features: string[] };

// Prices per month in Taka. Every plan comes with a free sub-domain, a custom domain and support.
export const PLANS: Plan[] = [
  { id: "starter", name: "Starter", price: 149, blurb: "For getting started online", features: ["10 page website", "10 products", "2 staff accounts", "Free sub-domain"] },
  { id: "business", name: "Business", price: 549, blurb: "For growing businesses", features: ["Unlimited pages", "100+ products", "10+ staff accounts", "Free sub-domain"] },
  { id: "pro", name: "Pro", price: 2499, blurb: "Everything unlimited", features: ["Unlimited pages", "Unlimited products", "Unlimited staff", "Free sub-domain"] },
];
export const planById = (id: string | null | undefined) => PLANS.find((p) => p.id === id);
export const taka = (n: number) => "৳" + Number(n).toLocaleString("en-US");

export type Template = {
  id: string; name: string; category: string; brand: string; desc: string; layout: "split" | "center" | "bleed" | "story";
  bg: string; text: string; accent: string; headline: string; sub: string; cta: string; status: "published" | "draft";
};

// The nine store templates, in the order the Templates page shows them. "brand" is the sample shop in the preview.
export const TEMPLATES: Template[] = [
  { id: "luxe-store", name: "Fashion & Clothing", category: "Fashion & Clothing", brand: "Shotiq", desc: "A Bangla clothing store for T-shirts and apparel, with collections, offers and a quick checkout.", layout: "story", bg: "#ffffff", text: "#141414", accent: "#0b5b35", headline: "আপনার স্টাইলের সাথে আপনার গল্প", sub: "প্রিমিয়াম কোয়ালিটির টি-শার্ট, যা আপনার ব্যক্তিত্বকে তুলে ধরে আরও এক ধাপ এগিয়ে। আরাম, স্টাইল আর মানের পারফেক্ট কম্বিনেশন।", cta: "এখনই কেনাকাটা করুন", status: "published" },
  { id: "saas-landing", name: "Electronics & Gadgets", category: "Electronics & Gadgets", brand: "GadgetBari", desc: "A sharp, modern Bangla store for phones, gadgets and accessories, with warranty, EMI and flash sales.", layout: "story", bg: "#ffffff", text: "#0f172a", accent: "#2f5bea", headline: "প্রতিদিনের জীবনে স্মার্ট গ্যাজেট", sub: "ইয়ারবাড, স্মার্টওয়াচ, ফোন আর ল্যাপটপ — ১০০% অরিজিনাল, ওয়ারেন্টিসহ।", cta: "এখনই কিনুন", status: "published" },
  { id: "mia-personal", name: "Beauty & Cosmetics", category: "Beauty & Cosmetics", brand: "Glow", desc: "A soft, elegant Bangla store for skincare, makeup and hair care, with combos and first-order offers.", layout: "story", bg: "#fffaf6", text: "#3b2418", accent: "#c25b6e", headline: "আপনার ত্বকের যত্নে প্রকৃতির ছোঁয়া", sub: "বাংলাদেশের ত্বকের জন্য বাছাই করা স্কিনকেয়ার, মেকআপ আর হেয়ার কেয়ার।", cta: "এখনই কিনুন", status: "published" },
  { id: "bistro-restaurant", name: "Grocery & Food", category: "Grocery & Food", brand: "Fresh Bazar", desc: "A bright, fresh Bangla grocery store with same-day delivery, monthly packs and daily deals.", layout: "story", bg: "#ffffff", text: "#13261a", accent: "#1f8a3b", headline: "তাজা বাজার, আপনার দরজায়", sub: "সবজি, ফল, চাল, ডাল আর নিত্যপ্রয়োজনীয় সব কিছু — একই দিনে ডেলিভারি।", cta: "বাজার শুরু করুন", status: "published" },
  { id: "growify-agency", name: "Home & Furniture", category: "Home & Furniture", brand: "Lume Home", desc: "A calm, spacious Bangla store for furniture and decor, with free fitting and 0% instalments.", layout: "story", bg: "#faf8f4", text: "#1f1d1a", accent: "#8a5a35", headline: "আপনার ঘর, আপনার গল্প", sub: "সোফা, চেয়ার, বেড আর লাইটিং — ফ্রি ডেলিভারি, ফিটিং আর ৫ বছরের ওয়ারেন্টি।", cta: "কালেকশন দেখুন", status: "published" },
  { id: "nova-portfolio", name: "Jewelry & Accessories", category: "Jewelry & Accessories", brand: "Rupkotha", desc: "A refined Bangla store for gold, diamond and pearl jewelry, with bridal sets and gift boxes.", layout: "story", bg: "#fffdf9", text: "#1a1714", accent: "#a8823b", headline: "প্রতিটি মুহূর্ত হোক স্মরণীয়", sub: "সোনা, রুপা আর মুক্তার গহনা — সার্টিফিকেট আর গিফট বক্সসহ।", cta: "কালেকশন দেখুন", status: "published" },
  { id: "writely-blog", name: "Single Product", category: "Single Product", brand: "Trailo", desc: "A one-page Bangla shop for a single hero product (a travel backpack): story, colours, reviews and FAQ.", layout: "split", bg: "#ffffff", text: "#14202b", accent: "#d9622b", headline: "এক ব্যাগেই সব অ্যাডভেঞ্চার", sub: "বৃষ্টিতেও ভিজবে না, কাঁধেও লাগবে না — ১৪টি পকেট আর ২ বছরের ওয়ারেন্টি।", cta: "এখনই অর্ডার করুন", status: "published" },
  { id: "fixly-services", name: "Single Product", category: "Single Product", brand: "FixKit", desc: "A one-page Bangla shop for one product (a tool kit): what's inside, add-ons, warranty and FAQ.", layout: "split", bg: "#f6f8fc", text: "#0b1b46", accent: "#1d4ed8", headline: "ঘরের সব মেরামত, এক বাক্সে", sub: "১০৮টি দরকারি টুল শক্ত কেসে, লাইফটাইম ওয়ারেন্টি।", cta: "এখনই অর্ডার করুন", status: "published" },
  { id: "launchly-landing", name: "Single Product", category: "Single Product", brand: "Nova Buds", desc: "A bold Bangla launch page for one product (earbuds), with launch pricing and pre-orders.", layout: "split", bg: "#0b0b14", text: "#ffffff", accent: "#ff3d8b", headline: "শব্দের নতুন অভিজ্ঞতা", sub: "নয়েজ ক্যান্সেলেশন, ৩০ ঘণ্টা ব্যাটারি — ২ বছরের ওয়ারেন্টি।", cta: "প্রি-অর্ডার করুন", status: "published" }
];
export const templateById = (id: string | null | undefined) => TEMPLATES.find((t) => t.id === id);

// Messages shown after "Continue with Google" fails (?error= on the sign-in and sign-up pages)
export const GOOGLE_ERRORS: Record<string, string> = {
  google: "Google sign-in didn't finish. Please try again.",
  google_email: "Your Google email isn't verified yet.",
  google_off: "Google sign-in isn't set up yet. Please use your email and password.",
  signups_off: "New sign-ups are paused for now. Please try again later.",
};
