import{A as e,O as t,T as n,c as r,d as i,g as a,h as o,k as s,m as c,o as l,s as u,v as d,x as f}from"./pace-C3Wk_-Gn.js";var p=`vec3(0.714, 1.0, 0.102)`,m=()=>({uTime:{value:0},uShow:{value:0}}),h=`
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
uniform float uFace;
uniform float uRings;
uniform float uHatch;
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
  // грань с рисунком: верхняя или передняя (фасад)
  float face = uFace > 0.5 ? smoothstep(0.6, 0.9, no.z) : up;
  float side = 1.0 - smoothstep(0.3, 0.6, abs(no.y));
  // срез — горизонтали; верх — тонкие линии или круги по форме детали; слишком частые гаснут
  float f = mix(uRings > 0.5 ? length(vObj.xz) * uTop : vObj.z * uTop, vObj.y * uStrata, side);
  float w = fwidth(f);
  float dl = abs(fract(f) - 0.5) / max(w, 1e-5);
  float line = (1.0 - smoothstep(0.4, 1.2, dl)) * (1.0 - smoothstep(0.3, 0.55, w));
  bool accent = uKind > 0.5;
  vec3 col = (accent ? vec3(0.2, 0.29, 0.04) : vec3(0.034, 0.042, 0.03)) * (0.45 + 0.65 * lit);
  float ink = line * (0.16 + 0.5 * lit) * uInk;
  float art = 0.0;
  if (uArtOn > 0.5 && face > 0.5) {
    // рисунок на грани: координаты из положения точки, проявляется слева направо; под ним — слабая штриховка
    vec2 uv = uFace > 0.5 ? vec2((vObj.x - uRect.x) / uRect.z, 1.0 - (vObj.y - uRect.y) / uRect.w) : vec2((vObj.x - uRect.x) / uRect.z, (vObj.z - uRect.y) / uRect.w);
    art = texture2D(tArt, vec2(uv.x, 1.0 - uv.y)).a * smoothstep(uv.x - 0.08, uv.x, uReveal * 1.08) * uGain;
    ink = max(art, ink * uHatch);
  }
  if (accent && (up > 0.5 || face > 0.5)) {
    // итоговая деталь: лаймовая грань, рисунок и штриховка на ней тёмные
    col = mix(LIME * (0.9 + 0.1 * lit), vec3(0.05, 0.07, 0.02), clamp(max(art, line * 0.35 * uHatch), 0.0, 1.0) * 0.9);
    col = mix(col, vec3(1.0), uHot * 0.3);
  } else {
    col = mix(col, LIME, clamp(ink * (1.0 + uHot * 1.3), 0.0, 1.0));
    col += LIME * uHot * 0.07;
  }
  float a = uAlpha * uShow;
  gl_FragColor = vec4(col * a, a);
}`,_=(t,r={})=>new n({vertexShader:h,fragmentShader:g,transparent:!0,premultipliedAlpha:!0,uniforms:{uShow:t.uShow,uKind:{value:r.kind??0},uHot:{value:0},uAlpha:{value:r.alpha??1},uStrata:{value:r.strata??14},uTop:{value:r.top??9},uArtOn:{value:+!!r.art},uGain:{value:r.gain??1},uInk:{value:r.ink??1},uFace:{value:+(r.face===`front`)},uRings:{value:+!!r.rings},uHatch:{value:r.hatch??0},uReveal:{value:1},uRect:{value:new e(...r.rect??[0,0,1,1])},tArt:{value:r.art??null}}}),v=(e,t=.5,n=30)=>{let r=new c({color:11992858,transparent:!0,opacity:t}),a=new o(new i(e,n),r);return a.frustumCulled=!1,a},y=(e,t,r,i=0,a=.5)=>{let o=new d(new f(t,r).rotateX(-Math.PI/2),new n({vertexShader:`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`uniform float uShow; uniform float uK; varying vec2 vUv;
      void main() { float d = length((vUv - 0.5) * 2.0); float a = (1.0 - smoothstep(0.25, 1.0, d)) * uK * uShow; gl_FragColor = vec4(vec3(0.0), a); }`,transparent:!0,premultipliedAlpha:!0,depthWrite:!1,uniforms:{uShow:e.uShow,uK:{value:a}}}));return o.position.y=i,o.renderOrder=-1,o},b=(e,t,n)=>{let i=document.createElement(`canvas`);i.width=e,i.height=t;let o=i.getContext(`2d`);if(!o)throw Error(`2d context unavailable`);o.strokeStyle=`#fff`,o.fillStyle=`#fff`,o.lineCap=`round`,o.lineJoin=`round`,n(o,e,t);let s=new r(i);return s.minFilter=a,s.magFilter=a,s.generateMipmaps=!1,s},x=`
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
}`,S=`
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
}`,C=(e,t,n)=>((e*n+t)%1+1)%1*1.7,w=(e,r,i=.2)=>{let a=[],o=[],s=[],c=[],f=[],p=[];for(let{pts:e,phase:t,speed:n}of r){let r=a.length/3,i=e.length-1;e.forEach((l,u)=>{let d=u<i?e[u+1]:l.clone().multiplyScalar(2).sub(e[u-1]);for(let e of[-1,1])a.push(l.x,l.y,l.z),o.push(d.x,d.y,d.z),s.push(e),c.push(u/i),f.push(t,n);if(u<i){let e=r+u*2;p.push(e,e+1,e+2,e+1,e+3,e+2)}})}let m=new u;m.setAttribute(`position`,new l(new Float32Array(a),3)),m.setAttribute(`aNext`,new l(new Float32Array(o),3)),m.setAttribute(`aSide`,new l(new Float32Array(s),1)),m.setAttribute(`aT`,new l(new Float32Array(c),1)),m.setAttribute(`aSeed`,new l(new Float32Array(f),2)),m.setIndex(p);let h=new d(m,new n({vertexShader:x,fragmentShader:S,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,side:2,uniforms:{uTime:e.uTime,uShow:e.uShow,uRes:{value:new t(1,1)},uWidth:{value:1.5},uBase:{value:i}}}));return h.frustumCulled=!1,h},T=`
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
}`,E=(e,t,r,i=1)=>{let a=new d(new f(.16,r),new n({vertexShader:`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:T,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,side:2,uniforms:{uShow:e.uShow,uGain:{value:i}}}));return a.position.set(t.x,t.y+r/2,t.z),a},D=e=>{let t={nx:0,ny:0,inside:!1},n=n=>{if(n.pointerType===`touch`)return;let r=e.getBoundingClientRect();t.nx=Math.max(-1.6,Math.min(1.6,(n.clientX-r.left)/r.width*2-1)),t.ny=Math.max(-1.6,Math.min(1.6,-((n.clientY-r.top)/r.height*2-1))),t.inside=Math.abs(t.nx)<=1&&Math.abs(t.ny)<=1};return window.addEventListener(`pointermove`,n,{passive:!0}),{p:t,off:()=>window.removeEventListener(`pointermove`,n)}},O=(e,t,n,r,i,a=[.94,.9,.9])=>{e.aspect=t,e.updateProjectionMatrix();let o=new s,c=.5,l=60;for(let t=0;t<26;t++){let t=(c+l)/2;e.position.copy(n).addScaledVector(r,t),e.lookAt(n),e.updateMatrixWorld();let s=!1;for(let t of i)o.copy(t).project(e),(Math.abs(o.x)>a[0]||o.y>a[1]||o.y<-a[2])&&(s=!0);s?c=t:l=t}e.position.copy(n).addScaledVector(r,l),e.lookAt(n),e.updateMatrixWorld()},k=(e,t)=>{let n=[];e.forEach((e,r)=>{e&&t[r]&&n.push({el:e,at:t[r],x:-9,y:-9,shown:-1})});let r=new s,i=n.map(()=>({x:0,y:0})),a=0;return{place:(e,t,o,s)=>{a=s,n.forEach((n,a)=>{r.copy(n.at).applyMatrix4(e.matrixWorld).project(t),i[a].x=(r.x*.5+.5)*o.cssW,i[a].y=(-r.y*.5+.5)*o.cssH})},write:()=>n.forEach((e,t)=>{let{x:n,y:r}=i[t];(Math.abs(n-e.x)>.25||Math.abs(r-e.y)>.25)&&(e.x=n,e.y=r,e.el.style.transform=`translate3d(${n.toFixed(1)}px, ${r.toFixed(1)}px, 0)`),a!==e.shown&&(e.shown=a,e.el.style.opacity=String(a))})}},A=()=>new Promise(e=>setTimeout(e,0)),j=e=>1-(1-Math.max(0,Math.min(1,e)))**3;export{O as a,v as c,y as d,m as f,_ as i,D as l,E as n,C as o,k as p,j as r,A as s,b as t,w as u};