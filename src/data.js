export const CATEGORIES = [
  "Sports",
  "Music",
  "Food",
  "Art",
  "Fitness",
  "Networking",
  "Gaming",
  "Outdoors",
  "Culture",
];

export const DEMO_USER = {
  username: "tanchho_25",
  fullName: "Tanchho Sherpa",
  email: "tanchho@gmail.com",
  password: "demo1234",
  followers: 201,
  following: 128,
  preferences: ["Sports", "Music", "Outdoors"],
  bio: "Run club regular. Always down for a concert.",
};

export const SEED_USERS = [
  DEMO_USER,
  {
    username: "arc_ktm",
    fullName: "Artha Run Club",
    email: "hello@arcktm.com",
    password: "demo1234",
    followers: 1840,
    following: 12,
    preferences: ["Sports", "Fitness", "Outdoors"],
    bio: "Kathmandu's community run club. Every Saturday, all paces welcome.",
  },
  {
    username: "sonepa_yoga",
    fullName: "Sanepa Yoga Collective",
    email: "studio@sonepayoga.com",
    password: "demo1234",
    followers: 612,
    following: 40,
    preferences: ["Fitness", "Culture"],
    bio: "Slow mornings, strong bodies. Sanepa, Lalitpur.",
  },
  {
    username: "ktm_soundwave",
    fullName: "KTM Soundwave",
    email: "bookings@soundwave.np",
    password: "demo1234",
    followers: 3450,
    following: 88,
    preferences: ["Music", "Culture"],
    bio: "Independent live music promoter based in Thamel.",
  },
];

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const SEED_EVENTS = [
  {
    id: "evt_dashain_run",
    title: "Dashain Morning Run",
    description:
      "An easy 5km shakeout around Tundikhel before the Dashain travel rush. All paces, coffee after at Himalayan Java.",
    date: daysFromNow(-12),
    time: "06:30",
    location: "Tundikhel, Kathmandu",
    category: "Sports",
    type: "public",
    organizer: "arc_ktm",
    cover: "dashain-run",
    trending: false,
    attendeeSample: ["tanchho_25"],
    attendeeCount: 34,
  },
  {
    id: "evt_cafe_crawl",
    title: "Cafe Crawl: Thamel Edition",
    description:
      "Four independent cafes, one afternoon. I organised this as a small group hang — no agenda beyond good coffee and a walk between stops.",
    date: daysFromNow(-20),
    time: "14:00",
    location: "Thamel, Kathmandu",
    category: "Food",
    type: "public",
    organizer: "tanchho_25",
    cover: "cafe-crawl",
    trending: false,
    attendeeSample: ["arc_ktm"],
    attendeeCount: 8,
  },
  {
    id: "evt_arc52",
    title: "ARC - 52: Saturday Long Run",
    description:
      "52nd run with the Artha Run Club members. A relaxed 8km loop around Sanepa followed by coffee. All paces welcome, walk-run groups available. Bring your own water bottle — we do not use single-use plastic at ARC events.",
    date: daysFromNow(4),
    time: "06:30",
    location: "International Club, Sanepa",
    category: "Sports",
    type: "public",
    organizer: "arc_ktm",
    cover: "arc52-run",
    trending: true,
    attendeeSample: ["tanchho_25", "sonepa_yoga"],
    attendeeCount: 47,
  },
  {
    id: "evt_soundwave_live",
    title: "Soundwave Sessions: Rooftop Live",
    description:
      "An intimate rooftop set from three of Kathmandu's rising indie acts. Doors open 6pm, first act at 7. Limited capacity — this one usually sells out early.",
    date: daysFromNow(6),
    time: "18:00",
    location: "Sundhara Terrace, Kathmandu",
    category: "Music",
    type: "public",
    organizer: "ktm_soundwave",
    cover: "rooftop-live",
    trending: true,
    attendeeSample: ["tanchho_25"],
    attendeeCount: 132,
  },
  {
    id: "evt_yoga_sunrise",
    title: "Sunrise Flow at Sanepa Studio",
    description:
      "A 60-minute vinyasa flow to start the weekend right. Mats provided, but bring your own if you have a favourite. Tea after class.",
    date: daysFromNow(2),
    time: "06:00",
    location: "Sanepa Yoga Studio, Lalitpur",
    category: "Fitness",
    type: "public",
    organizer: "sonepa_yoga",
    cover: "sunrise-yoga",
    trending: true,
    attendeeSample: [],
    attendeeCount: 19,
  },
  {
    id: "evt_pottery_pop",
    title: "Pottery Pop-Up: Hand-building Basics",
    description:
      "A beginner-friendly two-hour pottery workshop. No experience needed — all materials and firing included in the ticket price.",
    date: daysFromNow(9),
    time: "14:00",
    location: "Patan Art Loft",
    category: "Art",
    type: "public",
    organizer: "sonepa_yoga",
    cover: "pottery-workshop",
    trending: false,
    attendeeSample: [],
    attendeeCount: 14,
  },
  {
    id: "evt_food_crawl",
    title: "Ason Food Crawl",
    description:
      "A guided evening food crawl through Ason's back alleys — five stops, five very different flavours of the old city. Vegetarian route available on request.",
    date: daysFromNow(11),
    time: "17:30",
    location: "Ason, Kathmandu",
    category: "Food",
    type: "public",
    organizer: "arc_ktm",
    cover: "ason-food",
    trending: false,
    attendeeSample: [],
    attendeeCount: 26,
  },
  {
    id: "evt_founders_mixer",
    title: "Founders & Builders Mixer",
    description:
      "A casual evening for Kathmandu's early-stage founders, engineers and designers to trade notes. Short lightning-talk slot open on the night.",
    date: daysFromNow(14),
    time: "18:30",
    location: "Baluwatar Co-working Loft",
    category: "Networking",
    type: "private",
    organizer: "ktm_soundwave",
    cover: "founders-mixer",
    trending: false,
    attendeeSample: [],
    attendeeCount: 38,
  },
  {
    id: "evt_lan_party",
    title: "Weekend LAN Party: Valorant Cup",
    description:
      "5-a-side Valorant bracket, bring your own peripherals. Snacks and prizes for the top two teams. Spectators welcome.",
    date: daysFromNow(16),
    time: "12:00",
    location: "GameZone Arcade, Jhamsikhel",
    category: "Gaming",
    type: "public",
    organizer: "arc_ktm",
    cover: "lan-party",
    trending: false,
    attendeeSample: [],
    attendeeCount: 61,
  },
  {
    id: "evt_hike_shivapuri",
    title: "Shivapuri Ridge Day Hike",
    description:
      "A moderate 14km day hike through Shivapuri National Park. Meet at the entrance gate at 7am sharp — permits are handled by the organizer.",
    date: daysFromNow(19),
    time: "07:00",
    location: "Shivapuri Nagarjun National Park",
    category: "Outdoors",
    type: "public",
    organizer: "arc_ktm",
    cover: "shivapuri-hike",
    trending: false,
    attendeeSample: [],
    attendeeCount: 22,
  },
  {
    id: "evt_newari_walk",
    title: "Newari Heritage Walk",
    description:
      "A slow evening walk through Patan's courtyards with a local guide — temples, courtyards, and a Newari khaja set at the end.",
    date: daysFromNow(8),
    time: "16:00",
    location: "Patan Durbar Square",
    category: "Culture",
    type: "public",
    organizer: "sonepa_yoga",
    cover: "newari-walk",
    trending: false,
    attendeeSample: [],
    attendeeCount: 17,
  },
];

export const SEED_JOINS = [
  { eventId: "evt_arc52", username: "sonepa_yoga" },
];

export const SEED_MESSAGES = {
  evt_arc52: [
    { id: "m1", author: "arc_ktm", text: "Meeting point is the club gate, not the parking lot this time!", ts: daysAgoISO(2) },
    { id: "m2", author: "tanchho_25", text: "Got it, see everyone at 6:15 for warm-up", ts: daysAgoISO(1) },
    { id: "m3", author: "sonepa_yoga", text: "Bringing a stretching mat for anyone who wants a cooldown after", ts: daysAgoISO(0.5) },
  ],
};

export const SEED_POSTS = {
  evt_arc52: [
    { id: "p1", author: "arc_ktm", text: "Route map for Saturday is up — same loop as ARC-49 with the Sanepa extension.", ts: daysAgoISO(3) },
    { id: "p2", author: "sonepa_yoga", text: "Can't wait, missed the last two runs!", ts: daysAgoISO(2) },
  ],
};

function daysAgoISO(n) {
  const d = new Date();
  d.setHours(d.getHours() - n * 24);
  return d.toISOString();
}
