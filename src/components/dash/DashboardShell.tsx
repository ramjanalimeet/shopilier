// The store dashboard shell (/admin and the live demo at /demo/app). The dashboard (src/dashboard) fills it:
// #view gets each page and the chat panel its conversations; the icons are rendered here so nothing moves when it starts.
import Icon from "@/components/Icon";

// Phones: the bottom tab bar (Products, Orders, Home in the middle, Website, Account), everything else in the Account sheet
const MORE: [string, string, string][] = [
  ["customers", "customers", "Customers"], ["shipping", "truck", "Shipping"], ["categories", "grid", "Categories"], ["discounts", "discount", "Discounts"],
  ["analytics", "barchart", "Analytics"], ["marketing", "megaphone", "Marketing"], ["pages", "pages", "Pages"], ["preferences", "settings", "Preferences"],
];

const NAV: [string, string, string][] = [
  ["home", "home", "Home"], ["orders", "orders", "Orders"], ["products", "tag", "Products"], ["categories", "grid", "Categories"],
  ["customers", "customers", "Customers"], ["shipping", "truck", "Shipping & Delivery"], ["analytics", "barchart", "Analytics"], ["marketing", "megaphone", "Marketing"], ["discounts", "discount", "Discounts"],
];

export default function DashboardShell({ demo = false }: { demo?: boolean }) {
  return (
    <>
      {demo && (
        // Demo mode: the real dashboard running on a sample store that lives in this browser (see /assets/demo.js)
        <div className="demo-bar" role="status">
          <span className="demo-bar-dot" aria-hidden="true" />
          <span className="demo-text"><b>Live demo</b><span className="demo-sep"> · </span><span className="demo-long">You&apos;re managing a sample store, Dhaka Threads. Everything works — your changes are saved in this browser only.</span><span className="demo-short">Sample store · saved in this browser</span></span>
          <button className="btn btn-ghost" type="button" id="demo-reset"><Icon name="undo" /><span>Reset demo</span></button>
          <a className="btn btn-cta" href="/signup" target="_top">Create your own store →</a>
        </div>
      )}
      <div className="app">
        <aside className="side" id="dashboard-nav" aria-label="Dashboard navigation">
          <a className="brand" href="#/home" title="Dashboard home"><img className="brand-mark" src="/assets/logo.webp" width="34" height="34" alt="" />Shopilier<small id="brand-plan" title="Your plan" /></a>
          <nav className="side-nav">
            {NAV.map(([route, icon, label]) => (
              <a key={route} className="nav-item" data-route={route} href={`#/${route}`}><Icon name={icon} />{label}{route === "orders" && <span className="count" data-badge />}</a>
            ))}
          </nav>
          <div className="side-group">
            <div className="side-head">Sales channel</div>
            <button className="nav-item store-toggle" type="button" id="store-toggle" aria-expanded="false" aria-controls="store-sub"><Icon name="store" />Online Store<Icon name="chevronDown" /></button>
            <div className="store-sub" id="store-sub" hidden>
              <a className="nav-item sub" data-route="themes" href="#/themes">Themes</a>
              <a className="nav-item sub" data-route="pages" href="#/pages">Pages</a>
              <a className="nav-item sub" data-route="navigation" href="#/navigation">Navigation</a>
              <a className="nav-item sub" data-route="preferences" href="#/preferences">Preferences</a>
            </div>
          </div>
          <div className="side-foot">
            <button className="nav-item" type="button" data-settings="general"><Icon name="settings" />Settings</button>
            {/* Store switcher: the stores signed in on this device (filled by the dashboard, at once from the last visit) */}
            <div className="acct">
              <button className="acct-btn" type="button" id="acct-btn" aria-haspopup="menu" aria-expanded="false" aria-controls="acct-menu">
                <span className="acct-ava" id="acct-ava" /><span className="acct-text"><b id="acct-name" /><small id="acct-sub" /></span><Icon name="chevronDown" />
              </button>
              <div className="acct-menu" id="acct-menu" role="menu" hidden />
            </div>
          </div>
        </aside>
        <div className="main">
          <header className="topbar">
            <button className="top-icon menu-btn" type="button" aria-label="Open menu"><Icon name="menu" /></button>
            {/* Phones: a menu button (opens More), the page's title in the middle */}
            <button className="top-icon m-grid-btn" type="button" aria-label="Menu" data-more-open><Icon name="grid" /></button>
            <b className="top-title" id="crumb" />
            {/* Phones, on Home: the Shopilier logo and your plan */}
            <a className="m-brand" href="#/home" aria-label="Shopilier home"><img src="/assets/logo.webp" width="36" height="36" alt="" />Shopilier<small data-brand-plan /></a>
            {/* Phones: the store's name where the sidebar would be */}
            <a className="top-store" href="#/home" aria-label="Home"><span className="top-store-ava" data-acct-ava /><span className="top-store-text"><b data-acct-name /><small data-acct-plan /></span></a>
            <label className="top-search"><Icon name="search" /><input id="top-search" type="search" placeholder="Search products, orders, customers…" aria-label="Search products, orders and customers" /></label>
            {/* Date filters for Home: a preset range, or one whole month */}
            <div className="top-filters" id="top-filters" hidden>
              <div className="dd" id="dd-range">
                <button className="top-select" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Date range"><Icon name="calendar" /><span className="dd-label" /><Icon name="chevronDown" /></button>
                <div className="dd-menu" role="listbox" aria-label="Date range" hidden />
              </div>
              <div className="dd" id="dd-month">
                <button className="top-select" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Month"><Icon name="calendar" /><span className="dd-label" /><Icon name="chevronDown" /></button>
                <div className="dd-menu dd-months" role="listbox" aria-label="Month" hidden />
              </div>
            </div>
            {/* Opens the published website in a new tab (a preview before it's published) */}
            <button className="top-visit" type="button" data-visit title="View your website" aria-label="View your website"><Icon name="globe" /><span>View website</span></button>
            <div className="bell-wrap">
              <button className="top-bell" type="button" id="bell" aria-label="Notifications" title="Notifications" aria-haspopup="true" aria-expanded="false" aria-controls="bell-menu"><Icon name="bell" /><span className="badge" id="bell-count" /></button>
              <div className="bell-menu" id="bell-menu" hidden />
            </div>
            <div className="profile">
              <button className="profile-btn" type="button" id="profile-btn" aria-haspopup="menu" aria-expanded="false">
                <span className="profile-avatar" id="me-avatar" />
                <span className="profile-text"><b id="me-name">Owner</b><span id="me-store" /></span>
                <Icon name="chevronDown" />
              </button>
              <div className="profile-menu" id="profile-menu" role="menu" hidden>
                <div className="profile-menu-head"><b id="menu-name" /><span id="me-email" /><span className="tag green" id="me-plan" /></div>
                <button role="menuitem" type="button" data-visit><Icon name="external" />View my website</button>
                <button role="menuitem" type="button" data-settings="general"><Icon name="settings" />Settings</button>
                <button role="menuitem" type="button" data-settings="billing"><Icon name="billing" />Plan &amp; billing</button>
                {demo ? (
                  <>
                    <a role="menuitem" href="/" target="_top"><Icon name="logout" />Exit demo</a>
                    <button type="button" id="logout" hidden />
                  </>
                ) : (
                  <button role="menuitem" type="button" id="logout"><Icon name="logout" />Log out</button>
                )}
              </div>
            </div>
          </header>
          <div className="scroll"><div id="view" /></div>
        </div>
      </div>
      {/* Phones: bottom tab bar and the More sheet */}
      <nav className="tabbar" aria-label="Dashboard">
        <a className="tab" data-route="products" data-tab="products" href="#/products"><Icon name="products" /><span>Products</span></a>
        <a className="tab" data-route="orders" data-tab="orders" href="#/orders"><Icon name="orders" /><span>Orders</span><span className="tab-badge" data-badge /></a>
        <a className="tab tab-home" data-route="home" data-tab="home" href="#/home"><Icon name="home" /><span>Home</span></a>
        <a className="tab" data-route="themes" data-tab="themes" href="#/themes"><Icon name="monitor" /><span>Website</span></a>
        <button className="tab" type="button" id="more-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="more-sheet"><Icon name="user" /><span>Account</span></button>
      </nav>
      <div className="more-sheet" id="more-sheet" role="dialog" aria-modal="true" aria-label="More" hidden>
        <div className="more-panel">
          <span className="more-grip" aria-hidden="true" />
          <button className="more-store" type="button" data-more="stores">
            <span className="top-store-ava" data-acct-ava /><span className="top-store-text"><b data-acct-name /><small data-acct-plan /></span><span className="more-switch">Switch<Icon name="chevronRight" /></span>
          </button>
          <div className="more-grid">
            {MORE.map(([route, icon, label]) => (
              <a key={route} className="more-tile" data-route={route} href={`#/${route}`}><span className="more-ico"><Icon name={icon} /></span>{label}</a>
            ))}
          </div>
          <div className="more-list">
            <button type="button" data-visit className="more-visit"><Icon name="globe" />View your website<Icon name="external" /></button>
            <button type="button" data-more="chat"><Icon name="chat" />Help &amp; chat<span className="more-badge" data-more-msgs /></button>
            <button type="button" data-more="settings"><Icon name="settings" />Settings</button>
            <button type="button" data-more="billing"><Icon name="billing" />Plan &amp; billing</button>
            <a href="#/website"><Icon name="brush" />Edit website</a>
            {demo ? <a href="/" target="_top"><Icon name="logout" />Exit demo</a> : <button type="button" data-more="logout" className="danger"><Icon name="logout" />Log out</button>}
          </div>
        </div>
      </div>
      {/* Chat with the Shopilier team: a button at the bottom right opens the conversation panel */}
      <button className="chat-fab" type="button" id="chat-fab" aria-label="Chat with the Shopilier team" aria-controls="chat-panel" aria-expanded="false"><Icon name="chat" /><span className="chat-badge" id="msg-count" /></button>
      <aside className="chat-panel" id="chat-panel" aria-label="Chat with the Shopilier team" hidden>
        <header className="chat-head">
          <span className="chat-logo"><img src="/assets/logo.webp" width="34" height="34" alt="" /></span>
          <div className="chat-title"><b>Chat with Shopilier</b><span>Questions, problems or help with your website</span></div>
          <button className="chat-icon-btn" type="button" id="chat-new" title="New message" aria-label="New message"><Icon name="plus" /></button>
          <button className="chat-icon-btn" type="button" id="chat-close" title="Close" aria-label="Close chat"><Icon name="x" /></button>
        </header>
        <div className="chat-body" id="chat-root" />
      </aside>
    </>
  );
}
