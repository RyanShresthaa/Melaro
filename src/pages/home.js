import {
  getListedEvents,
  getTrendingEvents,
  getCategories,
  getFilters,
  setFilters,
  getCurrentUser,
  getNotifications,
  unreadNotificationCount,
  markNotificationsRead,
} from "../state.js";
import { eventCardHTML, trendingCardHTML, icons, emptyStateHTML, openNotificationList } from "../components.js";
import { escapeHTML, debounce } from "../utils.js";
import { navigate } from "../router.js";

export function renderHome(container, { query } = {}) {
  const isSearch = Boolean(query?.isSearch);
  const prefs = getCurrentUser()?.preferences || [];
  const filters = getFilters();
  if (filters.category === "For you" && !prefs.length) {
    filters.category = "All Events";
    setFilters({ category: "All Events" });
  }
  const categories = ["All Events", ...(prefs.length ? ["For you"] : []), ...getCategories()];
  const unread = unreadNotificationCount();

  container.innerHTML = `
    <div class="page page--home ${isSearch ? "page--search" : ""}">
      <div class="topbar">
        ${
          isSearch
            ? `<h1 class="search-title">Search</h1>`
            : `<p class="brand-word">Melaro</p>
               <span class="topbar__location">${icons.pin} KTM, Nepal</span>`
        }
      </div>

      <div class="home-search-row">
        <label class="sr-only" for="home-search">Search events</label>
        <div class="search-bar">
          ${icons.search}
          <input id="home-search" type="search" placeholder="Search Events" value="${escapeHTML(isSearch ? filters.query || "" : "")}" ${isSearch ? "" : "readonly"} />
        </div>
        ${
          isSearch
            ? ""
            : `<button type="button" class="icon-btn" id="notify-btn" aria-label="${unread ? `Notifications (${unread} unread)` : "Notifications"}">${icons.bell}${
                unread ? `<span class="icon-btn__badge">${unread > 9 ? "9+" : unread}</span>` : ""
              }</button>`
        }
      </div>

      ${
        isSearch
          ? ""
          : `<div class="section-header"><h2>Trending Events</h2></div>
             <div class="trending-rail" id="trending-rail" aria-label="Trending events"></div>`
      }

      <div class="section-header">
        <h2>Category</h2>
      </div>
      <div class="chip-scroll" id="category-scroll" role="group" aria-label="Filter events by category"></div>

      <div class="section-header">
        <h2 id="events-heading">${isSearch ? "Results" : "Upcoming Events"}</h2>
      </div>
      ${
        !isSearch
          ? `<p class="home-pref-hint" id="pref-sort-hint"></p>`
          : ""
      }
      <div class="event-list" id="upcoming-list"></div>
    </div>
  `;

  const categoryScroll = container.querySelector("#category-scroll");
  const upcomingList = container.querySelector("#upcoming-list");
  const searchInput = container.querySelector("#home-search");

  if (!isSearch) {
    const trendingRail = container.querySelector("#trending-rail");
    const trending = getTrendingEvents();
    trendingRail.innerHTML = trending.length
      ? trending.map(trendingCardHTML).join("")
      : `<p class="field-hint trending-rail__empty">No trending events right now.</p>`;
  }

  categoryScroll.innerHTML = categories
    .map(
      (cat) => `
      <button type="button" class="chip-pill" data-cat="${escapeHTML(cat)}" aria-pressed="${cat === filters.category}">
        ${escapeHTML(cat)}
      </button>`
    )
    .join("");

  function getFilteredEvents() {
    if (!isSearch) {
      return getListedEvents({
        query: "",
        category: filters.category,
        when: "upcoming",
        preferInterests: filters.category === "All Events" || filters.category === "For you",
      });
    }
    const searchQuery = (searchInput.value || "").trim();
    return getListedEvents({
      query: searchQuery,
      category: filters.category,
      when: searchQuery ? "all" : "upcoming",
      preferInterests: filters.category === "All Events" || filters.category === "For you",
    });
  }

  function renderList() {
    const all = getFilteredEvents();
    const heading = container.querySelector("#events-heading");
    const hint = container.querySelector("#pref-sort-hint");
    const prefs = getCurrentUser()?.preferences || [];
    if (heading && isSearch) {
      const q = (searchInput.value || "").trim();
      heading.textContent = q ? "Results" : "Upcoming Events";
    }
    if (hint) {
      if (!isSearch && filters.category === "For you") {
        hint.textContent = "Only events in the categories you picked.";
      } else if (!isSearch && filters.category === "All Events" && prefs.length) {
        hint.textContent = "Events matching your interests are listed first.";
      } else {
        hint.textContent = "";
      }
    }
    if (all.length === 0) {
      upcomingList.innerHTML = emptyStateHTML({
        title: "No events match yet",
        body:
          filters.category === "For you"
            ? "None of your preferred categories have upcoming events yet."
            : isSearch
              ? "Try a different search or category."
              : "Try a different category.",
      });
      return;
    }
    upcomingList.innerHTML = all.map(eventCardHTML).join("");
  }

  categoryScroll.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip-pill");
    if (!btn) return;
    const cat = btn.getAttribute("data-cat");
    filters.category = cat;
    setFilters({ category: cat });
    categoryScroll.querySelectorAll(".chip-pill").forEach((c) => c.setAttribute("aria-pressed", c === btn));
    renderList();
  });

  if (isSearch) {
    const debouncedSearch = debounce(() => {
      setFilters({ query: searchInput.value.trim() });
      renderList();
    }, 300);
    searchInput.addEventListener("input", debouncedSearch);
    requestAnimationFrame(() => searchInput.focus());
    renderList();
  } else {
    searchInput.addEventListener("focus", () => navigate("search"));
    container.querySelector(".search-bar")?.addEventListener("click", (e) => {
      if (e.target.closest("input")) return;
      navigate("search");
    });
    container.querySelector("#notify-btn")?.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      const items = getNotifications();
      markNotificationsRead();
      btn.querySelector(".icon-btn__badge")?.remove();
      btn.setAttribute("aria-label", "Notifications");
      openNotificationList({
        items,
        onSelect: (route) => {
          if (route) navigate(route);
        },
      });
    });
    renderList();
  }
}
