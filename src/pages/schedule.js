import { getCurrentUser, getJoinedEvents } from "../state.js";
import { eventCardHTML, emptyStateHTML, icons } from "../components.js";
import { todayISO } from "../utils.js";

export function renderSchedule(container) {
  const user = getCurrentUser();
  const today = todayISO();
  const events = getJoinedEvents(user.username)
    .slice()
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const upcoming = events.filter((e) => e.date >= today);
  const past = events.filter((e) => e.date < today).reverse();

  container.innerHTML = `
    <div class="page page--schedule">
      <div class="topbar">
        <p class="brand-word">Melaro</p>
        <span class="topbar__location">${icons.calendar} My Schedule</span>
      </div>

      <p class="schedule-group-label">Upcoming</p>
      <div class="event-list">
        ${
          upcoming.length
            ? upcoming.map(eventCardHTML).join("")
            : emptyStateHTML({
                title: "Nothing scheduled",
                body: "Join or host an event and it'll show up here.",
              })
        }
      </div>

      ${
        past.length
          ? `<p class="schedule-group-label">Past</p><div class="event-list">${past.map(eventCardHTML).join("")}</div>`
          : ""
      }
    </div>
  `;
}
