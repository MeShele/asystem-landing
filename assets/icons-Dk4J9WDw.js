import{A as e,T as t,c as n,d as r,g as i,h as a,j as o,k as s,m as c,o as l,s as u,v as d,x as f}from"./pace-CDXBADp_.js";var p=`vec3(0.714, 1.0, 0.102)`,m={lime:[.714,1,.102],amber:[1,.74,.2],ice:[.86,.95,.9]},h={lime:`#B6FF1A`,amber:`#FFBD33`,ice:`#DBF2E6`},g=()=>({uTime:{value:0},uShow:{value:0}}),_=`
varying vec3 vObj;
varying vec3 vNo;
varying vec3 vNw;
void main() {
  vObj = position; vNo = normal;
  vNw = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,v=`
uniform float uShow;
uniform float uKind;
uniform float uHot;
uniform float uAlpha;
uniform float uStrata;
uniform float uTop;
uniform float uArtOn;
uniform float uGain;
uniform float uInk;
uniform float uFace;
uniform float uRings;
uniform float uHatch;
uniform float uReveal;
uniform vec4 uRect;
uniform vec3 uTint;
uniform float uArtRgb;
uniform float uFill;
uniform sampler2D tArt;
varying vec3 vObj;
varying vec3 vNo;
varying vec3 vNw;
void main() {
  vec3 LIME = uTint;
  vec3 no = normalize(vNo);
  float lit = 0.32 + 0.68 * clamp(dot(normalize(vNw), normalize(vec3(-0.5, 0.75, 0.45))), 0.0, 1.0);
  float up = smoothstep(0.6, 0.9, no.y);
  // грань с рисунком: верхняя или передняя (фасад)
  float face = uFace > 0.5 ? smoothstep(0.6, 0.9, no.z) : up;
  float side = 1.0 - smoothstep(0.3, 0.6, abs(no.y));
  // срез — горизонтали; верх — тонкие линии или круги по форме детали; слишком частые гаснут
  float f = mix(uRings > 0.5 ? length(vObj.xz) * uTop : vObj.z * uTop, vObj.y * uStrata, side);
  float w = fwidth(f);
  float dl = abs(fract(f) - 0.5) / max(w, 1e-5);
  float line = (1.0 - smoothstep(0.4, 1.2, dl)) * (1.0 - smoothstep(0.3, 0.55, w));
  bool accent = uKind > 0.5;
  vec3 col = (accent ? LIME * 0.28 : vec3(0.034, 0.042, 0.03)) * (0.45 + 0.65 * lit);
  float ink = line * (0.16 + 0.5 * lit) * uInk;
  float art = 0.0;
  vec3 paint = LIME;
  if (uArtOn > 0.5 && face > 0.5) {
    // рисунок на грани: координаты из положения точки, проявляется слева направо; под ним — слабая штриховка
    vec2 uv = uFace > 0.5 ? vec2((vObj.x - uRect.x) / uRect.z, 1.0 - (vObj.y - uRect.y) / uRect.w) : vec2((vObj.x - uRect.x) / uRect.z, (vObj.z - uRect.y) / uRect.w);
    vec4 tex = texture2D(tArt, vec2(uv.x, 1.0 - uv.y));
    art = tex.a * smoothstep(uv.x - 0.08, uv.x, uReveal * 1.08) * uGain;
    float under = ink * uHatch;
    // цветной рисунок: краска берётся из самой текстуры, штриховка под ним остаётся цвета детали
    if (uArtRgb > 0.5) paint = mix(LIME, tex.rgb, clamp(art / max(art + under, 1e-4), 0.0, 1.0));
    ink = max(art, under);
  }
  if (accent && (up > 0.5 || face > 0.5 || uFill > 0.5)) {
    // залитая деталь: грань цвета краски, рисунок и штриховка на ней тёмные; у залитой целиком бока темнее по свету
    float shade = up > 0.5 || face > 0.5 ? 0.9 + 0.1 * lit : 0.42 + 0.58 * lit;
    col = mix(LIME * shade, vec3(0.05, 0.07, 0.02), clamp(max(art, line * 0.35 * uHatch), 0.0, 1.0) * 0.9);
    col = mix(col, vec3(1.0), uHot * 0.3);
  } else {
    col = mix(col, paint, clamp(ink * (1.0 + uHot * 1.3), 0.0, 1.0));
    col += LIME * uHot * 0.07;
  }
  float a = uAlpha * uShow;
  gl_FragColor = vec4(col * a, a);
}`,y=(n,r={})=>new t({vertexShader:_,fragmentShader:v,transparent:!0,premultipliedAlpha:!0,uniforms:{uShow:n.uShow,uKind:{value:r.kind??0},uHot:{value:0},uAlpha:{value:r.alpha??1},uStrata:{value:r.strata??14},uTop:{value:r.top??9},uArtOn:{value:+!!r.art},uGain:{value:r.gain??1},uInk:{value:r.ink??1},uFace:{value:+(r.face===`front`)},uRings:{value:+!!r.rings},uHatch:{value:r.hatch??0},uReveal:{value:1},uRect:{value:new o(...r.rect??[0,0,1,1])},tArt:{value:r.art??null},uTint:{value:new e(...r.tint??m.lime)},uArtRgb:{value:+!!r.rgb},uFill:{value:+!!r.fill}}}),b=(e,t=.5,n=30,i=h.lime)=>{let o=new c({color:i,transparent:!0,opacity:t}),s=new a(new r(e,n),o);return s.frustumCulled=!1,s},x=(e,n,r,i=0,a=.5)=>{let o=new d(new f(n,r).rotateX(-Math.PI/2),new t({vertexShader:`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`uniform float uShow; uniform float uK; varying vec2 vUv;
      void main() { float d = length((vUv - 0.5) * 2.0); float a = (1.0 - smoothstep(0.25, 1.0, d)) * uK * uShow; gl_FragColor = vec4(vec3(0.0), a); }`,transparent:!0,premultipliedAlpha:!0,depthWrite:!1,uniforms:{uShow:e.uShow,uK:{value:a}}}));return o.position.y=i,o.renderOrder=-1,o},S=(e,t,r)=>{let a=document.createElement(`canvas`);a.width=e,a.height=t;let o=a.getContext(`2d`);if(!o)throw Error(`2d context unavailable`);o.strokeStyle=`#fff`,o.fillStyle=`#fff`,o.lineCap=`round`,o.lineJoin=`round`,r(o,e,t);let s=new n(a);return s.minFilter=i,s.magFilter=i,s.generateMipmaps=!1,s},C=`
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
}`,w=`
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
}`,T=(e,t,n)=>((e*n+t)%1+1)%1*1.7,E=(e,n,r=.2)=>{let i=[],a=[],o=[],c=[],f=[],p=[];for(let{pts:e,phase:t,speed:r}of n){let n=i.length/3,s=e.length-1;e.forEach((l,u)=>{let d=u<s?e[u+1]:l.clone().multiplyScalar(2).sub(e[u-1]);for(let e of[-1,1])i.push(l.x,l.y,l.z),a.push(d.x,d.y,d.z),o.push(e),c.push(u/s),f.push(t,r);if(u<s){let e=n+u*2;p.push(e,e+1,e+2,e+1,e+3,e+2)}})}let m=new u;m.setAttribute(`position`,new l(new Float32Array(i),3)),m.setAttribute(`aNext`,new l(new Float32Array(a),3)),m.setAttribute(`aSide`,new l(new Float32Array(o),1)),m.setAttribute(`aT`,new l(new Float32Array(c),1)),m.setAttribute(`aSeed`,new l(new Float32Array(f),2)),m.setIndex(p);let h=new d(m,new t({vertexShader:C,fragmentShader:w,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,side:2,uniforms:{uTime:e.uTime,uShow:e.uShow,uRes:{value:new s(1,1)},uWidth:{value:1.5},uBase:{value:r}}}));return h.frustumCulled=!1,h},D=`
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
}`,O=(e,n,r,i=1)=>{let a=new d(new f(.16,r),new t({vertexShader:`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:D,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,side:2,uniforms:{uShow:e.uShow,uGain:{value:i}}}));return a.position.set(n.x,n.y+r/2,n.z),a},k=e=>{let t={nx:0,ny:0,inside:!1},n=n=>{if(n.pointerType===`touch`)return;let r=e.getBoundingClientRect();t.nx=Math.max(-1.6,Math.min(1.6,(n.clientX-r.left)/r.width*2-1)),t.ny=Math.max(-1.6,Math.min(1.6,-((n.clientY-r.top)/r.height*2-1))),t.inside=Math.abs(t.nx)<=1&&Math.abs(t.ny)<=1};return window.addEventListener(`pointermove`,n,{passive:!0}),{p:t,off:()=>window.removeEventListener(`pointermove`,n)}},A=(t,n,r,i,a,o=[.94,.9,.9])=>{t.aspect=n,t.updateProjectionMatrix();let s=new e,c=.5,l=60;for(let e=0;e<26;e++){let e=(c+l)/2;t.position.copy(r).addScaledVector(i,e),t.lookAt(r),t.updateMatrixWorld();let n=!1;for(let e of a)s.copy(e).project(t),(Math.abs(s.x)>o[0]||s.y>o[1]||s.y<-o[2])&&(n=!0);n?c=e:l=e}t.position.copy(r).addScaledVector(i,l),t.lookAt(r),t.updateMatrixWorld()},j=(t,n)=>{let r=[];t.forEach((e,t)=>{e&&n[t]&&r.push({el:e,at:n[t],x:-9,y:-9,shown:-1})});let i=new e,a=r.map(()=>({x:0,y:0})),o=0;return{place:(e,t,n,s)=>{o=s,r.forEach((r,o)=>{i.copy(r.at).applyMatrix4(e.matrixWorld).project(t),a[o].x=(i.x*.5+.5)*n.cssW,a[o].y=(-i.y*.5+.5)*n.cssH})},write:()=>r.forEach((e,t)=>{let{x:n,y:r}=a[t];(Math.abs(n-e.x)>.25||Math.abs(r-e.y)>.25)&&(e.x=n,e.y=r,e.el.style.transform=`translate3d(${n.toFixed(1)}px, ${r.toFixed(1)}px, 0)`),o!==e.shown&&(e.shown=o,e.el.style.opacity=String(o))})}},M=()=>Promise.race([Promise.all([`600 40px Unbounded`,`500 40px Unbounded`].map(e=>document.fonts.load(e,`Сс KGS USDT 09`))),new Promise(e=>setTimeout(e,1800))]).then(()=>void 0,()=>void 0),N=(e,t=600)=>`${t} ${e}px Unbounded, Onest, system-ui, sans-serif`,P=()=>new Promise(e=>setTimeout(e,0)),F=e=>1-(1-Math.max(0,Math.min(1,e)))**3,I={userCheck:[[`path`,`M2 21a8 8 0 0 1 13.292-6`],[`circle`,10,8,5],[`path`,`m16 19 2 2 4-4`]],searchCheck:[[`path`,`m8 11 2 2 4-4`],[`circle`,11,11,8],[`path`,`m21 21-4.3-4.3`]],server:[[`rect`,2,2,20,8,2],[`rect`,2,14,20,8,2],[`path`,`M6 6h.01`],[`path`,`M6 18h.01`]],fileChart:[[`path`,`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`],[`path`,`M14 2v5a1 1 0 0 0 1 1h5`],[`path`,`M8 18v-1`],[`path`,`M12 18v-6`],[`path`,`M16 18v-3`]],fileText:[[`path`,`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`],[`path`,`M14 2v5a1 1 0 0 0 1 1h5`],[`path`,`M10 9H8`],[`path`,`M16 13H8`],[`path`,`M16 17H8`]],lock:[[`circle`,12,16,1],[`rect`,3,10,18,12,2],[`path`,`M7 10V7a5 5 0 0 1 10 0v3`]],handshake:[[`path`,`m11 17 2 2a1 1 0 1 0 3-3`],[`path`,`m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4`],[`path`,`m21 3 1 11h-2`],[`path`,`M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3`],[`path`,`M3 4h8`]],sliders:[[`path`,`M10 5H3`],[`path`,`M12 19H3`],[`path`,`M14 3v4`],[`path`,`M16 17v4`],[`path`,`M21 12h-9`],[`path`,`M21 19h-5`],[`path`,`M21 5h-7`],[`path`,`M8 10v4`],[`path`,`M8 12H3`]],bitcoin:[[`path`,`M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727`]]},L=(e,t,n,r,i,a=2)=>{e.save(),e.translate(n,r),e.scale(i/24,i/24),e.lineWidth=a,e.lineCap=`round`,e.lineJoin=`round`;for(let n of t)n[0]===`path`?e.stroke(new Path2D(n[1])):n[0]===`circle`?(e.beginPath(),e.arc(n[1],n[2],n[3],0,Math.PI*2),e.stroke()):n[0]===`ellipse`?(e.beginPath(),e.ellipse(n[1],n[2],n[3],n[4],0,0,Math.PI*2),e.stroke()):(e.beginPath(),e.roundRect(n[1],n[2],n[3],n[4],n[5]),e.stroke());e.restore()};export{x as _,m as a,F as c,A as d,T as f,E as g,k as h,h as i,y as l,b as m,L as n,S as o,P as p,N as r,O as s,I as t,M as u,g as v,j as y};