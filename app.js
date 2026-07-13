/* ============================================================
   ANCESTOR CALENDAR™
   "Your ancestors did not survive thousands of years of hardship
    for you to casually pick a calendar date. Earn your appointment."
   ============================================================ */

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const STORE = {
  profile: 'ac_profile',
  events: 'ac_events',
  streak: 'ac_streak',
  key: 'ac_gemini_key',
};

const load = (k, d) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }
  catch { return d; }
};
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ---------- Global state ---------- */
const state = {
  profile: load(STORE.profile, null),   // { name, country, crest, body, traits }
  events: load(STORE.events, []),
  streak: load(STORE.streak, { count: 0, lastDate: null }),
  chosen: null,        // Date object selected by the orb
  draft: null,         // event being created
  verdict: null,       // AI judgement for the draft
  mathAttempts: 0,
};

/* ============================================================
   COUNTRIES + FICTIONAL ANCESTRAL PROFILES
   Playful, never insulting. The council is imaginary.
   ============================================================ */
const COUNTRIES = {
  'Nigeria': {
    crest: '🦁',
    body: 'Your fictional ancestral council believes you are capable of surviving long delays, unpredictable weather, and group chats with 400 unread messages. They have seen you say "I\'m on my way" from bed. They said nothing. They simply wrote it down.',
    traits: ['Elastic Time Mastery', 'Group Chat Survivor', 'Unshakeable Optimism'],
  },
  'Germany': {
    crest: '⚙️',
    body: 'Your fictional ancestral council values precision, structure, and probably wonders why you are five minutes late. They have prepared a spreadsheet about you. It has conditional formatting. You are currently amber.',
    traits: ['Punctuality Enforcement', 'Spreadsheet Lineage', 'Mildly Disappointed'],
  },
  'Japan': {
    crest: '🌸',
    body: 'Your fictional ancestral council appreciates discipline and is mildly concerned about your procrastination. They admire your dedication to planning. They have noticed the planning has not yet become doing.',
    traits: ['Quiet Discipline', 'Suspiciously Tidy', 'Deadline Adjacent'],
  },
  'Brazil': {
    crest: '🥁',
    body: 'Your fictional ancestral council believes any appointment can become a celebration if you simply refuse to leave. They approve of your scheduling. They do not approve of your ending times, which they consider optional.',
    traits: ['Joy Maximalist', 'Flexible Endings', 'Rhythm-Based Planning'],
  },
  'India': {
    crest: '🐘',
    body: 'Your fictional ancestral council has scheduled a 30-minute event that will last six hours and include three meals. They believe your calendar lacks ambition and also lacks relatives.',
    traits: ['Extended Timeline', 'Relative Overflow', 'Snack Contingency'],
  },
  'Italy': {
    crest: '🍇',
    body: 'Your fictional ancestral council believes lunch is a load-bearing structure of civilization. They have reviewed your 30-minute lunch block and are currently lying down.',
    traits: ['Lunch Architecture', 'Passionate Gesturing', 'Time Is A Suggestion'],
  },
  'United States': {
    crest: '🦅',
    body: 'Your fictional ancestral council notes that you have scheduled a meeting that could have been a message. They admire the hustle. They gently ask when you last sat down.',
    traits: ['Hustle Inheritance', 'Calendar Density', 'Rest Deficit'],
  },
  'United Kingdom': {
    crest: '☂️',
    body: 'Your fictional ancestral council would like to schedule this event, but only if nobody makes a fuss. They will arrive early, wait outside, and apologize to you for your own lateness.',
    traits: ['Preemptive Apology', 'Queue Discipline', 'Weather Anxiety'],
  },
  'France': {
    crest: '🥖',
    body: 'Your fictional ancestral council has reviewed your schedule and finds it lacking in leisure, bread, and philosophical objection. They will approve this event under protest, which they consider a hobby.',
    traits: ['Strategic Objection', 'Leisure Defense', 'Sighs Audibly'],
  },
  'Ghana': {
    crest: '⭐',
    body: 'Your fictional ancestral council is delighted you are scheduling anything at all. They only ask that you eat something first, greet everyone properly, and stop rushing like a person being chased.',
    traits: ['Greeting Protocol', 'Nourishment First', 'Unhurried Power'],
  },
  'Kenya': {
    crest: '🦓',
    body: 'Your fictional ancestral council has walked farther before breakfast than your entire step count this week. They support this appointment. They suggest you take the stairs.',
    traits: ['Endurance Bloodline', 'Cardio Judgement', 'Long-Range Vision'],
  },
  'Mexico': {
    crest: '🌵',
    body: 'Your fictional ancestral council believes an event without food is simply a meeting, and meetings are a punishment. They will attend, but they are bringing a cousin you have never met.',
    traits: ['Feast Requirement', 'Surprise Cousins', 'Celebration Instinct'],
  },
  'China': {
    crest: '🐉',
    body: 'Your fictional ancestral council has been planning across ten generations and finds your two-day notice charming, in the way one finds a puppy charming. They approve. Barely.',
    traits: ['Generational Strategy', 'Long Game', 'Patient Judgement'],
  },
  'South Korea': {
    crest: '🐯',
    body: 'Your fictional ancestral council notes you have scheduled rest, which they find suspicious, and will be monitoring. They ask that you at least be the best at resting.',
    traits: ['Excellence Reflex', 'Suspicious Of Rest', 'Group Harmony'],
  },
  'Egypt': {
    crest: '𓂀',
    body: 'Your fictional ancestral council built structures designed to last five thousand years. You have scheduled a 45-minute sync. They are being very polite about it.',
    traits: ['Monumental Ambition', 'Eternal Perspective', 'Politely Unimpressed'],
  },
  'Ethiopia': {
    crest: '☕',
    body: 'Your fictional ancestral council reminds you that coffee is a ceremony, not a fuel. Your "quick coffee" appointment has been reclassified as a spiritual event lasting three hours.',
    traits: ['Ceremony Over Speed', 'Ancient Calendar Flex', 'Unconquered Spirit'],
  },
  'Spain': {
    crest: '🔥',
    body: 'Your fictional ancestral council has looked at your 9 AM meeting and would like to know who hurt you. Dinner is at 10 PM. The event may begin after.',
    traits: ['Nocturnal Scheduling', 'Anti-Morning Stance', 'Siesta Advocacy'],
  },
  'Sweden': {
    crest: '❄️',
    body: 'Your fictional ancestral council supports this event, provided everyone agrees, nobody feels excluded, and there is a scheduled coffee break. They have already booked the coffee break.',
    traits: ['Consensus Engine', 'Fika Compliance', 'Quiet Efficiency'],
  },
  'Australia': {
    crest: '🦘',
    body: 'Your fictional ancestral council reviewed your event and said "yeah, nah, should be right." Nobody knows what this means. It has been approved.',
    traits: ['Casual Resilience', 'Ambiguous Approval', 'Fearless Outdoors'],
  },
  'Canada': {
    crest: '🍁',
    body: 'Your fictional ancestral council has apologized to your calendar for the inconvenience. Your calendar apologized back. The event may now proceed.',
    traits: ['Recursive Apology', 'Weather Hardiness', 'Aggressive Politeness'],
  },
  'Philippines': {
    crest: '🌴',
    body: 'Your fictional ancestral council has reviewed your event and immediately invited forty people, prepared food for eighty, and arranged for singing. You did not ask for this. It is happening.',
    traits: ['Hospitality Overflow', 'Karaoke Readiness', 'Joyful Chaos'],
  },
  'Poland': {
    crest: '🦬',
    body: 'Your fictional ancestral council has survived considerably worse than a Monday. They find your complaints about this appointment mathematically insignificant. Eat something.',
    traits: ['Industrial Endurance', 'Complaint Immunity', 'Feeding Insistence'],
  },
  'Greece': {
    crest: '🏛️',
    body: 'Your fictional ancestral council invented democracy, philosophy, and arguing at dinner. They will now debate whether this event should exist at all. This debate will outlast the event.',
    traits: ['Debate Instinct', 'Foundational Drama', 'Extended Dinner'],
  },
  'Argentina': {
    crest: '🧉',
    body: 'Your fictional ancestral council will attend, but they are bringing mate, staying late, and turning your appointment into an eight-hour discussion about football and destiny.',
    traits: ['Passion Surplus', 'Extended Discourse', 'Late-Night Stamina'],
  },
};

const GENERIC = (country) => ({
  crest: '✦',
  body: `Your fictional ancestral council from ${country} has convened. They have reviewed your scheduling habits with a mixture of pride and quiet alarm. They survived a great deal. They would simply like you to show up on time and drink water.`,
  traits: ['Ancestral Curiosity', 'Hydration Mandate', 'Cautious Optimism'],
});

const COUNTRY_LIST = [...Object.keys(COUNTRIES).sort(), 'Somewhere Else Entirely'];

/* ============================================================
   SCREENS
   ============================================================ */
const SCREENS = ['loading', 'onboarding', 'profile', 'physics', 'math', 'event', 'ask', 'calendar'];
let currentScreen = 'loading';

function show(name) {
  SCREENS.forEach((s) => $(`screen-${s}`).classList.remove('active'));
  const el = $(`screen-${name}`);
  el.classList.add('active');
  // Retrigger entry animation
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = '';
  currentScreen = name;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   TOASTS: random dramatic notifications
   ============================================================ */
const TOASTS = [
  ['SYSTEM', 'Your calendar has detected hesitation.'],
  ['COUNCIL', 'Your ancestors are wondering why you moved lunch three times.'],
  ['ENLIGHTENMENT', 'Your schedule has achieved temporary enlightenment.'],
  ['ADVISORY', 'A distant relative has been notified. They are disappointed but supportive.'],
  ['ANOMALY', 'Chronological instability detected. Probably fine. Probably.'],
  ['COUNCIL', 'The council has read your description. They have questions.'],
  ['WARNING', 'Your free time has been flagged as suspicious idleness.'],
  ['SYSTEM', 'Ancestral bandwidth is at 94%. Someone is talking about you.'],
  ['ADVISORY', 'Drink water. This is not a scheduling feature. They just insisted.'],
  ['COUNCIL', 'Somewhere, an ancestor has just sighed. This is unrelated. Probably.'],
  ['DESTINY', 'The universe has recalculated. You are still going to that meeting.'],
  ['SYSTEM', 'Your procrastination has been logged in the eternal record.'],
  ['COUNCIL', 'Great-great-grandmother would like to know if you have eaten today.'],
  ['ANOMALY', 'A calendar event has achieved sentience. It is nervous.'],
];

function toast(title, body, ms = 6000) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div class="t-title">${title}</div><div class="t-body">${body}</div>`;
  $('toasts').appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 500);
  }, ms);
}

function startAmbientToasts() {
  const tick = () => {
    // Never interrupt the loading ritual.
    if (currentScreen !== 'loading') {
      const [t, b] = pick(TOASTS);
      toast(t, b);
    }
    setTimeout(tick, rand(18000, 34000));
  };
  setTimeout(tick, 14000);
}

/* ============================================================
   1. LOADING SCREEN
   ============================================================ */
const LOAD_STEPS = [
  'Initializing ancestral calendar protocol...',
  'Connecting to historical wisdom database...',
  'Waking the council (they sleep lightly)...',
  'Calculating your scheduling destiny...',
  'Polishing the Orb of Destiny...',
];
const LOAD_HINTS = [
  'Do not close this ritual.',
  'The council is reviewing your past cancellations.',
  'Legally, we must state the council is imaginary.',
  'Almost there. Your ancestors waited longer.',
];

async function runLoader() {
  const wrap = $('loader-lines');
  const bar = $('loader-bar-fill');
  for (let i = 0; i < LOAD_STEPS.length; i++) {
    const line = document.createElement('div');
    line.className = 'line pending';
    line.innerHTML = `<span class="tick">◇</span><span>${LOAD_STEPS[i]}</span>`;
    wrap.appendChild(line);
    $('loader-hint').textContent = pick(LOAD_HINTS);
    bar.style.width = `${((i + 0.4) / LOAD_STEPS.length) * 100}%`;
    await sleep(rand(600, 1000));
    line.classList.remove('pending');
    line.classList.add('done');
    line.querySelector('.tick').textContent = '✓';
    bar.style.width = `${((i + 1) / LOAD_STEPS.length) * 100}%`;
    // Keep the list from growing past the fold
    if (wrap.children.length > 3) wrap.removeChild(wrap.firstChild);
  }
  $('loader-hint').textContent = 'The council will see you now.';
  await sleep(700);

  if (state.profile) {
    renderCalendar();
    show('calendar');
  } else {
    show('onboarding');
  }
}

/* ============================================================
   2. ONBOARDING + PROFILE
   ============================================================ */
function initCountries() {
  const sel = $('in-country');
  COUNTRY_LIST.forEach((c) => {
    const o = document.createElement('option');
    o.value = c;
    o.textContent = c;
    sel.appendChild(o);
  });
}

$('onboard-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('in-name').value.trim();
  const country = $('in-country').value;
  if (!name || !country) return;

  const prof = COUNTRIES[country] || GENERIC(country);
  state.profile = { name, country, ...prof };
  save(STORE.profile, state.profile);

  renderProfile();
  show('profile');
});

function renderProfile() {
  const p = state.profile;
  $('profile-crest').textContent = p.crest;
  $('profile-title').textContent = `${p.name}, the council has spoken.`;
  $('profile-body').textContent = p.body;
  $('profile-traits').innerHTML = p.traits
    .map((t) => `<span class="trait">${t}</span>`)
    .join('');
}

$('profile-continue').addEventListener('click', () => startNewTrial());

/* ============================================================
   3. THE PHYSICS BOARD: aim, drop, receive a month
   The user may not choose. The orb chooses.
   ============================================================ */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const YEAR = new Date().getFullYear();

const CANVAS_W = 640;
const CANVAS_H = 620;

let engine, runner, render, ball;
let dropping = false;
let chosenMonth = null;       // 0-indexed
let slotCount = 12;
let slotLabels = [];
let spinners = [];
let aimX = CANVAS_W / 2;      // where the user wants to release the orb

const M = window.Matter;

function buildBoard() {
  spinners = [];
  const canvas = $('physics-canvas');

  if (render) { M.Render.stop(render); }
  if (runner) { M.Runner.stop(runner); }
  if (engine) { M.World.clear(engine.world); M.Engine.clear(engine); }

  engine = M.Engine.create();
  engine.gravity.y = 1.05;

  render = M.Render.create({
    canvas,
    engine,
    options: {
      width: CANVAS_W,
      height: CANVAS_H,
      wireframes: false,
      background: 'transparent',
    },
  });

  slotCount = 12;
  slotLabels = MONTHS_SHORT;

  const W = CANVAS_W, H = CANVAS_H;
  const wallOpts = { isStatic: true, restitution: 0.4, render: { fillStyle: '#1a1c2b' } };
  const bodies = [];

  // Walls + floor
  bodies.push(M.Bodies.rectangle(-10, H / 2, 24, H * 2, wallOpts));
  bodies.push(M.Bodies.rectangle(W + 10, H / 2, 24, H * 2, wallOpts));
  bodies.push(M.Bodies.rectangle(W / 2, H + 8, W * 2, 24, {
    ...wallOpts,
    friction: 0.9,
    restitution: 0.15,
    render: { fillStyle: 'rgba(216,180,106,0.25)' },
  }));

  // Pegboard: the gauntlet of fate
  const rows = 9;
  const topY = 130;
  const gapY = 44;
  const pegR = 6;
  for (let r = 0; r < rows; r++) {
    const cols = r % 2 === 0 ? 9 : 8;
    const spacing = W / (cols + 1);
    const offset = r % 2 === 0 ? 0 : spacing / 2;
    for (let c = 0; c < cols; c++) {
      const x = spacing * (c + 1) + offset - (r % 2 === 0 ? 0 : 0);
      bodies.push(M.Bodies.circle(clamp(x, 14, W - 14), topY + r * gapY, pegR, {
        isStatic: true,
        restitution: 0.72,
        friction: 0.02,
        render: { fillStyle: r % 2 === 0 ? '#d8b46a' : '#9a7a38' },
      }));
    }
  }

  // Rotating chaos paddles, because destiny needs help
  const paddleY = topY + rows * gapY + 34;
  [W * 0.28, W * 0.72].forEach((px, i) => {
    const paddle = M.Bodies.rectangle(px, paddleY, 110, 9, {
      isStatic: true,
      restitution: 0.6,
      render: { fillStyle: '#e0562f' },
      chamfer: { radius: 4 },
    });
    bodies.push(paddle);
    spinners.push({ body: paddle, speed: i === 0 ? 0.028 : -0.034 });
  });

  // Slot dividers so the orb commits to a decision
  const slotW = W / slotCount;
  const divH = 74;
  const divY = H - divH / 2;
  for (let i = 1; i < slotCount; i++) {
    bodies.push(M.Bodies.rectangle(i * slotW, divY, 2.5, divH, {
      isStatic: true,
      restitution: 0.2,
      render: { fillStyle: 'rgba(216,180,106,0.4)' },
    }));
  }

  M.World.add(engine.world, bodies);

  runner = M.Runner.create();
  M.Runner.run(runner, engine);
  M.Render.run(render);

  // Overlay: slot labels + orb trail
  M.Events.on(render, 'afterRender', drawOverlay);
  M.Events.on(engine, 'beforeUpdate', () => {
    spinners.forEach((s) => M.Body.rotate(s.body, s.speed));
  });

  $('board-verdict').classList.remove('show');
  $('btn-drop').disabled = false;
  $('physics-stage-label').innerHTML =
    'Tap anywhere on the board to drop the orb from that spot. Wherever it lands becomes your <strong>month</strong>.';
  $('btn-drop').querySelector('span').textContent = 'Drop the Orb';
}

/* --- Aiming: the one freedom you are granted --- */
function canvasX(e) {
  const rect = $('physics-canvas').getBoundingClientRect();
  return clamp((e.clientX - rect.left) * (CANVAS_W / rect.width), 20, CANVAS_W - 20);
}

(function initAiming() {
  const canvas = $('physics-canvas');
  canvas.addEventListener('pointermove', (e) => {
    if (!dropping) aimX = canvasX(e);
  });
  canvas.addEventListener('pointerdown', (e) => {
    if (dropping) return;
    aimX = canvasX(e);
    dropOrb();
  });
})();

function drawOverlay() {
  const ctx = render.context;
  const W = CANVAS_W, H = CANVAS_H;

  // Header: the year is not negotiable
  ctx.save();
  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(233,195,126,0.7)';
  ctx.textAlign = 'center';
  ctx.fillText(`YEAR ${YEAR} · LOCKED BY THE COUNCIL`, W / 2, 28);
  ctx.font = '500 12px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('SELECTING YOUR MONTH', W / 2, 50);

  // Aim marker: a soft reticle where the orb will be released
  if (!dropping) {
    ctx.strokeStyle = 'rgba(233,195,126,0.5)';
    ctx.fillStyle = 'rgba(246,223,174,0.9)';
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(aimX, 66);
    ctx.lineTo(aimX, 108);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(aimX, 78, 13, 0, Math.PI * 2);
    ctx.globalAlpha = 0.35;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(aimX, 78, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Slot labels
  const slotW = W / slotCount;
  ctx.textAlign = 'center';
  const dense = slotCount > 16;
  ctx.font = dense ? '600 8px "JetBrains Mono", monospace' : '600 10px "JetBrains Mono", monospace';
  for (let i = 0; i < slotCount; i++) {
    const cx = i * slotW + slotW / 2;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(216,180,106,0.85)' : 'rgba(255,255,255,0.5)';
    if (dense && i % 2 === 1) ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillText(slotLabels[i], cx, H - 12);
  }
  ctx.restore();

  // Orb glow
  if (ball && !ball.isSleeping) {
    const p = ball.position;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 34);
    g.addColorStop(0, 'rgba(243,220,164,0.55)');
    g.addColorStop(1, 'rgba(243,220,164,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 34, 0, Math.PI * 2);
    ctx.fill();
  }
}

function daysInMonth(monthIdx, year) {
  return new Date(year, monthIdx + 1, 0).getDate();
}

$('btn-drop').addEventListener('click', dropOrb);

async function dropOrb() {
  if (dropping) return;
  dropping = true;
  $('btn-drop').disabled = true;
  $('physics-note').textContent = 'The orb is in flight. Nothing can be done now. Nothing.';

  if (ball) M.World.remove(engine.world, ball);

  ball = M.Bodies.circle(aimX, 78, 13, {
    restitution: 0.62,
    friction: 0.008,
    frictionAir: 0.002,
    density: 0.004,
    render: { fillStyle: '#f6dfae', strokeStyle: '#fff', lineWidth: 2 },
  });
  M.Body.setVelocity(ball, { x: rand(-1.2, 1.2), y: 0 });
  M.World.add(engine.world, ball);

  const slotIndex = await waitForRest();

  chosenMonth = clamp(slotIndex, 0, 11);
  revealBoardVerdict(
    'THE ORB HAS CHOSEN YOUR MONTH',
    MONTHS[chosenMonth].toUpperCase(),
    'The council nods. Slowly. Now you must earn the day.'
  );
  await sleep(2600);
  dropping = false;
  startMathTrial();
}

function waitForRest() {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      if (!ball) return resolve(0);
      const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
      const settled = speed < 0.35 && ball.position.y > CANVAS_H - 110;
      const timedOut = Date.now() - start > 14000;
      if (settled || timedOut) {
        const slotW = CANVAS_W / slotCount;
        const idx = Math.floor(clamp(ball.position.x, 1, CANVAS_W - 1) / slotW);
        return resolve(clamp(idx, 0, slotCount - 1));
      }
      requestAnimationFrame(check);
    };
    // Give the orb a moment of dignity before we start judging it
    setTimeout(() => requestAnimationFrame(check), 900);
  });
}

function revealBoardVerdict(kicker, big, sub) {
  const v = $('board-verdict');
  v.innerHTML = `
    <div>
      <div class="verdict-kicker">${kicker}</div>
      <div class="verdict-date">${big}</div>
      <div class="verdict-sub">${sub}</div>
    </div>`;
  v.classList.add('show');
}

/* Physics unavailable (offline CDN)? Destiny still finds a way. */
function physicsFallback() {
  toast('SYSTEM', 'Physics engine unreachable. The council will choose your month by pure will alone.');
  chosenMonth = Math.floor(Math.random() * 12);
  startMathTrial();
}

/* ============================================================
   4. THE DAY TRIAL
   A sacred number from 1 to 100 is drawn. Square it correctly
   and the number itself reveals your day of the month.
   ============================================================ */
function formatDate(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

let sacredNumber = 0;
let expectedSquare = 0;

function drawSacredNumber() {
  sacredNumber = Math.floor(rand(1, 101));
  expectedSquare = sacredNumber * sacredNumber;
  $('math-doy').textContent = sacredNumber;
  $('math-num').textContent = sacredNumber;
  $('math-input').value = '';
  $('math-analyzing').textContent = '';
}

function startMathTrial() {
  state.mathAttempts = 0;
  drawSacredNumber();
  $('math-date-badge').textContent = `${MONTHS[chosenMonth]} ${YEAR}`;
  show('math');
  setTimeout(() => $('math-input').focus(), 600);
}

$('btn-hint').addEventListener('click', () => {
  drawSacredNumber();
  toast('COUNCIL', 'A new sacred number has been drawn. The old one is offended.');
  $('math-input').focus();
});

$('math-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); submitMath(); }
});
$('btn-math-submit').addEventListener('click', submitMath);

const ANALYZE_STEPS = [
  'Analyzing mathematical compatibility...',
  'Checking numerical destiny...',
  'Consulting the ancient calculator spirits...',
];

async function submitMath() {
  const raw = $('math-input').value.trim().replace(/[,\s]/g, '');
  if (!raw) return;

  const btn = $('btn-math-submit');
  const out = $('math-analyzing');
  btn.disabled = true;
  $('math-input').disabled = true;

  for (const step of ANALYZE_STEPS) {
    out.textContent = step;
    await sleep(rand(700, 1100));
  }

  btn.disabled = false;
  $('math-input').disabled = false;

  if (Number(raw) === expectedSquare) {
    const day = ((sacredNumber - 1) % daysInMonth(chosenMonth, YEAR)) + 1;
    state.chosen = new Date(YEAR, chosenMonth, day);
    out.innerHTML = `<span class="ok">✓ You have proven your commitment. The number reveals your day: ${formatDate(state.chosen)}.</span>`;
    await sleep(2000);
    beginEventDraft();
  } else {
    state.mathAttempts++;
    out.textContent = '';
    triggerRejection();
  }
}

/* ============================================================
   5. WRONG ANSWER: ANCESTRAL REJECTION
   ============================================================ */
const RICK_EMBED = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0&rel=0';

function triggerRejection() {
  document.body.classList.add('shaking');
  setTimeout(() => document.body.classList.remove('shaking'), 600);

  const modal = $('rickroll');
  modal.hidden = false;
  $('rr-frame').src = RICK_EMBED;

  const m = modal.querySelector('.modal');
  m.classList.remove('shake-target');
  void m.offsetHeight;
  m.classList.add('shake-target');
}

function closeRejection() {
  $('rickroll').hidden = true;
  $('rr-frame').src = 'about:blank'; // stop the music. mercy.
}

$('btn-try-again').addEventListener('click', () => {
  closeRejection();
  $('math-input').value = '';
  $('math-analyzing').textContent = '';
  $('math-input').focus();
  toast('COUNCIL', `Attempt ${state.mathAttempts + 1}. They are still watching. They have nothing else to do.`);
});

$('btn-accept-defeat').addEventListener('click', () => {
  closeRejection();
  toast('DEFEAT ACCEPTED', 'Your surrender has been recorded in the eternal ledger. You may still try again, because the ledger is fake.');
});

/* ============================================================
   6. EVENT CREATION
   ============================================================ */
function beginEventDraft() {
  $('event-date-inline').textContent = formatDate(state.chosen);
  $('event-form').reset();
  $('ev-start').value = '20:00';
  $('ev-end').value = '21:30';
  document.querySelectorAll('.imp-opt').forEach((b) => b.classList.toggle('active', b.dataset.val === 'Grave'));
  show('event');
  setTimeout(() => $('ev-name').focus(), 600);
}

document.querySelectorAll('.imp-opt').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.imp-opt').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
  });
});

$('event-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const importance = document.querySelector('.imp-opt.active')?.dataset.val || 'Grave';
  state.draft = {
    id: `evt_${Date.now()}`,
    name: $('ev-name').value.trim(),
    start: $('ev-start').value,
    end: $('ev-end').value,
    location: $('ev-loc').value.trim() || 'An undisclosed location',
    description: $('ev-desc').value.trim() || 'No justification was offered.',
    importance,
    date: state.chosen.toISOString(),
  };
  state.verdict = null;
  $('verdict').hidden = true;
  $('btn-ask').disabled = false;
  show('ask');
});

/* ============================================================
   7. DIFFICULTY / CONFIDENCE / APPROVAL (local heuristics)
   ============================================================ */
const DIFFICULTY_RULES = [
  { re: /wedding|marriage|proposal|funeral|birth|graduation/i, label: 'Legendary', cls: 'legendary' },
  { re: /interview|exam|surgery|court|presentation|pitch|defen[cs]e|launch|move|moving/i, label: 'Heroic', cls: 'hard' },
  { re: /meeting|deadline|call|sync|review|appointment|doctor|dentist|gym|workout/i, label: 'Moderate', cls: 'moderate' },
  { re: /coffee|lunch|dinner|movie|nap|walk|brunch|chill|hangout|game|snack/i, label: 'Easy', cls: 'easy' },
];

function difficultyOf(ev) {
  const hay = `${ev.name} ${ev.description}`;
  for (const r of DIFFICULTY_RULES) {
    if (r.re.test(hay)) return { label: r.label, cls: r.cls };
  }
  if (ev.importance === 'Civilization-Altering') return { label: 'Legendary', cls: 'legendary' };
  if (ev.importance === 'Grave') return { label: 'Heroic', cls: 'hard' };
  if (ev.importance === 'Trivial') return { label: 'Easy', cls: 'easy' };
  return { label: 'Moderate', cls: 'moderate' };
}

const POSITIVE_SIGNALS = [
  { re: /friend|family|mum|mom|dad|sister|brother|cousin|reunion|dinner|party|date/i, txt: 'Friendship detected' },
  { re: /gym|run|workout|study|learn|course|read|practice|train|write|build/i, txt: 'Personal growth detected' },
  { re: /doctor|dentist|health|therapy|checkup|appointment/i, txt: 'Self-preservation instinct detected' },
  { re: /work|meeting|project|deadline|interview|pitch/i, txt: 'Contribution to the tribe detected' },
  { re: /celebrat|birthday|wedding|anniversary|festival/i, txt: 'Ceremonial honor detected' },
];
const NEGATIVE_SIGNALS = [
  { re: /nap|sleep|chill|netflix|scroll|movie|binge|nothing|relax|lie down/i, txt: 'Excessive laziness risk detected' },
  { re: /meeting|sync|call/i, txt: 'This could have been a message' },
  { re: /maybe|might|possibly|try to|if i|hopefully/i, txt: 'Commitment ambiguity detected' },
];

function scoreEvent(ev) {
  const hay = `${ev.name} ${ev.description}`;
  const reasons = [];
  let score = 58;

  POSITIVE_SIGNALS.forEach((s) => {
    if (s.re.test(hay)) { score += rand(7, 13); reasons.push({ t: 'plus', txt: s.txt }); }
  });
  NEGATIVE_SIGNALS.forEach((s) => {
    if (s.re.test(hay)) { score -= rand(6, 12); reasons.push({ t: 'minus', txt: s.txt }); }
  });

  const impBonus = { 'Trivial': -6, 'Notable': 3, 'Grave': 8, 'Civilization-Altering': 14 };
  score += impBonus[ev.importance] ?? 0;
  reasons.push({
    t: (impBonus[ev.importance] ?? 0) >= 0 ? 'plus' : 'minus',
    txt: `Importance declared: ${ev.importance}`,
  });

  // Late-night events: the council is old and sleeps early.
  const hour = parseInt(ev.start.split(':')[0], 10);
  if (hour >= 22) { score -= 7; reasons.push({ t: 'minus', txt: 'Scheduled during ancestral bedtime' }); }
  if (hour <= 6) { score += 9; reasons.push({ t: 'plus', txt: 'Rises before the sun. Impressive.' }); }

  if (ev.location && ev.location !== 'An undisclosed location') {
    score += 4; reasons.push({ t: 'plus', txt: 'Location specified. The council appreciates logistics.' });
  } else {
    score -= 5; reasons.push({ t: 'minus', txt: 'Location vague. Suspicious.' });
  }

  score = Math.round(clamp(score, 12, 99));
  const confidence = Math.round(clamp(score + rand(-14, 14), 15, 98));
  return { score, confidence, reasons: reasons.slice(0, 5) };
}

const CONFIDENCE_LINES = [
  'The universe agrees with this appointment.',
  'The universe is cautiously supportive.',
  'The universe has abstained from voting.',
  'The universe would like to speak with you privately.',
  'The universe is legally not allowed to comment.',
];
function confidenceLine(c) {
  if (c > 85) return CONFIDENCE_LINES[0];
  if (c > 65) return CONFIDENCE_LINES[1];
  if (c > 45) return CONFIDENCE_LINES[2];
  if (c > 28) return CONFIDENCE_LINES[3];
  return CONFIDENCE_LINES[4];
}

const WISDOM_CATEGORIES = ['Ancient Wisdom', 'Suspicious Advice', 'Dramatic Warning', 'Motivational Speech'];

/* ============================================================
   8. ASK YOUR ANCESTORS: Gemini (with offline scrolls)
   ============================================================ */
/* Demo key baked in so the app is deployable as-is.
   A key saved in Settings always overrides this one. */
const DEFAULT_GEMINI_KEY = 'AQ.Ab8RN6LPGaxIE-QQmKUnyv7zUtbV9SyVdhCzfTn6SseXZBji9w';

/* Tried in order; whichever answers first wins. */
const GEMINI_MODELS = ['gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-flash-latest'];

function geminiKey() { return load(STORE.key, '') || DEFAULT_GEMINI_KEY; }

const ASK_STEPS = [
  'Transmitting your plan across the ages...',
  'The council is reading. Slowly. On purpose.',
  'Cross-referencing your excuses with recorded history...',
  'Deliberating. Someone has raised their voice.',
  'A verdict has been reached.',
];

$('btn-ask').addEventListener('click', async () => {
  const btn = $('btn-ask');
  btn.disabled = true;
  const label = btn.querySelector('.ask-label');
  const original = label.textContent;

  for (const s of ASK_STEPS) {
    label.textContent = s;
    await sleep(rand(650, 1000));
  }

  const local = scoreEvent(state.draft);
  const wisdomCategory = pick(WISDOM_CATEGORIES);

  let ai;
  try {
    ai = await askGemini(state.draft, local, wisdomCategory);
  } catch (err) {
    console.warn('Council unreachable, using offline scrolls:', err);
    ai = null;
  }

  if (!ai) {
    ai = offlineCouncil(state.draft, local, wisdomCategory);
    toast('OFFLINE SCROLLS', 'The live council could not be reached. An older, grumpier council has answered instead.');
  }

  state.verdict = {
    ...local,
    message: ai.message,
    historical: ai.historical,
    wisdomCategory: ai.wisdomCategory || wisdomCategory,
    difficulty: difficultyOf(state.draft),
  };

  label.textContent = original;
  renderVerdict();
});

async function askGemini(ev, local, wisdomCategory) {
  const key = geminiKey();
  if (!key) return null;

  const p = state.profile;
  const prompt = `You are a fictional, dramatic ancestral advisor for a comedy calendar app called "Ancestor Calendar".
You are reviewing a person's calendar event and delivering a theatrical verdict.

RULES:
- Be funny, exaggerated, theatrical, and warm. Comedy, never cruelty.
- You are EXPLICITLY fictional. Never claim to know the user's real family, real history, or real ancestry.
- Refer to "your fictional ancestral council". Be playful about the user's country in a positive, affectionate way. Never insult a nationality or culture.
- End on an approving, joyful note. Joy is also important.
- Never use em dashes or en dashes. Use commas, periods, or colons instead.

USER:
- Name: ${p.name}
- Country selected: ${p.country}

EVENT:
- Mission: ${ev.name}
- Date: ${formatDate(new Date(ev.date))}
- Time: ${ev.start} to ${ev.end}
- Location: ${ev.location}
- Description: ${ev.description}
- Importance declared: ${ev.importance}

Respond ONLY with valid JSON (no markdown fences) in exactly this shape:
{
  "message": "3-6 short dramatic paragraphs separated by \\n\\n. Use the user's name. Be theatrical, funny, and ultimately approving.",
  "historical": "2-4 short lines contrasting ancestral hardship with this mundane event, ending with a reassurance that the council believes they will survive it.",
  "wisdomCategory": "${wisdomCategory}"
}`;

  let lastErr;
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 1.0, maxOutputTokens: 2048, responseMimeType: 'application/json' },
        }),
      });
      if (!res.ok) throw new Error(`Gemini ${model}: ${res.status}`);
      const data = await res.json();

      // Newer models may split the reply across parts (thoughts + JSON),
      // so join everything and extract the outermost JSON object.
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const text = parts.map((p) => p.text || '').join('\n');
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end <= start) throw new Error('No JSON in council response');

      const parsed = JSON.parse(text.slice(start, end + 1));
      if (!parsed.message) throw new Error('Malformed council response');
      const noDash = (s) => (typeof s === 'string' ? s.replace(/\s*[—–]\s*/g, ', ') : s);
      parsed.message = noDash(parsed.message);
      parsed.historical = noDash(parsed.historical);
      return parsed;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

/* --- The offline scrolls: still funny, no API key required --- */
function offlineCouncil(ev, local, wisdomCategory) {
  const p = state.profile;
  const time = to12h(ev.start);
  const approving = local.score >= 55;

  const openings = [
    `${p.name}, your fictional ancestral council has reviewed your plan to ${lower(ev.name)} at ${time}.`,
    `${p.name}. The council has gathered. They have read the words "${ev.name}" aloud. Twice.`,
    `A hush fell over the fictional ancestral council when your mission, "${ev.name}", was announced at ${time}.`,
  ];
  const reactions = [
    'They are confused.',
    'One of them has sat down.',
    'There was a long silence. It is still going.',
    'Someone asked if this was a joke. Nobody answered.',
  ];
  const laments = [
    'They crossed oceans.\nThey survived hardship.\nThey built civilizations.',
    'They walked for days without complaining.\nThey raised eleven children.\nThey never once owned a calendar.',
    'They endured famine, weather, and relatives.\nThey carried entire families on their backs.\nThey did not have notifications.',
  ];
  const punches = [
    `And now you are using this technology to schedule ${lower(ev.name)}.`,
    `And now the great technology of the ages is being used for "${ev.name}" at ${ev.location}.`,
    `You have inherited all of that. You have scheduled ${lower(ev.name)}.`,
  ];
  const blessings = approving
    ? [
        'However, they approve. Because joy is also important.',
        'They approve. Reluctantly. Then genuinely. Then loudly.',
        'The council approves. They only ask that you show up on time and eat something first.',
      ]
    : [
        'They approve anyway. They are not made of stone. They are made of drama.',
        'Approved, on one condition: you do not cancel. They will know.',
        'Approved, with a sigh so ancient it registered on a seismograph. Go. Be happy.',
      ];

  const message = [
    pick(openings),
    pick(reactions),
    pick(laments),
    pick(punches),
    pick(blessings),
  ].join('\n\n');

  const hist = [
    `Your ancestors faced uncertainty.\nYou face ${lower(ev.name)} at ${time}.\nThe council believes you will survive.`,
    `They faced unknown horizons and impossible odds.\nYou face ${ev.location}.\nThe council rates your survival odds as "almost certain."`,
    `Their greatest challenge was survival.\nYours is arriving by ${time}.\nThe council believes in you, mostly.`,
  ];

  return { message, historical: pick(hist), wisdomCategory };
}

const lower = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

function to12h(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ap}`;
}

function renderVerdict() {
  const v = state.verdict;
  const ev = state.draft;

  $('verdict-scores').innerHTML = `
    <div class="score-card">
      <div class="k">Ancestral Approval</div>
      <div class="v">${v.score}<small>/100</small></div>
      <div class="meter"><i style="width:0"></i></div>
      <ul class="reasons">
        ${v.reasons.map((r) => `<li class="${r.t}">${r.txt}</li>`).join('')}
      </ul>
    </div>
    <div class="score-card">
      <div class="k">Destiny Confidence Meter</div>
      <div class="v">${v.confidence}<small>%</small></div>
      <div class="meter"><i style="width:0"></i></div>
      <ul class="reasons">
        <li class="plus">${confidenceLine(v.confidence)}</li>
        <li class="plus">Event Difficulty: ${v.difficulty.label}</li>
      </ul>
    </div>`;

  $('verdict-message').textContent = v.message;

  $('verdict-extra').innerHTML = `
    <span class="chip wisdom">✦ ${v.wisdomCategory}</span>
    <span class="chip">Difficulty: ${v.difficulty.label}</span>
    <span class="chip ${v.confidence < 45 ? 'warn' : ''}">Confidence: ${v.confidence}%</span>
    <div class="historical">${escapeHtml(v.historical)}</div>`;

  $('verdict').hidden = false;

  // Animate the meters after paint, for maximum drama.
  requestAnimationFrame(() => {
    const meters = document.querySelectorAll('#verdict-scores .meter i');
    if (meters[0]) meters[0].style.width = `${v.score}%`;
    if (meters[1]) meters[1].style.width = `${v.confidence}%`;
  });

  $('btn-ask').disabled = false;
  $('btn-ask').querySelector('.ask-label').textContent = 'Ask Them Again (they love this)';
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

$('btn-reconsider').addEventListener('click', () => {
  toast('COUNCIL', 'Reconsidering, are we? They saw that. They wrote it down.');
  show('event');
});

$('btn-commit').addEventListener('click', () => {
  const ev = { ...state.draft, verdict: state.verdict, createdAt: Date.now() };
  state.events.push(ev);
  state.events.sort((a, b) => new Date(a.date) - new Date(b.date));
  save(STORE.events, state.events);

  bumpStreak();
  toast('MISSION SANCTIONED', `"${ev.name}" has been etched into the timeline. There is no undo. (There is an undo.)`);

  state.draft = null;
  state.verdict = null;
  state.chosen = null;

  renderCalendar();
  show('calendar');
});

function bumpStreak() {
  const today = new Date().toDateString();
  const s = state.streak;
  if (s.lastDate !== today) {
    s.count += 1;
    s.lastDate = today;
    save(STORE.streak, s);
  }
}

/* ============================================================
   9. CALENDAR VIEW: themed, obviously
   ============================================================ */
function renderCalendar() {
  const p = state.profile;
  $('cal-user').textContent = (p?.name || 'YOU').toUpperCase();
  $('stat-streak').textContent = state.streak.count;
  $('stat-count').textContent = state.events.length;
  $('streak-inline').textContent = state.streak.count;

  const list = $('events-list');
  const empty = $('events-empty');

  if (!state.events.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = state.events
    .map((ev, i) => {
      const d = new Date(ev.date);
      const diff = ev.verdict?.difficulty || difficultyOf(ev);
      const score = ev.verdict?.score ?? '?';
      return `
        <div class="event-card" data-id="${ev.id}" style="animation-delay:${i * 60}ms">
          <div class="ec-date">
            <div class="ec-day">${d.getDate()}</div>
            <div class="ec-mon">${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}</div>
          </div>
          <div>
            <div class="ec-title">Mission: ${escapeHtml(ev.name)}</div>
            <div class="ec-meta">
              <span>🕰 ${to12h(ev.start)} to ${to12h(ev.end)}</span>
              <span>📍 ${escapeHtml(ev.location)}</span>
              <span>⚑ ${escapeHtml(ev.importance)}</span>
            </div>
          </div>
          <div class="ec-right">
            <span class="diff ${diff.cls}">${diff.label}</span>
            <span class="approval-mini">Approval <b>${score}</b>/100</span>
          </div>
        </div>`;
    })
    .join('');

  list.querySelectorAll('.event-card').forEach((c) => {
    c.addEventListener('click', () => openDetail(c.dataset.id));
  });
}

function openDetail(id) {
  const ev = state.events.find((e) => e.id === id);
  if (!ev) return;
  const d = new Date(ev.date);
  const v = ev.verdict || {};
  const diff = v.difficulty || difficultyOf(ev);

  $('detail-body').innerHTML = `
    <div class="detail-title">Mission: ${escapeHtml(ev.name)}</div>
    <div class="detail-sub">${formatDate(d)} · ${to12h(ev.start)} to ${to12h(ev.end)}</div>
    <div class="detail-rows">
      <div class="detail-row"><span class="k">Where destiny unfolds</span><span class="v">${escapeHtml(ev.location)}</span></div>
      <div class="detail-row"><span class="k">Significance</span><span class="v">${escapeHtml(ev.description)}</span></div>
      <div class="detail-row"><span class="k">Importance</span><span class="v">${escapeHtml(ev.importance)}</span></div>
      <div class="detail-row"><span class="k">Difficulty</span><span class="v"><span class="diff ${diff.cls}">${diff.label}</span></span></div>
      <div class="detail-row"><span class="k">Approval</span><span class="v">${v.score ?? '?'}/100</span></div>
      <div class="detail-row"><span class="k">Destiny confidence</span><span class="v">${v.confidence ?? '?'}%. ${confidenceLine(v.confidence ?? 50)}</span></div>
      ${v.wisdomCategory ? `<div class="detail-row"><span class="k">Wisdom category</span><span class="v">${escapeHtml(v.wisdomCategory)}</span></div>` : ''}
    </div>
    ${v.message ? `<div class="detail-msg">${escapeHtml(v.message)}</div>` : ''}
    ${v.historical ? `<div class="historical">${escapeHtml(v.historical)}</div>` : ''}
    <div class="detail-actions">
      <button class="btn btn-ghost btn-sm" id="btn-challenge"><span>⚔ Challenge destiny</span></button>
      <button class="btn btn-danger btn-sm" id="btn-erase"><span>🜄 Erase this timeline decision</span></button>
    </div>`;

  $('event-modal').hidden = false;

  $('btn-challenge').addEventListener('click', () => {
    $('event-modal').hidden = true;
    toast('DESTINY CHALLENGED', 'Bold. The orb must be dropped again. Everything you knew is void.');
    state.events = state.events.filter((e) => e.id !== ev.id);
    save(STORE.events, state.events);
    renderCalendar();
    startNewTrial();
  });

  $('btn-erase').addEventListener('click', () => {
    state.events = state.events.filter((e) => e.id !== ev.id);
    save(STORE.events, state.events);
    $('event-modal').hidden = true;
    renderCalendar();
    toast('TIMELINE ERASED', 'That decision no longer exists. Your ancestors will pretend it never happened, but they remember.');
  });
}

$('btn-detail-close').addEventListener('click', () => { $('event-modal').hidden = true; });
$('event-modal').addEventListener('click', (e) => {
  if (e.target === $('event-modal')) $('event-modal').hidden = true;
});

function startNewTrial() {
  state.chosen = null;
  chosenMonth = null;
  spinners = [];
  dropping = false;
  show('physics');
  if (M) buildBoard();
  else physicsFallback();
}
$('btn-new-event').addEventListener('click', startNewTrial);

/* ============================================================
   10. SETTINGS
   ============================================================ */
$('btn-settings').addEventListener('click', () => {
  const p = $('settings-panel');
  p.hidden = !p.hidden;
  if (!p.hidden) {
    const saved = load(STORE.key, '');
    $('gemini-key').value = saved;
    $('settings-status').textContent = saved
      ? 'Live council connected (your key).'
      : 'Live council connected (built-in demo key).';
  }
});

$('btn-save-key').addEventListener('click', () => {
  const k = $('gemini-key').value.trim();
  save(STORE.key, k);
  $('settings-status').textContent = k
    ? 'Key saved. The live council awaits.'
    : 'Key cleared. Reverting to the built-in demo key.';
});

$('btn-reset-app').addEventListener('click', () => {
  Object.values(STORE).forEach((k) => localStorage.removeItem(k));
  location.reload();
});

/* ============================================================
   BOOT
   ============================================================ */
(function boot() {
  initCountries();
  startAmbientToasts();

  if (!window.Matter) {
    console.warn('Matter.js failed to load. Destiny will improvise.');
  }
  runLoader();
})();
