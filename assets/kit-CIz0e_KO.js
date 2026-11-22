import{A as e,E as t,S as n,_ as r,c as i,d as a,g as o,h as s,j as c,k as l,o as u,s as d,y as f}from"./pace-CK9a3ieE.js";var p=`vec3(0.714, 1.0, 0.102)`,m=()=>({uTime:{value:0},uShow:{value:0}}),h=`
varying vec3 vObj;
varying vec3 vNo;
varying vec3 vNw;
void main() {
  vObj = position; vNo = normal;
  vNw = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,g=`
uniform float uShow;
uniform float uKind;
uniform float uHot;
uniform float uAlpha;
uniform float uStrata;
uniform float uTop;
uniform float uArtOn;
uniform float uGain;
uniform float uInk;
uniform float uReveal;
uniform vec4 uRect;
uniform sampler2D tArt;
varying vec3 vObj;
varying vec3 vNo;
varying vec3 vNw;
const vec3 LIME = ${p};
void main() {
  vec3 no = normalize(vNo);
  float lit = 0.32 + 0.68 * clamp(dot(normalize(vNw), normalize(vec3(-0.5, 0.75, 0.45))), 0.0, 1.0);
  float up = smoothstep(0.6, 0.9, no.y);
  float side = 1.0 - smoothstep(0.3, 0.6, abs(no.y));
  // срез — горизонтали, верх — тонкие линии; слишком частые гаснут
  float f = mix(vObj.z * uTop, vObj.y * uStrata, side);
  float w = fwidth(f);
  float dl = abs(fract(f) - 0.5) / max(w, 1e-5);
  float line = (1.0 - smoothstep(0.4, 1.2, dl)) * (1.0 - smoothstep(0.3, 0.55, w));
  bool accent = uKind > 0.5;
  vec3 col = (accent ? vec3(0.2, 0.29, 0.04) : vec3(0.034, 0.042, 0.03)) * (0.45 + 0.65 * lit);
  float ink = line * (0.16 + 0.5 * lit) * uInk;
  float art = 0.0;
  if (uArtOn > 0.5 && up > 0.5) {
    // рисунок на верхней грани: координаты из положения точки, проявляется слева направо
    vec2 uv = vec2((vObj.x - uRect.x) / uRect.z, (vObj.z - uRect.y) / uRect.w);
    art = texture2D(tArt, vec2(uv.x, 1.0 - uv.y)).a * smoothstep(uv.x - 0.08, uv.x, uReveal * 1.08) * uGain;
    ink = art;
  }
  if (accent && up > 0.5) {
    // итоговая деталь: лаймовый верх, рисунок на нём тёмный
    col = mix(LIME * (0.9 + 0.1 * lit), vec3(0.05, 0.07, 0.02), clamp(art, 0.0, 1.0) * 0.9);
    col = mix(col, vec3(1.0), uHot * 0.3);
  } else {
    col = mix(col, LIME, clamp(ink * (1.0 + uHot * 1.3), 0.0, 1.0));
    col += LIME * uHot * 0.07;
  }
  float a = uAlpha * uShow;
  gl_FragColor = vec4(col * a, a);
}`,_=(e,n={})=>new t({vertexShader:h,fragmentShader:g,transparent:!0,premultipliedAlpha:!0,uniforms:{uShow:e.uShow,uKind:{value:n.kind??0},uHot:{value:0},uAlpha:{value:n.alpha??1},uStrata:{value:n.strata??14},uTop:{value:n.top??9},uArtOn:{value:+!!n.art},uGain:{value:n.gain??1},uInk:{value:n.ink??1},uReveal:{value:1},uRect:{value:new c(...n.rect??[0,0,1,1])},tArt:{value:n.art??null}}}),v=(e,t=.5,n=30)=>{let r=new s({color:11992858,transparent:!0,opacity:t}),i=new o(new a(e,n),r);return i.frustumCulled=!1,i},y=(e,t,n)=>{let a=document.createElement(`canvas`);a.width=e,a.height=t;let o=a.getContext(`2d`);if(!o)throw Error(`2d context unavailable`);o.strokeStyle=`#fff`,o.fillStyle=`#fff`,o.lineCap=`round`,o.lineJoin=`round`,n(o,e,t);let s=new i(a);return s.minFilter=r,s.magFilter=r,s.generateMipmaps=!1,s},b=`
attribute vec3 aNext;
attribute float aSide;
attribute float aT;
attribute vec2 aSeed;
uniform vec2 uRes;
uniform float uWidth;
varying float vT;
varying float vSide;
varying vec2 vSeed;
void main() {
  vec4 c = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 n = projectionMatrix * modelViewMatrix * vec4(aNext, 1.0);
  vec2 dir = normalize((n.xy / n.w - c.xy / c.w) * uRes + vec2(1e-5, 0.0));
  c.xy += vec2(-dir.y, dir.x) * aSide * uWidth / uRes * 2.0 * c.w;
  gl_Position = c;
  vT = aT; vSide = aSide; vSeed = aSeed;
}`,x=`
uniform float uTime;
uniform float uShow;
uniform float uBase;
varying float vT;
varying float vSide;
varying vec2 vSeed;
const vec3 LIME = ${p};
void main() {
  float core = smoothstep(1.0, 0.2, abs(vSide));
  // импульс идёт от начала пути к концу, за ним гаснущий хвост; между рейсами пауза
  float head = fract(uTime * vSeed.y + vSeed.x) * 1.7;
  float dt = head - vT;
  float comet = dt > 0.0 ? exp(-dt * 7.0) * smoothstep(0.0, 0.012, dt) : 0.0;
  float a = (uBase + comet * 0.95) * core * uShow;
  gl_FragColor = vec4(mix(LIME, vec3(1.0), comet * 0.45) * a, a);
}`,S=(e,t,n)=>((e*n+t)%1+1)%1*1.7,C=(e,n,r=.2)=>{let i=[],a=[],o=[],s=[],c=[],p=[];for(let{pts:e,phase:t,speed:r}of n){let n=i.length/3,l=e.length-1;e.forEach((u,d)=>{let f=d<l?e[d+1]:u.clone().multiplyScalar(2).sub(e[d-1]);for(let e of[-1,1])i.push(u.x,u.y,u.z),a.push(f.x,f.y,f.z),o.push(e),s.push(d/l),c.push(t,r);if(d<l){let e=n+d*2;p.push(e,e+1,e+2,e+1,e+3,e+2)}})}let m=new d;m.setAttribute(`position`,new u(new Float32Array(i),3)),m.setAttribute(`aNext`,new u(new Float32Array(a),3)),m.setAttribute(`aSide`,new u(new Float32Array(o),1)),m.setAttribute(`aT`,new u(new Float32Array(s),1)),m.setAttribute(`aSeed`,new u(new Float32Array(c),2)),m.setIndex(p);let h=new f(m,new t({vertexShader:b,fragmentShader:x,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,side:2,uniforms:{uTime:e.uTime,uShow:e.uShow,uRes:{value:new l(1,1)},uWidth:{value:1.5},uBase:{value:r}}}));return h.frustumCulled=!1,h},w=`
uniform float uShow;
uniform float uGain;
varying vec2 vUv;
const vec3 LIME = ${p};
void main() {
  float x = abs(vUv.x - 0.5) * 2.0;
  float fade = pow(1.0 - vUv.y, 1.3) * smoothstep(0.0, 0.03, vUv.y);
  float core = exp(-x * x * 220.0);
  float a = (exp(-x * x * 9.0) * 0.22 + core * 0.8) * fade * uShow * uGain;
  gl_FragColor = vec4(mix(LIME, vec3(1.0), core * 0.5) * a, a);
}`,T=(e,r,i,a=1)=>{let o=new f(new n(.16,i),new t({vertexShader:`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:w,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,side:2,uniforms:{uShow:e.uShow,uGain:{value:a}}}));return o.position.set(r.x,r.y+i/2,r.z),o},E=e=>{let t={nx:0,ny:0,inside:!1},n=n=>{if(n.pointerType===`touch`)return;let r=e.getBoundingClientRect();t.nx=Math.max(-1.6,Math.min(1.6,(n.clientX-r.left)/r.width*2-1)),t.ny=Math.max(-1.6,Math.min(1.6,-((n.clientY-r.top)/r.height*2-1))),t.inside=Math.abs(t.nx)<=1&&Math.abs(t.ny)<=1};return window.addEventListener(`pointermove`,n,{passive:!0}),{p:t,off:()=>window.removeEventListener(`pointermove`,n)}},D=(t,n,r,i,a,o=[.94,.9,.9])=>{t.aspect=n,t.updateProjectionMatrix();let s=new e,c=.5,l=60;for(let e=0;e<26;e++){let e=(c+l)/2;t.position.copy(r).addScaledVector(i,e),t.lookAt(r),t.updateMatrixWorld();let n=!1;for(let e of a)s.copy(e).project(t),(Math.abs(s.x)>o[0]||s.y>o[1]||s.y<-o[2])&&(n=!0);n?c=e:l=e}t.position.copy(r).addScaledVector(i,l),t.lookAt(r),t.updateMatrixWorld()},O=(t,n)=>{let r=[];t.forEach((e,t)=>{e&&n[t]&&r.push({el:e,at:n[t],x:-9,y:-9,shown:-1})});let i=new e,a=r.map(()=>({x:0,y:0})),o=0;return{place:(e,t,n,s)=>{o=s,r.forEach((r,o)=>{i.copy(r.at).applyMatrix4(e.matrixWorld).project(t),a[o].x=(i.x*.5+.5)*n.cssW,a[o].y=(-i.y*.5+.5)*n.cssH})},write:()=>r.forEach((e,t)=>{let{x:n,y:r}=a[t];(Math.abs(n-e.x)>.25||Math.abs(r-e.y)>.25)&&(e.x=n,e.y=r,e.el.style.transform=`translate3d(${n.toFixed(1)}px, ${r.toFixed(1)}px, 0)`),o!==e.shown&&(e.shown=o,e.el.style.opacity=String(o))})}},k=()=>new Promise(e=>setTimeout(e,0)),A=e=>1-(1-Math.max(0,Math.min(1,e)))**3;export{_ as a,k as c,C as d,m as f,A as i,v as l,y as n,D as o,O as p,T as r,S as s,p as t,E as u};