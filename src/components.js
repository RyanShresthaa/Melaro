import { escapeHTML, seededImage, formatDate, formatTime, timeAgo, initials, trapFocus } from "./utils.js";

export const icons = {
  home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>`,
  search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`,
  plus: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
  calendar: `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`,
  user: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"/></svg>`,
  back: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 19l-7-7 7-7"/></svg>`,
  pin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-6.6 7-11.5A7 7 0 105 9.5C5 14.4 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/></svg>`,
  clock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
  tag: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 12l-8 8-9-9V3h8l9 9z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/></svg>`,
  eye: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.2A9.9 9.9 0 0112 5c6.5 0 10 7 10 7a17.6 17.6 0 01-3.2 4.1M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7a9.7 9.7 0 004.4-1"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/></svg>`,
  send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>`,
  x: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
  camera: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 8h3l2-2h6l2 2h3v12H4z"/><circle cx="12" cy="14" r="3.5"/></svg>`,
  share: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/><path d="M12 3v13"/><path d="M8 7l4-4 4 4"/></svg>`,
  bell: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 8a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 21a2 2 0 004 0"/></svg>`,
  logout: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M10 7V5a2 2 0 012-2h7v18h-7a2 2 0 01-2-2v-2"/><path d="M15 12H3"/><path d="M6 9l-3 3 3 3"/></svg>`,
};

export function avatarHTML(user, size = 40) {
  const label = initials(user?.fullName || user?.username || "?");
  return `<span class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.max(11, size * 0.36)}px" aria-hidden="true">${escapeHTML(label)}</span>`;
}

export function coverImageHTML({ src, seed, alt, className = "" }) {
  const finalSrc = src || seededImage(seed, 800, 500);
  return `
    <img src="${escapeHTML(finalSrc)}" alt="${escapeHTML(alt)}" loading="lazy"
      class="${className}" data-cover />
  `;
}

export function fallbackInitial(text = "") {
  return (text.trim()[0] || "M").toUpperCase();
}

export function eventCardHTML(event) {
  return `
    <button type="button" class="event-card" data-event-id="${escapeHTML(event.id)}" data-route="event/${escapeHTML(event.id)}">
      <div class="event-card__media" data-media data-fallback-letter="${escapeHTML(fallbackInitial(event.title))}">
        ${coverImageHTML({ src: event.cover?.startsWith?.("data:") ? event.cover : null, seed: event.coverSeed || event.cover || event.id, alt: `${event.title} cover image` })}
        <span class="badge event-card__badge">${escapeHTML(event.category)}</span>
        ${event.type === "private" ? `<span class="badge badge-outline event-card__badge event-card__badge--private">Private</span>` : ""}
      </div>
      <div class="event-card__body">
        <p class="event-card__title">${escapeHTML(event.title)}</p>
        <p class="event-card__desc">${escapeHTML(event.description || "")}</p>
        <p class="event-card__meta">${escapeHTML(event.location)}</p>
        <p class="event-card__meta">${formatDate(event.date)} · ${formatTime(event.time)}</p>
      </div>
    </button>
  `;
}

export function trendingCardHTML(event) {
  return `
    <button type="button" class="trending-card" data-route="event/${escapeHTML(event.id)}" aria-label="${escapeHTML(event.title)}">
      <div class="trending-card__media" data-media data-fallback-letter="${escapeHTML(fallbackInitial(event.title))}">
        ${coverImageHTML({ src: event.cover?.startsWith?.("data:") ? event.cover : null, seed: event.coverSeed || event.cover || event.id, alt: "" })}
      </div>
      <span class="trending-card__scrim"></span>
      <span class="trending-card__label">
        <strong>${escapeHTML(event.title.split(":")[0])}</strong>
        <span>${escapeHTML(event.category)}</span>
      </span>
    </button>
  `;
}

const NAV_ITEMS = [
  { route: "home", icon: "home", label: "Home" },
  { route: "search", icon: "search", label: "Search" },
  { route: "create", icon: "plus", label: "Create", isCreate: true },
  { route: "schedule", icon: "calendar", label: "Schedule" },
  { route: "profile", icon: "user", label: "Profile" },
];

export function renderBottomNav(activeRoute) {
  const nav = document.getElementById("bottom-nav");
  if (!nav) return;
  nav.innerHTML = NAV_ITEMS.map((item) => {
    const active = activeRoute === item.route;
    return `
      <button type="button" class="nav-btn ${item.isCreate ? "nav-btn--create" : ""}"
        data-route="${item.route}"
        aria-current="${active ? "page" : "false"}"
        aria-label="${item.label}">
        ${icons[item.icon]}
        <span class="nav-btn__label">${item.label}</span>
      </button>
    `;
  }).join("");
}

export function showBottomNav(show) {
  const nav = document.getElementById("bottom-nav");
  if (nav) nav.hidden = !show;
}

export function emptyStateHTML({ icon = "◌", title, body }) {
  return `
    <div class="empty-state">
      <p class="empty-state__icon" aria-hidden="true">${icon}</p>
      <p class="empty-state__title">${escapeHTML(title)}</p>
      <p class="empty-state__body">${escapeHTML(body)}</p>
    </div>
  `;
}

export function bindTabs(tablist, { onChange }) {
  if (!tablist) return;
  tablist.addEventListener("click", (e) => {
    const btn = e.target.closest("[role='tab']");
    if (!btn) return;
    onChange(btn.getAttribute("data-tab"));
  });
  tablist.addEventListener("keydown", (e) => {
    const tabs = [...tablist.querySelectorAll("[role='tab']")];
    const current = e.target.closest("[role='tab']");
    const index = tabs.indexOf(current);
    if (index < 0) return;
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    onChange(tabs[next].getAttribute("data-tab"), { focus: true });
  });
}

export function openPeopleList({ title, people, empty, hint, onSelect }) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal-card modal-card--list" role="dialog" aria-modal="true" aria-labelledby="people-title">
      <h3 id="people-title">${escapeHTML(title)}</h3>
      <div class="people-list">
        ${
          people.length
            ? people
                .map(
                  (person) => `
            <button type="button" class="people-row" data-username="${escapeHTML(person.username)}">
              ${avatarHTML(person, 40)}
              <span class="people-row__text">
                <strong>${escapeHTML(person.fullName || person.username)}</strong>
                <span>@${escapeHTML(person.username)}</span>
              </span>
            </button>`
                )
                .join("")
            : `<p class="field-hint">${escapeHTML(empty || "No one to show yet.")}</p>`
        }
      </div>
      ${hint ? `<p class="field-hint">${escapeHTML(hint)}</p>` : ""}
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" id="people-close">Close</button>
      </div>
    </div>
  `;
  document.body.append(backdrop);
  const card = backdrop.querySelector(".modal-card");
  let restore = () => {};
  function close() {
    restore();
    backdrop.remove();
  }
  restore = trapFocus(card, { onEscape: close });
  backdrop.querySelector("#people-close").addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.querySelectorAll("[data-username]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const username = btn.getAttribute("data-username");
      close();
      onSelect?.(username);
    });
  });
  (backdrop.querySelector(".people-row") || backdrop.querySelector("#people-close")).focus();
}

export function openNotificationList({ items, onSelect }) {
  const list = Array.isArray(items) ? items.filter((n) => n && n.text) : [];
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal-card modal-card--list" role="dialog" aria-modal="true" aria-labelledby="notify-title">
      <h3 id="notify-title">Notifications</h3>
      <div class="people-list">
        ${
          list.length
            ? list
                .map(
                  (n) => `
            <button type="button" class="people-row people-row--notify ${n.read ? "" : "is-unread"}" data-go="${escapeHTML(n.route || "")}">
              <span class="people-row__text">
                <strong>${escapeHTML(n.text)}</strong>
                <span>${escapeHTML(n.ts ? timeAgo(n.ts) : "")}</span>
              </span>
            </button>`
                )
                .join("")
            : `<p class="field-hint">No notifications yet.</p>`
        }
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" id="notify-close">Close</button>
      </div>
    </div>
  `;
  document.body.append(backdrop);
  const card = backdrop.querySelector(".modal-card");
  let restore = () => {};
  function close() {
    restore();
    backdrop.remove();
  }
  restore = trapFocus(card, { onEscape: close });
  backdrop.querySelector("#notify-close").addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const route = btn.getAttribute("data-go");
      close();
      if (route) onSelect?.(route);
    });
  });
  (backdrop.querySelector(".people-row") || backdrop.querySelector("#notify-close")).focus();
}

export function openHighlightReel({ events, onSelect }) {
  const slides = Array.isArray(events) ? events.filter((e) => e && e.id) : [];
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  let index = 0;

  backdrop.innerHTML = `
    <div class="modal-card modal-card--highlight${slides.length ? "" : " modal-card--highlight-empty"}" role="dialog" aria-modal="true" aria-labelledby="highlight-title">
      ${
        slides.length
          ? `<div class="highlight-frame">
               <button type="button" class="highlight-close" id="highlight-close" aria-label="Close">${icons.x}</button>
               <div class="highlight-media" data-media data-fallback-letter=""></div>
               <div class="highlight-meta">
                 <p class="highlight-kicker" id="highlight-title">Highlights</p>
                 <p class="highlight-name"></p>
                 <p class="highlight-when"></p>
               </div>
               <button type="button" class="highlight-nav highlight-nav--prev" id="highlight-prev" aria-label="Previous">‹</button>
               <button type="button" class="highlight-nav highlight-nav--next" id="highlight-next" aria-label="Next">›</button>
             </div>
             <p class="highlight-count" id="highlight-count"></p>`
          : `<h3 id="highlight-title">Highlights</h3>
             <p class="field-hint">No hosted events to show yet. Create one and it will appear here.</p>
             <div class="modal-actions">
               <button type="button" class="btn btn-outline" id="highlight-close">Close</button>
             </div>`
      }
    </div>
  `;
  document.body.append(backdrop);
  const card = backdrop.querySelector(".modal-card");
  let restore = () => {};
  function close() {
    restore();
    backdrop.remove();
  }
  restore = trapFocus(card, { onEscape: close });
  backdrop.querySelector("#highlight-close").addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  if (!slides.length) {
    backdrop.querySelector("#highlight-close").focus();
    return;
  }

  const media = backdrop.querySelector(".highlight-media");
  const nameEl = backdrop.querySelector(".highlight-name");
  const whenEl = backdrop.querySelector(".highlight-when");
  const countEl = backdrop.querySelector("#highlight-count");
  const prevBtn = backdrop.querySelector("#highlight-prev");
  const nextBtn = backdrop.querySelector("#highlight-next");

  function paintSlide() {
    const event = slides[index];
    if (!event) return;
    media.setAttribute("data-fallback-letter", fallbackInitial(event.title));
    media.innerHTML = coverImageHTML({
      src: event.cover?.startsWith?.("data:") ? event.cover : null,
      seed: event.coverSeed || event.cover || event.id,
      alt: `${event.title} cover image`,
    });
    nameEl.textContent = event.title;
    whenEl.textContent = `${formatDate(event.date)} · ${formatTime(event.time)}`;
    countEl.textContent = `${index + 1} / ${slides.length}`;
    prevBtn.hidden = slides.length < 2;
    nextBtn.hidden = slides.length < 2;
  }

  function step(delta) {
    index = (index + delta + slides.length) % slides.length;
    paintSlide();
  }

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    step(-1);
  });
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    step(1);
  });
  media.addEventListener("click", () => {
    const event = slides[index];
    close();
    if (event?.id) onSelect?.(event.id);
  });
  nameEl.addEventListener("click", () => {
    const event = slides[index];
    close();
    if (event?.id) onSelect?.(event.id);
  });

  function onNavKey(e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  }
  document.addEventListener("keydown", onNavKey);
  const innerRestore = restore;
  restore = () => {
    document.removeEventListener("keydown", onNavKey);
    innerRestore();
  };

  paintSlide();
  backdrop.querySelector("#highlight-close").focus();
}
