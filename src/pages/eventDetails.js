import {
  getEventById,
  isJoined,
  isOrganizer,
  joinEvent,
  leaveEvent,
  getAttendeeUsernames,
  findUserByUsername,
  getMessages,
  sendMessage,
  getPosts,
  createPost,
  getCurrentUser,
} from "../state.js";
import { goBack } from "../router.js";
import { escapeHTML, formatTime, formatDateWeekday, timeAgo, showToast, confirmDialog } from "../utils.js";
import { icons, avatarHTML, coverImageHTML, emptyStateHTML, bindTabs } from "../components.js";

export function renderEventDetails(container, { params }) {
  const eventId = params[0];
  let activeTab = "chat";

  function paint() {
    const event = getEventById(eventId);

    if (!event) {
      container.innerHTML = `
        <div class="page" style="padding:var(--space-6) var(--page-gutter)">
          ${emptyStateHTML({ title: "Event not found", body: "It may have been removed. Head back to explore other events." })}
          <button type="button" class="btn btn-primary" data-route="home" style="margin-top:16px;">Back to Home</button>
        </div>
      `;
      return;
    }

    const joined = isJoined(event.id);
    const hosting = isOrganizer(event);
    const organizer = findUserByUsername(event.organizer);
    const attendees = getAttendeeUsernames(event)
      .map((u) => findUserByUsername(u))
      .filter(Boolean);

    container.innerHTML = `
      <div class="page page--event-details">
        <div class="event-details__intro">
          <div class="event-hero" data-media data-fallback-letter="${escapeHTML(event.title.trim()[0]?.toUpperCase() || "M")}">
            ${coverImageHTML({
              src: event.cover?.startsWith?.("data:") ? event.cover : null,
              seed: event.coverSeed || event.cover || event.id,
              alt: `${event.title} cover image`,
            })}
            <span class="event-hero__scrim"></span>
            <div class="event-hero__top">
              <button type="button" class="event-hero__icon-btn" data-action="back" aria-label="Go back">${icons.back}</button>
              <span class="badge badge-outline">${escapeHTML(event.type === "private" ? "Private" : "Public")}</span>
            </div>
          </div>

          <div class="event-details__copy">
            <div class="event-info">
              <span class="badge" style="margin-bottom:10px;display:inline-flex;">${escapeHTML(event.category)}</span>
              <h1 class="event-info__title">${escapeHTML(event.title)}</h1>

              <button type="button" class="event-info__organizer" data-route="profile/${escapeHTML(event.organizer)}">
                ${avatarHTML(organizer, 32)}
                <span>Hosted by <strong>${escapeHTML(organizer?.fullName || event.organizer)}</strong></span>
              </button>

              <div class="event-meta-list">
                <div class="event-meta-row">
                  ${icons.clock}
                  <div><strong>${escapeHTML(formatDateWeekday(event.date))}</strong><span> ${escapeHTML(formatTime(event.time))}</span></div>
                </div>
                <div class="event-meta-row">
                  ${icons.pin}
                  <div><strong>${escapeHTML(event.location)}</strong></div>
                </div>
              </div>

              <p class="event-description">${escapeHTML(event.description)}</p>

              <div class="event-attendees">
                <div class="avatar-stack">
                  ${attendees.slice(0, 4).map((a) => avatarHTML(a, 30)).join("")}
                </div>
                <span class="event-attendees__count">${event.attendeeCount || attendees.length} going</span>
              </div>
            </div>

            ${hosting ? `<p class="joined-banner">${icons.tag} You're hosting this event</p>` : ""}
            ${!hosting && joined ? `<p class="joined-banner">${icons.tag} You've joined this event</p>` : ""}

            ${
              !joined
                ? `<div class="event-cta"><button type="button" class="btn btn-primary" data-action="join">Join Event</button></div>`
                : ""
            }
          </div>
        </div>

        ${joined ? `<div class="event-details__community">${renderJoinedArea({ event, activeTab, hosting })}</div>` : ""}
      </div>
    `;

    container.querySelector('[data-action="back"]')?.addEventListener("click", () => goBack("home"));
    container.querySelector('[data-action="join"]')?.addEventListener("click", () => {
      joinEvent(eventId);
      showToast("Joined event");
      paint();
    });
    container.querySelector('[data-action="leave"]')?.addEventListener("click", async () => {
      const confirmed = await confirmDialog({
        title: "Leave this event?",
        body: "You'll lose access to the chat room and feed unless you rejoin.",
        confirmLabel: "Leave Event",
      });
      if (!confirmed) return;
      leaveEvent(eventId);
      showToast("Left event");
      activeTab = "chat";
      paint();
    });

    if (joined) {
      wireJoinedArea(container, event, activeTab);
    }
  }

  function renderJoinedArea({ event, activeTab, hosting }) {
    return `
      <div class="tabs" role="tablist" aria-label="Event community">
        <button type="button" class="tab-btn" role="tab" id="tab-chat" data-tab="chat" aria-selected="${activeTab === "chat"}" aria-controls="tab-panel" tabindex="${activeTab === "chat" ? "0" : "-1"}">Chat Room</button>
        <button type="button" class="tab-btn" role="tab" id="tab-feed" data-tab="feed" aria-selected="${activeTab === "feed"}" aria-controls="tab-panel" tabindex="${activeTab === "feed" ? "0" : "-1"}">Feed</button>
      </div>

      <div id="tab-panel" role="tabpanel" aria-labelledby="${activeTab === "chat" ? "tab-chat" : "tab-feed"}">
        ${activeTab === "chat" ? renderChatPanel(event) : renderFeedPanel(event)}
      </div>

      ${
        !hosting
          ? `<div class="event-cta"><button type="button" class="btn btn-danger-outline" data-action="leave">Leave Event</button></div>`
          : `<div class="event-cta"><p class="field-hint" style="text-align:center;">As the host, you can't leave your own event.</p></div>`
      }
    `;
  }

  function renderChatPanel(event) {
    const messages = getMessages(event.id);
    const me = getCurrentUser();
    return `
      <div class="chat-list" id="chat-list">
        ${
          messages.length
            ? messages
                .map((m) => {
                  const author = findUserByUsername(m.author);
                  const self = m.author === me.username;
                  return `
                <div class="chat-msg ${self ? "chat-msg--self" : ""}">
                  ${!self ? avatarHTML(author, 28) : ""}
                  <div>
                    ${!self ? `<p class="chat-msg__author">${escapeHTML(author?.fullName || m.author)}</p>` : ""}
                    <div class="chat-msg__bubble"><p class="chat-msg__text">${escapeHTML(m.text)}</p></div>
                    <p class="chat-msg__time">${escapeHTML(timeAgo(m.ts))}</p>
                  </div>
                </div>`;
                })
                .join("")
            : emptyStateHTML({ title: "No messages yet", body: "Say hello to the other attendees." })
        }
      </div>
      <form class="chat-composer" id="chat-form">
        <label class="sr-only" for="chat-input">Write a message</label>
        <input class="input" id="chat-input" type="text" placeholder="Message the group…" autocomplete="off" />
        <button type="submit" aria-label="Send message">${icons.send}</button>
        <p class="chat-composer__hint" id="chat-hint" hidden>Write a message first.</p>
      </form>
    `;
  }

  function renderFeedPanel(event) {
    const posts = getPosts(event.id)
      .slice()
      .sort((a, b) => new Date(b.ts) - new Date(a.ts));
    return `
      <form class="feed-composer" id="feed-form">
        <label class="sr-only" for="feed-input">Share an update</label>
        <textarea class="input" id="feed-input" rows="2" placeholder="Share an update with attendees…"></textarea>
        <p class="field-error" id="feed-hint" hidden>Write an update first.</p>
        <button type="submit" class="btn btn-primary btn-sm">Post update</button>
      </form>
      <div class="feed-list">
        ${
          posts.length
            ? posts
                .map((p) => {
                  const author = findUserByUsername(p.author);
                  return `
                <div class="feed-post">
                  ${avatarHTML(author, 36)}
                  <div class="feed-post__body">
                    <p class="feed-post__author">${escapeHTML(author?.fullName || p.author)}</p>
                    <p class="feed-post__time">${escapeHTML(timeAgo(p.ts))}</p>
                    <p class="feed-post__text">${escapeHTML(p.text)}</p>
                  </div>
                </div>`;
                })
                .join("")
            : emptyStateHTML({
                title: "No updates yet",
                body: "Be the first to post an update for this event.",
              })
        }
      </div>
    `;
  }

  function wireJoinedArea(container, event, currentTab) {
    bindTabs(container.querySelector(".tabs"), {
      onChange(tab, { focus } = {}) {
        if (tab === activeTab) {
          if (focus) container.querySelector(`[data-tab="${tab}"]`)?.focus();
          return;
        }
        activeTab = tab;
        paint();
        if (focus) container.querySelector(`[data-tab="${tab}"]`)?.focus();
      },
    });

    const chatForm = container.querySelector("#chat-form");
    chatForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = container.querySelector("#chat-input");
      const hint = container.querySelector("#chat-hint");
      const text = input.value.trim();
      if (!text) {
        input.setAttribute("aria-invalid", "true");
        if (hint) hint.hidden = false;
        input.focus();
        return;
      }
      sendMessage(event.id, text);
      input.value = "";
      paint();
      requestAnimationFrame(() => {
        const list = container.querySelector("#chat-list");
        if (list) list.scrollTop = list.scrollHeight;
      });
    });
    container.querySelector("#chat-input")?.addEventListener("input", () => {
      const hint = container.querySelector("#chat-hint");
      if (hint) hint.hidden = true;
      container.querySelector("#chat-input")?.removeAttribute("aria-invalid");
    });

    const feedForm = container.querySelector("#feed-form");
    feedForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = container.querySelector("#feed-input");
      const text = input.value.trim();
      if (!text) {
        input.setAttribute("aria-invalid", "true");
        const hint = container.querySelector("#feed-hint");
        if (hint) hint.hidden = false;
        input.focus();
        return;
      }
      createPost(event.id, text);
      activeTab = "feed";
      paint();
    });
    container.querySelector("#feed-input")?.addEventListener("input", () => {
      const hint = container.querySelector("#feed-hint");
      if (hint) hint.hidden = true;
      container.querySelector("#feed-input")?.removeAttribute("aria-invalid");
    });

    const list = container.querySelector("#chat-list");
    if (list) list.scrollTop = list.scrollHeight;
  }

  paint();
}
