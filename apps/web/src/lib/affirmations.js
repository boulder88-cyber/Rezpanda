// apps/web/src/lib/affirmations.js
// ─────────────────────────────────────────────────────────────────────────
// A quiet daily line for the Dashboard welcome banner. Homeowner-themed on
// purpose — this isn't generic self-help copy, it's specifically about the
// unglamorous, real work of running a house: paying bills, tracking
// maintenance, keeping things calm and current.
//
// Deliberately simple: no API call, no cost, no backend. The same line shows
// for everyone on a given calendar day (picked by day-of-year, cycling
// through the list), and changes the next day. That's enough for "every
// time you log on, something's there" without adding a moving part that can
// fail, cost money, or need a server round-trip on every dashboard load.
// ─────────────────────────────────────────────────────────────────────────

export const AFFIRMATIONS = [
  "Every bill you pay on time is a little more peace of mind banked for later.",
  "You don't have to fix everything today — noticing it was due is the job.",
  "A home that's tracked is a home that's cared for. You're doing that.",
  "Owning a home is a thousand small decisions. You're making the right ones, one at a time.",
  "The roof held, the pipes held, the lights came on. That's not nothing.",
  "You're not behind. You're the person who's actually paying attention.",
  "Equity isn't built in one big move — it's built in days like today.",
  "Nobody grows up dreaming about gutter maintenance. You're doing it anyway. That's adulthood.",
  "A well-run home doesn't happen by accident. It happens because someone shows up. That's you.",
  "You checked in on your home today. Some days, that's the whole job.",
  "Every system you maintain now is a repair you didn't have to make later.",
  "You're allowed to feel proud of a boring, uneventful home week.",
  "The best home news is often no news. Enjoy today's quiet.",
  "Home ownership is a long game. You're playing it well.",
  "Today, your house is a little more yours than it was yesterday.",
  "You don't need to know everything about your home. You just need to know where to look. You do.",
  "Small maintenance now is a favor to future-you.",
  "You're the CEO of this house. CEOs don't have to know how everything works — they just have to know it's handled.",
  "A paid bill is a problem that will never bother you again.",
  "You're building a home that will still be standing long after today's to-do list is done.",
  "Nobody notices a well-maintained home. That's the whole point, and you're doing it right.",
  "Today's a good day to feel calm about your house. It's in good hands. Yours.",
  "You're not behind on anything that actually matters.",
  "The home you're building today is the stability someone gets to stand on tomorrow.",
  "You handled it. Whatever \"it\" was. You handled it.",
  "A house doesn't need a hero. It needs someone consistent. That's you.",
  "The most impressive home maintenance is the kind nobody ever has to think about.",
  "You're doing the unglamorous work that makes a house a home.",
  "Every day you keep the lights on for someone is a day well spent.",
  "You're not just paying bills. You're keeping a promise to the people who live here.",
  "Today, take the win: the house is still standing, and so are you.",
  "A calm home doesn't mean nothing happened — it means you handled what did.",
  "You're the reason this house runs smoothly, even when nobody's watching.",
  "Progress on a house is quiet. Keep going anyway.",
  "You don't have to love home maintenance to be great at it. You clearly are.",
  "Ownership isn't a feeling, it's a habit. You showed up for it again today.",
  "The paperwork, the filing, the small fixes — that's what \"taken care of\" actually looks like.",
  "You're not managing chaos. You're managing a home. There's a difference, and you know it.",
  "Every home system you understand is one less thing that can surprise you.",
  "A house that's known is a house that's safe. You know yours.",
  "Some days the win is just: nothing's overdue. Take it.",
];

// Day-of-year, 1-indexed, so Jan 1 = 1.
const dayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
};

// Returns today's line — the same for everyone on a given calendar day,
// cycling through the list as the year goes on.
export const getTodaysAffirmation = (date = new Date()) => {
  const idx = dayOfYear(date) % AFFIRMATIONS.length;
  return AFFIRMATIONS[idx];
};
