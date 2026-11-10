/* The Race, setting: Rajnagar (industrial belt, colonies, villages, lakhs and crores).
   Plain data and text, no rules. Same globals, ids and numbers as harlan.js; each scene here is the
   counterpart of one there, retold for this place. Keep caste and religion out, and keep parties unnamed.
   Loaded before engine.js. */
const GROUPS = {
  factory:{ name:'Industrial belt', size:.30, share:46, yt:60, rt:60 },
  suburbs:{ name:'City colonies', size:.35, share:45, yt:62, rt:63 },
  farm:{ name:'Villages', size:.20, share:37, yt:60, rt:65 },
  college:{ name:'University town', size:.15, share:63, yt:54, rt:50 },
};
const TOWNS = {
  kapaspur:{ name:'Kapaspur', g:'factory', x:120, y:70 },
  lohanagar:{ name:'Lohanagar', g:'factory', x:60, y:190 },
  modeltown:{ name:'Model Town', g:'suburbs', x:300, y:110 },
  sector21:{ name:'Sector 21', g:'suburbs', x:420, y:60 },
  vidyanagar:{ name:'Vidyanagar', g:'college', x:530, y:150 },
  dhanauri:{ name:'Dhanauri', g:'farm', x:400, y:260 },
  belghat:{ name:'Bel Ghat', g:'farm', x:200, y:290 },
  capital:{ name:'State Capital', g:null, x:585, y:50 },
};
const ROADS = [['kapaspur','lohanagar',1],['kapaspur','modeltown',2],['modeltown','sector21',1],['sector21','vidyanagar',2],['vidyanagar','capital',2],['sector21','capital',3],['vidyanagar','dhanauri',2],['dhanauri','belghat',2],['belghat','lohanagar',2],['modeltown','dhanauri',3]];
const DAY_COUNT=5, DAY_START=8, DAY_END=18, STOP_HOURS=2;
const ISSUES = {
  plant:{ yes:'I will save the Kapaspur mill with state money', no:'No more state handouts to big companies' },
  water:{ farm:'Canal water goes to the farms first', homes:'The new colonies get their water connections first' },
  gas:{ keep:'The Lohanagar power plant stays open', close:'The Lohanagar power plant closes by 2030' },
  spend:{ cap:'The state will pay to cap university fees', freeze:'A freeze on all new state spending' },
  bypass:{ yes:'Build the highway bypass', no:'The bypass will never go through Sector 21' },
};
const PRINCIPLES = {
  noLies:{ text:"I won't lie to voters or mislead them about my opponent" },
  noPac:{ text:"I won't take money from big companies" },
  oneMessage:{ text:"I'll tell every town the same thing" },
  ownIt:{ text:"When I'm wrong, I'll say so" },
  noDeals:{ text:"I won't trade favours for votes" },
  keepStand:{ text:"I won't drop a position because of a survey" },
};
const SECRETS = {
  bankrupt:{ text:"Your first business shut down owing 40 workers their last month's wages", story:"A reporter has the old labour court papers: your first business shut down owing 40 workers their last month's wages." },
  dui:{ text:'You were booked for drunk driving in 2009, and the case quietly went away', story:'A reporter has the 2009 police record: you were booked for drunk driving, and the case quietly went away.' },
  brother:{ text:"Your brother's firm won a municipal contract while you sat on the council", story:"A reporter has the council minutes: your brother's firm won a contract while you sat on the council." },
};
const STAFF = {
  priya:{ cares:'the numbers', color:'#6B4FBB', role:'Manager', name:'Priya Nair', short:'Priya', pay:5, text:'Blunt. Replaces Deepak, your hopeful volunteer, so you hear the real number.', job:['numbers','Run the real numbers (a free good survey tomorrow night)'], done:()=>`Priya ran the real numbers. They're below, under Find out where you stand.` },
  tess:{ cares:'what plays in the room', color:'#0E6B6B', role:'Field director', name:'Tara Fernandes', short:'Tara', pay:6, text:'Your best stand-in in a town. Says what the room needs, sometimes too much of it.', job:['advance','Advance your route (your first stop tomorrow lands harder)'], done:()=>`Tara had your first stop ready before you got there.` },
  ben:{ cares:'staying on schedule', color:'#7A5C2E', role:'Scheduler', name:'Bunty Arora', short:'Bunty', pay:3, text:'Knows every back road and every dhaba, and is always tired.', job:['route','Plan your route (travel times down by a third tomorrow)'], done:()=>`Bunty: "Back roads saved you some time. You're welcome. I need to sleep."` },
  maya:{ cares:'what she can defend tomorrow', color:'#2F6FB0', role:'Press secretary', name:'Maya Kurian', short:'Maya', pay:6, text:'Straight with reporters. Will not defend a lie for long.', job:['press','Work the press (press warms; scandals hurt less tomorrow)'], done:()=>`Maya: "Reporters are taking my calls again."` },
  rick:{ cares:'winning, whatever it takes', color:'#B4532A', role:'Press secretary', name:'Rocky Chawla', short:'Rocky', pay:4, text:'Knows who to call. Will do what you did not ask.', job:['bury','Make some calls (stories less likely to surface tomorrow)'], done:()=>`Rocky: "Made some calls. You'd rather not know."` },
  lou:{ cares:'the money', color:'#3F7D3A', role:'Fundraiser', name:'Lalit Goyal', short:'Lalit', pay:4, text:'Great at raising money. His friends tend to want things.', job:['donors','Work the donors (about ₹16 lakh tomorrow)'], done:()=>`Lalit brought in ₹16 lakh.` },
  nina:{ cares:'what someone could dig up later', color:'#8A3A6E', role:'Researcher', name:'Nandini Rao', short:'Nandini', pay:5, text:'Digs up what is true, and how she gets it is sometimes a question.', job:['dig','Dig on Bhandari (true attack ad tomorrow night; his next stop)'], done:town=>`Nandini: "He's in ${town} tomorrow. And I've got enough for a true attack ad."` },
};
const skel=(label,p,hit)=>({label,p,hit});

const FIXED = {
  1:{ title:`Day 1: the announcement`, text:`You announce at the Kapaspur mill workers' union hall. Cameras are rolling. What is your opening line?`, choices:[
    { t:`"This campaign is about keeping jobs in these mills."`, fx:{s:{factory:2.2,college:-.4}}, log:`Opened on jobs` },
    { t:`"Life here costs too much, and nobody in the capital notices."`, fx:{s:{suburbs:1.6,farm:.6}}, log:`Opened on prices` },
    { t:`"Ramakant Bhandari has been missing for twenty years."`, fx:{all:.7}, log:`Opened by attacking Bhandari's twenty years` },
  ]},
  3:{ title:`Day 3: the TV debate`, text:`You are on a video link to the Rajnagar Live debate. The anchor asks what your hospital plan costs. You don't have the number, and everyone watching can tell.`, choices:[
    { t:`"I don't have that number. I'll send it to you tomorrow."`, fx:{all:-.3,cred:7,press:4}, log:`Admitted in the debate that you didn't know the cost` },
    { t:`Say "about four thousand crore" with total confidence.`, fx:{all:1.7,skel:skel(`You invented a four-thousand-crore figure in the debate`,.13,2.4)}, breaks:'noLies', log:`Invented a cost figure live in the debate` },
    { t:`Turn it into an attack on Bhandari's record.`, fx:{all:.6,cred:-2,press:-3}, log:`Dodged the debate question with an attack on Bhandari` },
  ]},
  5:{ title:`Day 5: the file`, text:`A party worker hands you a file on Bhandari: a claim that he took a cut on the highway contract. It is mostly unverified. Leak it now and there is no time for him to respond.`, choices:[
    { t:`Leak it.`, fx:{all:3.4,press:-8,skel:skel(`The highway kickback claim you leaked was false`,.3,3.2)}, breaks:'noLies', log:`Leaked an unverified kickback claim on the last day` },
    { t:`Hand it to a reporter and ask them to check it first.`, fx:{all:.4,cred:3,press:6}, log:`Passed the file to a reporter to verify` },
    { t:`Throw it away.`, fx:{cred:5}, log:`Threw away the unverified file on Bhandari` },
  ]},
};
const secretEvent=id=>({ title:`Day 4: your secret`, text:SECRETS[id].story+` They run the story tomorrow unless you get ahead of it. It is true.`, choices:[
  { t:`Hold a press conference and tell the whole truth.`, fx:{all:-1.8,cred:12,press:8}, log:`Told the whole truth about your secret` },
  { t:`Deny it. "This is a smear from the Bhandari camp."`, fx:{all:.8,press:-5,skel:skel(`Proof emerged that you lied about your secret`,.26,5)}, breaks:'ownIt', log:`Publicly denied your secret, which is true` },
  { t:`Say nothing and change the subject all week.`, fx:{all:-1,cred:-3,press:-4}, log:`Stayed silent about your secret` },
]});

/* Morning calls: things that reach you wherever you woke up. */
const MORNING = [
  { title:`A quiet dinner`, text:`Vardhan Power's people offer ₹1.5 crore of "outside support", paid through well-wishers so it never touches your accounts. They would like one quiet dinner.`, choices:[
    { t:`Take the dinner and the money.`, fx:{money:150,skel:skel(`Reporters traced ₹1.5 crore from Vardhan Power to your campaign`,.1,2.3)}, breaks:'noPac', flag:'gulfline', log:`Took ₹1.5 crore from Vardhan Power` },
    { t:`Decline, and say so publicly.`, fx:{cred:4,press:3,s:{college:.5}}, log:`Publicly turned down Vardhan Power's money` },
    { t:`Decline quietly.`, fx:{cred:1}, log:`Quietly turned down Vardhan Power's money` },
  ]},
  { title:`The consultant`, text:`Your best-known position is doing badly in the city colonies. Your consultant says to drop it by Friday and nobody will care.`, choices:[
    { t:`Drop it.`, fx:{s:{suburbs:3.2,college:-.8},cred:-3}, breaks:'keepStand', log:`Dropped your signature position after a bad survey` },
    { t:`Keep it, and explain why in the next town you visit.`, fx:{s:{suburbs:-.5},cred:5}, log:`Kept your position despite the surveys` },
  ]},
  { title:`The pamphlet`, text:`Your team printed the wrong figure on 40,000 pamphlets. It flatters you. Nobody has noticed.`, choices:[
    { t:`Publish a correction.`, fx:{all:-.4,cred:6,press:4}, log:`Corrected your own pamphlet in public` },
    { t:`Stop printing it and say nothing.`, fx:{skel:skel(`A fact-checker found the false figure on your pamphlet`,.09,1.5)}, breaks:'ownIt', log:`Quietly buried a false figure on your pamphlet` },
  ]},
  { title:`The clip`, text:`A volunteer sends a clip edited to make Bhandari look asleep in Parliament. He wasn't. It would be on every WhatsApp group in the constituency by lunch.`, choices:[
    { t:`Forward it.`, fx:{all:1.5,skel:skel(`The full video showed your clip of Bhandari was edited`,.15,2)}, breaks:'noLies', log:`Forwarded an edited clip of Bhandari` },
    { t:`Let a supporter forward it, not you.`, fx:{all:.7,skel:skel(`Your campaign was tied to the edited Bhandari clip`,.09,2.2)}, breaks:'noLies', log:`Let a supporter forward an edited clip of Bhandari` },
    { t:`Delete it and tell the volunteer why.`, fx:{cred:2}, log:`Deleted the edited clip of Bhandari` },
  ]},
  { title:`The endorsement`, text:`The Rajnagar Times will endorse you if you drop your opposition to the riverfront mall, which you have opposed for ten years.`, choices:[
    { t:`Support the mall. Take the endorsement.`, fx:{all:1.9,cred:-3,press:3}, breaks:'keepStand', log:`Reversed ten years on the riverfront for an endorsement` },
    { t:`Keep your position and lose the endorsement.`, fx:{cred:4}, log:`Gave up the Times endorsement over the riverfront` },
  ]},
  { title:`The old posts`, text:`A staffer's ugly old posts surface. You actually saw them when you hired him.`, choices:[
    { t:`Let him go, and admit you knew.`, fx:{all:-.5,cred:6,press:3}, log:`Admitted you had seen the staffer's posts` },
    { t:`Let him go and say you had no idea.`, fx:{all:.2,skel:skel(`Messages showed you knew about the staffer's posts`,.1,2)}, breaks:'ownIt', log:`Claimed you had no idea about the staffer's posts` },
    { t:`Stand by him.`, fx:{s:{factory:.5,college:-1},cred:-2}, log:`Stood by the staffer` },
  ]},
  { title:`Bhandari's son`, text:`Your researcher finds that Bhandari's son was arrested last spring after a fight outside a bar in the capital. It is true, and it has nothing to do with the race.`, choices:[
    { t:`Make sure the press hears about it.`, fx:{all:.9,cred:-5,press:-3}, log:`Pushed the story of Bhandari's son to the press` },
    { t:`Kill it, and tell Bhandari you did.`, fx:{cred:4,all:.2}, log:`Killed the story about Bhandari's son` },
  ]},
  { title:`The accounts`, text:`Your accountant finds ₹12 lakh of spending missing from your election expense register. Declaring it makes a headline.`, choices:[
    { t:`Declare it.`, fx:{all:-.5,cred:5,press:3}, log:`Declared your own missing spending` },
    { t:`Wait until after the election.`, fx:{skel:skel(`Your undeclared election spending came to light`,.09,2.2)}, breaks:'ownIt', log:`Held back spending you should have declared` },
  ]},
  { title:`Bhandari's offer`, text:`Bhandari's campaign manager calls with a quiet offer: neither side digs into the other's past until polling day.`, choices:[
    { t:`Agree.`, fx:{calm:4,cred:-1}, breaks:'noDeals', log:`Made a private truce with Bhandari` },
    { t:`Refuse.`, fx:{cred:1}, log:`Refused a private truce with Bhandari` },
  ]},
  { title:`Kisan Manch`, text:`An ally offers to set up "Kisan Manch for Kiran", a farmers' front with banners, a press note and no actual farmers in it.`, choices:[
    { t:`Do it.`, fx:{s:{farm:2.2},skel:skel(`"Kisan Manch for Kiran" was exposed as fake`,.12,2.6)}, breaks:'noLies', log:`Set up a fake farmers' front` },
    { t:`Say no, and go and find real farmers.`, fx:{s:{farm:.5},cred:2}, log:`Refused the fake front and looked for real farmers` },
  ]},
  /* Inner party */
  { title:`The president calls`, text:`Sudha Rawat, the state party president: "The Chief Minister is coming through tomorrow. Be on the stage with him. Yes, I know his numbers. Do it anyway."`, choices:[
    { t:`Be on the stage.`, fx:{party:12,s:{college:-.8,suburbs:-.4}}, log:`Shared a stage with the unpopular Chief Minister` },
    { t:`Find a clash in your schedule.`, fx:{party:-8,s:{suburbs:.5}}, log:`Dodged the Chief Minister with a made-up clash` },
    { t:`Tell her no, and tell her why.`, fx:{party:-12,cred:4,all:.3}, log:`Refused to share a stage with the Chief Minister` },
  ]},
  { title:`Anita Kohli`, text:`Anita Kohli, who you beat for the party ticket, still has her workers and a grudge. She'll bring them over if you say her attack on your record was fair. It wasn't, quite.`, choices:[
    { t:`Say it was fair. You need those workers.`, fx:{party:6,s:{college:1.5},t:{college:2}}, breaks:'noLies', log:`Said Anita Kohli's attack on you was fair` },
    { t:`Offer her a post on your team if you win.`, fx:{party:8,s:{college:1.2}}, breaks:'noDeals', flag:'lena', log:`Offered Anita Kohli a post for her workers` },
    { t:`Ask for her help with nothing in return.`, fx:{party:2,s:{college:.3},cred:2}, log:`Asked Anita Kohli to help with no deal` },
  ]},
  { title:`The central office`, text:`The party's central office wants to take over your ads. They bring ₹60 lakh and a script that calls you "a loyal soldier of the party".`, choices:[
    { t:`Take the money and run their script.`, fx:{money:60,party:10,s:{farm:-1,factory:-.6}}, log:`Ran the central office's script` },
    { t:`Take the money, then cut your own ad. Apologise later.`, fx:{money:60,party:-10,skel:skel(`Central office staff told the press you took their money and ignored their script`,.1,1)}, log:`Took central office money and ignored their script` },
    { t:`Turn it down.`, fx:{party:-6,cred:3}, log:`Turned down the central office's money` },
  ]},
  { title:`The district slate`, text:`The district party wants you to back its whole slate for the zilla parishad, including a man you believe is a crook.`, choices:[
    { t:`Back the full slate.`, fx:{party:12,t:{suburbs:1,farm:1},skel:skel(`The zilla parishad candidate you backed was arrested`,.09,1.8)}, breaks:'noDeals', flag:'slate', log:`Backed the party slate, crook included` },
    { t:`Back everyone but him.`, fx:{party:-6,cred:3}, log:`Refused to back the party's crooked candidate` },
    { t:`Stay out of it.`, fx:{party:-2}, log:`Stayed out of the zilla parishad slate fight` },
  ]},
  /* Team: only appear if you hired them */
  { needs:'tess', title:`Tara gets a call`, text:`Bhandari's people have offered Tara Fernandes double what you pay. She tells you herself. "I'd rather stay. I also have a home loan."`, choices:[
    { t:`Match it. ₹30 lakh now.`, fx:{money:-30,cred:1}, log:`Paid to keep Tara` },
    { t:`Tell her you can't, and hope.`, fx:{cred:2,lose:{id:'tess',chance:.4}}, log:`Told Tara you couldn't match the offer` },
  ]},
  { needs:'rick', title:`Rocky has an idea`, text:`Rocky Chawla knows a YouTuber who will run an anonymous rumour about Bhandari's health. "You'd never touch it. That's what I'm for."`, choices:[
    { t:`Don't ask, don't tell.`, fx:{all:1.3,skel:skel(`Rocky Chawla was caught feeding a false health rumour to a YouTuber`,.16,2.6)}, breaks:'noLies', log:`Let Rocky plant a rumour about Bhandari's health` },
    { t:`Tell him no, and that you mean it.`, fx:{cred:2}, log:`Stopped Rocky's rumour` },
    { t:`Fire him.`, fx:{cred:4,press:2,lose:{id:'rick',chance:1}}, log:`Fired Rocky over the rumour` },
  ]},
  { needs:'lou', title:`Lalit's friend`, text:`Lalit Goyal has a businessman ready with ₹45 lakh. He runs sand mining on the river and wants you to "take a look" at his lease.`, choices:[
    { t:`Take a look at the lease.`, fx:{money:45,skel:skel(`The sand miner's lease and his money ended up in the same story`,.12,2)}, breaks:'noDeals', flag:'quarry', log:`Traded a look at a sand-mining lease for ₹45 lakh` },
    { t:`Take the money and promise nothing.`, fx:{money:25,cred:-1}, log:`Took the sand miner's money with no promises` },
    { t:`Send it back.`, fx:{cred:3}, log:`Sent back the sand miner's money` },
  ]},
  { needs:'ben', title:`Bunty fell asleep`, text:`Bunty Arora drifted onto the shoulder of the Lohanagar highway at 6am. He has driven you 14 hours a day and says he's fine.`, choices:[
    { t:`Give him the morning off. You lose the morning.`, fx:{hours:-3,cred:1}, log:`Gave Bunty the morning off` },
    { t:`Hire a second driver, ₹12 lakh.`, fx:{money:-12}, log:`Hired a second driver` },
    { t:`Get him a strong tea. Keep going.`, fx:{skel:skel(`Your exhausted driver crashed on the Lohanagar highway`,.1,1)}, log:`Kept Bunty driving` },
  ]},
  { needs:'priya', title:`Priya's real number`, text:`Priya Nair shows you the real numbers. They're bad. Donors call at nine. "What do you want me to tell them?"`, choices:[
    { t:`Show them the real numbers.`, fx:{money:-10,cred:3}, log:`Showed donors your real numbers` },
    { t:`Tell them there's a wave building.`, fx:{money:30,skel:skel(`Donors leaked your real numbers after you told them a wave was building`,.1,1.3)}, breaks:'noLies', log:`Told donors a wave was building` },
  ]},
  { needs:'nina', title:`Nandini's find`, text:`Nandini Rao has Bhandari's real attendance record: he missed 40% of Parliament's sittings. It's true, and it checks out. It would cost ₹20 lakh to get it in front of people.`, choices:[
    { t:`Spend the ₹20 lakh.`, fx:{money:-20,all:1.4,press:2}, log:`Ran Bhandari's true attendance record` },
    { t:`Give it to the Times for free and let them decide.`, fx:{all:.5,press:5}, log:`Gave Bhandari's attendance record to the Times` },
  ]},
  { needs:'maya', title:`Maya's line`, text:`Maya Kurian, your press secretary: "If you ever have me say something false at a press conference, I walk. I just want you to know that today."`, choices:[
    { t:`"That's why I hired you."`, fx:{cred:2,press:2}, log:`Backed Maya's line` },
    { t:`"Let's hope it never comes up."`, fx:{press:-1}, log:`Dodged Maya's question` },
  ]},
];

/* Stops: what is happening in each town. `h` moves that town's own group. */
const STOPS = [
  // Kapaspur
  { town:'kapaspur', until:12, title:`Shift change at the mill`, tease:`Workers at the gate, only until noon`, text:`Six hundred workers pour out of the mill gate. One stops you, still in his work clothes: "Are you going to save this mill or not?"`, choices:[
    { t:`"Yes. I will save it with state money."`, fx:{h:2.6}, says:['plant','yes'], log:`Told mill workers you'd save it with state money` },
    { t:`"I can't promise that. I can promise I'll fight."`, fx:{h:.7,cred:4}, log:`Told mill workers you couldn't promise` },
    { t:`Fold your hands, smile and don't answer.`, fx:{h:.5,cred:-1}, log:`Greeted the mill gate without answering` },
  ]},
  { town:'kapaspur', title:`Layoffs at the mill`, tease:`300 jobs cut; a dharna at the gate`, text:`Kapaspur Mills announces 300 layoffs. Workers have started a dharna at the gate, and there's a TV van parked across the road.`, choices:[
    { t:`Sit with them on the dharna.`, fx:{h:2.2,s:{suburbs:-.5}}, log:`Joined the dharna at the Kapaspur mill` },
    { t:`Bring tea and food, and stay off camera.`, fx:{h:1,cred:3}, log:`Brought food to the dharna with no cameras` },
    { t:`Say the mill has to modernise to survive.`, fx:{s:{suburbs:1.2},h:-2,cred:2}, log:`Told workers the mill had to modernise` },
  ]},
  { town:'kapaspur', title:`The mill union`, tease:`The union wants a signature`, text:`The president of the Kapaspur Mill Mazdoor Union slides a pledge across the table: oppose any automation at the mill, ever. If you sign, his members knock on every door for you.`, choices:[
    { t:`Sign it.`, fx:{h:2,t:{factory:2},s:{suburbs:-.4}}, breaks:'noDeals', flag:'local88', log:`Signed the mill union's no-automation pledge` },
    { t:`Offer a weaker version you can actually keep.`, fx:{h:.9,cred:2}, log:`Offered the mill union a weaker pledge` },
    { t:`Decline and say why.`, fx:{h:-.4,cred:4}, log:`Declined the mill union's pledge` },
  ]},
  { town:'kapaspur', title:`Raju's tea stall, 10pm`, tease:`Men who stopped voting years ago`, text:`A laid-off loom operator tells you you're just another politician in a white kurta. Someone's phone is filming. You could tell them your father worked the looms. He was a bank clerk.`, choices:[
    { t:`Tell them about your father on the looms.`, fx:{h:2,t:{factory:1},skel:skel(`Reporters found out your father never worked in a mill`,.12,2)}, breaks:'noLies', log:`Claimed your father worked the looms` },
    { t:`Pay for everyone's chai and mostly listen.`, fx:{h:1.1,t:{factory:1},money:-2}, log:`Listened at Raju's tea stall` },
    { t:`Tell him he's right, and ask what he'd do.`, fx:{h:.9,cred:3}, log:`Agreed with the loom operator and asked for his ideas` },
  ]},
  { town:'kapaspur', title:`The community kitchen`, tease:`They need hands, no press allowed`, text:`The workers' community kitchen feeds 800 families a day and is short of volunteers. Your press team asks if they can leak a photo anyway.`, choices:[
    { t:`Serve the meal. No photo.`, fx:{h:.9,cred:4}, log:`Served at the community kitchen with no photos` },
    { t:`Serve the meal. Leak the photo.`, fx:{h:1.5,all:.2,cred:-3}, log:`Leaked a photo of your community kitchen shift` },
  ]},
  // Lohanagar
  { town:'lohanagar', title:`The ex-servicemen's meeting`, tease:`Retired soldiers, a full hall`, text:`At the ex-servicemen's association, an old subedar assumes you served. You didn't. Your uncle did.`, choices:[
    { t:`Correct him.`, fx:{h:.5,cred:3}, log:`Corrected the ex-servicemen who assumed you served` },
    { t:`Let it stand, and tell your uncle's stories as "we".`, fx:{h:2,s:{farm:.8},skel:skel(`The ex-servicemen learned you never served`,.1,2.4)}, breaks:'noLies', log:`Let ex-servicemen believe you had served` },
  ]},
  { town:'lohanagar', title:`Truck drivers at Transport Nagar`, tease:`They want the bypass built`, text:`Forty truck drivers lose two hours a day stuck in Sector 21 traffic. "Are you for the bypass or not?"`, choices:[
    { t:`"Build it."`, fx:{h:2,s:{farm:.4}}, says:['bypass','yes'], log:`Told Lohanagar truck drivers you'd build the bypass` },
    { t:`"It depends on the route. Let me see the study."`, fx:{h:.5,cred:2}, log:`Told truck drivers the bypass depends on the study` },
  ]},
  { town:'lohanagar', title:`The power plant tour`, tease:`900 jobs, one very loud question`, text:`The plant manager walks you past the coal conveyors. Nine hundred jobs. "Will it still be here in ten years?"`, choices:[
    { t:`"It stays open as long as I'm your MP."`, fx:{h:2.4,s:{college:-.5}}, says:['gas','keep'], log:`Promised the power plant would stay open` },
    { t:`"We need a plan for when it closes, and I want you writing it."`, fx:{h:.4,cred:4,s:{college:.5}}, log:`Told the power plant it needs a closing plan` },
  ]},
  { town:'lohanagar', title:`The closed school`, tease:`Parents have a petition`, text:`The government school in Lohanagar shut last June. Parents hand you a petition and a photo of their children's 50-minute bus ride.`, choices:[
    { t:`Ride the bus with them at 6am tomorrow. You'll lose the morning.`, fx:{h:2,cred:3,hours:-3}, log:`Rode the 6am school bus in Lohanagar` },
    { t:`Promise central funds to reopen it. They don't exist.`, fx:{h:1.8,skel:skel(`The central school funds you promised in Lohanagar do not exist`,.1,1.5)}, breaks:'noLies', log:`Promised Lohanagar school funds that don't exist` },
    { t:`Sign the petition.`, fx:{h:.7}, log:`Signed the Lohanagar school petition` },
  ]},
  { town:'lohanagar', title:`Mohan Lal's courtyard`, tease:`He runs the booth agents`, text:`Mohan Lal pours you tea in his courtyard. He can deliver every booth agent in Lohanagar. His nephew would like a job in your office if you win.`, choices:[
    { t:`"Tell your nephew to send his CV."`, fx:{h:3.6,party:4,skel:skel(`The Mohan Lal job-for-votes deal came out`,.09,2)}, breaks:'noDeals', flag:'mabry', log:`Promised Mohan Lal's nephew a job for his booth agents` },
    { t:`"I can't do that, Mohan-ji."`, fx:{h:-.5,party:-3,cred:3}, log:`Refused Mohan Lal's deal` },
  ]},
  // Model Town
  { town:'modeltown', title:`House tax night`, tease:`Packed community hall, angry homeowners`, text:`House tax is up 11%. A man at the microphone wants one sentence: who's getting the money?`, choices:[
    { t:`"Big companies. No more state handouts, starting with the Kapaspur mill."`, fx:{h:2.5,s:{factory:-.3}}, says:['plant','no'], log:`Told Model Town you'd end handouts, including the mill's` },
    { t:`"Mostly schools, honestly. I'd rather tell you that than lie."`, fx:{h:.3,cred:5}, log:`Told taxpayers the money mostly goes to schools` },
    { t:`"Bhandari has had twenty years to answer that."`, fx:{h:1,cred:-1}, log:`Blamed Bhandari at the house tax meeting` },
  ]},
  { town:'modeltown', title:`The Sunday cricket ground`, tease:`No microphones, real talk`, text:`At the under-14 match, parents want to know why three government schools share one science teacher. Nobody's filming. A mother asks what you'd really do.`, choices:[
    { t:`Tell her you don't know yet, and take notes.`, fx:{h:1,cred:2}, log:`Took notes on the science teacher problem` },
    { t:`Give your stump speech.`, fx:{h:.5,cred:-1}, log:`Gave a stump speech at a cricket match` },
  ]},
  { town:'modeltown', title:`The builders' breakfast`, tease:`₹40 lakh in the room if they like you`, text:`Ten builders can't get water connections for their new flats. The villages have the canal water. They've brought their chequebooks.`, choices:[
    { t:`"The new colonies get their water connections first."`, fx:{h:1.6,money:40,s:{farm:-.3}}, says:['water','homes'], log:`Told builders the new colonies get water first` },
    { t:`"We'll need a deal both sides can live with."`, fx:{h:.4,money:12,cred:1}, log:`Told builders both sides need a water deal` },
  ]},
  { town:'modeltown', title:`The election clerk`, tease:`She has a worry about the voter list`, text:`A retired election clerk says 4,000 names have been deleted from the voter list, all in Bhandari's weakest wards. She can't prove it was deliberate. You could say it was.`, choices:[
    { t:`Call it vote theft, on camera.`, fx:{all:1,t:{college:1},skel:skel(`The deleted names turned out to be a clerical error, not vote theft`,.1,1.6)}, breaks:'noLies', log:`Called the voter-list deletions vote theft without proof` },
    { t:`Write to the election office, publicly, asking for the reason.`, fx:{h:.8,press:5,cred:3}, log:`Asked the election office about the deletions in writing` },
  ]},
  { town:'modeltown', title:`The chemist's counter`, tease:`Insulin prices, one furious son`, text:`A man buys a month of his father's insulin in front of you. ₹3,400. He looks at your party badge and laughs.`, choices:[
    { t:`Pay for it yourself. A photo would help.`, fx:{h:1.6,money:-1,cred:-2}, log:`Paid for a stranger's insulin with a camera nearby` },
    { t:`Ask for his number and actually call him tonight.`, fx:{h:1,cred:3}, log:`Called a man about his father's insulin` },
  ]},
  // Sector 21
  { town:'sector21', title:`The bypass meeting`, tease:`The route runs through their lanes`, text:`Sector 21 residents have maps with red lines through their streets. "Will you stop this bypass?"`, choices:[
    { t:`"It will never go through Sector 21."`, fx:{h:2.5}, says:['bypass','no'], log:`Told Sector 21 the bypass would never come through` },
    { t:`"I need to see the study. I won't promise tonight."`, fx:{h:.2,cred:3}, log:`Refused to promise Sector 21 on the bypass` },
  ]},
  { town:'sector21', title:`The residents' association`, tease:`400 flat owners and one demand`, text:`The Sector 21 residents' association will put you on their stage if you promise to "clean up" the basti behind the park. Everyone here knows that means bulldozers. You don't support it.`, choices:[
    { t:`Promise to clean it up.`, fx:{h:2.6,s:{college:-1}}, breaks:'oneMessage', log:`Promised Sector 21 you'd "clean up" the basti` },
    { t:`Tell them honestly where you differ.`, fx:{h:.4,cred:5,s:{college:.3}}, log:`Told the residents' association where you differ` },
    { t:`Skip the stage and sit with the residents.`, fx:{h:.6}, log:`Sat in the crowd at the residents' meeting` },
  ]},
  { town:'sector21', title:`The morning walkers`, tease:`Retirees who vote every time`, text:`In the park at 6am, a retired schoolteacher asks if Bhandari really wants to cut the old-age pension. He voted for a review. That's all. Your pamphlet says "cut".`, choices:[
    { t:`"That's right, he wants to cut it."`, fx:{h:2,t:{suburbs:1},skel:skel(`Fact-checkers rated your pension claim false`,.12,1.8)}, breaks:'noLies', log:`Told retirees Bhandari wanted to cut the pension` },
    { t:`"He voted for a review. I'd watch that closely."`, fx:{h:.9,cred:3}, log:`Told retirees accurately what Bhandari voted for` },
    { t:`Walk a round with them and don't talk politics.`, fx:{h:1.1}, log:`Walked with the Sector 21 morning walkers` },
  ]},
  { town:'sector21', title:`The property dealers' lunch`, tease:`They could fund your last week`, text:`The property dealers' association wants you to oppose a rule making builders disclose flood risk on new flats. They'll bring ₹30 lakh. You think the rule is good.`, choices:[
    { t:`Oppose the rule. Take the money.`, fx:{money:30,h:.8,cred:-2}, breaks:'keepStand', log:`Opposed the flood-disclosure rule for ₹30 lakh` },
    { t:`Tell them you back the rule, and leave without the money.`, fx:{cred:4}, log:`Backed the flood-disclosure rule to the dealers' faces` },
  ]},
  { town:'sector21', title:`The heckler`, tease:`A public meeting that could go sideways`, text:`A heckler stands up and shouts about your record on the municipal council. He's half right. The crowd goes quiet.`, choices:[
    { t:`"You're half right. Here's the half."`, fx:{h:1.3,cred:4,press:3}, log:`Admitted a heckler was half right` },
    { t:`Have him taken out.`, fx:{h:-.3,press:-4,cred:-2}, log:`Had a heckler removed` },
    { t:`Make a joke and move on.`, fx:{h:.9}, log:`Joked your way past a heckler` },
  ]},
  // Dhanauri
  { town:'dhanauri', title:`At the dhaba`, tease:`A widow wants a word`, text:`A widow shows you a plastic folder of her mother's hospital bills. "Will you actually fix this?" You can't, not from one seat in Parliament. A camera is nearby.`, choices:[
    { t:`"I can't promise that. I'll fight, but I can't promise."`, fx:{h:.3,cred:5}, log:`Told the widow you couldn't promise to fix her bills` },
    { t:`"Yes. I'll fix this." (A white lie. It's kind, right?)`, fx:{h:2,s:{suburbs:.6},skel:skel(`The widow told a reporter nobody ever called back`,.05,1.2)}, breaks:'noLies', flag:'widow', log:`Told the widow you'd fix her bills, knowing you couldn't` },
    { t:`Take her number and have a staffer follow up.`, fx:{h:.6}, log:`Had a staffer follow up with the widow` },
  ]},
  { town:'dhanauri', title:`The canal meeting`, tease:`The vote everyone is shouting about`, text:`The irrigation board is debating whether to send canal water to the new city colonies. Every farmer for twenty kilometres has come. They want to hear it from you.`, choices:[
    { t:`"Canal water goes to the farms first. No exceptions."`, fx:{h:2.8,s:{suburbs:-.3}}, says:['water','farm'], log:`Told the canal meeting farms come first` },
    { t:`"There isn't enough water for what everyone's promising you."`, fx:{h:.2,cred:5}, log:`Told the canal meeting there isn't enough water` },
  ]},
  { town:'dhanauri', title:`The village mela`, tease:`Judge the rangoli, meet 2,000 people`, text:`They've asked you to judge the rangoli competition. One entry is from the sarpanch's wife. The clear best is from a woman who has fought with the sarpanch for years.`, choices:[
    { t:`Pick the best rangoli.`, fx:{h:1.2,cred:2,party:-3}, log:`Gave first prize to the best rangoli` },
    { t:`Pick the sarpanch's wife.`, fx:{h:1,party:4,cred:-1}, log:`Gave first prize to the sarpanch's wife` },
    { t:`Declare a tie. Everyone sees through it.`, fx:{h:.7}, log:`Declared a rangoli tie` },
  ]},
  { town:'dhanauri', title:`The YouTube channel`, tease:`The host has 4 lakh subscribers`, text:`A popular local YouTuber will have you on his show if you nod along to his theory about the irrigation board. It is nonsense.`, choices:[
    { t:`Nod along.`, fx:{h:2.2,s:{college:-1.5},skel:skel(`The YouTube interview resurfaced and you were asked to defend it`,.1,1.6)}, breaks:'noLies', log:`Nodded along to a false theory on YouTube` },
    { t:`Go on and push back.`, fx:{h:-.3,cred:5,press:3}, log:`Pushed back on the YouTuber live` },
    { t:`Skip the show and visit the fertiliser shop instead.`, fx:{h:.6}, log:`Skipped the YouTube show for the fertiliser shop` },
  ]},
  { town:'dhanauri', title:`The farmers' co-operative`, tease:`Their books are in trouble`, text:`The co-operative society's secretary says state spending is killing them, and asks you to say you'd freeze it. He's half right.`, choices:[
    { t:`"A freeze on all new state spending."`, fx:{h:2,s:{suburbs:.4}}, says:['spend','freeze'], log:`Promised the co-operative a state spending freeze` },
    { t:`"Let me look at the books with you."`, fx:{h:.8,cred:3,hours:-1}, log:`Sat down with the co-operative's books` },
  ]},
  // Bel Ghat
  { town:'belghat', title:`The flood`, tease:`The river is over the road`, text:`A flash flood hits Bel Ghat. Water is in the houses by the ghat. Your press team wants a camera crew there with you.`, choices:[
    { t:`Fill sandbags, no cameras.`, fx:{h:1,cred:4,hours:-2}, log:`Filled sandbags with no cameras` },
    { t:`Bring the crew.`, fx:{h:1.8,all:.3,cred:-3}, log:`Took a camera crew to the flood` },
    { t:`Send money for relief and leave.`, fx:{money:-5,h:.3}, log:`Sent money to the flood relief` },
  ]},
  { town:'belghat', title:`The grain market`, tease:`Old traders with long memories`, text:`At the mandi, the old traders knew Bhandari's father. They don't know you. "Bhandari got us the rail siding in '09. What have you done?"`, choices:[
    { t:`"Nothing yet. Tell me what's next."`, fx:{h:1.3,cred:3}, log:`Admitted you'd done nothing yet for the mandi` },
    { t:`"I worked on that rail deal on the council." You didn't.`, fx:{h:2,skel:skel(`Council records showed you had nothing to do with the rail siding`,.12,1.7)}, breaks:'noLies', log:`Claimed credit for the rail siding` },
  ]},
  { town:'belghat', title:`The clinic closing`, tease:`Last doctor for 50 km`, text:`The private clinic closes in March. The nurse asks you to stand with the staff at a protest. Its owner gave your campaign ₹5 lakh last month, and he is the one closing it.`, choices:[
    { t:`Stand with the staff, and return his money publicly.`, fx:{h:2,money:-5,cred:4,press:3}, log:`Returned the clinic owner's money at a protest` },
    { t:`Stand with the staff. Say nothing about the money.`, fx:{h:1.6,skel:skel(`The clinic owner's money to you came out`,.1,1.3)}, breaks:'ownIt', log:`Protested the clinic closing, kept the owner's money` },
    { t:`Skip the protest.`, fx:{h:-.5}, log:`Skipped the clinic protest` },
  ]},
  { town:'belghat', title:`The kabaddi final`, tease:`A girls' team and a big crowd`, text:`The Bel Ghat girls' team is in the district kabaddi final. The organisers want you to sponsor the trophy: ₹6 lakh, and you hand it over on stage. It would be a very good photo.`, choices:[
    { t:`Sponsor the trophy.`, fx:{h:1.5,money:-6}, log:`Sponsored the girls' kabaddi trophy` },
    { t:`Sit in the crowd, then talk to the team after.`, fx:{h:.9,cred:1}, log:`Watched the kabaddi final from the crowd` },
  ]},
  { town:'belghat', title:`The panchayat`, tease:`Five members and a broken bridge`, text:`Bel Ghat's only bridge is out, and the school bus takes an 18 km detour. The gram panchayat wants a letter. Bhandari has ignored them for two years.`, choices:[
    { t:`Write the letter tonight and read it to them.`, fx:{h:1.4,cred:2}, log:`Wrote the panchayat's bridge letter` },
    { t:`Say the money is already "sanctioned".`, fx:{h:1.8,skel:skel(`There was never any money for the Bel Ghat bridge`,.1,1.3)}, breaks:'noLies', log:`Said the bridge money was sanctioned` },
  ]},
  // Vidyanagar
  { town:'vidyanagar', title:`The climate pledge`, tease:`Students with clipboards`, text:`Students ask you to sign a pledge to close the Lohanagar power plant by 2030. It will not play well in Lohanagar.`, choices:[
    { t:`Sign it.`, fx:{h:2.5,s:{factory:-.4}}, says:['gas','close'], log:`Signed the pledge to close the power plant by 2030` },
    { t:`Sign it, then tell the colony newspaper you never really agreed.`, fx:{h:2.2,s:{suburbs:.4},skel:skel(`Both papers printed what you told the other`,.15,2.2)}, breaks:'oneMessage', log:`Signed the pledge and disowned it in the colonies` },
    { t:`Politely decline.`, fx:{h:-1,s:{suburbs:.4}}, log:`Declined the student pledge` },
  ]},
  { town:'vidyanagar', title:`The fee-hike sit-in`, tease:`Day four outside the vice-chancellor's office`, text:`Students have been sitting outside the vice-chancellor's office for four days. Fees went up 30%. They want you to say the state will pay to cap them.`, choices:[
    { t:`"The state will pay to cap university fees."`, fx:{h:2.6,t:{college:2},s:{suburbs:-.3}}, says:['spend','cap'], log:`Promised state money to cap university fees` },
    { t:`"I'll fight for it, but I won't promise a number."`, fx:{h:.7,cred:3}, log:`Told students you wouldn't promise a fee number` },
  ]},
  { town:'vidyanagar', title:`The campus paper`, tease:`A 19-year-old with better questions than Rajnagar Live`, text:`The editor of the campus paper has found a vote you cast on the municipal council that you got wrong. She's been fair about it.`, choices:[
    { t:`"I got that wrong. Print that I said so."`, fx:{h:1.2,cred:5,press:4}, log:`Admitted a bad council vote to the campus paper` },
    { t:`"The context is more complicated."`, fx:{h:.2,press:-2}, breaks:'ownIt', log:`Dodged the campus paper's question on your bad vote` },
  ]},
  { town:'vidyanagar', title:`Register the hostels`, tease:`3,000 students not on the voter list`, text:`A week of voter registration camps in the hostels could change the numbers. It'll cost ₹8 lakh and most of a day.`, choices:[
    { t:`Spend the day and the money.`, fx:{money:-8,t:{college:5},hours:-2}, log:`Ran voter registration camps in the Vidyanagar hostels` },
    { t:`Hand out pamphlets for an hour.`, fx:{t:{college:1.5}}, log:`Handed out pamphlets on campus` },
  ]},
  { town:'vidyanagar', title:`Professor Menon`, tease:`Her economics class is watching`, text:`Professor Shalini Menon asks you to explain your tax plan to her economics class. Her students will check the maths. Your plan's maths is a bit generous.`, choices:[
    { t:`Show them the honest numbers, gap included.`, fx:{h:1.1,cred:4}, log:`Showed an economics class your plan's gap` },
    { t:`Wave it away with charm.`, fx:{h:.5,skel:skel(`A student's fact-check of your tax maths went viral`,.12,1.3)}, log:`Charmed your way past the maths in an economics class` },
  ]},
  // Capital
  { town:'capital', title:`Sudha Rawat's office`, tease:`The party president, in person`, text:`Sudha Rawat has a chart of every seat in the state. "You've got a real chance, and I've got one pot of money. Convince me." She wants you to vote with the party leadership on the first big bill.`, choices:[
    { t:`Give her your word on the bill.`, fx:{money:70,party:18}, breaks:'noDeals', flag:'holt', log:`Promised Sudha Rawat your first big vote for ₹70 lakh` },
    { t:`Show her your numbers and ask for nothing but a fair look.`, fx:{money:20,party:6,cred:1}, log:`Made your case to the party president with no promises` },
  ]},
  { town:'capital', title:`The hotel suite`, tease:`A lobbyist has booked a room`, text:`A Vardhan Power lobbyist has a suite at the Grand, a plate of kebabs and ₹90 lakh of "independent" support. "You won't even have to meet them."`, choices:[
    { t:`Let them spend it.`, fx:{money:90,skel:skel(`Reporters traced ₹90 lakh of Vardhan Power money behind your campaign`,.1,2)}, breaks:'noPac', flag:'gulfline', log:`Accepted ₹90 lakh in Vardhan Power support` },
    { t:`Eat a kebab and leave.`, fx:{cred:1}, log:`Ate Vardhan Power's kebabs and left` },
  ]},
  { town:'capital', title:`The big-donor dinner`, tease:`₹5 lakh a table, a long way from Kapaspur`, text:`Sixty businessmen at a five-star hotel. A man at table two asks what you really think of "those mill people". They laugh. They'd pay well for you to laugh along.`, choices:[
    { t:`Laugh along.`, fx:{money:60,skel:skel(`A waiter's video of you laughing at the mill workers got out`,.13,3)}, breaks:'oneMessage', log:`Laughed along with donors about the mill workers` },
    { t:`Tell them about the man at Raju's tea stall.`, fx:{money:20,cred:3}, log:`Defended the mill workers at a donor dinner` },
  ]},
  { town:'capital', title:`The committee promise`, tease:`A senior leader has an offer`, text:`A senior party leader offers you a seat on the Agriculture committee if you win. You could announce it in the villages tomorrow. It isn't really his to offer.`, choices:[
    { t:`Announce it.`, fx:{s:{farm:2.2},party:4,skel:skel(`The party said nobody promised you a committee seat`,.12,1.4)}, breaks:'noLies', log:`Announced a committee seat nobody could promise` },
    { t:`Thank him and wait.`, fx:{party:3}, log:`Waited on the committee offer` },
  ]},
  { town:'capital', title:`The Chief Minister's photo`, tease:`An ally you may not want`, text:`The Chief Minister wants a photo with you for tomorrow's front page. He's unpopular, and he remembers everyone who says no.`, choices:[
    { t:`Take the photo.`, fx:{party:10,money:15,s:{suburbs:-.6}}, log:`Took a photo with the Chief Minister` },
    { t:`Find the back stairs.`, fx:{party:-6,s:{suburbs:.3}}, log:`Avoided the Chief Minister's photo` },
  ]},
  // Press: dealt to any town
  { press:true, title:`The Times editorial board`, tease:`Ninety minutes, on the record`, text:`Five editors of the Rajnagar Times, and a pile of your old council votes. They ask which of your promises you'd drop first if the money isn't there.`, choices:[
    { t:`Name one honestly.`, fx:{all:.4,press:8,cred:3}, log:`Told the Times which promise you'd drop first` },
    { t:`"I won't drop any of them."`, fx:{all:.5,press:-3}, log:`Told the Times you'd keep every promise` },
  ]},
  { press:true, title:`Rajnagar Live, 6pm`, tease:`Thirty seconds on the evening news`, text:`The reporter has one question: "Do you trust the surveys that have you behind?" You haven't seen a good survey in days.`, choices:[
    { t:`"Our own survey shows us ahead."`, fx:{all:.8,skel:skel(`Your "own survey" was shown never to have existed`,.1,1.3)}, breaks:'noLies', log:`Claimed a private survey showing you ahead` },
    { t:`"I expect we're behind. That's why I'm out here."`, fx:{all:.3,press:5,cred:3}, log:`Said on TV that you're probably behind` },
  ]},
  { press:true, title:`The tracker`, tease:`Bhandari's man with a camera`, text:`One of Bhandari's men is following you with a phone on a stick, trying to catch a bad moment. He asks a rude question about your family.`, choices:[
    { t:`Offer him a samosa and answer politely.`, fx:{all:.5,press:3}, log:`Gave Bhandari's tracker a samosa` },
    { t:`Grab the phone.`, fx:{all:-1.6,press:-5,t:{factory:1}}, log:`Grabbed the Bhandari tracker's phone` },
    { t:`Walk away.`, fx:{}, log:`Walked away from the tracker` },
  ]},
  { press:true, title:`The fact-check desk`, tease:`They've rated you "misleading"`, text:`The Times fact-checker says a number in your speech is wrong. It is, slightly. Your speechwriter says it's fine, keep it.`, choices:[
    { t:`Fix it, and thank them.`, fx:{press:7,cred:3}, log:`Fixed your speech after a fact-check` },
    { t:`Keep it. Nobody reads fact-checks.`, fx:{all:.3,press:-4,skel:skel(`Your repeated false number became the story`,.1,1.3)}, breaks:'ownIt', log:`Kept a number in your speech after it was fact-checked` },
  ]},
  { press:true, title:`The podcast`, tease:`30 lakh subscribers, no fact-checkers`, text:`A huge YouTube podcast wants two hours. The host is friendly and wrong about most things. It would reach people who never watch the news.`, choices:[
    { t:`Do it. Agree with him where it's easy.`, fx:{all:1,t:{factory:1},press:-3}, log:`Went along with a podcast host for two hours` },
    { t:`Do it. Correct him when he's wrong.`, fx:{all:.4,cred:3,press:2}, log:`Corrected a podcast host on air` },
    { t:`Pass.`, fx:{}, log:`Passed on the podcast` },
  ]},
  { press:true, title:`The magazine profile`, tease:`She wants to meet your family`, text:`A reporter from a national magazine is writing a profile. She wants a day with your family, and she's already asked about the old business.`, choices:[
    { t:`Give her the day, and the access.`, fx:{press:6,all:.4,hours:-1}, log:`Gave a national reporter a day with your family` },
    { t:`Give her twenty minutes in a coffee shop.`, fx:{press:-2}, log:`Gave a national reporter twenty minutes` },
  ]},
];
const ENCOUNTERS = [
  { title:`Bhandari puts an arm around you`, tease:`Bhandari is in town today`, text:`You turn a corner and there he is: Ramakant Bhandari, with cameras. He puts an arm around your shoulders. "This one's going places. Just not to Parliament." The crowd laughs. They like him.`, choices:[
    { t:`Laugh, and fold your hands to him.`, fx:{h:.9,cred:1}, log:`Took Bhandari's joke well in public` },
    { t:`"Going places is more than you've done in twenty years."`, fx:{h:1.5,press:2,cred:-1}, log:`Fired back at Bhandari in front of the cameras` },
  ]},
  { title:`The joint forum`, tease:`Bhandari is in town today`, text:`The Lions Club forum had an empty chair for you. Bhandari points to it. You walk in. He asks you, there and then, to name one bill you've ever read.`, choices:[
    { t:`Name it, and quote a line.`, fx:{h:1.8,press:3}, log:`Won a Lions Club exchange with Bhandari` },
    { t:`Ask how many sittings he has skipped.`, fx:{h:.9}, log:`Answered Bhandari with a question at the Lions Club` },
  ]},
  { title:`The condolence meeting`, tease:`Bhandari is in town today`, text:`A much-loved former district judge has died. You and Bhandari have both come to the condolence meeting. His people are handing out pamphlets at the gate. Yours would like to.`, choices:[
    { t:`Pay your respects, and leave without a word about the race.`, fx:{h:.9,cred:4}, log:`Stayed quiet about the race at the condolence meeting` },
    { t:`Tell the press Bhandari's people campaigned at a condolence meeting.`, fx:{h:.9,press:-2,all:.4}, log:`Called out Bhandari's people at the condolence meeting` },
    { t:`Tell your people to hand out pamphlets too.`, fx:{h:.6,cred:-5}, log:`Handed out pamphlets at a condolence meeting` },
  ]},
  { title:`Same dhaba`, tease:`Bhandari is in town today`, text:`Bhandari sits down across from you and orders two teas. "Off the record. Why are you doing this? You know what this job does to people." For a moment he seems to mean it.`, choices:[
    { t:`Answer him honestly.`, fx:{cred:3,calm:1}, flag:'booth', log:`Told Bhandari honestly why you're running` },
    { t:`Leak the conversation.`, fx:{h:1.3,press:-3,cred:-4}, log:`Leaked your private talk with Bhandari` },
  ]},
];
const AD_LINES = {
  factory:[`A spot shot on the Kapaspur mill floor`,`Radio spots between film songs in Lohanagar`],
  suburbs:[`A soft spot about prices and school fees`,`Pamphlets in every Model Town and Sector 21 letterbox`],
  farm:[`An auto-rickshaw with a loudspeaker through every village`,`A spot filmed at the Dhanauri grain market`],
  college:[`Instagram ads across campus`,`A student-made video about fees`],
};

/* What staff say when they report back (used by runJobs in engine.js). */
const VOICE={ priya:`The room was going badly`, tess:`They were ready to walk out on me`, ben:`I'm the driver, they kept asking me things`, maya:`A reporter pushed me on it, on the record`, rick:`I saw an opening and I took it`, lou:`The businessmen in the room wanted a clear answer`, nina:`They asked what the research showed` };
const TOWN_SAYS={ factory:[['plant','yes'],['gas','keep']], suburbs:[['plant','no'],['water','homes'],['bypass','no']], farm:[['water','farm'],['spend','freeze']], college:[['gas','close'],['spend','cap']] };
const OK_LINES={ priya:`The room came around. Nothing to fix.`, tess:`Good day. They like you more than they did.`, ben:`I shook every hand in town. Don't make me do it again.`, maya:`Quiet and clean. I told them only what's true.`, rick:`They love you. Don't ask what I said. Kidding. Mostly.`, lou:`I got two cheques and a lot of opinions.`, nina:`I listened more than I talked. Useful, too.` };
const SPECIAL={
  lou:[{ text:`Lalit: "I've got ₹30 lakh from the Sand and Gravel Association. I may have implied you'd take their calls first."`, choices:[
    { t:`Keep the money. You'll take their calls.`, fx:{money:30,skel:skel(`The Sand and Gravel Association said they were promised first call`,.12,1.4)}, breaks:'noDeals', loyal:{lou:6}, log:`Kept sand-and-gravel money that came with a promise` },
    { t:`Send it back, and tell Lalit never to imply that again.`, fx:{cred:3}, loyal:{lou:-12}, log:`Made Lalit return the Sand and Gravel Association's money` },
  ]},{ text:`Lalit: "A businessman's offering ₹25 lakh, but he wants to ride in your car tomorrow. He's a talker, and he's not a nice man."`, choices:[
    { t:`Bring him along.`, fx:{money:25,cred:-2}, loyal:{lou:5}, log:`Took a difficult donor on tour` },
    { t:`Thank him and say no.`, fx:{}, loyal:{lou:-6}, log:`Turned down a difficult donor's ride-along` },
  ]}],
  rick:[{ text:`Rocky: "The Times was about to run something on you. I told the editor his paper could forget about our ads. They held it. You're welcome."`, choices:[
    { t:`"Good." Say nothing more.`, fx:{press:-5,skel:skel(`The Times editor said your press man threatened him`,.18,1.8)}, breaks:'noLies', loyal:{rick:7}, log:`Approved of Rocky threatening the Times` },
    { t:`Call the editor and apologise.`, fx:{press:5,cred:2}, loyal:{rick:-16}, log:`Apologised to the Times for Rocky` },
  ]},{ text:`Rocky: "I've got a guy at Rajnagar Live who'll drop Bhandari's clip if we give him the exclusive on your family."`, choices:[
    { t:`Give him your family.`, fx:{all:.8,cred:-3}, loyal:{rick:5}, log:`Traded your family's story to Rajnagar Live` },
    { t:`Not my family, Rocky.`, fx:{cred:2}, loyal:{rick:-6}, log:`Refused to trade your family's story` },
  ]}],
  nina:[{ text:`Nandini: "I've got Bhandari's tax returns. Don't ask whose login I used. It's real, and it's good."`, choices:[
    { t:`Use it.`, fx:{all:1.6,skel:skel(`Your researcher was caught using someone's login to get Bhandari's tax returns`,.2,2.6)}, breaks:'noLies', loyal:{nina:7}, log:`Used Bhandari's tax returns that Nandini shouldn't have had` },
    { t:`Delete it, and make sure she knows why.`, fx:{cred:3}, loyal:{nina:-12}, log:`Made Nandini delete Bhandari's tax returns` },
  ]},{ text:`Nandini: "Heads up. I ran your record the way they will. Your 2018 council vote on the garbage dump is worse than you remember."`, choices:[
    { t:`Get ahead of it tomorrow.`, fx:{all:-.3,cred:4,press:3}, loyal:{nina:5}, log:`Got ahead of your own garbage-dump vote` },
    { t:`Sit on it. They may not find it.`, fx:{skel:skel(`Bhandari's team found your 2018 garbage-dump vote`,.18,1.6)}, loyal:{nina:-5}, log:`Sat on your garbage-dump vote` },
  ]}],
  maya:[{ text:`Maya: "The Times asked me if you'd seen the donor list before Tuesday. I said yes, because you had. Now you have a mess, and I'd do it again."`, choices:[
    { t:`Back her up in public.`, fx:{all:-.4,cred:3,press:5}, loyal:{maya:10}, log:`Backed Maya's honest answer to the Times` },
    { t:`Say she was mistaken.`, fx:{skel:skel(`Maya Kurian's notes showed you threw her under the bus`,.2,1.8)}, breaks:'ownIt', loyal:{maya:-30}, log:`Told the press Maya was mistaken` },
  ]},{ text:`Maya: "A Rajnagar Live producer will give you the Sunday interview if I hand over Bhandari's schedule. I told her I'd ask you, and that I hate it."`, choices:[
    { t:`Do it anyway.`, fx:{all:.7,press:-3}, loyal:{maya:-12}, log:`Traded Bhandari's schedule for a Sunday interview` },
    { t:`You're right. No.`, fx:{press:3}, loyal:{maya:6}, log:`Turned down the Sunday interview` },
  ]}],
  ben:[{ text:`Bunty: "Shortcut saved us an hour tomorrow, but I got a challan doing 110 in the campaign jeep. With your face on the side. It's on the Lohanagar police record."`, choices:[
    { t:`Pay it and joke about it in public.`, fx:{money:-2,all:.1,cred:1}, loyal:{ben:5}, log:`Joked about Bunty's speeding challan` },
    { t:`Tell him to slow down or he's gone.`, fx:{}, loyal:{ben:-8}, log:`Warned Bunty about the speeding` },
  ]}],
  priya:[{ text:`Priya: "The numbers are in, and you need to hear this before anyone else: if you lost tomorrow, it'd be because of the promises. I'd stop making them."`, choices:[
    { t:`"Tell me which ones to walk back."`, fx:{all:-.2,cred:4}, loyal:{priya:8}, log:`Asked Priya which promises to walk back` },
    { t:`"Thanks. We're not changing anything."`, fx:{}, loyal:{priya:-8}, log:`Ignored Priya's warning about promises` },
  ]}],
  tess:[{ text:`Tara: "Volunteers in the field want to know if we're paying them for the last week like you said. You said that, right?"`, choices:[
    { t:`Pay them. ₹12 lakh.`, fx:{money:-12,t:{factory:1,suburbs:1}}, loyal:{tess:8}, log:`Paid the field volunteers` },
    { t:`Admit it was never in the budget.`, fx:{cred:2}, loyal:{tess:-4}, log:`Told Tara the volunteer pay wasn't real` },
  ]}],
};

/* What staff say when they recommend an option in a scene. */
const ADVICE={
  rick:[`This one. If it goes wrong, that's what I'm for.`,`Say it. Nobody's checking.`,`You want to be clean or you want to win?`],
  maya:[`This is the one I can defend tomorrow.`,`If you say anything else, I'm not the one going out there for you.`,`The boring true answer. Please.`],
  tess:[`This one plays in the room. I've been talking to these people.`,`Trust me on this crowd.`],
  lou:[`This one keeps the lights on.`,`The donors will hear about this. Go with this one.`],
  priya:[`The numbers say this one.`,`I've run it. This costs you the least.`],
  nina:[`This one survives an RTI request.`,`This is the one I couldn't dig up dirt on.`],
  ben:[`This one keeps us on schedule.`],
};

/* Everything else the screens and the engine say that belongs to this place. */
const SET = {
  id:'rajnagar', place:'Rajnagar',
  you:'Kiran Mehra', youWas:'a former municipal councillor', rival:'Ramakant Bhandari', rivalShort:'Bhandari', volunteer:'Deepak',
  sign:{ name:'MEHRA', for:'for Parliament', line:'Rajnagar constituency' },
  brief:[
    `You're Kiran Mehra, running for Parliament from Rajnagar. Ramakant Bhandari has held the seat for twenty years.`,
    `Polling is in five days, and you're behind. Each day you choose where to go and what to say there. Then the votes are counted.`,
    `The catch: you swear to three principles before you start, and the game keeps offering ways to win by breaking them.`,
  ],
  words:{ area:'constituency', poll:'survey', Poll:'Survey', pollster:'survey agency', travel:h=>h+(h===1?' hour':' hours')+' away',
    quietMorning:`Nothing on the phones yet. You get twenty minutes with the map and a cup of chai.` },
  start:'kapaspur', rivalStart:['lohanagar','modeltown','sector21','dhanauri','belghat'],
  money:n=>n>=100?'₹'+(n/100)+' crore':'₹'+n+' lakh',
  ads:{ district:`A positive TV ad across the constituency`, mislead:`A misleading attack ad on Bhandari`, misleadSkel:`Fact-checkers took apart your attack ad`,
    trueAd:`A true attack ad from Nandini's research`, pac:`A businessman offers to pay for your ads, no questions`, pacSkel:`Reporters traced a businessman's money behind your ads`,
    cheap:`Rajnagar Live has a slow week: cheap` },
  rickSkel:`Rocky Chawla was caught leaning on a reporter to kill a story`,
  mayaHeard:`Maya heard what you just said. She doesn't say anything.`,
  mayaQuit:`Maya Kurian has quit, on the record: "I can't say what I'm being asked to say."`,
  quit:name=>`${name} has quit. "I'm done," the message says. That's all it says.`,
  payroll:name=>`You can't pay salaries. ${name} has left.`,
  capitalReport:n=>`${n}, from the capital: "The party office is warmer on you than it was."`,
  rivalQuiet:`Bhandari stays quiet today.`,
  rivalVisit:(town,covered)=>`Bhandari held a rally in ${town}.`+(covered?` You were in the area, which blunted it.`:` You weren't around to answer him.`),
  rivalAd:`He also put up a new attack ad.`,
  rivalMove:`Bhandari's campaigning`,
  drifting:g=>`${g}: "We haven't seen you in days." They are drifting away.`,
  party:{ big:`The party sends ₹70 lakh. Sudha Rawat: "Don't make me regret it."`, bigLog:`The party sent ₹70 lakh`,
    cut:`The party has moved its money to other seats. Sudha Rawat doesn't take your call.`, cutLog:`The party cut you off`,
    small:`The party sends ₹20 lakh and a shrug.`,
    machine:`The party's booth workers are out for you.`, noMachine:`The party's booth workers are busy with other seats.` },
  estimate:{ manager:n=>`Priya: "We're at about ${n}%."`, volunteer:n=>`Deepak, your volunteer manager: "I'd say we're at about ${n}%. We're closing in."` },
  compared:(townA,a,townB,b)=>`Rajnagar Live plays two clips side by side. In ${townA}: "${a}." In ${townB}: "${b}." The anchor asks which one you meant.`,
  night:{ before:`The last night before polling`, title:`Counting day`, justIn:`Counted so far`, next:`Next round of counting`, done:`See the result`, lastBtn:`Go to bed. Tomorrow, polling.`,
    count:[['farm',.5,'Round 1: the first village booths'],['suburbs',.4,'Round 2: early colony booths'],['factory',.5,'Round 3: the first industrial-belt booths'],['farm',.5,'Round 4: the rest of the villages'],['suburbs',.35,'Round 5: more colony booths'],['factory',.5,'Round 6: the rest of the industrial belt'],['college',.55,'Round 7: Vidyanagar booths'],['suburbs',.25,'Round 8: the last colony booths'],['college',.45,'Round 9: postal ballots and the rest of Vidyanagar']] },
  endings:{
    clean:{ title:`You won, and you kept your word`, text:`It is rare, and it may not happen twice. Nobody can tell you what you owe, because you do not owe anything.` },
    bought:{ title:`You won. Was it you who won?`, text:`You are the MP-elect for Rajnagar. The person who swore those three things on day 1 is not quite the person garlanded on that stage.` },
    honour:{ title:`You lost, and you kept your word`, text:`You can look at yourself in the morning. Bhandari keeps the seat, and the industrial belt gets five more years of nothing. Was it worth it? You will wonder.` },
    worst:{ title:`You sold out, and you lost anyway`, text:`You crossed your own lines and it still was not enough. There is nothing to show for it except the list below.` },
  },
  epilogue:{
    gulfline:`Week one: Vardhan Power's man is in your diary for a "getting to know you" chai.`,
    mabry:`Mohan Lal's nephew starts in your office on Monday. He does not appear to have read the job description.`,
    widow:`A woman from the dhaba has called your office four times about her mother's hospital bills.`,
    holt:`Sudha Rawat calls about your first big vote. She doesn't ask how you feel about the bill.`,
    quarry:`The sand-mining lease is on your desk with a note from Lalit.`,
    lena:`Anita Kohli's first memo as your adviser is about how you should run your office.`,
    local88:`Kapaspur mill wants to automate its second line. The union sends you a photo of your signature.`,
    slate:`The zilla parishad candidate you endorsed is on the phone about "a small problem".`,
    binder:`Your office has a file of everything you told each town. Your chief of staff reads it and goes quiet.`,
    quiet:`Your first week is quiet. You owe nobody. You also have almost no friends in the capital.`,
    lost:`Bhandari wins a fifth term. He sends a gracious note.`,
  },
};
