/* The Race: game rules. No DOM access, so tools/sim.js can run it in Node. Needs content.js loaded first. */
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function pick(rng,a){ return a[Math.floor(rng()*a.length)]; }
function shuffled(rng,a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function gauss(rng){ return (rng()+rng()+rng()+rng()-2)*1.73; }

const DIST=(()=>{ const d={}; for(const a in TOWNS){ d[a]={}; for(const b in TOWNS) d[a][b]=a===b?0:1e9; }
  for(const [a,b,h] of ROADS){ d[a][b]=h; d[b][a]=h; }
  for(const k in TOWNS) for(const a in TOWNS) for(const b in TOWNS) d[a][b]=Math.min(d[a][b],d[a][k]+d[k][b]);
  return d; })();
function travelTime(s,a,b){ const h=DIST[a][b]; if(!h) return 0; return s.jobToday.ben==='route'&&s.staff.includes('ben')?Math.max(1,Math.round(h*.67)):h; }

function newGame(rng,{principles,secret,staff}){
  const groups={}; for(const id in GROUPS) groups[id]={...GROUPS[id]};
  const jobs={},loyal={}; for(const id of staff){ jobs[id]=STAFF[id].job[0]; loyal[id]=60; }
  const s={ rng,groups,principles,secret,staff:staff.slice(),jobs,jobToday:{...jobs},loyal,covered:{},info:[],decisions:[],decision:null,reaction:'',quits:0,calls:1,askedFor:null,advance:false,dug:false,digToday:false,day:1,hour:DAY_START,at:'millbrook',money:60,cred:60,press:50,party:50,calm:0,phase:'morning',
    stances:{},skeletons:[],broken:[],log:[],flags:{},moves:[],news:[],polls:[],route:[['millbrook']],seen:{},seenToday:{},groupToday:{},lastSeen:{factory:0,suburbs:0,farm:0,college:0},
    morning:shuffled(rng,MORNING),stops:shuffled(rng,STOPS.map((x,i)=>({...x,id:i}))),enc:shuffled(rng,ENCOUNTERS),queue:[],posted:{},dispatched:false,event:null,scene:null,offers:[],boughtAd:false,partyPaid:false,hoursLost:0,sawCount:0,startPct:0 };
  if(s.staff.includes('rick')) s.skeletons.push({...skel(`Rick Dunn was caught leaning on a reporter to bury a story`,.08,1.5),day:1,exposed:false});
  s.startPct=realPct(s);
  s.whitmore=pick(rng,['ironton','cedar','oakfield','dunmore','pikes']);
  s.whitmoreNext=pick(rng,Object.keys(TOWNS).filter(t=>TOWNS[t].g&&t!==s.whitmore));
  s.event=eventFor(s);
  return s;
}
function eventFor(s){
  if(s.day===4) return secretEvent(s.secret);
  if(FIXED[s.day]) return FIXED[s.day];
  if(s.queue.length) return s.queue.shift();
  for(let i=s.morning.length-1;i>=0;i--){ const e=s.morning[i];
    if(e.needs&&!s.staff.includes(e.needs)) continue;
    s.morning.splice(i,1); return { ...e, title:'Day '+s.day+': '+e.title }; }
  return { title:'Day '+s.day+': a quiet morning', text:`Nothing on the phones yet. You get twenty minutes with the map and a coffee.`, choices:[{ t:`Go.`, fx:{}, log:`A quiet morning` }] };
}
function dealStops(s){
  s.posted={}; s.dispatched=false;
  const towns=shuffled(s.rng,Object.keys(TOWNS));
  for(const t of towns){
    if(s.rng()>.8) continue;
    let i=s.stops.findIndex(x=>x.town===t); if(i<0) continue;
    s.posted[t]=s.stops.splice(i,1)[0];
  }
  const press=s.stops.filter(x=>x.press); if(press.length){ const open=towns.filter(t=>TOWNS[t].g&&!s.posted[t]); const t=open.length?open[0]:pick(s.rng,towns.filter(t=>TOWNS[t].g));
    if(!s.posted[t]){ const p=press[0]; s.stops.splice(s.stops.indexOf(p),1); s.posted[t]=p; } }
  if(s.enc.length&&TOWNS[s.whitmore].g){ const old=s.posted[s.whitmore]; if(old) s.stops.push(old); s.posted[s.whitmore]={...s.enc.pop(),town:s.whitmore,isEnc:true}; }
  s.covered={}; for(const id of s.staff){ const j=s.jobToday[id]; if(j&&j.startsWith('town:')){ const t=j.slice(5); s.covered[t]=id; const p=s.posted[t]; if(p){ if(p.isEnc) s.enc.unshift(p); else s.stops.unshift(p); delete s.posted[t]; } } }
  s.advance=s.jobToday.tess==='advance'&&s.staff.includes('tess');
}
function realPct(s){ let y=0,r=0; for(const id in s.groups){ const g=s.groups[id]; y+=g.size*g.share/100*g.yt/100; r+=g.size*(100-g.share)/100*g.rt/100; } return 100*y/(y+r); }
function credMult(s){ return .85+s.cred/500; }
function shift(s,id,d){ const g=s.groups[id]; g.share=clamp(g.share+(d>0?d*credMult(s):d),5,95); }
function shiftAll(s,d){ for(const id in s.groups) shift(s,id,d); }
function record(s,label,fn,breaks){
  const before=realPct(s); fn(); s.moves.push({day:s.day,label,delta:realPct(s)-before});
  const crossed=!!(breaks&&s.principles.includes(breaks));
  s.log.push({day:s.day,label,breaks:crossed}); if(crossed) s.broken.push({day:s.day,principle:breaks,label});
}
const STOP_POWER=.72;
function applyFx(s,fx,home){
  if(fx.all) shiftAll(s,fx.all);
  if(fx.h&&home){ const n=s.groupToday[home]||0; const boost=fx.h>0&&s.advance?1.5:1; if(fx.h>0) s.advance=false; shift(s,home,fx.h>0?fx.h*STOP_POWER*boost*Math.pow(.8,n):fx.h); }
  if(fx.s) for(const id in fx.s) shift(s,id,fx.s[id]);
  if(fx.t) for(const id in fx.t) s.groups[id].yt+=fx.t[id];
  if(fx.money) s.money+=fx.money;
  if(fx.cred) s.cred=clamp(s.cred+fx.cred,0,100);
  if(fx.press) s.press=clamp(s.press+fx.press,0,100);
  if(fx.party) s.party=clamp(s.party+fx.party,0,100);
  if(fx.calm) s.calm+=fx.calm;
  if(fx.hours) s.hour=Math.min(DAY_END,s.hour-fx.hours);
  if(fx.skel) s.skeletons.push({...fx.skel,day:s.day,exposed:false});
  if(fx.lose&&s.rng()<fx.lose.chance){ s.staff=s.staff.filter(x=>x!==fx.lose.id); s.news.push(STAFF[fx.lose.id].name+' has left the campaign.'); }
}
function contradiction(s,c){
  if(!c.says) return null; const [issue,side]=c.says; const had=s.stances[issue];
  return had&&had.side!==side?had:null;
}
function applyChoice(s,c,home){
  const clash=contradiction(s,c);
  const breaks=c.breaks||(clash?'oneMessage':null), where=c.where||TOWNS[s.at].name;
  record(s,c.log,()=>applyFx(s,c.fx,home),breaks);
  if(c.flag) s.flags[c.flag]=true;
  if(c.says){ const [issue,side]=c.says;
    if(clash) s.skeletons.push({label:`Voters compared what you said in ${clash.town} and in ${where}`,p:.3,hit:0,clash:{issue,a:clash,b:{side,town:where}},day:s.day,exposed:false});
    if(!s.stances[issue]||clash) s.stances[issue]={side,town:where,day:s.day}; }
  if(c.loyal) for(const id in c.loyal) if(s.staff.includes(id)) s.loyal[id]=clamp(s.loyal[id]+c.loyal[id],0,100);
}
function choose(s,i){ reactToChoice(s,s.event,i); applyChoice(s,s.event.choices[i],null); dealStops(s); s.phase='tour'; s.scene=null; }
function canReach(s,t){ const stop=s.posted[t]; if(!stop) return {ok:false};
  const tt=travelTime(s,s.at,t), arrive=s.hour+tt;
  if(arrive+STOP_HOURS>DAY_END) return {ok:false,tt,why:'Not enough hours left'};
  if(stop.until&&arrive>=stop.until) return {ok:false,tt,why:'You would miss it'};
  return {ok:true,tt,arrive}; }
function goTo(s,t){ const r=canReach(s,t); if(!r.ok) return false;
  s.hour+=r.tt; if(t!==s.at){ s.at=t; s.route[s.route.length-1].push(t); }
  s.scene=s.posted[t]; delete s.posted[t]; s.phase='stop'; return true; }
function pickStop(s,i){ const home=TOWNS[s.at].g; reactToChoice(s,s.scene,i); applyChoice(s,s.scene.choices[i],home); s.sawCount++;
  s.hour+=STOP_HOURS; if(home){ s.groupToday[home]=(s.groupToday[home]||0)+1; s.lastSeen[home]=s.day; s.seenToday[s.at]=true; }
  s.scene=null; s.phase='tour'; }
function buildOffers(s){
  const gs=shuffled(s.rng,Object.keys(s.groups)); const out=[];
  const expensive=gs[3];
  for(const g of gs.slice(0,2)){ const deal=s.rng()<.3; const price=g===expensive?44:(deal?14:24);
    out.push({ id:out.length,label:pick(s.rng,AD_LINES[g]),market:g,price,gain:1.9,tag:deal?'Channel 9 has a slow week: cheap':'',kind:'pos'}); }
  out.push({ id:out.length,label:`A district-wide positive TV ad`,market:null,price:60,gain:.9,kind:'pos'});
  if(s.rng()<.6) out.push({ id:out.length,label:`A misleading attack ad on Whitmore`,market:null,price:34,gain:1.5,kind:'mislead',breaks:'noLies'});
  if(s.jobToday.nina==='dig'&&s.staff.includes('nina')) out.push({ id:out.length,label:`A true attack ad from Nina's research`,market:null,price:38,gain:1.1,kind:'true'});
  if(s.rng()<.25) out.push({ id:out.length,label:`A super PAC offers to pay for your ads, no questions`,market:null,price:0,gain:.5,money:45,kind:'pac',breaks:'noPac'});
  return out;
}
function endTour(s){ s.offers=buildOffers(s); s.boughtAd=false; runJobs(s); nextDecision(s); }
function buyAd(s,i){ const o=s.offers[i]; if(!o||s.boughtAd||o.price>s.money) return false; s.money-=o.price; s.boughtAd=true;
  const label='Ran: '+o.label;
  record(s,label,()=>{ if(o.market) shift(s,o.market,o.gain); else shiftAll(s,o.gain); if(o.money) s.money+=o.money;
    if(o.kind==='mislead') s.skeletons.push({...skel(`Fact-checkers took apart your attack ad`,.13,1.8),day:s.day,exposed:false});
    if(o.kind==='pac'){ s.flags.pac=true; s.skeletons.push({...skel(`PAC filings showed outside money behind your ads`,.1,1.7),day:s.day,exposed:false}); } },o.breaks);
  return true; }
function buyPoll(s,cheap){ const cost=cheap?10:25; if(s.money<cost) return false; s.money-=cost; const sd=cheap?3:1,bias=cheap?2:0,rows={};
  for(const id in s.groups) rows[id]=Math.round(s.groups[id].share+bias+gauss(s.rng)*sd*1.5);
  const total=Math.round(realPct(s)+bias+gauss(s.rng)*sd); s.polls.push({day:s.day,cheap,total,rows}); s.log.push({day:s.day,label:(cheap?'Cheap':'Good')+' poll: you at '+total+'%'}); return true; }
function hire(s,id){ if(s.staff.includes(id)) return false; const role=STAFF[id].role; s.staff.filter(x=>STAFF[x].role===role).forEach(x=>fire(s,x)); s.staff.push(id); s.loyal[id]=60; s.jobs[id]=STAFF[id].job[0];
  if(id==='rick'&&!s.skeletons.some(k=>k.label.startsWith('Rick'))) s.skeletons.push({...skel(`Rick Dunn was caught leaning on a reporter to bury a story`,.08,1.5),day:s.day,exposed:false});
  s.log.push({day:s.day,label:'Hired '+STAFF[id].name}); return true; }
function fire(s,id){ const sore=id==='rick'||s.loyal[id]<50; s.staff=s.staff.filter(x=>x!==id); delete s.jobs[id]; s.log.push({day:s.day,label:'Let '+STAFF[id].name+' go'});
  if(sore) leak(s,STAFF[id].short,.5); }
function leak(s,who,chance){ const open=s.skeletons.filter(k=>!k.exposed&&!k.leaked); if(open.length&&s.rng()<chance){ open[open.length-1].leaked=true; s.news.push(`${who} took a reporter's call. You don't know yet what was said.`); } }
function setJob(s,id,j){ if(s.staff.includes(id)) s.jobs[id]=j; }
function jobOptions(s,id){ const o=[{id:STAFF[id].job[0],label:STAFF[id].job[1]}];
  for(const t in TOWNS) o.push({id:'town:'+t,label:'Go to '+TOWNS[t].name+(TOWNS[t].g?' and stand in for you':' and work the party')});
  o.push({id:'rest',label:'Take the day off (rebuilds loyalty)'}); return o; }
const loyalWord=v=>v>=70?'solid':v>=45?'fine':v>=30?'unhappy':'about to walk';
function runJobs(s){ s.info=[]; s.decisions=[];
  for(const id of s.staff.slice()){ const j=s.jobToday[id]; const n=STAFF[id].short; if(!j) continue;
    if(j==='rest'){ s.loyal[id]=clamp(s.loyal[id]+14,0,100); s.info.push(`${n} took the day off and sounds better for it.`); continue; }
    if(j.startsWith('town:')){ const t=j.slice(5), g=TOWNS[t].g;
      if(!g){ s.party=clamp(s.party+6,0,100); s.info.push(`${n}, from the Capital: "The party's warmer on you than it was."`); continue; }
      record(s,`${n} stood in for you in ${TOWNS[t].name}`,()=>shift(s,g,id==='tess'?.9:.45)); s.lastSeen[g]=s.day; s.groupToday[g]=(s.groupToday[g]||0)+1;
      const opts=TOWN_SAYS[g].filter(([iss,side])=>!(s.stances[iss]&&s.stances[iss].side===side));
      if(opts.length&&s.rng()<(id==='tess'?.3:.45)){ const [iss,side]=pick(s.rng,opts), q=ISSUES[iss][side];
        s.decisions.push({who:id,text:`${n}, back from ${TOWNS[t].name}: "${VOICE[id]}. So I told them, '${q}.' In your name. I should have called first."`,choices:[
          { t:`Stand by it.`, fx:{s:{[g]:1.3}}, says:[iss,side], where:TOWNS[t].name, loyal:{[id]:8}, log:`Stood by ${n}'s promise in ${TOWNS[t].name}: "${q}"` },
          { t:`Disown it. "That was never my position."`, fx:{s:{[g]:-1.1},cred:2}, loyal:{[id]:-20}, log:`Disowned what ${n} told ${TOWNS[t].name}` },
          { t:`Say nothing and hope it dies.`, fx:{skel:skel(`${TOWNS[t].name} found out nobody meant what ${n} promised them`,.2,1.2)}, breaks:'ownIt', loyal:{[id]:-3}, log:`Ignored what ${n} promised ${TOWNS[t].name}` },
        ]}); }
      else s.info.push(`${n}, back from ${TOWNS[t].name}: "${OK_LINES[id]}"`);
      continue; }
    if(j==='donors'){ s.money+=16; s.info.push(`Lou brought in $16k.`); }
    if(j==='press'){ s.press=clamp(s.press+5,0,100); s.info.push(`Maya: "Reporters are returning my calls."`); }
    if(j==='bury') s.info.push(`Rick: "Made some calls. You'd rather not know."`);
    if(j==='dig'){ s.dug=true; s.info.push(`Nina: "He's in ${TOWNS[s.whitmoreNext].name} tomorrow. And I've got enough for a true attack ad."`); }
    if(j==='numbers'){ s.money+=25; buyPoll(s,false); s.polls[s.polls.length-1].priya=true; s.info.push(`Priya ran the real numbers. They're below, under Find out where you stand.`); }
    if(j==='route') s.info.push(`Ben: "Back roads saved you some time. You're welcome. I need a nap."`);
    if(j==='advance') s.info.push(`Tess had your first stop ready before you got there.`);
    if(SPECIAL[id]&&s.rng()<.4){ const p=SPECIAL[id].filter(x=>!s.flags['sp'+x.text.length]); if(p.length){ const e=pick(s.rng,p); s.flags['sp'+e.text.length]=true; s.decisions.push({who:id,text:e.text,choices:e.choices}); } }
  } }
function nextDecision(s){ s.decision=s.decisions.shift()||null; s.phase=s.decision?'report':'hq'; }
function decide(s,i){ applyChoice(s,s.decision.choices[i],null); nextDecision(s); }
/* Staff only speak up in a scene when you call them: one call a day. Each has a taste,
   so advice is a biased opinion, not the answer. Asking and then ignoring them stings. */
const votes=c=>{ const f=c.fx||{}; let v=(f.all||0)*3+(f.h||0)+(f.t?1:0); for(const k in f.s||{}) v+=f.s[k]; return v; };
const TASTE={
  rick:c=>votes(c)+((c.breaks||(c.fx&&c.fx.skel))?1.5:0),
  maya:c=>((c.fx.cred||0)+(c.fx.press||0))/3-((c.breaks||c.fx.skel)?4:0),
  tess:c=>votes(c)+(c.fx.t?1:0),
  lou:c=>(c.fx.money||0)/10+votes(c)*.2,
  priya:c=>votes(c)-(c.fx.skel?c.fx.skel.hit*2:0),
  nina:c=>(c.fx.cred||0)/2-(c.fx.skel?3:0),
  ben:c=>-(c.fx.hours?-c.fx.hours:0)*1+votes(c)*.1,
};
function advise(s,scene){ if(!scene||!scene.choices||scene.choices.length<2) return [];
  const seed=scene.title.length, out=[];
  const staff=s.staff.slice().sort((a,b)=>((a.charCodeAt(0)+seed)%7)-((b.charCodeAt(0)+seed)%7));
  for(const id of staff){ const sc=scene.choices.map(c=>TASTE[id](c)), top=Math.max(...sc); if(top===Math.min(...sc)) continue;
    const i=sc.indexOf(top); if(out.some(o=>o.i===i)) continue;
    out.push({id,i,line:ADVICE[id][seed%ADVICE[id].length]}); if(out.length===2) break; }
  return out; }
function askTeam(s,scene){ if(s.calls<1||!advise(s,scene).length) return false; s.calls--; s.askedFor=scene.title; return true; }
function reactToChoice(s,scene,i){ const notes=[], asked=s.askedFor===scene.title; s.askedFor=null;
  if(asked) for(const a of advise(s,scene)){ const followed=a.i===i; s.loyal[a.id]=clamp(s.loyal[a.id]+(followed?3:-6),0,100); if(!followed&&s.loyal[a.id]<45) notes.push(`${STAFF[a.id].short} noticed you went the other way.`); }
  if(scene.choices[i].breaks==='noLies'&&s.staff.includes('maya')){ s.loyal.maya=clamp(s.loyal.maya-12,0,100); notes.push(`Maya heard what you just said. She doesn't say anything.`); }
  s.reaction=notes.join(' '); }
function checkQuits(s,news){ for(const id of s.staff.slice()){ if(s.loyal[id]>25) continue;
  s.staff=s.staff.filter(x=>x!==id); delete s.jobs[id]; s.quits++; s.log.push({day:s.day,label:`${STAFF[id].name} quit`,exposed:true});
  if(id==='maya'){ s.press=clamp(s.press-12,0,100); news.push(`Maya Cole has quit, on the record: "I can't say what I'm being asked to say."`); }
  else news.push(`${STAFF[id].name} has quit. "I'm done," the text says. That's all it says.`);
  leak(s,STAFF[id].short,id==='rick'?1:.5); } }
function sleep(s){
  const news=s.news.splice(0); const before=realPct(s);
  checkQuits(s,news); news.push(...s.news.splice(0));
  const pay=s.staff.reduce((a,id)=>a+STAFF[id].pay,0); s.money-=pay;
  const small=Math.round(2+s.cred/15); s.money+=small;
  if(s.money<0){ const gone=s.staff.pop(); if(gone) news.push(`You can't make payroll. ${STAFF[gone].name} has left.`); s.money=0; }
  const wg=TOWNS[s.whitmore].g;
  if(s.calm>0){ s.calm--; news.push(`Whitmore stays quiet today.`); shiftAll(s,-.1); }
  else if(wg){ const covered=s.groupToday[wg]>0; shift(s,wg,covered?-1.2:-2.6); shiftAll(s,-.42);
    news.push(`Whitmore campaigned in ${TOWNS[s.whitmore].name}.`+(covered?` You were in the area, which blunted it.`:` You weren't around to answer him.`));
    if(s.rng()<.4){ shiftAll(s,-.7); news.push(`He also put up a new attack ad.`); } }
  if(s.day>1) s.moves.push({day:s.day,label:`Whitmore's campaigning`,delta:realPct(s)-before,rival:true});
  for(const g in s.lastSeen){ const away=s.day-s.lastSeen[g]; if(away>=2){ shift(s,g,-.7); if(away===2||away===4) news.push(`${GROUPS[g].name}: "We haven't seen you in days." They are drifting away.`); } }
  if(s.day===3){ if(s.party>=60){ s.money+=70; news.push(`The state party sends $70k. Marian Holt: "Don't make me regret it."`); s.log.push({day:s.day,label:`The party sent $70k`}); }
    else if(s.party<35){ news.push(`The state party has moved its money to other races. Marian Holt doesn't return your call.`); s.log.push({day:s.day,label:`The party cut you off`}); } else news.push(`The state party sends $20k and a shrug.`), s.money+=20; }
  if(s.day===4){ if(s.party>=60){ for(const id in s.groups) s.groups[id].yt+=1.5; news.push(`The party's turnout machine is working for you.`); }
    else if(s.party<35){ for(const id in s.groups) s.groups[id].yt-=1; news.push(`The party's turnout machine is working other races.`); } }
  const pressMult=1.25-s.press/100*.55, open=s.skeletons.filter(x=>!x.exposed).length, rick=s.jobToday.rick==='bury'&&s.staff.includes('rick')?.67:1, softer=s.jobToday.maya==='press'&&s.staff.includes('maya')?.67:1;
  for(const k of s.skeletons){ if(k.exposed) continue;
    if(s.rng()<(k.p*1.1+.01*open)*pressMult*rick||k.leaked){ k.exposed=true; const b=realPct(s);
      s.cred=clamp(s.cred-7,0,100); s.press=clamp(s.press-4,0,100); news.push('BREAKING: '+k.label+'.');
      if(k.clash){ const c=k.clash, a=ISSUES[c.issue][c.a.side], z=ISSUES[c.issue][c.b.side];
        s.queue.push({ title:'Day '+(s.day+1)+': voters compared notes', text:`Channel 9 plays two clips side by side. In ${c.a.town}: "${a}." In ${c.b.town}: "${z}." The reporter asks which one you meant.`, choices:[
          { t:`Pick one, and admit you told the other town what it wanted to hear.`, fx:{all:-.8,cred:5,press:4}, log:`Admitted you'd told two towns opposite things` },
          { t:`"Both. It's complicated."`, fx:{all:-1.5,cred:-4,press:-4}, log:`Told reporters both contradictory promises stood` },
          { t:`Blame a staffer for the mix-up.`, fx:{all:-.3,skel:skel(`The staffer you blamed told reporters the truth`,.2,2)}, breaks:'ownIt', log:`Blamed a staffer for your contradiction` },
        ]}); }
      else shiftAll(s,-k.hit*.8*softer);
      s.moves.push({day:s.day,label:'Exposed: '+k.label,delta:realPct(s)-b}); s.log.push({day:s.day,label:'Exposed: '+k.label,exposed:true}); }
  }
  const honest=realPct(s);
  news.push(s.staff.includes('priya')?`Priya: "We're at about ${Math.round(honest+gauss(s.rng)*.7)}%."`:`Dana, your volunteer manager: "I'd say we're at about ${Math.round(honest+3+gauss(s.rng)*1.5)}%. We're closing."`);
  s.news=news.slice(); s.lastNews=news.slice();
  for(const k in s.posted){ const p=s.posted[k]; if(p.isEnc) s.enc.unshift(p); else s.stops.unshift(p); } s.posted={};
  if(s.day>=DAY_COUNT){ s.phase='night'; s.night=buildNight(s); return news; }
  s.day++; s.hour=DAY_START; s.calls=1; s.askedFor=null; s.jobToday={...s.jobs}; s.digToday=s.dug; s.dug=false; s.groupToday={}; s.seenToday={}; s.route.push([s.at]);
  s.whitmore=s.whitmoreNext; s.whitmoreNext=pick(s.rng,Object.keys(TOWNS).filter(t=>TOWNS[t].g&&t!==s.whitmore));
  s.event=eventFor(s); s.phase='morning'; s.news=[]; return news;
}
function buildNight(s){
  const rows=[], total=280000, results={};
  for(const id in s.groups){ const g=s.groups[id], sw=gauss(s.rng)*.9, sh=clamp(g.share+sw,5,95);
    results[id]={you:Math.round(total*g.size*sh/100*g.yt/100),rival:Math.round(total*g.size*(100-sh)/100*g.rt/100),share:sh}; }
  const order=[['farm',.5,'first rural precincts'],['suburbs',.4,'early suburban precincts'],['factory',.5,'the first mill-town wards'],['farm',.5,'the rest of Farm country'],['suburbs',.35,'more of the suburbs'],['factory',.5,'the remaining mill-town wards'],['college',.55,'Harlan precincts'],['suburbs',.25,'the last suburban precincts'],['college',.45,'mail ballots from Harlan']];
  let y=0,r=0; for(const [id,f,label] of order){ y+=results[id].you*f; r+=results[id].rival*f; rows.push({label,you:Math.round(y),rival:Math.round(r)}); }
  const you=Object.values(results).reduce((a,x)=>a+x.you,0), rival=Object.values(results).reduce((a,x)=>a+x.rival,0);
  rows[rows.length-1]={...rows[rows.length-1],you,rival};
  return {rows,results,you,rival,step:0,won:you>rival,margin:Math.abs(you-rival)};
}
function ending(s){ const won=s.night.won, kept=s.broken.length===0;
  if(won&&kept) return {key:'clean',title:`You won, and you kept your word`,text:`It is rare, and it may not happen twice. Nobody can tell you what you owe, because you do not owe anything.`};
  if(won) return {key:'bought',title:`You won. Was it you who won?`,text:`You are the member-elect for the 9th District. The person who swore those three things on day 1 is not quite the person giving this speech.`};
  if(kept) return {key:'honour',title:`You lost, and you kept your word`,text:`You can look at yourself in the morning. Whitmore gets the seat, and the mill towns get two more years of nothing. Was it worth it? You will wonder.`};
  return {key:'worst',title:`You sold out, and you lost anyway`,text:`You crossed your own lines and it still was not enough. There is nothing to show for it except the list below.`};
}
function epilogue(s){ const e=[];
  if(s.night.won){
    if(s.flags.gulfline||s.flags.pac) e.push(`Week one: Gulfline's lobbyist is in your calendar for a "getting to know you" coffee.`);
    if(s.flags.mabry) e.push(`Earl Mabry's nephew starts in your office on Monday. He does not appear to have read the job description.`);
    if(s.flags.widow) e.push(`A woman from the diner has called your office four times about her mother's bills.`);
    if(s.flags.holt) e.push(`Marian Holt calls about your first big vote. She doesn't ask how you feel about the bill.`);
    if(s.flags.quarry) e.push(`The quarry owner's permit is on your desk with a sticky note from Lou.`);
    if(s.flags.lena) e.push(`Lena Ortiz's first memo as your adviser is about how you should run your office.`);
    if(s.flags.local88) e.push(`Millbrook wants to automate its second line. Local 88 sends you a photo of your signature.`);
    if(s.flags.slate) e.push(`The sheriff you endorsed is on the phone about "a little trouble".`);
    if(Object.keys(s.stances).length>=3) e.push(`Your office has a binder of everything you told each town. Your chief of staff reads it and goes quiet.`);
    if(!e.length) e.push(`Your first week is quiet. You owe nobody. You also have almost no allies in the capital.`);
  } else e.push(`Whitmore wins a tenth term. He sends a gracious note.`);
  return e; }
