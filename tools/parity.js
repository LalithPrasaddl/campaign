// Checks that a setting matches harlan.js scene for scene: same order, numbers, lines, flags and ids. Only text may differ.
// Usage: node tools/parity.js [setting]   (run from the project root; default rajnagar)
const fs=require('fs'),vm=require('vm');
const load=f=>{const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(f,'utf8')+';this.X={GROUPS,TOWNS,ROADS,ISSUES,PRINCIPLES,SECRETS,STAFF,FIXED,MORNING,STOPS,ENCOUNTERS,SPECIAL,TOWN_SAYS,SET,secretEvent,ADVICE,VOICE,OK_LINES,AD_LINES};',c);return c.X;};
const dir=require('path').join(__dirname,'..','assets','js','content'),other=process.argv[2]||'rajnagar';
const A=load(dir+'/harlan.js'),B=load(dir+'/'+other+'.js');
const tmap={}; Object.keys(A.TOWNS).forEach((k,i)=>tmap[k]=Object.keys(B.TOWNS)[i]);
let bad=0; const err=(...m)=>{bad++;console.log('MISMATCH',...m);};
const j=x=>JSON.stringify(x);
const nofx=f=>f&&f.skel?{...f,skel:{p:f.skel.p,hit:f.skel.hit}}:f;
const strip=c=>({fx:j(nofx(c.fx)),breaks:c.breaks,says:j(c.says),flag:c.flag,loyal:j(c.loyal)});
function scene(a,b,where){ if(!b) return err(where,'missing');
  for(const k of ['until','needs','press']) if(a[k]!==b[k]) err(where,k,a[k],b[k]);
  if(a.town&&tmap[a.town]!==b.town) err(where,'town',a.town,b.town);
  if(a.choices.length!==b.choices.length) return err(where,'choice count');
  a.choices.forEach((c,i)=>{const x=strip(c),y=strip(b.choices[i]); for(const k in x) if(x[k]!==y[k]) err(where+' #'+i,k,x[k],y[k]);});
  for(const c of b.choices) if(!c.log||!c.t) err(where,'missing t/log'); if((a.title&&!b.title)||!b.text) err(where,'missing title/text'); if((a.tease||b.tease)&&!b.tease) err(where,'tease'); }
for(const k of ['MORNING','STOPS','ENCOUNTERS']){ if(A[k].length!==B[k].length) err(k,'length',A[k].length,B[k].length); A[k].forEach((s,i)=>scene(s,B[k][i],k+'['+i+'] '+s.title+' / '+(B[k][i]||{}).title)); }
for(const d in A.FIXED) scene(A.FIXED[d],B.FIXED[d],'FIXED '+d);
scene(A.secretEvent('dui'),B.secretEvent('dui'),'secret');
for(const id in A.SPECIAL) A.SPECIAL[id].forEach((s,i)=>scene(s,B.SPECIAL[id][i],'SPECIAL '+id+i));
if(j(A.ROADS.map(([a,b,h])=>[tmap[a],tmap[b],h]))!==j(B.ROADS)) err('ROADS');
for(const g in A.GROUPS){const{name:_,...x}=A.GROUPS[g],{name:__,...y}=B.GROUPS[g]; if(j(x)!==j(y)) err('GROUP',g);}
for(const t in A.TOWNS){const a=A.TOWNS[t],b=B.TOWNS[tmap[t]]; if(a.g!==b.g||a.x!==b.x||a.y!==b.y) err('TOWN',t);}
for(const id in A.STAFF){const a=A.STAFF[id],b=B.STAFF[id]; if(a.pay!==b.pay||a.job[0]!==b.job[0]) err('STAFF',id);}
if(j(Object.keys(A.ISSUES))!==j(Object.keys(B.ISSUES))||j(Object.keys(A.PRINCIPLES))!==j(Object.keys(B.PRINCIPLES))||j(Object.keys(A.SECRETS))!==j(Object.keys(B.SECRETS))) err('ids');
if(j(A.TOWN_SAYS)!==j(B.TOWN_SAYS)) err('TOWN_SAYS');
const keys=o=>Object.keys(o).sort().join(); if(keys(A.SET)!==keys(B.SET)) err('SET keys'); for(const k of ['words','ads','party','night','endings','epilogue','estimate','sign']) if(keys(A.SET[k])!==keys(B.SET[k])) err('SET.'+k);
if(j(A.SET.night.count.map(r=>r.slice(0,2)))!==j(B.SET.night.count.map(r=>r.slice(0,2)))) err('count order');
if(A.SET.rivalStart.map(t=>tmap[t]).join()!==B.SET.rivalStart.join()||tmap[A.SET.start]!==B.SET.start) err('start');
if(bad) process.exitCode=1;
console.log(bad?bad+' mismatches':'All scenes and numbers match.', 'Morning',B.MORNING.length,'Stops',B.STOPS.length,'Encounters',B.ENCOUNTERS.length);
