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

Login, joins, chat, feed posts, and created events are simulated in JavaScript. They persist across refresh via `localStorage` (`melaro_state_v1`).

## Features

- Login, signup, and interest preferences
- Home feed with trending events and an upcoming list
- Search, plus category chips
- Event details — join, then chat + feed; leave (hosts cannot leave their own event)
- Create event (optional cover image, date/time, location, public/private, category)
- My Schedule — only events you joined or host
- Profile with past / hosted tabs and edit name + bio
- Bottom navigation across the main screens
- Responsive layout from ~320px through desktop
- Demo state survives navigation and refresh

Follow is shown on other profiles, and View Highlight on your own profile. Both are visible but disabled — they are not implemented.

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
│   ├── data.js                seed users, events, chat, posts
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

Routes look like `#event/evt_arc52`. Refresh and static hosts (including GitHub Pages) keep working. `history.pushState` would 404 without server rewrite rules.

Logged-out users are sent to login. Logged-in users hitting login/signup go to home. The bottom nav is hidden on login, signup, and preferences because those routes are not in the visible-nav list. Saving preferences navigates to Home; a logged-in user can still open Home directly.

### Local state

One object in `localStorage` under `melaro_state_v1` (shape version **3**): current user, users, events, joins, messages, posts, and search/category filters.

`state.js` is the only read/write layer. If this later grew a backend, pages would keep calling the same functions and `state.js` would talk to an API instead of `localStorage`.

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
| Preferences screen shows bottom nav | Nav hidden on the preferences route | Preferences is excluded from visible nav; saving goes to Home, but the URL is not locked |
| Edit Profile undescribed | Modal: name + bio | Not enough spec for a second screen |
| View Highlight / Follow | Disabled (Highlight on own profile, Follow on others) | No highlight reel or follow graph |
| Notification bell | Toast: "No new notifications" | No inbox |
| Create button white on one mockup | Red, same as login/signup | One accent for CTAs |
| Native date/time controls | Custom calendar + time menu | Windows dark-mode pickers were unreadable |

## Data & persistence

Seed users, events, chat, and posts live in `data.js`. After first load, `state.js` clones them into `localStorage`.

Joins, messages, feed posts, created events, and profile edits survive refresh. Organizers count as joined. Schedule lists only events the current user joined or hosts — a new signup starts empty.

Preferences are stored on the user. They do not rank or hide events on Home. Home shows upcoming events only, with category filtering. Search with an empty query does the same. A non-empty search looks across all events, including past ones, still with category filtering.

## Known limitations

- Auth is simulated and local-only. It is not suitable for production.
- Chat and feed are saved locally. They are not realtime and do not sync across browsers or tabs/windows — there is no `storage` event listener.
- Private events show a badge. Join is not restricted.
- Follower / following counts are static.
- Cover uploads are stored as data URLs, capped at 2MB, because of `localStorage` quota.
- The Home list skeleton is cosmetic, not a real network load.

## Production next steps

A real product would need an API, a database, hashed authentication, object storage/CDN for covers, WebSockets (or similar) for chat, server-side checks on join/leave/private events, and a real notification service.

## Development

About **8 hours**: screens and click-through first, then responsive layout, join/schedule behaviour, search, the category menu, feed posting, and remaining UI gaps.

## Business questions

Product/business answers are in [business-questions.md](./business-questions.md).
