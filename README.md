# Melaro

Melaro is a frontend-only event discovery app for Kathmandu — find what's on, join it, or host your own.

Built with vanilla HTML, CSS, and JavaScript. There is no application backend, database, or API. Demo users, events, and app state are simulated in the browser and saved in `localStorage`. Some seed cover images are loaded from `picsum.photos`.

## Demo

**Username:** `tanchho_25`  
**Password:** `demo1234`

Email login also works: `tanchho@gmail.com` / `demo1234`. The login screen has a control that fills these in.

To wipe local demo data and start over, run this in the browser console:

```js
melaroResetDemo()
```

It clears stored demo data and reloads the login screen.

Login, joins, chat, feed posts, follows, notifications, and created events are simulated in JavaScript. They persist across refresh via `localStorage` (`melaro_state_v1`).

The demo account is already joined to **ARC - 52** (chat + feed). Other events still show Join. The seed private event is **Founders & Builders Mixer** — it is not on Home; open `#/event/evt_founders_mixer`.

## Features

- Login, signup, and interest preferences
- Home feed with trending events, a **For you** chip, and preferred categories listed first
- Search, plus category chips
- Event details — join, copy link, attendee profiles, then chat + feed; leave (hosts cannot leave their own event)
- Create event (optional cover image, date/time, location, public/private, category)
- Private events stay off Home/Search unless you host or already joined; cards show a Private badge
- My Schedule — only events you joined or host
- Profile with full name + handle, follower/following lists, past / hosted tabs, **View Highlight** of hosted events, edit name + bio, and follow/unfollow
- Local notifications (join + follow) with an unread badge on the Home bell
- Bottom navigation across the main screens
- Responsive layout from ~320px through desktop
- Demo state survives navigation and refresh, and re-renders if another tab updates `localStorage`

## Tech stack

- HTML, CSS, vanilla JavaScript
- ES modules (no bundler)
- Hash-based routing
- `localStorage` for persistence

No frameworks, no npm packages, no `package.json`.

## Getting started

ES modules will not load from `file://`. Serve the folder:

```bash
npx serve .
```

or:

```bash
python -m http.server 8000
```

It starts a local server. Open the URL it prints.

Nothing to install.

## Project structure

```text
melaro/
├── index.html                 shell (#app, bottom nav, toasts)
├── README.md
├── business-questions.md
├── assets/css/                tokens, reset, components, page layout
├── src/
│   ├── app.js                 register routes, start router
│   ├── router.js              hash routes + auth guards
│   ├── state.js               the only module that reads/writes storage
│   ├── data.js                seed users, events, chat, posts, notifications
│   ├── components.js          cards, avatars, icons, nav markup
│   ├── pickers.js             custom date and time menus (create event)
│   ├── utils.js               dates, toasts, focus trap, confirm modal
│   └── pages/                 one file per screen
└── .gitignore
```

`index.html` is the only HTML page. Hash changes re-render `#app`. Pages call `state.js`; they never touch `localStorage` themselves.

`src/pages/` maps to the brief: login, signup, preferences, home (also used for `#search`), create, event details, schedule, profile.

## Architecture & technical decisions

### Vanilla JavaScript

The brief asked for HTML, CSS, and JavaScript. A framework would add a build step without changing the click-through a reviewer actually grades.

### Hash router

Routes look like `#/event/evt_arc52`. Refresh and static hosts (including GitHub Pages) keep working. `history.pushState` would 404 without server rewrite rules.

Logged-out users are sent to login. Logged-in users hitting login/signup go to home — or to preferences if they have not picked any interests yet. Auth and preference redirects use `history.replaceState`, so the browser back button does not loop. Opening an event (or other app) link while logged out returns you there after login. The bottom nav is hidden on login, signup, and preferences because those routes are not in the visible-nav list. Saving preferences navigates to Home — or back to the link you were opening. If a signed-up user has empty preferences, any other route sends them back to preferences.

### Local state

One object in `localStorage` under `melaro_state_v1` (shape version **6**): current user, users, events, joins, messages, posts, notifications, follows, and search/category filters. Search/category filters reset on logout so they do not leak between accounts. Return-to-link and in-app Back flags live in `sessionStorage`.

`state.js` is the only module that reads or writes `localStorage`. A `storage` listener reloads that object when another tab writes the same key, then the current screen re-renders. If this later grew a backend, pages would keep calling the same functions and `state.js` would talk to an API instead of `localStorage`.

### Full re-renders

The dataset is small. After join, leave, chat, or a tab change, the page is written with `innerHTML` and listeners are bound again. Simpler than a client store for this size.

### Responsive design

Mobile-first to match the ~390px screenshots, but not locked in a phone frame. Cards go 2- then 3-up; event details become two-column on larger screens. Auth and create stay narrow so forms stay readable. Bottom nav stays at the bottom.

## Design decisions & deviations

| Brief / mockup | This build | Why |
| --- | --- | --- |
| Preference tags all say "Technology" | Nine real categories | Brief asked to replace the placeholders |
| Phone-app column only | Full-width responsive site | This is a website, not an iPhone mock |
| Trending tiles like "Run Clubs / 128+ Events" | Real events; tap opens details | Those tiles had no destination |
| "See All" + upcoming date picker | Omitted | Chips + search already filter |
| Search / Calendar icons, no spec | Search is its own screen; Calendar is My Schedule | Otherwise those nav items do nothing |
| Preferences screen shows bottom nav | Nav hidden on that route; empty prefs redirect back here | Signup should not skip picking interests |
| Edit Profile undescribed | Modal: name + bio | Not enough spec for a second screen |
| View Highlight / Follow | Highlights of hosted events; Follow works on other profiles | Local reel + follow graph, not Instagram Stories |
| Notification bell | Modal list with unread badge | Local only — join and follow write into `localStorage` |
| Create button white on one mockup | Red, same as login/signup | One accent for CTAs |
| Native date/time controls | Custom calendar + time menu | Windows dark-mode pickers were unreadable |

## Data & persistence

Seed users, events, chat, posts, and notifications live in `data.js`. After first load, `state.js` clones them into `localStorage`.

Joins, messages, feed posts, created events, follows, notifications, and profile edits survive refresh. Organizers count as joined. The demo user is joined to ARC-52. Schedule lists only events the current user joined or hosts — a new signup starts empty.

Preferences are stored on the user. On Home and Search, upcoming events in those categories are listed first when the chip is All Events or For you. Other events still show. Private events are omitted from Home and Search unless you host them or have already joined; the details URL still works. Unknown profile URLs show a not-found state instead of silently falling back to your own profile.

## Known limitations

- Auth is simulated and local-only. It is not suitable for production.
- Chat, feed, and notifications are saved locally. They are not push or realtime; they do sync across tabs in the same browser via `localStorage`.
- Private events are hidden from Home/Search, but anyone with the details link can still join.
- In-app Back uses the browser history after you've moved around inside Melaro. If this tab was opened on a deep link, Back goes to Home instead of leaving the site.
- View Highlight is a local reel of hosted events (or past events if you have not hosted yet), not a social-media story product.
- Cover uploads are stored as data URLs, capped at 2MB, because of `localStorage` quota.

## Production next steps

A real product would need an API, a database, hashed authentication, object storage/CDN for covers, WebSockets (or similar) for chat, server-side checks on join/leave/private events, and a real notification service.

## Development

About **8 hours**: screens and click-through first, then responsive layout, join/schedule behaviour, search, the category menu, feed posting, and remaining UI gaps.

## Business questions

Product/business answers are in [business-questions.md](./business-questions.md).
