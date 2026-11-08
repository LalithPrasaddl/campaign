/* The Race: game content. Plain data and text, no rules. Loaded before engine.js. */
const GROUPS = {
  factory:{ name:'Mill towns', size:.30, share:46, yt:60, rt:60 },
  suburbs:{ name:'Suburbs', size:.35, share:45, yt:62, rt:63 },
  farm:{ name:'Farm country', size:.20, share:37, yt:60, rt:65 },
  college:{ name:'College town', size:.15, share:63, yt:54, rt:50 },
};
const TOWNS = {
  millbrook:{ name:'Millbrook', g:'factory', x:120, y:70 },
  ironton:{ name:'Ironton', g:'factory', x:60, y:190 },
  cedar:{ name:'Cedar Heights', g:'suburbs', x:300, y:110 },
  oakfield:{ name:'Oakfield', g:'suburbs', x:420, y:60 },
  harlan:{ name:'Harlan', g:'college', x:530, y:150 },
  dunmore:{ name:'Dunmore', g:'farm', x:400, y:260 },
  pikes:{ name:"Pike's Ford", g:'farm', x:200, y:290 },
  capital:{ name:'State Capital', g:null, x:585, y:50 },
};
const ROADS = [['millbrook','ironton',1],['millbrook','cedar',2],['cedar','oakfield',1],['oakfield','harlan',2],['harlan','capital',2],['oakfield','capital',3],['harlan','dunmore',2],['dunmore','pikes',2],['pikes','ironton',2],['cedar','dunmore',3]];
const DAY_COUNT=5, DAY_START=8, DAY_END=18, STOP_HOURS=2;
const ISSUES = {
  plant:{ yes:'I will save the Millbrook plant with state money', no:'No more state subsidies for corporations' },
  water:{ farm:'Farm water rights come first', homes:'New housing gets its water hookups first' },
  gas:{ keep:'The Ironton gas plant stays open', close:'The Ironton gas plant closes by 2030' },
  spend:{ cap:'The state will pay to cap tuition', freeze:'A freeze on all new state spending' },
  bypass:{ yes:'Build the bypass', no:'The bypass will never go through Oakfield' },
};
const PRINCIPLES = {
  noLies:{ text:"I won't lie to voters or mislead them about my opponent" },
  noPac:{ text:"I won't take corporate PAC money" },
  oneMessage:{ text:"I'll tell every town the same thing" },
  ownIt:{ text:"When I'm wrong, I'll say so" },
  noDeals:{ text:"I won't trade favors for votes" },
  keepStand:{ text:"I won't drop a position because of a poll" },
};
const SECRETS = {
  bankrupt:{ text:'Your first business went under owing 40 workers their final pay', story:'A reporter has the old court filing: your first business went under owing 40 workers their final pay.' },
  dui:{ text:'You had a drunk-driving arrest in 2009 that nobody knows about', story:'A reporter has the 2009 police record of your drunk-driving arrest.' },
  brother:{ text:"Your brother's firm won a county contract while you sat on the board", story:"A reporter has the county minutes: your brother's firm won a contract while you sat on the board." },
};
const STAFF = {
  priya:{ cares:'the numbers', color:'#6B4FBB', role:'Manager', name:'Priya Nair', short:'Priya', pay:5, text:'Blunt. Replaces Dana, your optimistic volunteer, so you hear the real number.', job:['numbers','Run the real numbers (a free good poll tomorrow night)'] },
  tess:{ cares:'what plays in the room', color:'#0E6B6B', role:'Field director', name:'Tess Okafor', short:'Tess', pay:6, text:'Your best stand-in in a town. Says what the room needs, sometimes too much of it.', job:['advance','Advance your route (your first stop tomorrow lands harder)'] },
  ben:{ cares:'staying on schedule', color:'#7A5C2E', role:'Scheduler', name:'Ben Lowe', short:'Ben', pay:3, text:'Knows the back roads, and is always tired.', job:['route','Plan your route (drive times down by a third tomorrow)'] },
  maya:{ cares:'what she can defend tomorrow', color:'#2F6FB0', role:'Press secretary', name:'Maya Cole', short:'Maya', pay:6, text:'Straight with reporters. Will not defend a lie for long.', job:['press','Work the press (press warms; scandals hurt less tomorrow)'] },
  rick:{ cares:'winning, whatever it takes', color:'#B4532A', role:'Press secretary', name:'Rick Dunn', short:'Rick', pay:4, text:'Knows who to call. Will do what you did not ask.', job:['bury','Make some calls (stories less likely to surface tomorrow)'] },
  lou:{ cares:'the money', color:'#3F7D3A', role:'Fundraiser', name:'Lou Hart', short:'Lou', pay:4, text:'Great at raising money. Their friends tend to want things.', job:['donors','Work the donors (about $16k tomorrow)'] },
  nina:{ cares:'what someone could dig up later', color:'#8A3A6E', role:'Researcher', name:'Nina Voss', short:'Nina', pay:5, text:'Digs up what is true, and how she gets it is sometimes a question.', job:['dig','Dig on Whitmore (true attack ad tomorrow night; his next stop)'] },
};
const skel=(label,p,hit)=>({label,p,hit});

const FIXED = {
  1:{ title:`Day 1: the announcement`, text:`You announce at the Millbrook union hall. Cameras are rolling. What is your opening line?`, choices:[
    { t:`"This campaign is about keeping jobs in this valley."`, fx:{s:{factory:2.2,college:-.4}}, log:`Opened on jobs` },
    { t:`"Life here costs too much, and Washington doesn't notice."`, fx:{s:{suburbs:1.6,farm:.6}}, log:`Opened on the cost of living` },
    { t:`"Dale Whitmore has been gone for eighteen years."`, fx:{all:.7}, log:`Opened by attacking Whitmore's long tenure` },
  ]},
  3:{ title:`Day 3: the TV debate`, text:`You are on a video link to the Channel 9 debate. The moderator asks what your healthcare plan costs. You don't have the number, and everyone can tell.`, choices:[
    { t:`"I don't have that number. I'll get it to you tomorrow."`, fx:{all:-.3,cred:7,press:4}, log:`Admitted in the debate that you didn't know the cost` },
    { t:`Say "about four billion" with total confidence.`, fx:{all:1.7,skel:skel(`You invented a four-billion-dollar figure in the debate`,.13,2.4)}, breaks:'noLies', log:`Invented a cost figure live in the debate` },
    { t:`Pivot to Whitmore's voting record instead.`, fx:{all:.6,cred:-2,press:-3}, log:`Dodged the debate question with an attack on Whitmore` },
  ]},
  5:{ title:`Day 5: the file`, text:`An ally hands you a file on Whitmore: a claim that he took a kickback. It is mostly unverified. Leak it now and there is no time for him to respond.`, choices:[
    { t:`Leak it.`, fx:{all:3.4,press:-8,skel:skel(`The kickback claim you leaked was false`,.3,3.2)}, breaks:'noLies', log:`Leaked an unverified kickback claim on the last day` },
    { t:`Hand it to a reporter and ask them to check it first.`, fx:{all:.4,cred:3,press:6}, log:`Passed the file to a reporter to verify` },
    { t:`Throw it away.`, fx:{cred:5}, log:`Threw away the unverified file on Whitmore` },
  ]},
};
const secretEvent=id=>({ title:`Day 4: your secret`, text:SECRETS[id].story+` They run the story tomorrow unless you get ahead of it. It is true.`, choices:[
  { t:`Hold a press conference and tell the whole truth.`, fx:{all:-1.8,cred:12,press:8}, log:`Told the whole truth about your secret` },
  { t:`Deny it. "This is a smear from the Whitmore camp."`, fx:{all:.8,press:-5,skel:skel(`Proof emerged that you lied about your secret`,.26,5)}, breaks:'ownIt', log:`Publicly denied your secret, which is true` },
  { t:`Say nothing and change the subject all week.`, fx:{all:-1,cred:-3,press:-4}, log:`Stayed silent about your secret` },
]});

/* Morning calls: things that reach you wherever you woke up. */
const MORNING = [
  { title:`A quiet dinner`, text:`Gulfline Energy's PAC offers $150,000 of outside support. They would like one quiet dinner.`, choices:[
    { t:`Take the dinner and the money.`, fx:{money:150,skel:skel(`Reporters traced $150,000 from Gulfline to your race`,.1,2.3)}, breaks:'noPac', flag:'gulfline', log:`Took $150,000 from Gulfline's PAC` },
    { t:`Decline, and say so publicly.`, fx:{cred:4,press:3,s:{college:.5}}, log:`Publicly turned down Gulfline's money` },
    { t:`Decline quietly.`, fx:{cred:1}, log:`Quietly turned down Gulfline's money` },
  ]},
  { title:`The consultant`, text:`Your best-known position is polling badly in the suburbs. Your consultant says to drop it by Friday and nobody will care.`, choices:[
    { t:`Drop it.`, fx:{s:{suburbs:3.2,college:-.8},cred:-3}, breaks:'keepStand', log:`Dropped your signature position after a bad poll` },
    { t:`Keep it, and explain why in the next town you visit.`, fx:{s:{suburbs:-.5},cred:5}, log:`Kept your position despite the polling` },
  ]},
  { title:`The flyer`, text:`Your staff printed the wrong statistic on 40,000 flyers. It flatters you. Nobody has noticed.`, choices:[
    { t:`Publish a correction.`, fx:{all:-.4,cred:6,press:4}, log:`Corrected your own flyer in public` },
    { t:`Stop printing it and say nothing.`, fx:{skel:skel(`A fact-checker found the false statistic on your flyer`,.09,1.5)}, breaks:'ownIt', log:`Quietly buried a false statistic on your flyer` },
  ]},
  { title:`The clip`, text:`A volunteer sends a clip cropped to make Whitmore look asleep in a hearing. He wasn't. It would go viral by lunch.`, choices:[
    { t:`Post it.`, fx:{all:1.5,skel:skel(`The full video showed your clip of Whitmore was cropped`,.15,2)}, breaks:'noLies', log:`Posted a cropped clip of Whitmore` },
    { t:`Let a supporter post it, not you.`, fx:{all:.7,skel:skel(`Your campaign was tied to the cropped Whitmore clip`,.09,2.2)}, breaks:'noLies', log:`Let a supporter post a cropped clip of Whitmore` },
    { t:`Delete it and tell the volunteer why.`, fx:{cred:2}, log:`Deleted the cropped clip of Whitmore` },
  ]},
  { title:`The endorsement`, text:`The Harlan Courier will endorse you if you drop your opposition to rezoning the riverfront, which you have opposed for ten years.`, choices:[
    { t:`Support the rezoning. Take the endorsement.`, fx:{all:1.9,cred:-3,press:3}, breaks:'keepStand', log:`Reversed ten years on the riverfront for an endorsement` },
    { t:`Keep your position and lose the endorsement.`, fx:{cred:4}, log:`Gave up the Courier endorsement over the riverfront` },
  ]},
  { title:`The old posts`, text:`A staffer's ugly old posts surface. You actually saw them when you hired him.`, choices:[
    { t:`Let him go, and admit you knew.`, fx:{all:-.5,cred:6,press:3}, log:`Admitted you had seen the staffer's posts` },
    { t:`Let him go and say you had no idea.`, fx:{all:.2,skel:skel(`Emails showed you knew about the staffer's posts`,.1,2)}, breaks:'ownIt', log:`Claimed you had no idea about the staffer's posts` },
    { t:`Stand by him.`, fx:{s:{factory:.5,college:-1},cred:-2}, log:`Stood by the staffer` },
  ]},
  { title:`Whitmore's son`, text:`Your researcher finds that Whitmore's son was arrested last spring. It is true, and it has nothing to do with the race.`, choices:[
    { t:`Make sure the press hears about it.`, fx:{all:.9,cred:-5,press:-3}, log:`Pushed the story of Whitmore's son to the press` },
    { t:`Kill it, and tell Whitmore you did.`, fx:{cred:4,all:.2}, log:`Killed the story about Whitmore's son` },
  ]},
  { title:`The treasurer`, text:`Your treasurer finds $12,000 in donations you failed to report. Reporting them makes a headline.`, choices:[
    { t:`Report them.`, fx:{all:-.5,cred:5,press:3}, log:`Reported your own late donations` },
    { t:`Wait until after the election.`, fx:{skel:skel(`Your unreported donations came to light`,.09,2.2)}, breaks:'ownIt', log:`Held back donations you should have reported` },
  ]},
  { title:`Whitmore's offer`, text:`Whitmore's manager calls with a quiet offer: you both stay away from each other's pasts until election day.`, choices:[
    { t:`Agree.`, fx:{calm:4,cred:-1}, breaks:'noDeals', log:`Made a private truce with Whitmore` },
    { t:`Refuse.`, fx:{cred:1}, log:`Refused a private truce with Whitmore` },
  ]},
  { title:`Farmers for Sam`, text:`An ally offers to set up "Farmers for Sam", a grassroots group with no actual farmers in it.`, choices:[
    { t:`Do it.`, fx:{s:{farm:2.2},skel:skel(`"Farmers for Sam" was exposed as fake`,.12,2.6)}, breaks:'noLies', log:`Set up a fake grassroots farmers' group` },
    { t:`Say no, and find real farmers.`, fx:{s:{farm:.5},cred:2}, log:`Refused the fake group and looked for real farmers` },
  ]},
  /* Inner party */
  { title:`The chair calls`, text:`Marian Holt, the state party chair: "The Governor is coming through. Stand next to him. Yes, I know his numbers. Do it anyway."`, choices:[
    { t:`Stand next to him.`, fx:{party:12,s:{college:-.8,suburbs:-.4}}, log:`Campaigned with the unpopular Governor` },
    { t:`Find a scheduling conflict.`, fx:{party:-8,s:{suburbs:.5}}, log:`Dodged the Governor with a fake scheduling conflict` },
    { t:`Tell her no, and tell her why.`, fx:{party:-12,cred:4,all:.3}, log:`Refused to campaign with the Governor` },
  ]},
  { title:`Lena Ortiz`, text:`Lena Ortiz, who you beat in the primary, still has her volunteers and a grudge. She'll bring them over if you admit her attack on your record was fair. It wasn't, quite.`, choices:[
    { t:`Say it was fair. You need those volunteers.`, fx:{party:6,s:{college:1.5},t:{college:2}}, breaks:'noLies', log:`Said Lena Ortiz's attack on you was fair` },
    { t:`Offer her a role on your transition team instead.`, fx:{party:8,s:{college:1.2}}, breaks:'noDeals', flag:'lena', log:`Offered Lena Ortiz a job for her volunteers` },
    { t:`Ask for her help with nothing in return.`, fx:{party:2,s:{college:.3},cred:2}, log:`Asked Lena Ortiz to help with no deal` },
  ]},
  { title:`The national committee`, text:`National party staffers want to take over your ads. They bring $60,000 and a script that calls you "a reliable vote for leadership."`, choices:[
    { t:`Take the money and run their script.`, fx:{money:60,party:10,s:{farm:-1,factory:-.6}}, log:`Ran the national party's script` },
    { t:`Take the money, then cut your own ad. Apologize later.`, fx:{money:60,party:-10,skel:skel(`National staffers told the press you took their money and ignored their script`,.1,1)}, log:`Took national money and ignored their script` },
    { t:`Turn it down.`, fx:{party:-6,cred:3}, log:`Turned down the national committee's money` },
  ]},
  { title:`The county slate`, text:`The party's county chairs want you to endorse their whole slate, including a sheriff candidate you think is a crook.`, choices:[
    { t:`Endorse the full slate.`, fx:{party:12,t:{suburbs:1,farm:1},skel:skel(`The sheriff candidate you endorsed was indicted`,.09,1.8)}, breaks:'noDeals', flag:'slate', log:`Endorsed the party slate, crook included` },
    { t:`Endorse everyone but the sheriff.`, fx:{party:-6,cred:3}, log:`Refused to endorse the party's sheriff candidate` },
    { t:`Stay out of it.`, fx:{party:-2}, log:`Stayed out of the county slate fight` },
  ]},
  /* Team: only appear if you hired them */
  { needs:'tess', title:`Tess gets a call`, text:`Whitmore's people have offered Tess Okafor twice what you pay. She tells you herself. "I'd rather stay. I also have a mortgage."`, choices:[
    { t:`Match it. $30k now.`, fx:{money:-30,cred:1}, log:`Paid to keep Tess` },
    { t:`Tell her you can't, and hope.`, fx:{cred:2,lose:{id:'tess',chance:.4}}, log:`Told Tess you couldn't match the offer` },
  ]},
  { needs:'rick', title:`Rick has an idea`, text:`Rick Dunn knows a blogger who will run an anonymous rumor about Whitmore's health. "You'd never touch it. That's what I'm for."`, choices:[
    { t:`Don't ask, don't tell.`, fx:{all:1.3,skel:skel(`Rick Dunn was caught feeding a false health rumor to a blogger`,.16,2.6)}, breaks:'noLies', log:`Let Rick plant a rumor about Whitmore's health` },
    { t:`Tell him no, and that you mean it.`, fx:{cred:2}, log:`Stopped Rick's rumor` },
    { t:`Fire him.`, fx:{cred:4,press:2,lose:{id:'rick',chance:1}}, log:`Fired Rick over the rumor` },
  ]},
  { needs:'lou', title:`Lou's friend`, text:`Lou Hart has a donor ready with $45,000 in bundled checks. He owns the quarry and wants you to "take a look" at a permit.`, choices:[
    { t:`Take a look at the permit.`, fx:{money:45,skel:skel(`The quarry owner's permit and his checks ended up in the same story`,.12,2)}, breaks:'noDeals', flag:'quarry', log:`Traded a look at a quarry permit for $45,000` },
    { t:`Take the checks and promise nothing.`, fx:{money:25,cred:-1}, log:`Took the quarry owner's checks with no promises` },
    { t:`Send them back.`, fx:{cred:3}, log:`Sent back the quarry owner's checks` },
  ]},
  { needs:'ben', title:`Ben fell asleep`, text:`Ben Lowe drifted onto the shoulder on the Ironton road at 6am. He has driven you 14 hours a day and says he's fine.`, choices:[
    { t:`Give him a day off. You lose the morning.`, fx:{hours:-3,cred:1}, log:`Gave Ben the morning off` },
    { t:`Hire a second driver, $12k.`, fx:{money:-12}, log:`Hired a second driver` },
    { t:`Get coffee. Keep going.`, fx:{skel:skel(`Your exhausted driver crashed on the Ironton road`,.1,1)}, log:`Kept Ben driving` },
  ]},
  { needs:'priya', title:`Priya's real number`, text:`Priya Nair shows you the real internals. They're bad. Donors call at nine. "What do you want me to tell them?"`, choices:[
    { t:`Show them the real numbers.`, fx:{money:-10,cred:3}, log:`Showed donors your real numbers` },
    { t:`Tell them you're surging.`, fx:{money:30,skel:skel(`Donors leaked your real internals after you told them you were surging`,.1,1.3)}, breaks:'noLies', log:`Told donors you were surging` },
  ]},
  { needs:'nina', title:`Nina's find`, text:`Nina Voss has Whitmore's real attendance record: he missed 40% of committee votes. It's true, and it checks out. It would cost $20k to get it in front of people.`, choices:[
    { t:`Spend the $20k.`, fx:{money:-20,all:1.4,press:2}, log:`Ran Whitmore's true attendance record` },
    { t:`Give it to the Courier for free and let them decide.`, fx:{all:.5,press:5}, log:`Gave Whitmore's attendance record to the Courier` },
  ]},
  { needs:'maya', title:`Maya's line`, text:`Maya Cole, your press secretary: "If you ever have me say something false from that podium, I walk. I just want you to know that today."`, choices:[
    { t:`"That's why I hired you."`, fx:{cred:2,press:2}, log:`Backed Maya's line` },
    { t:`"Let's hope it never comes up."`, fx:{press:-1}, log:`Dodged Maya's question` },
  ]},
];

/* Stops: what is happening in each town. `h` moves that town's own group. */
const STOPS = [
  // Millbrook
  { town:'millbrook', until:12, title:`Shift change at the plant`, tease:`Workers at the gate, only until noon`, text:`Six hundred workers file past. One stops you: "Are you going to save this plant or not?"`, choices:[
    { t:`"Yes. I will save it with state money."`, fx:{h:2.6}, says:['plant','yes'], log:`Told plant workers you'd save it with state money` },
    { t:`"I can't promise that. I can promise I'll fight."`, fx:{h:.7,cred:4}, log:`Told plant workers you couldn't promise` },
    { t:`Shake hands and don't answer.`, fx:{h:.5,cred:-1}, log:`Shook hands at the gate without answering` },
  ]},
  { town:'millbrook', title:`Layoffs at the plant`, tease:`300 jobs cut; picket line this morning`, text:`Millbrook announces 300 layoffs. There is a picket line, and a TV truck.`, choices:[
    { t:`Stand on the picket line.`, fx:{h:2.2,s:{suburbs:-.5}}, log:`Joined the Millbrook picket line` },
    { t:`Bring coffee, stay off camera.`, fx:{h:1,cred:3}, log:`Brought coffee to the picket line with no cameras` },
    { t:`Say the plant has to change to survive.`, fx:{s:{suburbs:1.2},h:-2,cred:2}, log:`Told workers the plant had to change` },
  ]},
  { town:'millbrook', title:`Local 88`, tease:`The union wants a signature`, text:`Local 88's president slides a pledge across the table: oppose any automation at the plant, ever. Their phone bank comes with it.`, choices:[
    { t:`Sign it.`, fx:{h:2,t:{factory:2},s:{suburbs:-.4}}, breaks:'noDeals', flag:'local88', log:`Signed Local 88's no-automation pledge` },
    { t:`Offer a weaker version you can actually keep.`, fx:{h:.9,cred:2}, log:`Offered Local 88 a weaker pledge` },
    { t:`Decline and say why.`, fx:{h:-.4,cred:4}, log:`Declined Local 88's pledge` },
  ]},
  { town:'millbrook', title:`Last call at Rosie's`, tease:`A bar full of people who don't vote`, text:`A laid-off machinist tells you you're just another suit. Someone's phone is filming. You could tell the room your father worked the line. He sold insurance.`, choices:[
    { t:`Tell them about your father on the line.`, fx:{h:2,t:{factory:1},skel:skel(`Reporters found out your father never worked at a mill`,.12,2)}, breaks:'noLies', log:`Claimed your father worked the line at the plant` },
    { t:`Buy a round and mostly listen.`, fx:{h:1.1,t:{factory:1},money:-2}, log:`Listened at Rosie's bar` },
    { t:`Tell him he's right, and ask what he'd do.`, fx:{h:.9,cred:3}, log:`Agreed with the machinist and asked for his ideas` },
  ]},
  { town:'millbrook', title:`The food bank`, tease:`They need hands, no press allowed`, text:`The food bank is short of volunteers. Your press team asks if they can leak a photo anyway.`, choices:[
    { t:`Work the shift. No photo.`, fx:{h:.9,cred:4}, log:`Worked the food bank with no photos` },
    { t:`Work the shift. Leak the photo.`, fx:{h:1.5,all:.2,cred:-3}, log:`Leaked a photo of your food bank shift` },
  ]},
  // Ironton
  { town:'ironton', title:`The veterans' hall`, tease:`Friday fish fry, big crowd`, text:`At the veterans' hall, someone assumes you served. You didn't. Your uncle did.`, choices:[
    { t:`Correct them.`, fx:{h:.5,cred:3}, log:`Corrected the veterans who assumed you served` },
    { t:`Let it stand, and tell your uncle's stories as "we".`, fx:{h:2,s:{farm:.8},skel:skel(`Veterans learned you never served`,.1,2.4)}, breaks:'noLies', log:`Let veterans believe you had served` },
  ]},
  { town:'ironton', title:`Truckers at the depot`, tease:`They want the bypass built`, text:`Forty truckers lose two hours a day in Oakfield traffic. "Are you for the bypass or not?"`, choices:[
    { t:`"Build it."`, fx:{h:2,s:{farm:.4}}, says:['bypass','yes'], log:`Told Ironton truckers you'd build the bypass` },
    { t:`"It depends on the route. Let me see the study."`, fx:{h:.5,cred:2}, log:`Told truckers the bypass depends on the study` },
  ]},
  { town:'ironton', title:`The gas plant tour`, tease:`900 jobs, one very loud question`, text:`The plant manager walks you past the turbines. Nine hundred jobs. "Will it still be here in ten years?"`, choices:[
    { t:`"It stays open as long as I'm in office."`, fx:{h:2.4,s:{college:-.5}}, says:['gas','keep'], log:`Promised the gas plant would stay open` },
    { t:`"We need a plan for when it closes, and I want you writing it."`, fx:{h:.4,cred:4,s:{college:.5}}, log:`Told the gas plant it needs a closing plan` },
  ]},
  { town:'ironton', title:`The closed school`, tease:`Parents have a petition`, text:`Ironton Elementary shut last June. Parents hand you a petition and a photo of a 50-minute bus ride.`, choices:[
    { t:`Ride the bus with them at 6am tomorrow. You'll lose the morning.`, fx:{h:2,cred:3,hours:-3}, log:`Rode the 6am school bus in Ironton` },
    { t:`Promise federal money to reopen it. It doesn't exist.`, fx:{h:1.8,skel:skel(`The federal school money you promised in Ironton does not exist`,.1,1.5)}, breaks:'noLies', log:`Promised Ironton federal money that doesn't exist` },
    { t:`Sign the petition.`, fx:{h:.7}, log:`Signed the Ironton school petition` },
  ]},
  { town:'ironton', title:`Earl Mabry's kitchen`, tease:`He runs the ward captains`, text:`Earl Mabry pours coffee. He can deliver the ward captains. His nephew would like a job in your office if you win.`, choices:[
    { t:`"Tell your nephew to send a résumé."`, fx:{h:3.6,party:4,skel:skel(`The Mabry job-for-votes deal came out`,.09,2)}, breaks:'noDeals', flag:'mabry', log:`Promised Earl Mabry's nephew a job for his ward captains` },
    { t:`"I can't do that, Earl."`, fx:{h:-.5,party:-3,cred:3}, log:`Refused Earl Mabry's deal` },
  ]},
  // Cedar Heights
  { town:'cedar', title:`Property tax night`, tease:`Packed school gym, angry homeowners`, text:`Tax bills are up 11%. A man at the microphone wants one sentence: who's getting the money?`, choices:[
    { t:`"Corporations. No more state subsidies, starting with Millbrook."`, fx:{h:2.5,s:{factory:-.3}}, says:['plant','no'], log:`Told Cedar Heights you'd end subsidies, including Millbrook's` },
    { t:`"Mostly schools, honestly. I'd rather tell you that than lie."`, fx:{h:.3,cred:5}, log:`Told taxpayers the money mostly goes to schools` },
    { t:`"Whitmore has had eighteen years to answer that."`, fx:{h:1,cred:-1}, log:`Blamed Whitmore at the tax meeting` },
  ]},
  { town:'cedar', title:`The soccer sideline`, tease:`Saturday, no microphones, real talk`, text:`Parents want to know why three schools share one nurse. Nobody's filming. A mom asks what you'd really do.`, choices:[
    { t:`Tell her you don't know yet, and take notes.`, fx:{h:1,cred:2}, log:`Took notes on the school nurse problem` },
    { t:`Give your stump speech.`, fx:{h:.5,cred:-1}, log:`Gave a stump speech at a soccer game` },
  ]},
  { town:'cedar', title:`The developer's breakfast`, tease:`$40k in the room if they like you`, text:`Ten homebuilders can't get water hookups. Farm country has the water rights. They've brought checkbooks.`, choices:[
    { t:`"New housing gets its hookups first."`, fx:{h:1.6,money:40,s:{farm:-.3}}, says:['water','homes'], log:`Told developers housing gets water hookups first` },
    { t:`"We'll need a deal both sides can live with."`, fx:{h:.4,money:12,cred:1}, log:`Told developers both sides need a water deal` },
  ]},
  { town:'cedar', title:`The poll worker`, tease:`She has a concern about ballots`, text:`A retired poll worker says the county is cutting two early-voting sites, in Whitmore's weakest wards. She can't prove it was deliberate. You could say it was.`, choices:[
    { t:`Call it voter suppression, on camera.`, fx:{all:1,t:{college:1},skel:skel(`The early-voting cuts turned out to be a budget error, not suppression`,.1,1.6)}, breaks:'noLies', log:`Called early-voting cuts suppression without proof` },
    { t:`Ask the county in writing, publicly, for the reason.`, fx:{h:.8,press:5,cred:3}, log:`Asked the county about early-voting cuts in writing` },
  ]},
  { town:'cedar', title:`The pharmacy line`, tease:`Insulin prices, one furious son`, text:`A man buys his father's insulin in front of you. $340. He looks at your campaign button and laughs.`, choices:[
    { t:`Pay for it yourself. A photo would help.`, fx:{h:1.6,money:-1,cred:-2}, log:`Paid for a stranger's insulin with a camera nearby` },
    { t:`Ask for his number and actually call him tonight.`, fx:{h:1,cred:3}, log:`Called a man about his father's insulin` },
  ]},
  // Oakfield
  { town:'oakfield', title:`The bypass meeting`, tease:`The route runs through their backyards`, text:`Oakfield homeowners have maps with red lines through their streets. "Will you stop this bypass?"`, choices:[
    { t:`"It will never go through Oakfield."`, fx:{h:2.5}, says:['bypass','no'], log:`Told Oakfield the bypass would never come through` },
    { t:`"I need to see the study. I won't promise tonight."`, fx:{h:.2,cred:3}, log:`Refused to promise Oakfield on the bypass` },
  ]},
  { town:'oakfield', title:`Grace Fellowship`, tease:`3,000 people on a Sunday`, text:`Pastor Dale Keane offers you the pulpit, if you tell the congregation you share their "values". You know what that means here, and you don't.`, choices:[
    { t:`Tell them you share their values.`, fx:{h:2.6,s:{college:-1}}, breaks:'oneMessage', log:`Told Grace Fellowship you shared their values` },
    { t:`Speak honestly about where you differ.`, fx:{h:.4,cred:5,s:{college:.3}}, log:`Told Grace Fellowship where you differ` },
    { t:`Skip the pulpit and attend as a visitor.`, fx:{h:.6}, log:`Attended Grace Fellowship as a visitor` },
  ]},
  { town:'oakfield', title:`Bingo at Maple Court`, tease:`Retirees who vote every time`, text:`A woman asks if Whitmore really wants to cut Social Security. He voted for a study. That's all. Your flyer says "cut".`, choices:[
    { t:`"That's right, he wants to cut it."`, fx:{h:2,t:{suburbs:1},skel:skel(`Fact-checkers rated your Social Security claim false`,.12,1.8)}, breaks:'noLies', log:`Told retirees Whitmore wanted to cut Social Security` },
    { t:`"He voted for a study. I'd watch that closely."`, fx:{h:.9,cred:3}, log:`Told retirees accurately what Whitmore voted for` },
    { t:`Call the bingo numbers and don't talk politics.`, fx:{h:1.1}, log:`Called bingo at Maple Court` },
  ]},
  { town:'oakfield', title:`Realtors' lunch`, tease:`They could fund your last week`, text:`The realtors' group wants you to oppose a rule requiring flood-risk disclosure. They'll bring $30k. You think the rule is good.`, choices:[
    { t:`Oppose the rule. Take the money.`, fx:{money:30,h:.8,cred:-2}, breaks:'keepStand', log:`Opposed the flood-disclosure rule for $30k` },
    { t:`Tell them you back the rule, and leave without the money.`, fx:{cred:4}, log:`Backed the flood-disclosure rule to the realtors' faces` },
  ]},
  { town:'oakfield', title:`The heckler`, tease:`A town hall that could go sideways`, text:`A heckler stands up and shouts about your record on the county board. He's half right. The room goes quiet.`, choices:[
    { t:`"You're half right. Here's the half."`, fx:{h:1.3,cred:4,press:3}, log:`Admitted a heckler was half right` },
    { t:`Have him removed.`, fx:{h:-.3,press:-4,cred:-2}, log:`Had a heckler removed` },
    { t:`Make a joke and move on.`, fx:{h:.9}, log:`Joked your way past a heckler` },
  ]},
  // Dunmore
  { town:'dunmore', title:`At the diner`, tease:`A widow wants a word`, text:`A widow shows you her mother's care bills. "Will you actually fix this?" You can't, not from one House seat. A camera is nearby.`, choices:[
    { t:`"I can't promise that. I'll fight, but I can't promise."`, fx:{h:.3,cred:5}, log:`Told the widow you couldn't promise to fix her bills` },
    { t:`"Yes. I'll fix this." (A white lie. It's kind, right?)`, fx:{h:2,s:{suburbs:.6},skel:skel(`The widow told a reporter nobody ever called back`,.05,1.2)}, breaks:'noLies', flag:'widow', log:`Told the widow you'd fix her bills, knowing you couldn't` },
    { t:`Take her number and have a staffer follow up.`, fx:{h:.6}, log:`Had a staffer follow up with the widow` },
  ]},
  { town:'dunmore', title:`The water board`, tease:`The vote everyone is shouting about`, text:`The water board debates giving new subdivisions priority. Every rancher in the county has come. They want to hear it from you.`, choices:[
    { t:`"Farm water rights come first. No exceptions."`, fx:{h:2.8,s:{suburbs:-.3}}, says:['water','farm'], log:`Told the water board farm rights come first` },
    { t:`"There isn't enough water for what everyone's promising you."`, fx:{h:.2,cred:5}, log:`Told the water board there isn't enough water` },
  ]},
  { town:'dunmore', title:`The county fair`, tease:`Judge the pies, shake 2,000 hands`, text:`They've asked you to judge the pies. One is from the sheriff's wife. One is clearly the best, from a woman who has spent years feuding with the sheriff.`, choices:[
    { t:`Pick the best pie.`, fx:{h:1.2,cred:2,party:-3}, log:`Gave the blue ribbon to the best pie` },
    { t:`Pick the sheriff's wife.`, fx:{h:1,party:4,cred:-1}, log:`Gave the blue ribbon to the sheriff's wife` },
    { t:`Declare a tie. Everyone sees through it.`, fx:{h:.7}, log:`Declared a pie tie` },
  ]},
  { town:'dunmore', title:`KDUN talk radio`, tease:`The host has 40,000 listeners`, text:`A popular talk host will have you on if you nod along to his theory about the water board. It is nonsense.`, choices:[
    { t:`Nod along.`, fx:{h:2.2,s:{college:-1.5},skel:skel(`The radio interview resurfaced and you were asked to defend it`,.1,1.6)}, breaks:'noLies', log:`Nodded along to a false theory on talk radio` },
    { t:`Go on and push back.`, fx:{h:-.3,cred:5,press:3}, log:`Pushed back on the talk host live` },
    { t:`Skip the show and see the feed store instead.`, fx:{h:.6}, log:`Skipped the talk show for the feed store` },
  ]},
  { town:'dunmore', title:`The seed co-op`, tease:`Their books are in trouble`, text:`The co-op manager says state spending is killing them, and asks you to say you'd freeze it. He's half right.`, choices:[
    { t:`"A freeze on all new state spending."`, fx:{h:2,s:{suburbs:.4}}, says:['spend','freeze'], log:`Promised the seed co-op a state spending freeze` },
    { t:`"Let me look at the books with you."`, fx:{h:.8,cred:3,hours:-1}, log:`Sat down with the seed co-op's books` },
  ]},
  // Pike's Ford
  { town:'pikes', title:`The flood`, tease:`The river is over the road`, text:`A flash flood hits Pike's Ford. Your press team wants a crew there with you.`, choices:[
    { t:`Fill sandbags, no cameras.`, fx:{h:1,cred:4,hours:-2}, log:`Filled sandbags with no cameras` },
    { t:`Bring the crew.`, fx:{h:1.8,all:.3,cred:-3}, log:`Took a camera crew to the flood` },
    { t:`Send a check and leave.`, fx:{money:-5,h:.3}, log:`Sent a check to the flood relief` },
  ]},
  { town:'pikes', title:`The grain elevator`, tease:`Old men with long memories`, text:`They knew your opponent's father. They don't know you. "Whitmore got us that grain rail in '09. What've you done?"`, choices:[
    { t:`"Nothing yet. Tell me what's next."`, fx:{h:1.3,cred:3}, log:`Admitted you'd done nothing yet for the grain elevator` },
    { t:`"I worked on that rail deal at the county." You didn't.`, fx:{h:2,skel:skel(`County records showed you had nothing to do with the rail deal`,.12,1.7)}, breaks:'noLies', log:`Claimed credit for the grain rail deal` },
  ]},
  { town:'pikes', title:`The clinic closing`, tease:`Last doctor for 50 miles`, text:`The rural clinic closes in March. The nurse asks you to stand with staff at a rally. Its owner gave your campaign $5,000 last month, and he is the one closing it.`, choices:[
    { t:`Stand with staff, and return his check publicly.`, fx:{h:2,money:-5,cred:4,press:3}, log:`Returned the clinic owner's check at a rally` },
    { t:`Stand with staff. Say nothing about the check.`, fx:{h:1.6,skel:skel(`The clinic owner's check to you came out`,.1,1.3)}, breaks:'ownIt', log:`Rallied against the clinic closing, kept the owner's check` },
    { t:`Skip the rally.`, fx:{h:-.5}, log:`Skipped the clinic rally` },
  ]},
  { town:'pikes', title:`4-H auction`, tease:`A 12-year-old and her steer`, text:`A girl has raised a steer for a year. The crowd looks at you. A bid means $6k and a very good photo.`, choices:[
    { t:`Bid big.`, fx:{h:1.5,money:-6}, log:`Bought a 4-H steer at auction` },
    { t:`Skip the bid and ask her about the steer.`, fx:{h:.9,cred:1}, log:`Talked to a 4-H kid about her steer` },
  ]},
  { town:'pikes', title:`The township board`, tease:`Three men and a broken bridge`, text:`Pike's Ford has one bridge out, and an 11-mile detour for the school bus. The board wants a letter. Whitmore has ignored them for two years.`, choices:[
    { t:`Write the letter tonight and read it to them.`, fx:{h:1.4,cred:2}, log:`Wrote the township's bridge letter` },
    { t:`Say the funding is already "in the works".`, fx:{h:1.8,skel:skel(`There was never any funding for the Pike's Ford bridge`,.1,1.3)}, breaks:'noLies', log:`Said bridge funding was in the works` },
  ]},
  // Harlan
  { town:'harlan', title:`The climate pledge`, tease:`Students with clipboards`, text:`Students ask you to sign a pledge to close the Ironton gas plant by 2030. It will not play well in Ironton.`, choices:[
    { t:`Sign it.`, fx:{h:2.5,s:{factory:-.4}}, says:['gas','close'], log:`Signed the pledge to close the gas plant by 2030` },
    { t:`Sign it, then tell the suburban paper you never really agreed.`, fx:{h:2.2,s:{suburbs:.4},skel:skel(`Both papers printed what you told the other`,.15,2.2)}, breaks:'oneMessage', log:`Signed the pledge and disowned it in the suburbs` },
    { t:`Politely decline.`, fx:{h:-1,s:{suburbs:.4}}, log:`Declined the student pledge` },
  ]},
  { town:'harlan', title:`The tuition sit-in`, tease:`Day four in the admin building`, text:`Students have occupied the admin building. They want a tuition cap. They ask you to say the state will pay for it.`, choices:[
    { t:`"The state will pay to cap tuition."`, fx:{h:2.6,t:{college:2},s:{suburbs:-.3}}, says:['spend','cap'], log:`Promised state money to cap Harlan tuition` },
    { t:`"I'll fight for it, but I won't promise a number."`, fx:{h:.7,cred:3}, log:`Told students you wouldn't promise a tuition number` },
  ]},
  { town:'harlan', title:`The student paper`, tease:`A 19-year-old with better questions than Channel 9`, text:`The editor of the Harlan Daily has found a vote you cast on the county board that you got wrong. She's been fair about it.`, choices:[
    { t:`"I got that wrong. Print that I said so."`, fx:{h:1.2,cred:5,press:4}, log:`Admitted a bad county vote to the student paper` },
    { t:`"The context is more complicated."`, fx:{h:.2,press:-2}, breaks:'ownIt', log:`Dodged the student paper's question on your bad vote` },
  ]},
  { town:'harlan', title:`Register the dorms`, tease:`3,000 students not registered`, text:`A week of registration drives could change the math. It'll cost $8k and most of a day.`, choices:[
    { t:`Spend the day and the money.`, fx:{money:-8,t:{college:5},hours:-2}, log:`Ran a voter registration drive in the Harlan dorms` },
    { t:`Hand out flyers for an hour.`, fx:{t:{college:1.5}}, log:`Handed out flyers on campus` },
  ]},
  { town:'harlan', title:`Professor Adeyemi`, tease:`Her economics class is watching`, text:`A professor asks you to explain your tax plan to her class. Her students will check the math. Your plan's math is a bit generous.`, choices:[
    { t:`Show them the honest numbers, gap included.`, fx:{h:1.1,cred:4}, log:`Showed an economics class your plan's math gap` },
    { t:`Wave it away with charm.`, fx:{h:.5,skel:skel(`A student's fact-check of your tax math went viral`,.12,1.3)}, log:`Charmed your way past the math in an economics class` },
  ]},
  // Capital
  { town:'capital', title:`Marian Holt's office`, tease:`The party chair, in person`, text:`Marian Holt has a map of every race in the state. "You've got a real shot, and I've got one pot of money. Convince me." She wants you to vote with leadership on the first big bill.`, choices:[
    { t:`Give her your word on the bill.`, fx:{money:70,party:18}, breaks:'noDeals', flag:'holt', log:`Promised Marian Holt your first big vote for $70,000` },
    { t:`Show her your numbers and ask for nothing but a fair look.`, fx:{money:20,party:6,cred:1}, log:`Made your case to the chair with no promises` },
  ]},
  { town:'capital', title:`The Gulfline suite`, tease:`A lobbyist is holding a room`, text:`A Gulfline lobbyist has a suite, shrimp and $90,000 of "independent" support. "You won't even have to meet them."`, choices:[
    { t:`Let them spend it.`, fx:{money:90,skel:skel(`Filings showed $90,000 of Gulfline money behind your race`,.1,2)}, breaks:'noPac', flag:'gulfline', log:`Accepted $90,000 in Gulfline support` },
    { t:`Eat the shrimp and leave.`, fx:{cred:1}, log:`Ate Gulfline's shrimp and left` },
  ]},
  { town:'capital', title:`The big-donor dinner`, tease:`$500 a plate, a long way from Millbrook`, text:`Sixty donors. A man at table two asks you to say what you really think of "those towns". They laugh. They'd pay well for you to laugh along.`, choices:[
    { t:`Laugh along.`, fx:{money:60,skel:skel(`A waiter's video of you laughing at the mill towns got out`,.13,3)}, breaks:'oneMessage', log:`Laughed along with donors about the mill towns` },
    { t:`Tell them about the man at Rosie's bar.`, fx:{money:20,cred:3}, log:`Defended the mill towns at a donor dinner` },
  ]},
  { town:'capital', title:`The committee promise`, tease:`Leadership has an offer`, text:`A senior member offers a seat on the Agriculture committee if you win. You could announce it in Farm country tomorrow. It isn't really his to offer.`, choices:[
    { t:`Announce it.`, fx:{s:{farm:2.2},party:4,skel:skel(`Leadership said nobody promised you a committee seat`,.12,1.4)}, breaks:'noLies', log:`Announced a committee seat nobody could promise` },
    { t:`Thank him and wait.`, fx:{party:3}, log:`Waited on the committee offer` },
  ]},
  { town:'capital', title:`The Governor's photo`, tease:`An ally you may not want`, text:`The Governor wants a photo for tomorrow's paper. He's unpopular, and he remembers everyone who says no.`, choices:[
    { t:`Take the photo.`, fx:{party:10,money:15,s:{suburbs:-.6}}, log:`Took a photo with the Governor` },
    { t:`Find the back stairs.`, fx:{party:-6,s:{suburbs:.3}}, log:`Avoided the Governor's photo` },
  ]},
  // Press: dealt to any town
  { press:true, title:`Courier editorial board`, tease:`Ninety minutes, on the record`, text:`Five editors, a pile of your old votes. They ask which of your promises you'd drop first if the money isn't there.`, choices:[
    { t:`Name one honestly.`, fx:{all:.4,press:8,cred:3}, log:`Told the Courier which promise you'd drop first` },
    { t:`"I won't drop any of them."`, fx:{all:.5,press:-3}, log:`Told the Courier you'd keep every promise` },
  ]},
  { press:true, title:`Channel 9 live shot`, tease:`Thirty seconds at 6pm`, text:`The reporter has one question: "Do you trust the polls that have you behind?" You haven't seen a good poll in days.`, choices:[
    { t:`"Our internals show us ahead."`, fx:{all:.8,skel:skel(`Your "internals" were shown never to have existed`,.1,1.3)}, breaks:'noLies', log:`Claimed internals showing you ahead` },
    { t:`"I expect we're behind. That's why I'm out here."`, fx:{all:.3,press:5,cred:3}, log:`Said on TV that you're probably behind` },
  ]},
  { press:true, title:`The tracker`, tease:`Whitmore's guy with a camera`, text:`A Whitmore staffer is following you with a camera, trying to catch a bad moment. He asks a rude question about your family.`, choices:[
    { t:`Offer him a sandwich and answer politely.`, fx:{all:.5,press:3}, log:`Bought Whitmore's tracker a sandwich` },
    { t:`Grab the camera.`, fx:{all:-1.6,press:-5,t:{factory:1}}, log:`Grabbed the Whitmore tracker's camera` },
    { t:`Walk away.`, fx:{}, log:`Walked away from the tracker` },
  ]},
  { press:true, title:`The fact-check desk`, tease:`They've rated you "misleading"`, text:`The Courier's fact-checker says a number in your stump speech is wrong. It is, slightly. Your speechwriter says it's fine, keep it.`, choices:[
    { t:`Fix it, and thank them.`, fx:{press:7,cred:3}, log:`Fixed your stump speech after a fact-check` },
    { t:`Keep it. Nobody reads fact-checks.`, fx:{all:.3,press:-4,skel:skel(`Your repeated false number became the story`,.1,1.3)}, breaks:'ownIt', log:`Kept a number in your speech after it was fact-checked` },
  ]},
  { press:true, title:`The podcast`, tease:`Three million downloads, no fact-checkers`, text:`A huge podcast wants two hours. The host is friendly and wrong about most things. It would reach people who never watch the news.`, choices:[
    { t:`Do it. Agree with him where it's easy.`, fx:{all:1,t:{factory:1},press:-3}, log:`Went along with a podcast host for two hours` },
    { t:`Do it. Correct him when he's wrong.`, fx:{all:.4,cred:3,press:2}, log:`Corrected a podcast host on air` },
    { t:`Pass.`, fx:{}, log:`Passed on the podcast` },
  ]},
  { press:true, title:`The Sunday profile`, tease:`She wants to meet your family`, text:`A national reporter is writing a profile. She wants a day with your family, and she's already asked about the old business.`, choices:[
    { t:`Give her the day, and the access.`, fx:{press:6,all:.4,hours:-1}, log:`Gave a national reporter a day with your family` },
    { t:`Give her twenty minutes in a coffee shop.`, fx:{press:-2}, log:`Gave a national reporter twenty minutes` },
  ]},
];
const ENCOUNTERS = [
  { title:`Whitmore shakes your hand`, tease:`Whitmore is in town today`, text:`You turn a corner and there he is: Dale Whitmore, with cameras. He puts his arm around you. "This kid's going places. Just not Washington." The crowd laughs. They like him.`, choices:[
    { t:`Laugh, and shake his hand.`, fx:{h:.9,cred:1}, log:`Took Whitmore's joke well in public` },
    { t:`"Going places is more than you've done in 18 years."`, fx:{h:1.5,press:2,cred:-1}, log:`Fired back at Whitmore in front of the cameras` },
  ]},
  { title:`The joint forum`, tease:`Whitmore is in town today`, text:`The Rotary forum had an empty chair for you. Whitmore points to it. You walk in. He asks you, there and then, to name one bill you've ever read.`, choices:[
    { t:`Name it, and quote a line.`, fx:{h:1.8,press:3}, log:`Won a Rotary exchange with Whitmore` },
    { t:`Ask how many he has skipped.`, fx:{h:.9}, log:`Answered Whitmore with a question at the Rotary` },
  ]},
  { title:`At the funeral`, tease:`Whitmore is in town today`, text:`A beloved county judge has died. You and Whitmore both came. His people are handing out cards in the parking lot. Yours would like to.`, choices:[
    { t:`Pay your respects, and leave without a word about the race.`, fx:{h:.9,cred:4}, log:`Stayed quiet about the race at the judge's funeral` },
    { t:`Tell the press Whitmore's people campaigned at a funeral.`, fx:{h:.9,press:-2,all:.4}, log:`Called out Whitmore's people at the funeral` },
    { t:`Tell your people to hand out cards too.`, fx:{h:.6,cred:-5}, log:`Handed out campaign cards at a funeral` },
  ]},
  { title:`Same diner`, tease:`Whitmore is in town today`, text:`Whitmore slides into your booth. "Off the record. Why are you doing this? You know what this job does to people." For a moment he seems to mean it.`, choices:[
    { t:`Answer him honestly.`, fx:{cred:3,calm:1}, flag:'booth', log:`Told Whitmore honestly why you're running` },
    { t:`Leak the conversation.`, fx:{h:1.3,press:-3,cred:-4}, log:`Leaked your private talk with Whitmore` },
  ]},
];
const AD_LINES = {
  factory:[`A spot shot on the Millbrook plant floor`,`A 30-second radio ad on Ironton's union stations`],
  suburbs:[`A soft spot about the cost of living`,`Mailers to every Cedar Heights and Oakfield door`],
  farm:[`Radio during the farm report`,`A spot filmed at the Dunmore feed store`],
  college:[`Digital ads across campus`,`A student-made video about tuition`],
};

/* What staff say when they report back (used by runJobs in engine.js). */
const VOICE={ priya:`The room was going badly`, tess:`They were ready to walk out on me`, ben:`I'm a driver, they kept asking me things`, maya:`A reporter pushed me on it, on the record`, rick:`I saw an opening and I took it`, lou:`The donors in the room wanted a clear answer`, nina:`They asked what the research showed` };
const TOWN_SAYS={ factory:[['plant','yes'],['gas','keep']], suburbs:[['plant','no'],['water','homes'],['bypass','no']], farm:[['water','farm'],['spend','freeze']], college:[['gas','close'],['spend','cap']] };
const OK_LINES={ priya:`The room came around. Nothing to fix.`, tess:`Good day. They like you more than they did.`, ben:`I shook every hand in town. Don't make me do it again.`, maya:`Quiet and clean. I told them only what's true.`, rick:`They love you. Don't ask what I said. Kidding. Mostly.`, lou:`I got two checks and a lot of opinions.`, nina:`I listened more than I talked. Useful, too.` };
const SPECIAL={
  lou:[{ text:`Lou: "I've got $30k from the Gravel Association. I may have implied you'd return their calls first."`, choices:[
    { t:`Keep the money. You'll return their calls.`, fx:{money:30,skel:skel(`The Gravel Association said they were promised first call`,.12,1.4)}, breaks:'noDeals', loyal:{lou:6}, log:`Kept gravel money that came with a promise` },
    { t:`Send it back, and tell Lou never to imply that again.`, fx:{cred:3}, loyal:{lou:-12}, log:`Made Lou return the Gravel Association's money` },
  ]},{ text:`Lou: "A donor's offering $25k, but he wants to ride along with you tomorrow. He's a talker, and he's not a nice man."`, choices:[
    { t:`Bring him along.`, fx:{money:25,cred:-2}, loyal:{lou:5}, log:`Took a difficult donor on tour` },
    { t:`Thank him and say no.`, fx:{}, loyal:{lou:-6}, log:`Turned down a difficult donor's ride-along` },
  ]}],
  rick:[{ text:`Rick: "The Courier was about to run something on you. I told the editor we'd stop returning their calls. They held it. You're welcome."`, choices:[
    { t:`"Good." Say nothing more.`, fx:{press:-5,skel:skel(`The Courier editor said your press man threatened him`,.18,1.8)}, breaks:'noLies', loyal:{rick:7}, log:`Approved of Rick threatening the Courier` },
    { t:`Call the editor and apologize.`, fx:{press:5,cred:2}, loyal:{rick:-16}, log:`Apologized to the Courier for Rick` },
  ]},{ text:`Rick: "I've got a guy at Channel 9 who'll bump Whitmore's clip if we give him the exclusive on your family."`, choices:[
    { t:`Give him your family.`, fx:{all:.8,cred:-3}, loyal:{rick:5}, log:`Traded your family's story to Channel 9` },
    { t:`Not my family, Rick.`, fx:{cred:2}, loyal:{rick:-6}, log:`Refused to trade your family's story` },
  ]}],
  nina:[{ text:`Nina: "I've got Whitmore's tax records. Don't ask whose login I used. It's real, and it's good."`, choices:[
    { t:`Use it.`, fx:{all:1.6,skel:skel(`Your researcher was caught using someone's login to get Whitmore's tax records`,.2,2.6)}, breaks:'noLies', loyal:{nina:7}, log:`Used Whitmore's tax records that Nina shouldn't have had` },
    { t:`Delete it, and make sure she knows why.`, fx:{cred:3}, loyal:{nina:-12}, log:`Made Nina delete Whitmore's tax records` },
  ]},{ text:`Nina: "Heads up. I ran your record the way they will. Your 2018 vote on the landfill is worse than you remember."`, choices:[
    { t:`Get ahead of it tomorrow.`, fx:{all:-.3,cred:4,press:3}, loyal:{nina:5}, log:`Got ahead of your own landfill vote` },
    { t:`Sit on it. They may not find it.`, fx:{skel:skel(`Whitmore's team found your 2018 landfill vote`,.18,1.6)}, loyal:{nina:-5}, log:`Sat on your landfill vote` },
  ]}],
  maya:[{ text:`Maya: "The Courier asked me if you'd seen the donor list before Tuesday. I said yes, because you had. Now you have a mess, and I'd do it again."`, choices:[
    { t:`Back her up in public.`, fx:{all:-.4,cred:3,press:5}, loyal:{maya:10}, log:`Backed Maya's honest answer to the Courier` },
    { t:`Say she was mistaken.`, fx:{skel:skel(`Maya Cole's notes showed you threw her under the bus`,.2,1.8)}, breaks:'ownIt', loyal:{maya:-30}, log:`Told the press Maya was mistaken` },
  ]},{ text:`Maya: "A Channel 9 producer will give you the Sunday slot if I hand over Whitmore's schedule. I told her I'd ask you, and that I hate it."`, choices:[
    { t:`Do it anyway.`, fx:{all:.7,press:-3}, loyal:{maya:-12}, log:`Traded Whitmore's schedule for a Sunday slot` },
    { t:`You're right. No.`, fx:{press:3}, loyal:{maya:6}, log:`Turned down the Sunday slot` },
  ]}],
  ben:[{ text:`Ben: "Shortcut saved us an hour tomorrow, but I got a ticket doing 90 in your wrapped van. It's on the Ironton police blotter."`, choices:[
    { t:`Pay it and joke about it in public.`, fx:{money:-2,all:.1,cred:1}, loyal:{ben:5}, log:`Joked about Ben's speeding ticket` },
    { t:`Tell him to slow down or he's gone.`, fx:{}, loyal:{ben:-8}, log:`Warned Ben about the speeding` },
  ]}],
  priya:[{ text:`Priya: "The numbers are in, and you need to hear this before anyone else: if you lost tomorrow, it'd be because of the promises. I'd stop making them."`, choices:[
    { t:`"Tell me which ones to walk back."`, fx:{all:-.2,cred:4}, loyal:{priya:8}, log:`Asked Priya which promises to walk back` },
    { t:`"Thanks. We're not changing anything."`, fx:{}, loyal:{priya:-8}, log:`Ignored Priya's warning about promises` },
  ]}],
  tess:[{ text:`Tess: "Volunteers in the field want to know if we're paying them for the last week like you said. You said that, right?"`, choices:[
    { t:`Pay them. $12k.`, fx:{money:-12,t:{factory:1,suburbs:1}}, loyal:{tess:8}, log:`Paid the field volunteers` },
    { t:`Admit it was never in the budget.`, fx:{cred:2}, loyal:{tess:-4}, log:`Told Tess the volunteer pay wasn't real` },
  ]}],
};

/* What staff say when they recommend an option in a scene. */
const ADVICE={
  rick:[`This one. If it goes wrong, that's what I'm for.`,`Say it. Nobody's checking.`,`You want to be clean or you want to win?`],
  maya:[`This is the one I can defend tomorrow.`,`If you say anything else, I'm not the one going out there for you.`,`The boring true answer. Please.`],
  tess:[`This one plays in the room. I've been talking to these people.`,`Trust me on this crowd.`],
  lou:[`This one keeps the lights on.`,`Donors will read about this. Go with this one.`],
  priya:[`The numbers say this one.`,`I've run it. This costs you the least.`],
  nina:[`This one survives a records request.`,`This is the one I couldn't dig up dirt on.`],
  ben:[`This one keeps us on schedule.`],
};
