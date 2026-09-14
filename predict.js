import { NAKSHATRAS, RASHIS, YOGINIS, PLANETS, SIGN_LORDS, HOUSE_MEAN, CAREER_FIELDS, SPOUSE_HINT } from "./knowledge.js";
/* MY LIFE PREDICTION — Parashari house-lord engine reading window.LAST_CHART */
function lh(lord){const m={Surya:"Su",Chandra:"Mo",Mangal:"Ma",Budha:"Me",Guru:"Ju",Shukra:"Ve",Shani:"Sa"};const C=window.LAST_CHART;const p=C.planets.find(p=>p.ab===m[lord]);return ((Math.floor(p.deg/30)%12-C.lagIdx)+12)%12;}
function fmt(d){return d.toLocaleDateString("en-IN",{year:"numeric",month:"short"});}
const OUTER=["bold initiator","steady sensualist","curious communicator","nurturing empath","radiant leader","precise analyst","charming diplomat","intense transformer","optimistic philosopher","disciplined climber","visionary rebel","dreamy mystic"];
const MIND=["fiery","sensual","airy","soft","bright","sharp","balanced","deep","expansive","grave","original","gentle"];
document.getElementById("predictBtn").addEventListener("click",()=>{
const grid=document.getElementById("futureGrid");
const C=window.LAST_CHART;
if(!C){grid.innerHTML='<p class="placeholder">Generate your kundali in section 01 first.</p>';document.getElementById("kundali").scrollIntoView({behavior:"smooth"});return;}
const H=s=>((s-C.lagIdx)+12)%12;
const hs=ab=>H(Math.floor(C.planets.find(p=>p.ab===ab).deg/30)%12);
const good=h=>[0,1,3,4,6,8,9,10].includes(h), bad=h=>[5,7,11].includes(h), hn=n=>n+1;
const lord10=SIGN_LORDS[(C.lagIdx+9)%12], lord7=SIGN_LORDS[(C.lagIdx+6)%12];
const l10=lh(lord10), l7=lh(lord7), ve=hs("Ve"), mo=hs("Mo"), ju=hs("Ju"), su=hs("Su"), ma=hs("Ma");
let career='<b>10th house</b> in <b>'+RASHIS[(C.lagIdx+9)%12][0]+'</b>, lord <b>'+lord10+'</b> in house '+hn(l10)+' ('+HOUSE_MEAN[l10]+'). ';
career+=good(l10)?'10th lord strong (kendra/trikona) — <b>steady rise, rank & recognition</b>. ':'10th lord in dusthana — <b>success after struggle</b>; service first, authority later. ';
const ken=C.planets.filter(p=>[0,3,6,9].includes(H(Math.floor(p.deg/30)%12))&&["Su","Ju","Me","Ve"].includes(p.ab)).map(p=>p.n);
career+=ken.length?'Kendra grace: <b>'+ken.join(", ")+'</b>. ':'Saturnian grind path: slow, then unshakeable. ';
career+='<br>Best fields: '+CAREER_FIELDS[lord10];
const rise=C.date.getFullYear()+(good(l10)?27:33);
career+='<br>Career lift near age <b>'+(good(l10)?27:33)+' ('+rise+')</b>; peak <b>'+(rise+9)+'–'+(rise+16)+'</b>.';
const l2=lh(SIGN_LORDS[(C.lagIdx+1)%12]);
let wealth='<b>2nd lord ('+SIGN_LORDS[(C.lagIdx+1)%12]+')</b> in house '+hn(l2)+'; <b>11th</b> in '+RASHIS[(C.lagIdx+10)%12][0]+' lord '+SIGN_LORDS[(C.lagIdx+10)%12]+'. ';
const dh=[l2,H((C.lagIdx+4)%12),H((C.lagIdx+8)%12)].filter(good).length;
wealth+=dh>=2?'<b>Dhana Yoga present</b> — wealth via family + wisdom + fortune. ':'Wealth via <b>self-effort + networks</b>; discipline multiplies it. ';
wealth+=(ju===0||ju===3||ju===6||ju===9)?'Gaja-Kesari hint adds lasting prosperity. ':'Strengthen Guru (Thursday daan, teacher seva). ';
wealth+='<br>Money windows: <b>Dhanya & Siddha</b> Yogini years; avoid speculation in Sankata.';
const dosha=[0,1,3,6,7,11].includes(ma);
let marr='<b>7th</b> in <b>'+RASHIS[(C.lagIdx+6)%12][0]+'</b>, lord <b>'+lord7+'</b> in house '+hn(l7)+'; Shukra in house '+hn(ve)+'. ';
marr+=(good(l7)&&good(ve))?'<b>Harmonious loving union.</b> ':'Love needs patience; maturity fixes all. ';
marr+=dosha?'<br><b>Mangal-Dosha indicated</b> (Mars house '+hn(ma)+') — passion + friction; match charts; Hanuman Chalisa Tuesdays. ':'<br>No Mangal-Dosha from Lagna here. ';
marr+='<br>Spouse ('+lord7+'): '+SPOUSE_HINT[lord7];
const ma2=good(l7)?(C.lagIdx%2?26:27):30;
marr+='<br>Likely window: age <b>'+ma2+'–'+(ma2+3)+'</b>, in Shukra/Guru periods.';
const weak=C.planets.filter(p=>bad(H(Math.floor(p.deg/30)%12))).map(p=>p.n);
let hl='Lagna <b>'+RASHIS[C.lagIdx][0]+'</b>; 6th lord <b>'+SIGN_LORDS[(C.lagIdx+5)%12]+'</b>, 8th sign '+RASHIS[(C.lagIdx+7)%12][0]+'. ';
hl+=weak.length?'Guard: <b>'+weak.join(", ")+'</b> in dusthanas — '+weak.map(w=>PLANETS[w].body.split(".")[0]).join("; ")+'. ':'Good vitality baseline. ';
hl+='<br><b>Goel lens:</b> watch houses '+hn(H((C.lagIdx+5)%12))+' & '+hn(H((C.lagIdx+7)%12))+' + Shashtiamsha Lagna. <i>Educational — doctors diagnose.</i>';
let ch='<b>Lagna '+RASHIS[C.lagIdx][0]+'</b> ('+RASHIS[C.lagIdx][4]+') + Moon in <b>'+RASHIS[C.moonIdx][0]+'</b> + <b>'+NAKSHATRAS[C.nakIdx][0]+'</b> ('+NAKSHATRAS[C.nakIdx][2]+'). ';
ch+='Outer: '+OUTER[C.lagIdx]+'; mind: '+MIND[C.moonIdx]+'. ';
const seq=[];for(let k=0;k<8;k++)seq.push((C.nakIdx+k)%8);
let ageN=(Date.now()-C.date.getTime())/315576e5, cy=Math.floor(ageN/36), rem=ageN-cy*36, ac=0, ci=0;
for(let i=0;i<8;i++){const y=YOGINIS[seq[i]].yrs;if(rem<ac+y){ci=i;break;}ac+=y;}
let cur=new Date(C.date);cur.setFullYear(cur.getFullYear()+cy*36);
for(let i=0;i<ci;i++)cur.setFullYear(cur.getFullYear()+YOGINIS[seq[i]].yrs);
let tl='';
for(let i=0;i<5;i++){const ii=(ci+i)%8, Y=YOGINIS[seq[ii]];const s=new Date(cur), e=new Date(s);e.setFullYear(e.getFullYear()+Y.yrs);
tl+='<div class="tl-item'+(i===0?' now':'')+'"><div class="tl-dot">'+(i===0?'🔥':Y.g)+'</div><div class="tl-body"><b>'+(i===0?'NOW · ':fmt(s)+' → '+fmt(e)+' · ')+Y.n+' ('+Y.lord+', '+Y.yrs+'y)</b><br>'+(i===0?Y.t:Y.q)+'</div></div>';cur=new Date(e);}
window.ASTRO_TEXTS={career,wealth,marr,hl,ch};
const cards=[["💼 Future Career & Job",career],["💰 Wealth & Fortune",wealth],["💍 Marriage & Future Spouse",marr],["🩺 Health Forecast",hl],["🧬 Character & Nature",ch]];
grid.innerHTML=cards.map(c=>'<article class="future-card"><h3>'+c[0]+'</h3><p>'+c[1]+'</p></article>').join("")+'<article class="future-card wide"><h3>🕰️ Your Next 5 Chapters</h3><div class="timeline">'+tl+'</div><p class="disclaimer">🌟 Shastra-based guidance for reflection — karma + effort write the final chapter.</p></article>';
grid.scrollIntoView({behavior:"smooth",block:"nearest"});
});
