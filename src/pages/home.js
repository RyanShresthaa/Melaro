import { getListedEvents, getTrendingEvents, getCategories, getFilters, setFilters } from "../state.js";
import { eventCardHTML, trendingCardHTML, icons, emptyStateHTML, skeletonCards } from "../components.js";
import { escapeHTML, debounce, showToast } from "../utils.js";
import { navigate } from "../router.js";

export function renderHome(container, { query } = {}) {
  const isSearch = Boolean(query?.isSearch);
  const categories = ["All Events", ...getCategories()];
  const filters = getFilters();

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
            : `<button type="button" class="icon-btn" id="notify-btn" aria-label="Notifications">${icons.bell}</button>`
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
      : `<p class="field-hint" style="padding:0 4px;">No trending events right now.</p>`;
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
      return getListedEvents({ query: "", category: filters.category, when: "upcoming" });
    }
    const searchQuery = (searchInput.value || "").trim();
    return getListedEvents({
      query: searchQuery,
      category: filters.category,
      when: searchQuery ? "all" : "upcoming",
    });
  }

  function renderList({ showSkeleton = false } = {}) {
    if (showSkeleton) {
      upcomingList.innerHTML = skeletonCards(3);
      return;
    }
    const all = getFilteredEvents();
    const heading = container.querySelector("#events-heading");
    if (heading && isSearch) {
      const q = (searchInput.value || "").trim();
      heading.textContent = q ? "Results" : "Upcoming Events";
    }
    if (all.length === 0) {
      upcomingList.innerHTML = emptyStateHTML({
        title: "No events match yet",
        body: isSearch ? "Try a different search or category." : "Try a different category.",
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
    container.querySelector(".search-bar")?.addEventListener("click", () => navigate("search"));
    container.querySelector("#notify-btn")?.addEventListener("click", () => {
      showToast("No new notifications");
    });
    renderList({ showSkeleton: true });
    setTimeout(renderList, 180);
  }
}
