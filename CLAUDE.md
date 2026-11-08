# The Race

A text-based campaign game. You run for Congress in a fictional US district over the last 5 days before the vote, against an 18-year incumbent. You swear to three principles at the start, and the game keeps offering ways to win by breaking them. The question it asks is what winning is worth.

This web version exists to **validate the idea with outside reviewers** before a React Native build. Keep it static, so it can be published to GitHub Pages with no build step. The design history, playtest results and open questions are in `docs/design-notes.md`; read that before changing game design.

## Running it

Open `index.html` in a browser. All scripts are plain classic scripts, so it also works from `file://`. Alternatively:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Structure

```
campaign/
├── .nojekyll              ← GitHub Pages: serve files as they are
├── index.html             ← Loads fonts, CSS and the three scripts in order
├── assets/css/main.css    ← All styling; colour tokens at the top
├── assets/js/content.js   ← Data and text only: groups, towns, roads, principles, secrets, staff, scenes, staff lines
├── assets/js/engine.js    ← Game rules. No DOM access. Depends on content.js globals
├── assets/js/ui.js        ← Screens. Renders state and calls engine functions; no game rules
├── tools/sim.js           ← Balance tool: plays thousands of scripted games in Node
└── docs/design-notes.md   ← Concept, decisions, playtest history, balance targets, open questions
```

The three scripts share globals (top-level `const` and `function`). `content.js` must load before `engine.js`, and `engine.js` before `ui.js`.

## How the game works

- **State:** one object made by `newGame(rng, {principles, secret, staff})`. `s.phase` drives the screens: `morning → tour ⇄ stop → report → hq → (next day) … → night → end`.
- **Vote model:** four voter groups (Mill towns, Suburbs, Farm country, College town), each with a hidden support `share` and turnout `yt`/`rt`. `realPct(s)` is the true number. Polls and the manager's estimate are noisy views of it; the player never sees it directly until the end. A poll taken in the evening (bought, or Priya's free one) is shown in full that evening as a card with a bar per group (`pollCard` in `ui.js`); after that it only lives in the files drawer.
- **A day:** `choose` (morning call) → `dealStops` posts one scene per town → the player drives (`canReach`, `goTo`; 10 hours, stops take 2) and plays scenes (`pickStop`) → `endTour` runs staff jobs (`runJobs`) and queues reports (`decide`) → evening ad, polls, hiring, tomorrow's jobs → `sleep` (Whitmore's move, neglect, party money, scandal exposure, news).
- **Scene effects (`fx`):** `h` moves the home town's group, `s` moves named groups, `all` moves everyone, `t` changes turnout, plus `money`, `cred`, `press`, `party`, `hours`, `calm` (Whitmore stays quiet), `skel` (a hidden scandal that may be exposed later), `lose` (a staffer may leave).
- **Lines:** a choice with `breaks: '<principleId>'` crosses that principle, and the UI warns when it's one the player swore to. A choice with `says: [issue, side]` puts a position on the record. Saying the opposite side elsewhere counts as breaking `oneMessage`, adds a "voters compared notes" scandal and warns in the UI.
- **Team:** each hire has one evening job a day: their specialty, standing in for you in a town, or resting. You get one call to your team a day (`askTeam`); spending it in a scene shows up to two staff opinions (`advise` / `TASTE`, each biased by what that person cares about) above the options, never on them. Ignoring advice you asked for lowers loyalty; unasked, nothing happens. This replaced always-on advice tags, which the designer found made you just pick the tagged option. At 25 or below they quit, and a sore ex-staffer may leak a hidden scandal (`leak`).
- **Endings:** won or lost × kept or broke your principles, plus an epilogue driven by `s.flags`.

## Adding content

Most growth will be new scenes. Add them to `content.js`:

- **A town stop:** add to `STOPS` with `town`, `title`, `tease` (one line shown on the map list), `text`, and 2–3 `choices`. Optional `until` (hour) makes it time-limited. Use `press: true` instead of `town` for a press scene that can appear anywhere.
- **A morning call:** add to `MORNING`. Use `needs: '<staffId>'` if it only makes sense when that person is hired.
- **A staff report:** add to `SPECIAL[staffId]`.
- **A Whitmore encounter:** add to `ENCOUNTERS`; it appears only in the town Whitmore is visiting.

Writing rules for scenes:
- Every scene is a real dilemma. Avoid an obviously right answer; the honest option should usually cost something.
- Give each choice a `log` line in the past tense ("Told the widow you couldn't promise"). The end screen is built from these.
- Fictional people and places only. Keep the parties unnamed, and judge consistency, never ideology.
- Plain, specific language: a person, a place, a number.

After adding content or changing numbers, run the balance tool.

## Balance

```bash
node tools/sim.js 2000
```

Current targets for the scripted styles (2000 games each):

| Style | Target win rate | Last measured |
|---|---|---|
| Never crosses any line (`saint`) | under 15% | 10% |
| Keeps own 3 principles (`principled`) | 30–45% | 36% |
| Breaks own principles about twice (`calculating`) | a little above principled | 43% |
| Cheats constantly (`greedy`) | below principled | 29% |
| Stays near home (`homebody`) | well below principled | 11% |

The shape matters more than exact numbers: pure honesty rarely wins, selective compromise pays a little, recklessness backfires, and touring the map matters. The scripted players ignore staff advice, polls and tips, so they undersell staff such as Priya and Nina.

## Deploying

GitHub Pages from the repo root (Settings → Pages → Deploy from branch → `main`, `/`). Nothing to build. The user handles git and publishing themselves; don't init, commit or push unless asked.

## Feedback loop

There is no in-game feedback form (removed at the user's request), no server and no analytics. Reviewers send feedback however they like. Record what reviewers say in `docs/design-notes.md` under the playtest log.

## Towards React Native

The goal is an Expo / React Native app, structured like the sibling `donkey` project (pure TypeScript engine in `src/game/`, seeded random, UI separate). Keep `engine.js` free of DOM access and keep text in `content.js`, so the port is mostly typing the engine and moving content into data files. `newGame` already takes an `rng` argument for seeding.
