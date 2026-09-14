import { NAKSHATRAS, RASHIS, YOGINIS, PLANETS, YOGAS, PALM, QA, SIGN_LORDS, HOUSE_MEAN, CAREER_FIELDS, SPOUSE_HINT } from "./knowledge.js";
import { realChart, signOf as rSign, nakOf, padaOf } from "./astro.js";
/* Shared chart store: kundali form saves here, prediction + oracle read it */
let LAST_CHART=null;
function houseOf(signIdx,lagIdx){return ((signIdx-lagIdx)+12)%12;} // 0-based house
function fmtD(d){return d.toLocaleDateString("en-IN",{year:"numeric",month:"short"});}
/* PART 1: 3D lives in cosmos.js — page logic below (3D can never break buttons) */
/* PART 2: nav, loader, progress, reveal */
addEventListener("load",()=>setTimeout(()=>{
  document.getElementById("loader").classList.add("hidden");
  initWelcomeGate();
},700));
/* Welcome voice gate — speaks to the seeker on entry */
function initWelcomeGate(){
  const gate=document.getElementById("welcomeGate"),enter=document.getElementById("enterBtn"),
    toggle=document.getElementById("voiceToggle"),preview=document.getElementById("welcomePreview");
  if(!gate)return;
  const WELCOME_MSG="Hello Jethai! I am Nilutpal. I want to say that this is a prototype — please check it and give your final decision on what is wrong or not. First test it for 2 weeks. I am AstroGod, your Vedic astrology oracle. I hold the wisdom of Parashara, Phaladeepika, Laghu Parashari, Yogini Dasha, and the palm shastras. Generate your kundali, reveal your life prediction, scan your palm, and ask me anything — I am here to guide you. Tap Enter, and let the stars speak.";
  preview.innerHTML="👋 <b>Hello Jethai!</b> I am <b>Nilutpal</b>. This is a <b>prototype</b> — please check it and give your final decision on what is wrong or not. <b>First test it for 2 weeks.</b><br><br>Namaste, radiant seeker. I am AstroGod, your Vedic astrology oracle. Generate your kundali, reveal your life prediction, scan your palm, and ask me anything — I am here to guide you.";
  function dismiss(){gate.classList.add("hidden");document.body.style.overflow="";showProtoToast();}
  function speak(text){
    if(!toggle||!toggle.checked)return;
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.rate=0.92;u.pitch=1;u.volume=1;u.lang="en-IN";
      const voices=speechSynthesis.getVoices();
      const v=voices.find(v=>/en-IN|en_GB|en.*male|daniel|google/i.test(v.name))||voices.find(v=>v.lang.startsWith("en"))||voices[0];
      if(v)u.voice=v;
      speechSynthesis.speak(u);
    }catch(e){/*silently ignore*/}
  }
  enter.addEventListener("click",()=>{speak(WELCOME_MSG);setTimeout(dismiss,400);});
  document.addEventListener("keydown",e=>{if(!gate.classList.contains("hidden")&&(e.key==="Enter"||e.key===" ")){e.preventDefault();enter.click();}});
  document.body.style.overflow="hidden";
  // warm voices
  if("speechSynthesis"in window){try{speechSynthesis.getVoices();}catch(e){}}
}
/* Prototype toast + banner */
function showProtoToast(){
  const t=document.createElement("div");
  t.className="proto-toast";
  t.innerHTML=`<b>🛠️ Prototype Notice</b><br>Hello Jethai! I am Nilutpal. Please test this for 2 weeks and tell me what is wrong. Your feedback matters!`;
  document.body.appendChild(t);
  setTimeout(()=>t.classList.add("show"),100);
  setTimeout(()=>{t.classList.remove("show");setTimeout(()=>t.remove(),400);},6000);
}
document.getElementById("protoClose")?.addEventListener("click",()=>{
  document.getElementById("protoBanner").classList.add("hidden");
  document.querySelector(".navbar").style.top="0";
  document.querySelector(".scroll-progress").style.top="0";
});
const bar=document.getElementById("progressBar");
addEventListener("scroll",()=>{
  const h=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)-innerHeight;
  bar.style.width=(h>0?scrollY/h*100:0)+"%";
},{passive:true});
const burger=document.getElementById("burger"),navLinks=document.getElementById("navLinks");
burger.addEventListener("click",()=>{burger.classList.toggle("open");navLinks.classList.toggle("open");});
document.querySelectorAll(".nav-link").forEach(a=>a.addEventListener("click",()=>{burger.classList.remove("open");navLinks.classList.remove("open");}));
const secs=[...document.querySelectorAll(".section")];
addEventListener("scroll",()=>{
  let cur=secs[0].id;
  secs.forEach(s=>{if(s.getBoundingClientRect().top<=innerHeight*.4)cur=s.id;});
  document.querySelectorAll(".nav-link").forEach(a=>a.classList.toggle("active",a.dataset.section===cur));
},{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in-view");io.unobserve(e.target);}}),{threshold:.15});
document.querySelectorAll("[data-anim]").forEach(el=>io.observe(el));
document.getElementById("year").textContent=new Date().getFullYear();
document.getElementById("oracleFab").addEventListener("click",()=>document.getElementById("oracle").scrollIntoView({behavior:"smooth"}));
/* PART 3: daily horoscope */
const HORO={
Mesha:{t:"Mars sharpens your resolve — mornings favour bold decisions; evenings call for soft words at home.",c:"Red",n:7},
Vrishabha:{t:"Venus steadies wealth and taste — a pending payment or purchase moves in your favour.",c:"Cream white",n:6},
Mithuna:{t:"Mercury quickens wit — write, pitch, negotiate. Double-check messages before sending.",c:"Green",n:5},
Karka:{t:"The Moon deepens intuition — family needs your calm. Hydrate, rest, forgive.",c:"Silver",n:2},
Simha:{t:"The Sun crowns your efforts — visibility rises. Lead generously; applause follows.",c:"Gold",n:1},
Kanya:{t:"Mercury blesses detail — organise, heal, refine. Small fixes yield big relief.",c:"Emerald",n:5},
Tula:{t:"Venus harmonises bonds — partnerships bloom. Beauty, art and diplomacy win.",c:"Pink",n:6},
Vrishchika:{t:"Mars deepens focus — research, transform, purge. Secrets surface; stay composed.",c:"Maroon",n:9},
Dhanu:{t:"Jupiter expands horizons — study, travel, teach. Luck favours the optimistic.",c:"Yellow",n:3},
Makara:{t:"Saturn rewards grind — slow steady steps outrun haste. Elders bring useful counsel.",c:"Navy blue",n:8},
Kumbha:{t:"Saturn + Rahu spark originality — networks and tech favour you. Share the vision.",c:"Electric blue",n:4},
Meena:{t:"Jupiter softens the heart — dreams carry messages. Create, meditate, surrender.",c:"Sea green",n:12}};
const rashiGrid=document.getElementById("rashiGrid");
RASHIS.forEach(([name,en,glyph])=>{
  const d=document.createElement("div");d.className="rashi";
  d.innerHTML=`<span class="g">${glyph}</span><b>${name}</b><small>${en}</small>`;
  d.addEventListener("click",()=>{
    document.querySelectorAll(".rashi").forEach(x=>x.classList.remove("sel"));
    d.classList.add("sel");showHoro(name);
  });
  rashiGrid.appendChild(d);
});
function seeded(str){let h=0;for(const c of str)h=(h*31+c.charCodeAt(0))>>>0;return h;}
function showHoro(name){
  const h=HORO[name];const day=new Date().toDateString();
  const s1=60+seeded(name+day)%41,s2=60+seeded(day+name+"c")%41,s3=60+seeded(name+"h"+day)%41,s4=60+seeded("l"+name+day)%41;
  document.getElementById("horoscopeCard").classList.remove("hidden");
  document.getElementById("horoSign").textContent=RASHIS.find(r=>r[0]===name)[2];
  document.getElementById("horoName").textContent=name+" · "+RASHIS.find(r=>r[0]===name)[1];
  document.getElementById("horoText").textContent="✦ "+h.t;
  document.getElementById("horoLucky").textContent=`🍀 Lucky colour: ${h.c} · Lucky number: ${h.n} · ${new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}`;
  const set=(id,v)=>requestAnimationFrame(()=>document.getElementById(id).style.width=v+"%");
  set("mLove",s1);set("mCareer",s2);set("mHealth",s3);set("mLuck",s4);
  document.getElementById("horoscopeCard").scrollIntoView({behavior:"smooth",block:"nearest"});
}
/* PART 4: REAL kundali engine (astronomy series + Lahiri ayanamsa + AI fallback) */
const dNak=document.getElementById("dNak");
NAKSHATRAS.forEach(([n],i)=>{const o=document.createElement("option");o.value=i;o.textContent=(i+1)+". "+n;dNak.appendChild(o);});
function sunLong(date){
  const start=new Date(date.getFullYear(),0,1);
  const day=(date-start)/864e5+1;
  return (280+day*0.9856)%360;
}
function ascendant(date,timeStr){
  const [h,m]=timeStr.split(":").map(Number);
  const sun=sunLong(date);
  const tod=(h+m/60)/24*360; // sun moves ~1deg/4min
  return (sun+tod+180)%360; // rough MC-to-Lagna flip keeps chart sensible
}
function signOf(deg){return Math.floor(deg/30)%12;}
function drawKundali(canvas,lagnaIdx,planets){
  const x=canvas.getContext("2d"),S=canvas.width;
  x.clearRect(0,0,S,S);
  x.strokeStyle="#ffd76a";x.lineWidth=3;x.shadowColor="#ffd76a";x.shadowBlur=14;
  x.strokeRect(14,14,S-28,S-28);
  x.beginPath();
  x.moveTo(14,14);x.lineTo(S-14,S-14);x.moveTo(S-14,14);x.lineTo(14,S-14);
  x.moveTo(S/2,14);x.lineTo(14,S/2);x.lineTo(S/2,S-14);x.lineTo(S-14,S/2);x.closePath();x.stroke();
  x.shadowBlur=0;x.fillStyle="#f4f1ff";x.textAlign="center";x.textBaseline="middle";
  // 12 bhava cells: [cx,cy] fractions
  const cells=[[.5,.30],[.72,.18],[.86,.34],[.80,.5],[.86,.66],[.72,.82],[.5,.70],[.28,.82],[.14,.66],[.20,.5],[.14,.34],[.28,.18]];
  x.font="13px Outfit,sans-serif";
  for(let b=0;b<12;b++){
    const r=(lagnaIdx+b)%12;
    x.fillStyle="#ffd76a";x.font="bold 15px Cinzel,serif";
    x.fillText(RASHIS[r][0].slice(0,4),cells[b][0]*S,cells[b][1]*S-24);
    x.fillStyle="#b9b3d9";x.font="11px Outfit,sans-serif";
    x.fillText((b+1)+"",cells[b][0]*S,cells[b][1]*S+26);
  }
  x.fillStyle="#22d3ee";x.font="bold 12px Outfit,sans-serif";
  planets.forEach(p=>{
    const house=((signOf(p.deg)-lagnaIdx)+12)%12;
    x.fillText(p.ab,cells[house][0]*S,cells[house][1]*S+10);
  });
  x.fillStyle="#f472b6";x.font="bold 16px Cinzel,serif";
  x.fillText("ॐ Lagna · "+RASHIS[lagnaIdx][0],S/2,S/2-4);
}
/* Gemini AI via keyless proxy (user pastes key in Oracle settings; default demo endpoint) */
/* MY API: multi-provider keyless chain — tries each until one answers */
const AI_SYS="You are AstroGod, a friendly Vedic astrology teacher. Ground answers in Parashara/Phaladeepika/Laghu-Parashari/Yogini-dasha/Goel-divisional principles, name houses/lords/yogas, give timelines + remedies, keep under 220 words, add educational-only disclaimer for health.";
async function aiVia(url,body,extract,ms){
  const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),ms||12000);
  try{const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:ctl.signal});
    if(!r.ok)throw new Error("HTTP "+r.status);const j=await r.json();const t=extract(j);
    if(!t||t.length<10)throw new Error("empty");return t;
  }finally{clearTimeout(to);}
}
async function geminiAsk(prompt){
  const key=(localStorage.getItem("astro_gemini_key")||"").trim();
  const errs=[];
  const providers=[
    {n:"pollinations",fn:()=>aiVia("https://text.pollinations.ai/openai",{model:"openai",messages:[{role:"system",content:AI_SYS},{role:"user",content:prompt}],max_tokens:600},j=>j.choices?.[0]?.message?.content)},
    {n:"duckchat",fn:async()=>{const r=await fetch("https://duckduckgo.com/duckchat/v1/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"system",content:AI_SYS},{role:"user",content:prompt}]})});if(!r.ok)throw new Error("HTTP "+r.status);const t=await r.text();if(!t||t.length<10)throw new Error("empty");return t;}},
    {n:"pollinations-get",fn:async()=>{const r=await fetch("https://text.pollinations.ai/"+encodeURIComponent(AI_SYS+"\n\nSeeker: "+prompt).slice(0,1500));if(!r.ok)throw new Error("HTTP "+r.status);const t=await r.text();if(!t||t.length<10)throw new Error("empty");return t;}}
  ];
  if(key)providers.unshift({n:"gemini",fn:async()=>{const url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+encodeURIComponent(key);const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:AI_SYS+"\n\nSeeker: "+prompt}]}]})});if(!r.ok)throw new Error("HTTP "+r.status);const j=await r.json();return j.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("");}});
  for(const p of providers){try{return await p.fn();}catch(e){errs.push(p.n+":"+e.message);}}
  throw new Error(errs.join(" | "));
}
const PYB = (location.port==="5000"?"":"http://localhost:5000"); // python backend base
async function pyPost(path, body, isForm){
  try{
    const opt = isForm ? {method:"POST", body}
      : {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)};
    opt.signal = AbortSignal.timeout(25000);
    const r = await fetch(PYB + path, opt);
    if(!r.ok) throw new Error("HTTP "+r.status);
    return await r.json();
  }catch(e){ return null; }
}
async function pyChart(dVal, tVal){ const j = await pyPost("/api/chart", {date:dVal,time:tVal}); return (j && j.ok) ? j : null; }
async function pyOracle(question, context){
  let key = "";
  try{ key = localStorage.getItem("astro_gemini_key") || ""; }catch(e){}
  const j = await pyPost("/api/oracle", {question, context, key});
  return (j && j.ok && j.answer) ? {text:j.answer, via:j.via||"python"} : null;
}
async function pyPalm(blob){
  const fd = new FormData(); fd.append("image", blob, "palm.jpg");
  const j = await pyPost("/api/palm", fd, true);
  return (j && j.ok) ? j : null;
}
document.getElementById("kundaliForm").addEventListener("submit",async()=>{
  const dVal=document.getElementById("kDate").value||"2000-01-01";
  const tVal=document.getElementById("kTime").value||"12:00";
  const name=(document.getElementById("kName").value||"Seeker").trim();
  const place=document.getElementById("kPlace").value||"Bharat";
  const date=new Date(dVal+"T00:00:00");
  const [Y,M,D]=dVal.split("-").map(Number), [hh,mm]=tVal.split(":").map(Number);
  const res=document.getElementById("kundaliResult");
  res.innerHTML='<p class="placeholder">🪐 Consulting Python Swiss Ephemeris…</p>';
  let lagIdx,planets,moonIdx,nakIdx,pada,nak,engLabel,vim=null;
  const py=await pyChart(dVal,tVal); // precise backend first
  if(py){
    const idx=ab=>py.planets.findIndex(p=>p.ab===ab);
    planets=py.planets.map(p=>({n:p.n,ab:p.ab,deg:p.deg}));
    lagIdx=Math.floor(py.asc/30)%12;
    moonIdx=RASHIS.findIndex(r=>r[0]===py.moonSign);
    nakIdx=NAKSHATRAS.findIndex(n=>n[0]===py.nakshatra);
    pada=py.pada;nak=NAKSHATRAS[nakIdx];vim=py.vimshottari;
    engLabel="🐍 Python Swiss Ephemeris · Lahiri "+py.ayanamsa+"°";
  }else{
    let rc=null;try{rc=realChart(Y,M,D,hh,mm);}catch(e){rc=null;}
    lagIdx=rc?rSign(rc.Asc):signOf(ascendant(date,tVal));
    const mk=(n,ab,deg)=>({n,ab,deg:((deg%360)+360)%360});
    planets=rc?[mk("Surya","Su",rc.Su),mk("Chandra","Mo",rc.Mo),mk("Mangal","Ma",rc.Ma),
      mk("Budha","Me",rc.Me),mk("Guru","Ju",rc.Ju),mk("Shukra","Ve",rc.Ve),
      mk("Shani","Sa",rc.Sa),mk("Rahu","Ra",rc.Ra),mk("Ketu","Ke",rc.Ke)]:
      [{n:"Surya",ab:"Su",deg:sunLong(date)},{n:"Chandra",ab:"Mo",deg:(sunLong(date)+D*13.2)%360},
      {n:"Mangal",ab:"Ma",deg:0},{n:"Budha",ab:"Me",deg:0},{n:"Guru",ab:"Ju",deg:0},
      {n:"Shukra",ab:"Ve",deg:0},{n:"Shani",ab:"Sa",deg:0},{n:"Rahu",ab:"Ra",deg:0},{n:"Ketu",ab:"Ke",deg:0}];
    moonIdx=rSign(planets[1].deg);nakIdx=nakOf(planets[1].deg);pada=padaOf(planets[1].deg);
    nak=NAKSHATRAS[nakIdx];
    engLabel="JS ephemeris (offline fallback — start Python backend for Swiss precision)";
  }
  drawKundali(document.getElementById("kundaliCanvas"),lagIdx,planets);
  LAST_CHART={name,place,dVal,tVal,lagIdx,moonIdx,nakIdx,planets,date,vim};window.LAST_CHART=LAST_CHART;
  const yogas=[];
  if(Math.abs(planets[0].deg-planets[3].deg)<30)yogas.push("☀️ Budha-Aditya Yoga");
  if([0,3,6,9].includes(((signOf(planets[4].deg)-moonIdx)+12)%12))yogas.push("🐘 Gaja Kesari hint");
  yogas.push("🪐 Kendra: "+[0,3,6,9].map(k=>RASHIS[(lagIdx+k)%12][0]).join(", "));
  if(vim)yogas.push("🕰️ Vimshottari: "+vim.periods[0].lord+" till "+vim.periods[0].to);
  res.innerHTML=
    `<div class="krow"><span>🧑 Name</span><b>${name}</b></div>
     <div class="krow"><span>📍 Birth</span><b>${dVal} · ${tVal} · ${place}</b></div>
     <div class="krow"><span>🌅 Lagna</span><b>${RASHIS[lagIdx][0]} (${RASHIS[lagIdx][1]})</b></div>
     <div class="krow"><span>🌙 Moon sign</span><b>${RASHIS[moonIdx][0]} (${RASHIS[moonIdx][1]})</b></div>
     <div class="krow"><span>✨ Nakshatra</span><b>${nak[0]} · pada ${pada} · lord ${nak[1]}</b></div>
     <div class="krow"><span>📐 Engine</span><b>${engLabel}</b></div>
     <div class="yogas">${yogas.map(y=>`<span>${y}</span>`).join("")}</div>
     <p class="hint">Start the Python backend for Swiss-Ephemeris precision (see backend/README). Vimshottari comes from Python.</p>`;
});
/* PART 5: Yogini Dasha timeline */
document.getElementById("dashaForm").addEventListener("submit",()=>{
  const dVal=document.getElementById("dDate").value||"2000-01-01";
  const birth=new Date(dVal+"T00:00:00");
  let nakIdx=dNak.value===""?Math.floor((((birth.getMonth()*30.4+birth.getDate())/365)*27)%27):parseInt(dNak.value,10);
  const seq=[];
  for(let k=0;k<8;k++)seq.push((nakIdx+k)%8);
  const now=new Date();let age=(now-birth)/315576e5;
  let cyc=Math.floor(age/36);let rem=age-cyc*36;
  // find current
  let acc=0,curI=0,startRem=0;
  for(let i=0;i<8;i++){const y=YOGINIS[seq[i]].yrs;if(rem<acc+y){curI=i;startRem=rem-acc;break;}acc+=y;}
  const cycStart=new Date(birth);cycStart.setFullYear(birth.getFullYear()+cyc*36);
  let html=`<div class="krow"><span>✨ Birth nakshatra</span><b>${NAKSHATRAS[nakIdx][0]} (${NAKSHATRAS[nakIdx][1]})</b></div>
  <div class="krow"><span>🪐 Current Mahadasha</span><b>${YOGINIS[seq[curI]].g} ${YOGINIS[seq[curI]].n} (${YOGINIS[seq[curI]].lord}, ${YOGINIS[seq[curI]].yrs}y)</b></div>
  <div class="krow"><span>⏳ Elapsed in period</span><b>${startRem.toFixed(1)} / ${YOGINIS[seq[curI]].yrs} years</b></div>`;
  document.getElementById("dashaResult").innerHTML=html;
  const tl=document.getElementById("dashaTimeline");tl.innerHTML="";
  const nowMs=now.getTime();
  // walk: one full cycle before current cycle start, then 3 cycles forward
  let cursor=new Date(cycStart);cursor.setFullYear(cursor.getFullYear()-36);
  for(let c=0;c<3;c++){
    for(let i=0;i<8;i++){
      const Y=YOGINIS[seq[i]];
      const s=new Date(cursor);
      const end=new Date(s);end.setFullYear(end.getFullYear()+Y.yrs);
      const isNow=nowMs>=s.getTime()&&nowMs<end.getTime();
      const past=end.getTime()<nowMs;
      const div=document.createElement("div");
      div.className="tl-item"+(isNow?" now":"");
      const fmt=d=>d.toLocaleDateString("en-IN",{year:"numeric",month:"short"});
      div.innerHTML=`<div class="tl-dot">${isNow?"🔥":Y.g}</div>
        <div class="tl-body"><b>${Y.n} · ${Y.lord} · ${Y.yrs}y</b><br>
        ${fmt(s)} → ${fmt(end)}<br>
        ${past?'<span class="past">✓ completed — '+Y.q+'</span>':(isNow?'🔥 <b>NOW:</b> '+Y.t:Y.q)}</div>`;
      tl.appendChild(div);
      cursor=new Date(end);
    }
  }
  tl.querySelector(".tl-item.now")?.scrollIntoView({block:"center"});
});
/* PART 6: AI Oracle chat engine */
const chatLog=document.getElementById("chatLog"),chatForm=document.getElementById("chatForm"),chatText=document.getElementById("chatText");
function addMsg(who,html){
  const d=document.createElement("div");d.className="msg "+who;
  d.innerHTML=`<span class="avatar">${who==="bot"?"🔮":"🧑"}</span><div class="bubble">${html}</div>`;
  chatLog.appendChild(d);chatLog.scrollTop=chatLog.scrollHeight;return d;
}
function personalReading(s){
  const T=window.ASTRO_TEXTS||null;
  if(!T){
    if(window.LAST_CHART){
      const C=window.LAST_CHART;
      return `🔮 <b>${C.name||"Seeker"}, your chart IS ready</b> — ${RASHIS[C.lagIdx][0]} Lagna, Moon in ${RASHIS[C.moonIdx][0]}, ${NAKSHATRAS[C.nakIdx][0]} nakshatra. Now press <b>🔮 Reveal My Life Prediction</b> in section 03 and I will speak of your career, marriage, wealth, health & character in full detail!`;
    }
    return "Generate your kundali, then press <b>Reveal My Life Prediction</b> — I will read your personal chart! 🔮";
  }
  if(s.includes("career")||s.includes("job")||s.includes("suit")||s.includes("profession")||s.includes("business"))return "💼 <b>YOUR career (from your chart):</b><br>"+T.career;
  if(s.includes("marry")||s.includes("marriage")||s.includes("spouse")||s.includes("wife")||s.includes("husband")||s.includes("partner"))return "💍 <b>YOUR marriage (from your chart):</b><br>"+T.marr;
  if(s.includes("wealth")||s.includes("rich")||s.includes("money")||s.includes("finance"))return "💰 <b>YOUR wealth (from your chart):</b><br>"+T.wealth;
  if(s.includes("health")||s.includes("disease"))return "🩺 <b>YOUR health (from your chart):</b><br>"+T.hl+"<br>⚕️ Educational only.";
  if(s.includes("character")||s.includes("nature")||s.includes("personality"))return "🧬 <b>YOUR nature (from your chart):</b><br>"+T.ch;
  return "🔮 <b>Your chart speaks, "+(window.LAST_CHART.name||"seeker")+"!</b> Ask: <b>my career? my marriage? my wealth? my health? my character?</b>";
}
function isPersonalQ(s){
  return s.includes("my ")||s.includes("mine")||s.includes("suit")||s.includes("predict")||
    s.includes("spouse")||s.includes("marry")||s.includes("marriage")||s.includes("career")||
    s.includes("job")||s.includes("wealth")||s.includes("rich")||s.includes("health")||
    s.includes("character")||s.includes("nature")||s.includes("wife")||s.includes("husband")||
    s.includes("future")||s.includes("when will i");
}
function oracleAnswer(q){
  const s=" "+q.toLowerCase()+" ";
  // YOUR chart first: personal questions always get YOUR reading, never generic text
  if(window.LAST_CHART&&isPersonalQ(s))return personalReading(s);
  let best=null,bestHits=0;
  for(const item of QA){
    let hits=0;
    for(const k of item.k){if(s.includes(k))hits+=k.length;}
    if(hits>bestHits){bestHits=hits;best=item;}
  }
  if(best&&bestHits>0)return best.a;
  // planet fallback
  for(const p of Object.keys(PLANETS)){
    if(s.includes(p.toLowerCase())){const P=PLANETS[p];return `<b>${P.g} ${p}</b> — ${P.body}<br><br>🏠 ${P.house}<br><br>💎 ${P.remedy}`;}
  }
  for(const [n] of NAKSHATRAS){if(s.includes(n.toLowerCase()))return `✨ <b>${n}</b> — one of the 27 lunar mansions. Generate your kundali above to see if it is yours!`;}
  if(window.LAST_CHART&&isPersonalQ(s))return personalReading(s);
  return `The stars hear you, seeker. 🌌 Ask me of <b>Yogini Dasha, career, marriage, wealth, health, character, yogas, planets</b> — or generate your kundali and ask <b>"what career suits me?"</b> for a personal reading!`;
}
try{
  const k=localStorage.getItem("astro_gemini_key");
  if(k)document.getElementById("gemKey").value=k;
  document.getElementById("gemSave").addEventListener("click",()=>{
    const v=document.getElementById("gemKey").value.trim();
    if(v)localStorage.setItem("astro_gemini_key",v);else localStorage.removeItem("astro_gemini_key");
    document.getElementById("gemStatus").textContent=v?"✅ Key saved — real AI active for deep questions!":"Key cleared — oracle runs on built-in engine.";
  });
}catch(e){}
function chartContext(){
  const C=window.LAST_CHART;if(!C)return "";
  return `\nSeeker chart: ${C.name}, ${C.dVal} ${C.tVal}, Lagna ${RASHIS[C.lagIdx][0]}, Moon ${RASHIS[C.moonIdx][0]}, Nakshatra ${NAKSHATRAS[C.nakIdx][0]}, planets ${C.planets.map(p=>p.n+"@"+RASHIS[Math.floor(p.deg/30)%12][0]).join(", ")}.`;
}
function say(bubbleEl,html){try{bubbleEl.innerHTML=html;}catch(e){}chatLog.scrollTop=chatLog.scrollHeight;}
chatForm.addEventListener("submit",async()=>{
  const q=chatText.value.trim();if(!q)return;
  let typing=null;
  try{
    addMsg("user",q.replace(/</g,"&lt;"));chatText.value="";
    typing=addMsg("bot","<i>Consulting the ephemeris… ✨</i>");
    const bubble=typing.querySelector(".bubble");
    const local=oracleAnswer(q);
    const ctx=chartContext();
    // PERSONAL chart questions: answer INSTANTLY, never wait on network
    if(window.LAST_CHART&&isPersonalQ(" "+q.toLowerCase()+" ")){say(bubble,local);return;}
    if(!local.startsWith("The stars hear")){setTimeout(()=>say(bubble,local),400);return;}
    // Generic/unknown question: race backends, always reply within ~14s
    const withTimeout=(p,ms)=>Promise.race([p,new Promise(res=>setTimeout(()=>res(null),ms))]);
    const py=await withTimeout(pyOracle(q,ctx),9000);
    if(py&&py.text){
      const tag=py.via==="gemini-flash"?"🤖 <b>AstroGod AI · Gemini:</b><br>":"🐍 <b>AstroGod AI · Python engine:</b><br>";
      say(bubble,tag+String(py.text).replace(/\n/g,"<br>"));return;
    }
    try{
      const ai=await withTimeout(geminiAsk(ctx+"\n\n"+q),9000);
      if(ai){say(bubble,"🤖 <b>AstroGod AI:</b><br>"+String(ai).replace(/\n/g,"<br>"));return;}
    }catch(e){}
    say(bubble,local+'<br><br><span class="hint">💡 Tip: generate kundali (01) + prediction (03), then ask "my career? my marriage? my health?" — I always answer those instantly.</span>');
  }catch(err){
    try{
      const fb=typing?typing.querySelector(".bubble"):null;
      if(fb)fb.innerHTML="I heard you — "+(""+q).replace(/</g,"&lt;")+". The stars flickered for a moment; please ask once more! ✨";
    }catch(e2){}
  }
});
document.getElementById("chips").addEventListener("click",e=>{
  if(e.target.tagName==="BUTTON"){chatText.value=e.target.textContent;chatForm.dispatchEvent(new Event("submit"));}
});
/* PART 7: medical astrology explorer */
const pGrid=document.getElementById("planetGrid");
Object.keys(PLANETS).forEach(p=>{
  const d=document.createElement("div");d.className="planet";
  d.innerHTML=`<span class="g">${PLANETS[p].g}</span><b>${p}</b>`;
  d.addEventListener("click",()=>{
    document.querySelectorAll(".planet").forEach(x=>x.classList.remove("sel"));
    d.classList.add("sel");
    const P=PLANETS[p];
    document.getElementById("planetCard").classList.remove("hidden");
    document.getElementById("planetName").textContent=`${P.g} ${p}`;
    document.getElementById("planetBody").textContent=P.body;
    document.getElementById("planetHouse").textContent=P.house;
    document.getElementById("planetRemedy").textContent=P.remedy;
    document.getElementById("planetCard").scrollIntoView({behavior:"smooth",block:"nearest"});
  });
  pGrid.appendChild(d);
});
/* PART 8: palmistry camera scanner (real vision analysis) */
const video=document.getElementById("camVideo"),camCanvas=document.getElementById("camCanvas"),
  btnStart=document.getElementById("camStart"),btnCap=document.getElementById("camCapture"),
  btnStop=document.getElementById("camStop"),camStatus=document.getElementById("camStatus"),
  laser=document.getElementById("scanLaser");
let stream=null,activeLine="life";
document.querySelectorAll(".pline").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".pline").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");activeLine=b.dataset.line;renderPalmReading();
}));
btnStart.addEventListener("click",async()=>{
  try{
    camStatus.textContent="Requesting camera…";
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:960}},audio:false});
    video.srcObject=stream;await video.play();
    btnStart.classList.add("hidden");btnStop.classList.remove("hidden");btnCap.disabled=false;
    camStatus.textContent="✅ Camera live — flatten your palm inside the dashed frame, then Capture.";
  }catch(err){camStatus.textContent="❌ Camera blocked: "+err.message+". Allow permission, or try Chrome on localhost/HTTPS.";}
});
btnStop.addEventListener("click",()=>{
  stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;
  btnStart.classList.remove("hidden");btnStop.classList.add("hidden");btnCap.disabled=true;
  camStatus.textContent="Camera off.";
});
/* REAL palm-line vision: grayscale → adaptive contrast → directional line tracing per zone */
function grayPlane(img,W,H){
  const d=img.data,g=new Float32Array(W*H);
  for(let i=0;i<W*H;i++)g[i]=(d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114)/255;
  return g;
}
function zoneStats(g,W,H,zone,minLen){
  // column-wise darkest-pixel tracing: finds long continuous dark creases (real lines)
  const x0=zone[0]*W|0,y0=zone[1]*H|0,x1=zone[2]*W|0,y1=zone[3]*H|0;
  const lines=[];let len=0,depthSum=0,depthN=0,gaps=0;
  for(let x=x0;x<x1;x+=2){
    let best=1,bY=-1;
    for(let y=y0;y<y1;y+=2){const v=g[y*W+x];if(v<best){best=v;bY=y;}}
    const local=[];for(let y=Math.max(y0,bY-6);y<Math.min(y1,bY+6);y+=2)local.push(g[y*W+x]);
    const avg=local.reduce((a,b)=>a+b,0)/Math.max(1,local.length);
    const depth=avg-best; // how much darker the crease is than surroundings
    depthSum+=depth;depthN++;
    if(best<0.62&&depth>0.03){len++;gaps=0;}
    else{gaps++;if(gaps>3){if(len>=minLen)lines.push(len);len=0;}}
  }
  if(len>=minLen)lines.push(len);
  const longest=lines.length?Math.max(...lines):0;
  return {segments:lines.length,gaps:lines.length?lines.length-1:3,longest,clarity:depthN?depthSum/depthN:0,
    span:((x1-x0)/2),longestNorm:longest/Math.max(1,(x1-x0)/2)};
}
function visionScore(img,W,H,zone){
  const g=grayPlane(img,W,H);
  const s=zoneStats(g,W,H,zone,6);
  // score = continuity (longest segment) 60% + clarity 25% + unbroken-ness 15%
  const cont=Math.min(1,s.longestNorm*1.6);
  const clar=Math.min(1,s.clarity*9);
  const whole=s.segments<=1?1:s.segments===2?.65:.35;
  return {score:Math.min(1,Math.max(.04,cont*.6+clar*.25+whole*.15)),detail:s};
}
let lastScores=null;
function palmVerdict(line,s){
  const brk=s.detail.segments>=3, faint=s.score<.38, strong=s.score>.62;
  if(line==="life")return strong?"Long, deep, unbroken arc — classical mark of strong vitality & stamina; major relocations few.":faint?"Faint/broken arc — vitality fluctuates; rest, routine & iron-rich diet rebuild it; breaks mark moves or health chapters, never lifespan.":"Clear arc with "+s.detail.segments+" segment(s) — steady stamina; upward branches show support in hard years.";
  if(line==="head")return strong?"Long clear channel across the palm — deep focus, strong memory; sloping end adds imagination.":brk?"Chained/broken into "+s.detail.segments+" parts — folk reading: scattered focus & rest-deficit phases; single-tasking + sleep restore it.":"Clean mid-length channel — practical logic with creative bends; decisions improve after 30.";
  if(line==="heart")return strong?"Long curved rise toward Jupiter mount — warm, expressive, loyal love; depth shows emotional resilience.":brk?"Split into "+s.detail.segments+" segments — emotional resets (heartbreak→rebirth); each break is followed by a stronger reunion line.":"Straight loyal line — reserved but fiercely devoted; expresses love through acts, not words.";
  return strong?"Single deep vertical to Saturn mount — steady career spine; promotions in Shani/Guru periods.":s.detail.segments===0?"No single fate spine — the self-made palm: zigzag careers, many skills, success after 35 via own venture.":"Broken into "+s.detail.segments+" spans — career pivots written in the hand; each break = a wiser second innings.";
}
function renderPalmReading(){
  const box=document.getElementById("palmResult");
  if(!lastScores){box.innerHTML=`<h4>${PALM[activeLine].t}</h4><p>${PALM[activeLine].d}</p><p class="placeholder">Capture your palm to get a personalised line-strength score…</p>`;return;}
  const L=PALM[activeLine],s=lastScores[activeLine];
  const names={life:"Vitality",head:"Mental clarity",heart:"Emotional depth",fate:"Career steadiness"};
  const pct=Math.round(s.score*100);
  box.innerHTML=`<h4>${L.t}</h4><p>${L.d}</p>
    <div class="score"><b>${names[activeLine]}: ${pct}%</b><div class="meter"><div style="width:${pct}%"></div></div></div>
    <p>📏 <b>Traced:</b> ${s.detail.segments||"no"} continuous segment(s) · longest covers ${Math.round(s.detail.longestNorm*100)}% of zone · clarity ${(s.detail.clarity*100).toFixed(1)}%</p>
    <p>🔍 <b>Reading:</b> ${palmVerdict(activeLine,s)}</p>
    <p class="hint">Real line-tracing vision on YOUR photo (darkest-crease tracing per zone). Interpretive art + educational — not fate.</p>`;
}
renderPalmReading();
document.querySelectorAll(".book-btn").forEach(b=>b.addEventListener("click",()=>{
  const card=b.closest(".book-card"),extra=card.querySelector(".book-extra");
  extra.classList.toggle("hidden");
  b.textContent=extra.classList.contains("hidden")?"📖 Reveal teachings":"🙈 Hide teachings";
}));
btnCap.addEventListener("click",()=>{
  if(!stream)return;
  laser.classList.remove("hidden");camStatus.textContent="🔍 Scanning palm lines…";
  const vw=video.videoWidth,vh=video.videoHeight;
  camCanvas.width=vw;camCanvas.height=vh;
  const cx=camCanvas.getContext("2d");
  setTimeout(()=>{
    cx.drawImage(video,0,0,vw,vh);
    const img=cx.getImageData(0,0,vw,vh);
    // zones: [x0,y0,x1,y1] — life arc, head band, heart band, fate spine
    lastScores={
      life:visionScore(img,vw,vh,[.18,.45,.48,.92]),
      head:visionScore(img,vw,vh,[.20,.42,.82,.60]),
      heart:visionScore(img,vw,vh,[.18,.24,.84,.42]),
      fate:visionScore(img,vw,vh,[.42,.20,.60,.90])};
    laser.classList.add("hidden");
    camStatus.textContent="✅ Scan complete — see your reading on the right. Tap line tabs to explore each.";
    renderPalmReading();
  },1700);
});
