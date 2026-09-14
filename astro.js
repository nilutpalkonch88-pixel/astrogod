/* REAL VEDIC ASTRONOMY ENGINE — low-precision series, Lahiri ayanamsa */
const RAD=Math.PI/180, DEG=180/Math.PI;
function jdUTC(y,mo,d,h,mi){if(mo<=2){y--;mo+=12;}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(mo+1))+d+B-1524.5+(h+mi/60)/24;}
function ayanamsa(date){return 23.85+(date.getFullYear()-2000)*0.0139;}
function sunTropical(jd){const T=(jd-2451545)/36525;let L=280.46646+36000.76983*T+0.0003032*T*T;L%=360;if(L<0)L+=360;const M=(357.52911+35999.05029*T-0.0001537*T*T)%360;return (L+1.9148*Math.sin(M*RAD)+0.02*Math.sin(2*M*RAD))%360;}
function planetTropical(name,jd){
const T=(jd-2451545)/36525;
const el={Mercury:[252.25,149472.68,0.2056,48.33,29.12,7.0],Venus:[181.98,58517.8,0.0068,76.68,54.88,3.39],Mars:[355.45,19140.3,0.0934,49.56,286.5,1.85],Jupiter:[34.4,3034.75,0.0484,100.49,273.87,1.3],Saturn:[50.08,1222.11,0.0557,113.66,339.39,2.49]}[name];
if(!el)return 0;
const a={Mercury:.387,Venus:.723,Mars:1.524,Jupiter:5.203,Saturn:9.537}[name];
let L=(el[0]+el[1]*T)%360;const e=el[2],Om=el[3],w=el[4],inc=el[5];
const M=((L-w)%360+360)%360, E=M+e*DEG*Math.sin(M*RAD);
const xv=a*(Math.cos(E*RAD)-e), yv=a*Math.sqrt(1-e*e)*Math.sin(E*RAD);
const v=Math.atan2(yv,xv)*DEG, r=Math.hypot(xv,yv);
const Es=sunTropical(jd), Rs=1.0;
const xs=Rs*Math.cos(Es*RAD), ys=Rs*Math.sin(Es*RAD);
const xh=r*(Math.cos(Om*RAD)*Math.cos((v+w)*RAD)-Math.sin(Om*RAD)*Math.sin((v+w)*RAD)*Math.cos(inc*RAD));
const yh=r*(Math.sin(Om*RAD)*Math.cos((v+w)*RAD)+Math.cos(Om*RAD)*Math.sin((v+w)*RAD)*Math.cos(inc*RAD));
const xg=xh+xs, yg=yh+ys;
return ((Math.atan2(yg,xg)*DEG)%360+360)%360;
}
function moonTropical(jd){const T=(jd-2451545)/36525;const L=(218.316+13.176396* (jd-2451545))%360;const M=((134.963+13.064993*(jd-2451545))%360+360)%360;const Ms=((357.529+0.98560028*(jd-2451545))%360+360)%360;const F=((93.272+13.229350*(jd-2451545))%360+360)%360;let lo=L+6.289*Math.sin(M*RAD)+1.274*Math.sin((2*(L-Ms)+M)*RAD)+0.658*Math.sin(2*(L-Ms)*RAD)-0.186*Math.sin(Ms*RAD)-0.114*Math.sin(2*F*RAD);return ((lo%360)+360)%360;}
export function realChart(y,mo,d,h,mi){
const jd=jdUTC(y,mo,d,h,mi), ay=ayanamsa(new Date(y,mo-1,d));
const sid=l=>((l-ay)%360+360)%360;
const su=sid(sunTropical(jd)), moo=sid(moonTropical(jd));
const me=sid(planetTropical("Mercury",jd)), ve=sid(planetTropical("Venus",jd));
const ma=sid(planetTropical("Mars",jd)), ju=sid(planetTropical("Jupiter",jd)), sa=sid(planetTropical("Saturn",jd));
const rahu=sid((125.045-0.0529539*(jd-2451545))%360);
const ketu=(rahu+180)%360;
const lst=(((jd-2451545)/36525*36000.76983+280.4606)%360+360)%360+(h+mi/60)*15;
const asc=sid((lst+90)%360);
return {Su:su,Mo:moo,Ma:ma,Me:me,Ju:ju,Ve:ve,Sa:sa,Ra:((rahu%360)+360)%360,Ke:ketu,Asc:((asc%360)+360)%360,jd,ay};
}
export function signOf(deg){return Math.floor((((deg%360)+360)%360)/30)%12;}
export function padaOf(deg){return Math.floor((((deg%360)+360)%360%30)/3.333333)+1;}
export function nakOf(deg){return Math.floor((((deg%360)+360)%360)/13.333333)%27;}
