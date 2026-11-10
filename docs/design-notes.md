# The Race: design notes

## The idea

Gamify a political race: announcing, campaigning, talking to people, polls, vote share moving, scandals. The candidate holds a set of principles, and the game asks what winning really means: would you tell a white lie to win, and what if your chances are slim? US first; an India version (constituency, counting day) may come later.

What the game judges is **consistency with what you swore**, never ideology. Parties stay unnamed.

## How it got here

The idea came out of the games research in the sibling `research-center` project (`topics/thinking-games-app-ideas.html`), after the earlier card and puzzle ideas were rejected. Three throwaway prototypes live in `research-center/prototypes/`:

| Prototype | What it tested | Verdict |
|---|---|---|
| `the-race.html` (14 days, action menu) | Is there a game here at all? | 2.5/5 from the designer. Morning dilemmas worked and made them think; the daily action menu was dull, because "Talk to the people" and "Fire up your voters" were always right. |
| `the-race-tour.html` (14 days, map) | Does a map with one stop per town fix the dull tap? | Yes: curious through all 14 days, mainly about what each town would offer and ask. The evening worked as a round-up. The team felt dead: picked at setup, then nothing to do with them. |
| `the-race-team.html` (5 days, team) | Is 5 days enough? Does the team feel like people? | The designer chose 5 days and moved on to this project; no playtest notes yet. |

This project is the third prototype, restyled for outside reviewers.

## Decisions so far

- **5 days, not 14.** The designer's call: shorter sessions, and the content lasts longer (about 30% of a second game repeats the first, against about 55% at 14 days). The cost is that only day 2 has a varying morning call, while days 1, 3, 4 and 5 are fixed (announcement, debate, secret, leaked file). Lies also have less time to catch up with you.
- **A map with travel time** instead of an action menu. You can be in one place at a time; your team covers the others.
- **You sleep where you finish the day**, with no return to base.
- **Team as people:** evening jobs, reports that can go wrong (a staffer promises something in your name), advice only when you spend your one call a day (always-on advice tags made the designer just follow them), and loyalty that leads to quitting and leaks.
- **What you say is remembered.** Positions go on the record, and contradicting them between towns is flagged and can be exposed.
- **Fixed candidate and district** (Sam Rivera, Harlan Valley's 9th) for now. A candidate and district builder is wanted later.

### Settings (2026-11-08)

After reviewer 1 (India) couldn't relate to the US framing, the game got a setting picker at the top of the landing page: **Harlan Valley** (the original) and **Rajnagar** (Indian-flavoured: mill towns, city colonies, villages, a university town; MP seat; lakhs and crores; counting day by rounds). Neither names a real country. Same rules, map, groups and numbers; only text differs, so balance carries over. The landing page also now opens with a three-line briefing (who you are, the goal, the catch), since reviewer 1 didn't know what he was playing.

Rajnagar was finished on 2026-11-09 after the designer approved the tone of a sample: all 75 scenes, matching Harlan's numbers exactly (checked by `tools/parity.js`; the sim gives the same win rates). Rajnagar avoids caste and religion. Scenes that leaned on religion in Harlan were rewritten around other things: Grace Fellowship's "values" became a residents' association that wants a basti cleared; the funeral became a condolence meeting.

## Balance (scripted players, 1,500–2,000 games per style)

| Style | Win rate |
|---|---|
| Never crosses any line | 10% |
| Keeps own 3 principles | 36% |
| Breaks own principles about twice | 43% |
| Cheats constantly | 29% |
| Keeps principles but stays near home | 11% |
| Random | under 1% |

With no staff, the keep-your-principles style wins 13%. With Tess, Ben and Lou standing in for you in towns, it wins 58%, and 36% when they do their specialties instead.

## Known weaknesses

- **Content:** 46 town stops, 21 morning calls, 4 Whitmore encounters, 4 fixed events and 11 staff reports. A game uses about 17 scenes plus about 5 staff conversations. The designer wants far more ("like a 1000"); that's a writing job worth starting only once the structure holds up with reviewers.
- **Temptation is mild:** breaking your principles wins only slightly more than keeping them (43% vs 36%).
- **Staff advice is generic:** lines are written to fit many scenes, so some read oddly (Lou saying "This one keeps the lights on" about a lie).
- **Money piles up** late in the game for some play styles, so it isn't tight enough.
- **No human other than the designer has played it.** Bots are not people.

## Open questions for reviewers

Worth asking reviewers (not in the game; the end-screen form was removed):
1. Was there a moment you hesitated before crossing one of your lines?
2. Did choosing where to drive each day feel like a real decision?
3. Did your team feel like people, or like settings?
4. Would you play again, and what would make you?

## Playtest log

Add each reviewer's answers here with the date, their result and anything they said unprompted.

### 2026-11-08 — Reviewer 1 (India)

- Result: not recorded.
- Didn't understand what the game was or what he was doing; clicked through every question without engaging.
- Complained unprompted that there were too many questions.
- Not from the US. The setting (Congress, incumbent, US-style districts and voter groups) assumes US political context, which may be part of why he couldn't get into it.
- Takeaways to weigh: the opening may not explain the goal and stakes clearly enough; the number of decisions may feel like a quiz when you aren't invested; US framing may limit reach outside the US.
