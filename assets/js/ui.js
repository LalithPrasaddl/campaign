/* The Race: screens. Reads and calls engine.js; holds no game rules of its own. */
const $ = id => document.getElementById(id);
let setup = { principles: [], secret: null, staff: [] }, G = null, screen = 'landing';
const START_MONEY = 60;

function fmtHour(h) { const x = h > 12 ? h - 12 : h; return x + (h < 12 ? 'am' : 'pm'); }
function esc(s) { return String(s); }
function face(id) { const p = STAFF[id]; return `<span class="face" style="--c:${p.color}" aria-hidden="true">${p.short.slice(0, 2)}</span>`; }
function go(top = true) { render(); if (top) window.scrollTo(0, 0); }

function render() {
  const app = $('app');
  if (screen === 'landing') return renderLanding(app);
  if (!G) return renderSetup(app);
  ({ morning: renderMorning, tour: renderTour, stop: renderStop, report: renderReport, hq: renderHQ, night: renderNight, end: renderEnd })[G.phase](app);
}

/* ---------- Landing ---------- */
function renderLanding(el) {
  el.innerHTML = `<section class="landing">
    <div class="sign" role="img" aria-label="Campaign yard sign: Rivera for Congress">
      <div class="who">RIVERA</div><div class="for">for Congress</div><div class="stripe"></div>
      <div class="line">Harlan Valley's 9th District</div>
    </div>
    <h1>The Race</h1>
    <p class="lede">Five days until the vote. Dale Whitmore has held this seat for eighteen years, and you're behind. Every town wants to hear something different, and some of it isn't true.</p>
    <ol class="steps">
      <li>Swear to three principles, pick your secret and hire a team.</li>
      <li>Each day, answer a morning call, then choose where to drive. Every town has its own moment.</li>
      <li>Each evening, hear from your team, give them tomorrow's jobs and buy an ad.</li>
      <li>Watch the results come in, then see what winning cost you.</li>
    </ol>
    <button class="btn" onclick="screen='setup';go()">Start a campaign</button>
    <p class="small" style="margin-top:12px">About 10 minutes. Text only, no sign-up.</p>
    <div class="note small"><p>This is an early build for feedback. The district, people and events are fictional.</p></div>
  </section>`;
}

/* ---------- Setup ---------- */
function renderSetup(el) {
  const pr = Object.entries(PRINCIPLES).map(([id, p]) => `<button class="choice" aria-pressed="${setup.principles.includes(id)}" onclick="togglePrinciple('${id}')">${p.text}</button>`).join('');
  const se = Object.entries(SECRETS).map(([id, p]) => `<button class="choice" aria-pressed="${setup.secret === id}" onclick="setup.secret='${id}';go(false)">${p.text}</button>`).join('');
  const st = Object.entries(STAFF).map(([id, p]) => `<button class="choice" aria-pressed="${setup.staff.includes(id)}" onclick="toggleStaff('${id}')"><span class="who-line">${face(id)}${p.name}</span><span class="meta">${p.role}, $${p.pay}k a day. ${p.text}</span></button>`).join('');
  const pay = setup.staff.reduce((a, x) => a + STAFF[x].pay, 0);
  const ready = setup.principles.length === 3 && setup.secret;
  el.innerHTML = `<section style="padding-top:24px">
    <p class="small">You are Sam Rivera, a former county commissioner.</p>
    <h1>Before you announce</h1>
    <h2>Swear to three principles <span class="count">${setup.principles.length} of 3</span></h2>
    <p class="small">Nothing stops you breaking them. The game remembers.</p>
    <div class="pick">${pr}</div>
    <h2>Choose your secret</h2>
    <p class="small">It's true, and it may come out.</p>
    <div class="pick">${se}</div>
    <h2>Hire your team <span class="count">$${pay}k a day</span></h2>
    <p class="small">You start with $${START_MONEY}k and raise about $6k a day. One person per role. They'll give advice, stand in for you and remember how you treat them.</p>
    <div class="pick">${st}</div>
    <div class="cta"><button class="btn" ${ready ? '' : 'disabled'} onclick="startGame()">${ready ? 'Announce your campaign' : 'Pick 3 principles and a secret'}</button></div>
  </section>`;
}
function togglePrinciple(id) { const a = setup.principles; if (a.includes(id)) a.splice(a.indexOf(id), 1); else if (a.length < 3) a.push(id); go(false); }
function toggleStaff(id) { const a = setup.staff; if (a.includes(id)) a.splice(a.indexOf(id), 1); else { const r = STAFF[id].role; setup.staff = a.filter(x => STAFF[x].role !== r); setup.staff.push(id); } go(false); }
function startGame() { G = newGame(Math.random, { principles: setup.principles.slice(), secret: setup.secret, staff: setup.staff.slice() }); go(); }

/* ---------- Shared pieces ---------- */
function bar() {
  const days = Array.from({ length: DAY_COUNT }, (_, i) => `<i class="${i + 1 < G.day ? 'done' : i + 1 === G.day ? 'now' : ''}"></i>`).join('');
  const word = v => v >= 70 ? 'warm' : v >= 45 ? 'neutral' : v >= 25 ? 'cool' : 'hostile';
  return `<div class="bar"><span class="days" aria-label="Day ${G.day} of ${DAY_COUNT}">${days}</span><span>Day <b>${G.day}</b> of ${DAY_COUNT}</span><span><b>${fmtHour(Math.min(G.hour, 23))}</b></span><span><b>$${G.money}k</b></span><span>Press <b>${word(G.press)}</b></span><span>Party <b>${word(G.party)}</b></span></div>`;
}
function files() {
  const lines = G.principles.map(p => { const b = G.broken.some(x => x.principle === p); return `<li class="${b ? 'broken' : ''}">${b ? 'Broken: ' : ''}${PRINCIPLES[p].text}</li>`; }).join('');
  const said = Object.entries(G.stances).map(([i, x]) => `<li>Day ${x.day}, ${x.town}: "${ISSUES[i][x.side]}"</li>`).join('') || '<li>Nothing on the record yet.</li>';
  const team = G.staff.map(x => `<li>${STAFF[x].name}, ${STAFF[x].role}: ${loyalWord(G.loyal[x])}</li>`).join('') || '<li>Just you and Dana, a volunteer.</li>';
  const polls = G.polls.map(p => `<li>Day ${p.day}, ${p.cheap ? 'cheap' : 'good'} poll: you ${p.total}%. ${Object.keys(p.rows).map(id => GROUPS[id].name + ' ' + p.rows[id] + '%').join(', ')}</li>`).join('') || '<li>No polls yet.</li>';
  return `<div class="files">
    <details><summary>Your principles</summary><ul>${lines}</ul></details>
    <details><summary>What you've said on the record (${Object.keys(G.stances).length})</summary><ul>${said}</ul></details>
    <details><summary>Your team (${G.staff.length})</summary><ul>${team}</ul></details>
    <details><summary>Polls (${G.polls.length})</summary><ul>${polls}</ul></details></div>`;
}
function choiceBtn(x, i, fn) {
  const crosses = x.breaks && G.principles.includes(x.breaks), clash = contradiction(G, x), clashLine = clash && G.principles.includes('oneMessage');
  const warn = (crosses ? `<span class="warn">Crosses your line: "${PRINCIPLES[x.breaks].text}"</span>` : '') +
    (clash ? `<span class="warn">You said the opposite in ${clash.town} on day ${clash.day}: "${ISSUES[x.says[0]][clash.side]}"${clashLine ? '. This crosses your line.' : ''}</span>` : '');
  return `<button class="choice ${crosses || clash ? 'risk' : ''}" onclick="${fn}(${i})">${x.t}${warn}</button>`;
}
/* Advice sits above the options, not on them, and only after you spend the day's call. */
function teamCall(scene) {
  const adv = advise(G, scene);
  if (!adv.length) return '';
  if (G.askedFor === scene.title) {
    const short = t => { const f = t.split(/(?<=[.?!])\s/)[0]; return f.length > 70 ? f.slice(0, 67).trimEnd() + '…' : f; };
    return `<div class="call">${adv.map(a => `<p class="adv">${face(a.id)}<span><b>${STAFF[a.id].short}</b> would go with "${short(scene.choices[a.i].t)}" <i>"${a.line}"</i></span></p>`).join('')}
      <p class="small">Weigh it: ${adv.map(a => `${STAFF[a.id].short} cares about ${STAFF[a.id].cares}`).join('; ')}.</p></div>`;
  }
  return G.calls > 0 ? `<p><button class="btn quiet" onclick="callTeam()">Call your team</button> <span class="small">One call a day. Use it here, or save it.</span></p>`
    : `<p class="small">You've used today's call to your team. This one is yours.</p>`;
}
function callTeam() { if (askTeam(G, G.phase === 'morning' ? G.event : G.scene)) go(); }
function wire(items) {
  if (!items || !items.length) return '';
  return `<div class="wire">${items.map(n => `<p class="${/^BREAKING/.test(n) ? 'breaking' : ''}">${n}</p>`).join('')}</div>`;
}

/* ---------- Morning ---------- */
function renderMorning(el) {
  const e = G.event;
  const news = G.day > 1 && G.lastNews ? `<h3>Overnight</h3>${wire(G.lastNews)}` : '';
  el.innerHTML = bar() + files() + news + `<article class="scene"><div class="place">Morning call</div><h2>${e.title.replace(/^Day \d+: /, '')}</h2><p class="prose">${e.text}</p></article>` +
    teamCall(e) + e.choices.map((x, i) => choiceBtn(x, i, 'pickMorning')).join('');
}
function pickMorning(i) { choose(G, i); go(); }

/* ---------- Tour ---------- */
const RIVER = 'M-10,236 C90,224 150,188 236,206 S380,300 470,268 S640,196 770,222';
function mapSvg() {
  const roads = ROADS.map(([a, b]) => { const A = TOWNS[a], B = TOWNS[b]; return `<line class="casing" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"/>`; }).join('') +
    ROADS.map(([a, b, h]) => { const A = TOWNS[a], B = TOWNS[b], mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      return `<line class="road" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"/><rect class="shield" x="${mx - 17}" y="${my - 12}" width="34" height="23" rx="6"/><text class="hrs" x="${mx}" y="${my + 5}">${h}h</text>`; }).join('');
  const towns = Object.entries(TOWNS).map(([id, t]) => {
    const live = canReach(G, id).ok, here = G.at === id, cap = !t.g;
    const shape = cap ? `<rect class="town ${live ? 'live' : ''}" x="${t.x - 10}" y="${t.y - 10}" width="20" height="20" rx="3" ${live ? `onclick="travel('${id}')"` : ''}/>`
      : `<circle class="town ${live ? 'live' : ''}" cx="${t.x}" cy="${t.y}" r="13" ${live ? `onclick="travel('${id}')"` : ''}/>`;
    return (here ? `<circle class="here" cx="${t.x}" cy="${t.y}" r="19"/>` : '') + shape +
      `<text class="name" x="${t.x + 19}" y="${t.y + 6}">${t.name}</text>` +
      (here ? `<text class="tag you" x="${t.x - 16}" y="${t.y + 36}">You</text>` : '') +
      (G.whitmore === id ? `<text class="tag rival" x="${t.x - 30}" y="${t.y - 20}">Whitmore</text>` : '') +
      (G.covered[id] ? `<text class="tag staff" x="${t.x + 19}" y="${t.y + 30}">${STAFF[G.covered[id]].short}</text>` : '');
  }).join('');
  return `<svg class="map" viewBox="0 0 760 330" role="img" aria-label="Map of the district. Towns with something on today are filled in."><path class="river" d="${RIVER}"/>${roads}${towns}</svg>`;
}
function renderTour(el) {
  const rows = Object.entries(G.posted).map(([t, st]) => ({ t, st, r: canReach(G, t) })).sort((a, b) => (b.r.ok - a.r.ok) || (a.r.tt - b.r.tt));
  const list = rows.map(({ t, st, r }) => {
    const where = TOWNS[t].name + (TOWNS[t].g ? `, ${GROUPS[TOWNS[t].g].name}` : '');
    const drive = r.tt ? `${r.tt}h drive` : 'You are here';
    const until = st.until ? `, only until ${fmtHour(st.until)}` : '';
    return `<button class="choice stop" ${r.ok ? '' : 'disabled'} onclick="travel('${t}')"><span class="where">${st.title}</span> <span class="when">in ${where}</span><span class="meta">${st.tease}. ${drive}${until}.${r.ok ? '' : ' ' + r.why + '.'}</span></button>`;
  }).join('') || '<p>Nothing else is happening today. End the day when you are ready.</p>';
  const wg = TOWNS[G.whitmore].g, left = Math.max(0, DAY_END - G.hour);
  const covered = Object.entries(G.covered).map(([t, id]) => `${STAFF[id].short} is in ${TOWNS[t].name}`).join(', ');
  el.innerHTML = bar() + files() +
    (G.reaction ? `<div class="aside">${G.reaction}</div>` : '') +
    `<h2>You're in ${TOWNS[G.at].name}, with ${left} hour${left === 1 ? '' : 's'} left</h2>
    <p class="small">Whitmore is campaigning in ${TOWNS[G.whitmore].name} today. Get to ${GROUPS[wg].name} to blunt him.${G.digToday ? ` Nina says he's in ${TOWNS[G.whitmoreNext].name} tomorrow.` : ''}${covered ? ` ${covered}.` : ''}</p>` +
    mapSvg() + list +
    `<p style="margin-top:18px"><button class="btn ${rows.some(x => x.r.ok) ? 'quiet' : ''}" onclick="endTour(G);go()">End the day</button></p>`;
}
function travel(t) { if (goTo(G, t)) go(); }
function renderStop(el) {
  const st = G.scene;
  el.innerHTML = bar() + `<article class="scene"><div class="place">${TOWNS[G.at].name}, ${fmtHour(G.hour)}</div><h2>${st.title}</h2><p class="prose">${st.text}</p></article>` +
    teamCall(st) + st.choices.map((x, i) => choiceBtn(x, i, 'pickAtStop')).join('');
}
function pickAtStop(i) { pickStop(G, i); go(); }

/* ---------- Evening ---------- */
function renderReport(el) {
  const d = G.decision;
  el.innerHTML = bar() + `<article class="scene"><div class="place who-line">${face(d.who)}${STAFF[d.who].name} needs a word</div><p class="prose">${d.text}</p></article>` +
    d.choices.map((x, i) => choiceBtn(x, i, 'pickDecision')).join('');
}
function pickDecision(i) { decide(G, i); go(); }
/* A poll is shown in full the evening it comes in, so it can't be missed. */
function pollCard(p) {
  const prev = G.polls.filter(q => q.day < p.day).pop(), d = prev ? p.total - prev.total : 0;
  const trend = prev ? (d ? ` ${d > 0 ? 'Up' : 'Down'} ${Math.abs(d)} since day ${prev.day}.` : ` No change since day ${prev.day}.`) : '';
  const who = p.priya ? 'Priya\'s numbers' : p.cheap ? 'Cheap poll' : 'Good poll';
  const rows = Object.keys(p.rows).map(id => { const v = Math.max(0, Math.min(100, p.rows[id]));
    return `<div class="prow"><span>${GROUPS[id].name}</span><div class="mid"><div class="split"><div class="you" style="width:${v}%"></div><div class="them" style="width:${100 - v}%"></div></div></div><b>${p.rows[id]}%</b></div>`; }).join('');
  return `<div class="poll tally"><p class="phead"><b>${who}: you ${p.total}%, Whitmore ${100 - p.total}%.</b>${trend} ${p.total > 50 ? 'Ahead' : p.total === 50 ? 'Dead even' : 'Behind'}, ${p.cheap ? 'but this pollster likes to flatter you' : 'give or take a point or two'}.</p>
    <div class="mid"><div class="split"><div class="you" style="width:${p.total}%"></div><div class="them" style="width:${100 - p.total}%"></div></div></div>
    <div class="prows">${rows}</div></div>`;
}
function pollsTonight() {
  const today = G.polls.filter(p => p.day === G.day);
  if (today.length) return today.map(pollCard).join('');
  const last = G.polls[G.polls.length - 1];
  return last ? `<p class="small">Your last poll, on day ${last.day}, had you at ${last.total}%. Things have moved since.</p>` : `<p class="small">You haven't polled yet. Without one, you're guessing.</p>`;
}
function renderHQ(el) {
  const reports = G.info.length ? `<h3>Your team reports</h3>${wire(G.info)}` : '';
  const jobs = G.day < DAY_COUNT && G.staff.length ? `<h3>Tomorrow's jobs</h3>${G.staff.map(id => {
    const low = G.loyal[id] < 45;
    return `<div class="job"><span class="who-line">${face(id)}${STAFF[id].name} <span class="mood ${low ? 'low' : ''}">${loyalWord(G.loyal[id])}</span></span><span></span>
      <select aria-label="Job for ${STAFF[id].name}" onchange="setJob(G,'${id}',this.value)">${jobOptions(G, id).map(o => `<option value="${o.id}" ${G.jobs[id] === o.id ? 'selected' : ''}>${o.label}</option>`).join('')}</select></div>`; }).join('')}` : '';
  const ads = G.offers.map((o, i) => {
    const crosses = o.breaks && G.principles.includes(o.breaks), where = o.market ? GROUPS[o.market].name : 'Whole district';
    return `<button class="choice ${crosses ? 'risk' : ''}" ${G.boughtAd || o.price > G.money ? 'disabled' : ''} onclick="buyAd(G,${i});go(false)">${o.label}<span class="meta">${where}. ${o.price ? '$' + o.price + 'k' : 'Free'}.${o.tag ? ' ' + o.tag + '.' : ''}</span>${crosses ? `<span class="warn">Crosses your line: "${PRINCIPLES[o.breaks].text}"</span>` : ''}</button>`;
  }).join('');
  const hireable = Object.entries(STAFF).map(([id, p]) => {
    const on = G.staff.includes(id);
    return `<button class="choice" aria-pressed="${on}" onclick="${on ? 'fire' : 'hire'}(G,'${id}');go(false)"><span class="who-line">${face(id)}${p.name}</span><span class="meta">${on ? `On your team, ${loyalWord(G.loyal[id])}. Select to let them go.` : `${p.role}, $${p.pay}k a day. ${p.text}`}</span></button>`;
  }).join('');
  el.innerHTML = bar() + files() + `<h2>Evening in the war room</h2>` + reports + jobs +
    `<h3>Tonight's ad ${G.boughtAd ? '(bought)' : '(pick one)'}</h3>${ads}
    <h3>Find out where you stand</h3>
    <div class="polls"><button class="choice" ${G.money < 10 ? 'disabled' : ''} onclick="buyPoll(G,true);go(false)">Cheap poll<span class="meta">$10k. A friendly pollster who may flatter you.</span></button>
    <button class="choice" ${G.money < 25 ? 'disabled' : ''} onclick="buyPoll(G,false);go(false)">Good poll<span class="meta">$25k. Fairly accurate.</span></button></div>
    ${pollsTonight()}
    <details><summary>Hire or let go</summary><div class="pick" style="margin:8px 0 14px">${hireable}</div></details>
    <div class="cta"><button class="btn" onclick="sleep(G);go()">${G.day < DAY_COUNT ? 'Go to bed' : 'Go to bed. Tomorrow, the vote.'}</button></div>`;
}

/* ---------- Election night ---------- */
function renderNight(el) {
  const n = G.night, shown = n.rows.slice(0, n.step + 1), row = shown[shown.length - 1], done = n.step >= n.rows.length - 1;
  const pct = 100 * row.you / (row.you + row.rival);
  const lines = shown.map(r => { const lead = r.you >= r.rival; return `<tr><td>${r.label}</td><td class="num ${lead ? 'kept' : 'broken'}">${lead ? 'You' : 'Whitmore'} +${Math.abs(r.you - r.rival).toLocaleString()}</td></tr>`; }).join('');
  el.innerHTML = `<section style="padding-top:24px"><h3>The last night of the campaign</h3>${wire(G.lastNews)}
    <h1>Election night</h1>
    <div class="tally" aria-live="polite"><div class="mid"><div class="split"><div class="you" style="width:${pct}%"></div><div class="them" style="width:${100 - pct}%"></div></div></div>
    <div class="legend"><span class="kept">You ${row.you.toLocaleString()}</span><span class="broken">Whitmore ${row.rival.toLocaleString()}</span></div></div>
    <table><thead><tr><th>Just in</th><th class="num">Lead</th></tr></thead><tbody>${lines}</tbody></table>
    <button class="btn" onclick="${done ? "G.phase='end';go()" : 'G.night.step++;go(false)'}">${done ? 'See the result' : 'Next batch of results'}</button></section>`;
}

/* ---------- The end ---------- */
function renderEnd(el) {
  const e = ending(G), n = G.night;
  const lines = G.principles.map(p => { const b = G.broken.filter(x => x.principle === p); return `<li class="${b.length ? 'broken' : 'kept'}"><b>${PRINCIPLES[p].text}:</b> ${b.length ? 'broken on day ' + [...new Set(b.map(x => x.day))].join(', ') + '. ' + b[0].label + '.' : 'kept.'}</li>`; }).join('');
  const real = Object.keys(G.groups).map(id => { const r = n.results[id], lp = G.polls[G.polls.length - 1]; return `<tr><td>${GROUPS[id].name}</td><td class="num">${GROUPS[id].share}%</td><td class="num">${r.share.toFixed(1)}%</td><td class="num">${lp ? lp.rows[id] + '%' : 'None'}</td></tr>`; }).join('');
  const sorted = G.moves.slice().sort((a, b) => b.delta - a.delta);
  const best = sorted.filter(m => m.delta > 0).slice(0, 4).map(m => `<li>Day ${m.day}: ${m.label} (+${m.delta.toFixed(1)})</li>`).join('') || '<li>Nothing moved much.</li>';
  const worst = sorted.slice().reverse().filter(m => m.delta < 0 && !m.rival).slice(0, 4).map(m => `<li>Day ${m.day}: ${m.label} (${m.delta.toFixed(1)})</li>`).join('') || '<li>Nothing major.</li>';
  const hidden = G.skeletons.filter(k => !k.exposed);
  const route = G.route.map((r, i) => `<li>Day ${i + 1}: ${r.map(t => TOWNS[t].name).join(', then ')}</li>`).join('');
  const story = G.log.map(l => `<li class="${l.breaks || l.exposed ? 'broken' : ''}">Day ${l.day}: ${l.label}${l.breaks ? '. You crossed your line.' : ''}</li>`).join('');
  el.innerHTML = `<section style="padding-top:24px">
    <div class="verdict"><p class="small" style="color:inherit;opacity:.8;margin:0 0 8px;font-family:var(--display)">${n.won ? 'You won' : 'You lost'} by ${n.margin.toLocaleString()} votes</p><h1>${e.title}</h1><p>${e.text}</p></div>
    <h2>Your principles</h2><ul>${lines}</ul>
    <h2>What comes next</h2><ul>${epilogue(G).map(x => `<li>${x}</li>`).join('')}</ul>
    ${hidden.length ? `<h2>Still buried</h2><p class="small">Nobody found these, but you know about them.</p><ul>${hidden.map(k => `<li>${k.label}</li>`).join('')}</ul>` : ''}
    <h2>The true numbers</h2><table><thead><tr><th>Group</th><th class="num">Started</th><th class="num">Finished</th><th class="num">Your last poll</th></tr></thead><tbody>${real}</tbody></table>
    <p class="small">You started at ${G.startPct.toFixed(1)}% and needed 50%.</p>
    <h3>What helped you most</h3><ul>${best}</ul><h3>What hurt you most</h3><ul>${worst}</ul>
    <details><summary>Your route</summary><ul>${route}</ul></details>
    <details><summary>Your whole campaign, day by day</summary><ul>${story}</ul></details>
    <p style="margin-top:22px"><button class="btn quiet" onclick="G=null;setup={principles:[],secret:null,staff:[]};go()">Run again, differently</button></p></section>`;
}

render();
