import{A as e,C as t,O as n,S as r,T as i,_ as a,b as o,g as s,k as c,o as l,p as u,s as d,u as f,v as p,w as m,x as h}from"./pace-CDXBADp_.js";import{i as g,n as _,t as ee}from"./reliefData-DzQUuJtr.js";import{t as te}from"./live-2jjXdT65.js";var ne=.25,re=.055,v=`vec3(0.714, 1.0, 0.102)`,y=[74.59,42.87],ie=[[72.8,40.53],[73,40.93],[78.39,42.49],[76,41.43],[72.24,42.52],[70.82,40.06],[77.08,42.65]],b=`
uniform float uIntro;
float introK(float u) { return clamp(uIntro * 1.7 - u * 0.7, 0.0, 1.0); }
float introRise(float k) { return 1.0 - pow(1.0 - k, 3.0); }`,ae=`
attribute float aH;
uniform float uHScale;
${b}
varying vec2 vUv;
varying float vH;
varying float vShow;
void main() {
  vUv = uv;
  vH = aH;
  float k = introK(uv.x);
  vShow = smoothstep(0.0, 0.3, k);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, aH * uHScale * introRise(k), position.z, 1.0);
}`,oe=`
uniform sampler2D tData;
uniform vec2 uTexel;
uniform float uTime;
uniform float uRows;
uniform float uLine;
uniform vec3 uPointer;
uniform vec2 uCity;
varying vec2 vUv;
varying float vH;
varying float vShow;
const vec3 LIME = ${v};
const vec3 SNOW = vec3(0.94, 1.0, 0.82);
const vec3 BODY = vec3(0.026, 0.034, 0.022);
void main() {
  vec4 d = texture2D(tData, vUv);
  float sdB = (d.g * 2.0 - 1.0) * 16.0;
  float sdL = (d.b * 2.0 - 1.0) * 8.0;
  float pxB = sdB / max(fwidth(sdB), 1e-4);
  if (pxB < -1.0) discard;
  float inside = clamp(pxB + 0.5, 0.0, 1.0);
  float pxL = sdL / max(fwidth(sdL), 1e-4);
  float lake = clamp(pxL + 0.5, 0.0, 1.0);

  // склоны: свет с запада-юго-запада
  float hL = texture2D(tData, vUv - vec2(uTexel.x, 0.0)).r, hR = texture2D(tData, vUv + vec2(uTexel.x, 0.0)).r;
  float hU = texture2D(tData, vUv - vec2(0.0, uTexel.y)).r, hD = texture2D(tData, vUv + vec2(0.0, uTexel.y)).r;
  float shade = clamp(0.78 + dot(vec2(hR - hL, hD - hU), vec2(1.0, -0.6)) * 7.0, 0.36, 1.3);

  // линии широт постоянной экранной толщины; слишком частые гаснут
  float fv = vUv.y * uRows;
  float wv = fwidth(fv);
  float dl = abs(fract(fv) - 0.5) / max(wv, 1e-5);
  float dense = 1.0 - smoothstep(0.26, 0.5, wv);
  float line = (1.0 - smoothstep(uLine - 0.55, uLine + 0.55, dl)) * dense;
  float halo = exp(-dl * dl * 0.16) * dense;

  float alt = smoothstep(0.03, 0.6, vH);
  float lit = mix(0.46, 1.0, alt) * shade;
  lit *= mix(1.0, 0.55, lake);

  // волны от сервера и подсветка под курсором
  vec2 q = (vUv - uCity) * vec2(2.0, 1.0);
  float r = length(q);
  float ring = pow(max(0.0, 1.0 - abs(fract(r * 4.2 - uTime * 0.42) - 0.5) * 2.0), 8.0) * exp(-r * 3.0);
  vec2 pq = (vUv - uPointer.xy) * vec2(2.0, 1.0);
  float spot = exp(-dot(pq, pq) * 42.0) * uPointer.z;
  lit += ring * 0.9 + spot * 0.9;

  vec3 col = BODY + LIME * (0.018 + 0.06 * alt + 0.06 * spot);
  col = mix(col, vec3(0.012, 0.03, 0.03), lake * 0.85);
  float alpha = 0.86;
  vec3 lcol = mix(LIME, SNOW, smoothstep(0.5, 0.86, vH) * (1.0 - lake));
  float l = clamp(line * lit, 0.0, 1.0) * vShow;
  col += LIME * halo * lit * 0.13 * vShow;
  col = mix(col, lcol, l);
  alpha = mix(alpha, 1.0, l);
  col += LIME * ring * 0.22 * vShow;

  // берег озёр и граница страны
  float shore = (1.0 - smoothstep(0.5, 1.5, abs(pxL))) * 0.7;
  col = mix(col, LIME, shore * vShow);
  float edge = 1.0 - smoothstep(0.9, 1.9, abs(pxB));
  col = mix(col, mix(LIME, SNOW, 0.35), edge * vShow);

  float a = alpha * inside * smoothstep(0.0, 0.2, vShow + 0.001);
  gl_FragColor = vec4(col * a, a);
}`,se=`
attribute float aH;
attribute float aDown;
uniform float uHScale;
uniform float uDepth;
${b}
varying float vY;
varying float vTop;
varying float vShow;
void main() {
  float k = introK(uv.x);
  vShow = smoothstep(0.0, 0.3, k);
  vTop = aH * uHScale * introRise(k);
  vY = mix(vTop, -uDepth, aDown);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, vY, position.z, 1.0);
}`,ce=`
uniform float uDepth;
uniform float uStep;
varying float vY;
varying float vTop;
varying float vShow;
const vec3 LIME = ${v};
const vec3 BODY = vec3(0.026, 0.034, 0.022);
void main() {
  // срез макета: горизонтали через равный шаг высоты, ярче у поверхности
  float f = (vY + uDepth) / uStep;
  float w = fwidth(f);
  float dl = abs(fract(f) - 0.5) / max(w, 1e-5);
  float strata = (1.0 - smoothstep(0.35, 1.25, dl)) * (1.0 - smoothstep(0.3, 0.55, w));
  float near = smoothstep(-uDepth, max(vTop, 0.01), vY);
  vec3 col = BODY * 0.8 + LIME * 0.035 * near;
  col = mix(col, LIME, strata * mix(0.1, 0.5, near) * vShow);
  float a = 0.94 * smoothstep(0.0, 0.2, vShow + 0.001) * smoothstep(-uDepth, -uDepth + fwidth(vY) * 1.5, vY);
  gl_FragColor = vec4(col * a, a);
}`,le=`
uniform sampler2D tData;
uniform float uIntro;
varying vec2 vUv;
const vec3 LIME = ${v};
void main() {
  float sdB = (texture2D(tData, vUv).g * 2.0 - 1.0) * 16.0;
  float dark = smoothstep(-15.0, 2.0, sdB) * 0.6;
  float rim = exp(-abs(sdB + 3.0) * 0.26) * 0.16;
  float a = clamp(dark + rim, 0.0, 1.0) * uIntro;
  gl_FragColor = vec4(LIME * rim * uIntro, a);
}`,ue=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,de=`
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
}`,fe=`
uniform float uTime;
uniform float uShow;
varying float vT;
varying float vSide;
varying vec2 vSeed;
const vec3 LIME = ${v};
void main() {
  float core = smoothstep(1.0, 0.2, abs(vSide));
  // импульс идёт от города к серверу, за ним гаснущий хвост; между рейсами пауза
  float head = fract(uTime * vSeed.y + vSeed.x) * 1.7;
  float dt = head - vT;
  float comet = dt > 0.0 ? exp(-dt * 7.0) * smoothstep(0.0, 0.012, dt) : 0.0;
  float ends = smoothstep(0.0, 0.05, vT) * smoothstep(1.0, 0.95, vT);
  float a = (0.2 + comet * 0.95) * core * ends * uShow;
  vec3 col = mix(LIME, vec3(1.0), comet * 0.45);
  gl_FragColor = vec4(col * a, a);
}`,pe=`
attribute float aSize;
uniform float uDpr;
uniform float uTime;
varying float vBig;
void main() {
  vBig = step(9.0, aSize);
  float pulse = 1.0 + vBig * 0.14 * sin(uTime * 2.4);
  gl_PointSize = aSize * uDpr * pulse;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,me=`
uniform float uShow;
varying float vBig;
const vec3 LIME = ${v};
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float disc = smoothstep(mix(0.62, 0.26, vBig), mix(0.42, 0.16, vBig), r);
  float halo = exp(-r * r * 3.5) * mix(0.25, 0.8, vBig);
  float a = clamp(disc + halo, 0.0, 1.0) * smoothstep(1.0, 0.85, r) * uShow;
  gl_FragColor = vec4(mix(LIME, vec3(1.0), disc * vBig * 0.8) * a, a);
}`,he=`
uniform float uShow;
uniform float uTime;
varying vec2 vUv;
const vec3 LIME = ${v};
void main() {
  float x = abs(vUv.x - 0.5) * 2.0;
  float fade = pow(1.0 - vUv.y, 1.6) * smoothstep(0.0, 0.015, vUv.y);
  float core = exp(-x * x * 220.0);
  float a = (exp(-x * x * 9.0) * 0.34 + core * 0.95) * fade * uShow;
  a *= 0.9 + 0.1 * sin(uTime * 2.4 - vUv.y * 9.0);
  gl_FragColor = vec4(mix(LIME, vec3(1.0), core * 0.6) * a, a);
}`,x=(t,n,r,i=0)=>{let[a,o]=_(n,r);return new e((a-.5)*2,g(t.height,t,a,o)*ne+i,o-.5)},ge=(e,t)=>{let n=t/2,r=t+1,i=n+1,a=new Float32Array(r*i*3),o=new Float32Array(r*i*2),s=new Float32Array(r*i);for(let c=0;c<i;c++)for(let i=0;i<r;i++){let l=c*r+i,u=i/t,d=c/n;a[l*3]=(u-.5)*2,a[l*3+1]=0,a[l*3+2]=d-.5,o[l*2]=u,o[l*2+1]=d,s[l]=g(e.height,e,u,d)}let c=[];for(let i=0;i<n;i++)for(let a=0;a<t;a++){if(g(e.border,e,(a+.5)/t,(i+.5)/n)<-3)continue;let o=i*r+a,s=o+1,l=o+r,u=l+1;c.push(o,l,s,s,l,u)}let u=new d;return u.setAttribute(`position`,new l(a,3)),u.setAttribute(`uv`,new l(o,2)),u.setAttribute(`aH`,new l(s,1)),u.setIndex(new l(new Uint32Array(c),1)),u},_e=e=>{let{w:t,h:n,border:r}=e,i=[],a=[],o=[],s=[],c=[],u=(e,r,i,a,o,s)=>{let c=i/(i-s);return[(e+(a-e)*c+.5)/t,(r+(o-r)*c+.5)/n]},f=(t,n)=>{let r=i.length/3;for(let[r,c]of[t,n]){let t=g(e.height,e,r,c);for(let e of[0,1])i.push((r-.5)*2,0,c-.5),a.push(r,c),o.push(t),s.push(e)}c.push(r,r+1,r+2,r+2,r+1,r+3)};for(let e=0;e<n-1;e++)for(let n=0;n<t-1;n++){let i=r[e*t+n],a=r[e*t+n+1],o=r[(e+1)*t+n+1],s=r[(e+1)*t+n],c=(i>0?8:0)|(a>0?4:0)|(o>0?2:0)|s>0;if(c===0||c===15)continue;let l=()=>u(n,e,i,n+1,e,a),d=()=>u(n+1,e,a,n+1,e+1,o),p=()=>u(n,e+1,s,n+1,e+1,o),m=()=>u(n,e,i,n,e+1,s);switch(c){case 1:case 14:f(m(),p());break;case 2:case 13:f(p(),d());break;case 3:case 12:f(m(),d());break;case 4:case 11:f(l(),d());break;case 6:case 9:f(l(),p());break;case 7:case 8:f(m(),l());break;case 5:f(m(),l()),f(p(),d());break;case 10:f(m(),p()),f(l(),d());break}}let p=new d;return p.setAttribute(`position`,new l(new Float32Array(i),3)),p.setAttribute(`uv`,new l(new Float32Array(a),2)),p.setAttribute(`aH`,new l(new Float32Array(o),1)),p.setAttribute(`aDown`,new l(new Float32Array(s),1)),p.setIndex(new l(new Uint32Array(c),1)),p},ve=t=>{let n=x(t,y[0],y[1],.012),r=[],i=[],a=[],o=[],s=[],c=[];ie.forEach(([l,u],d)=>{let f=x(t,l,u,.012),p=.1+f.distanceTo(n)*.2,m=t=>new e().lerpVectors(f,n,t).setY(f.y+(n.y-f.y)*t+Math.sin(Math.PI*t)*p),h=d*.37%1,g=.11+d*7%5*.012,_=r.length/3;for(let e=0;e<=56;e++){let t=e/56,n=m(t),l=e<56?m((e+1)/56):n.clone().multiplyScalar(2).sub(m((e-1)/56));for(let e of[-1,1])r.push(n.x,n.y,n.z),i.push(l.x,l.y,l.z),a.push(e),o.push(t),s.push(h,g);if(e<56){let t=_+e*2;c.push(t,t+1,t+2,t+1,t+3,t+2)}}});let u=new d;return u.setAttribute(`position`,new l(new Float32Array(r),3)),u.setAttribute(`aNext`,new l(new Float32Array(i),3)),u.setAttribute(`aSide`,new l(new Float32Array(a),1)),u.setAttribute(`aT`,new l(new Float32Array(o),1)),u.setAttribute(`aSeed`,new l(new Float32Array(s),2)),u.setIndex(c),u},ye=e=>{let t=1,n=0,r=1,i=0;for(let a=0;a<e.h;a++)for(let o=0;o<e.w;o++){if(e.border[a*e.w+o]<=0)continue;let s=(o+.5)/e.w,c=(a+.5)/e.h;s<t&&(t=s),s>n&&(n=s),c<r&&(r=c),c>i&&(i=c)}return{u0:t,u1:n,v0:r,v1:i}},S=async({canvas:g,label:v,url:b})=>{let S=await ee(b),be=window.matchMedia(`(pointer: coarse)`).matches||window.innerWidth<768,C=new f(S.rgba,S.w,S.h,t,n);C.minFilter=s,C.magFilter=s,C.generateMipmaps=!1,C.needsUpdate=!0;let xe=new m,w=new u;xe.add(w);let T=new o(30,1.5,.1,20),Se=_(y[0],y[1]),E={uTime:{value:0},uIntro:{value:0},uShow:{value:0}},Ce={value:ne},we={value:re},D=new i({vertexShader:ae,fragmentShader:oe,transparent:!0,premultipliedAlpha:!0,blending:1,uniforms:{tData:{value:C},uTexel:{value:new c(1/S.w,1/S.h)},uTime:E.uTime,uIntro:E.uIntro,uHScale:Ce,uRows:{value:50},uLine:{value:.7},uPointer:{value:new e(.5,.5,0)},uCity:{value:new c(Se[0],Se[1])}}}),O=new p(ge(S,be?320:512),D);O.frustumCulled=!1;let k=new p(_e(S),new i({vertexShader:se,fragmentShader:ce,transparent:!0,premultipliedAlpha:!0,side:2,uniforms:{uIntro:E.uIntro,uHScale:Ce,uDepth:we,uStep:{value:.0205}}}));k.frustumCulled=!1;let A=new p(new h(2,1),new i({vertexShader:ue,fragmentShader:le,transparent:!0,premultipliedAlpha:!0,depthWrite:!1,side:2,uniforms:{tData:{value:C},uIntro:E.uIntro}}));A.geometry.rotateX(Math.PI/2),A.position.y=-.10500000000000001,A.renderOrder=-1;let j=new i({vertexShader:de,fragmentShader:fe,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,side:2,uniforms:{uTime:E.uTime,uShow:E.uShow,uRes:{value:new c(1,1)},uWidth:{value:1.5}}}),M=new p(ve(S),j);M.frustumCulled=!1,M.renderOrder=2;let N=x(S,y[0],y[1],.008),Te=[N.x,N.y,N.z],Ee=[18];for(let[e,t]of ie){let n=x(S,e,t,.008);Te.push(n.x,n.y,n.z),Ee.push(6.5)}let P=new d;P.setAttribute(`position`,new l(new Float32Array(Te),3)),P.setAttribute(`aSize`,new l(new Float32Array(Ee),1));let F=new i({vertexShader:pe,fragmentShader:me,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,depthTest:!1,uniforms:{uTime:E.uTime,uShow:E.uShow,uDpr:{value:1}}}),I=new r(P,F);I.frustumCulled=!1,I.renderOrder=3;let De=.6,L=new p(new h(.1,De),new i({vertexShader:ue,fragmentShader:he,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,side:2,uniforms:{uTime:E.uTime,uShow:E.uShow}}));L.position.set(N.x,N.y+De/2,N.z),L.renderOrder=4,w.add(A,k,O,M,I,L);let Oe=.9,R=-.12,z=ye(S),B=(z.u0-.5)*2,V=(z.u1-.5)*2,H=z.v0-.5,ke=z.v1-.5,Ae=new e(0,1,0),U=(t,n,r)=>new e(t,n,r).applyAxisAngle(Ae,R),W=U((B+V)/2,.03,(H+ke)/2),je=new e(0,Math.sin(Oe),Math.cos(Oe)),Me=[U(B,.1,H),U(V,.1,H),U(B,-.055,ke),U(V,-.055,ke),U(B,-.055,H),U(V,-.055,H)],Ne=new e,G=0,Pe=0,Fe=(e,t)=>{T.position.copy(W).addScaledVector(je,e),T.lookAt(W),T.setViewOffset(G,1,0,t,G,1),T.updateMatrixWorld()},Ie=e=>{if(Math.abs(e-G)<.001)return;G=e,Pe=0,T.aspect=e,T.clearViewOffset(),T.updateProjectionMatrix();let t=1,n=14;for(let e=0;e<24;e++){let e=(t+n)/2;T.position.copy(W).addScaledVector(je,e),T.lookAt(W),T.updateMatrixWorld();let r=!1;for(let e of Me)Ne.copy(e).project(T),(Math.abs(Ne.x)>.96||Math.abs(Ne.y)>.74)&&(r=!0);r?t=e:n=e}Fe(n,-.1),T.updateProjectionMatrix()},K={x:0,y:0,nx:0,ny:0,inside:!1},Le=e=>{if(e.pointerType===`touch`)return;let t=g.getBoundingClientRect();K.nx=(e.clientX-t.left)/t.width*2-1,K.ny=-((e.clientY-t.top)/t.height*2-1),K.inside=Math.abs(K.nx)<=1&&Math.abs(K.ny)<=1,K.x=Math.max(-1.6,Math.min(1.6,K.nx)),K.y=Math.max(-1.6,Math.min(1.6,K.ny))};window.addEventListener(`pointermove`,Le,{passive:!0});let q=-1,J=0,Re=0,ze=0,Be=new e,Y=new e,X=new e,Ve=new a,He=new e,Ue=!1,Z=0,We=-9,Ge=-9,Q=-1,$={x:0,y:0,w:0},Ke=te({canvas:g,scene:xe,camera:T,maxDpr:be?1.75:1.5,frame:(e,t,n)=>{Ie(n.cssW/n.cssH),q<0&&(q=e),E.uTime.value=e-q,E.uIntro.value=Math.min(1,(e-q)/2.6),E.uShow.value=Math.max(0,Math.min(1,(e-q-1.7)/1.1)),j.uniforms.uRes.value.set(n.w,n.h),j.uniforms.uWidth.value=1.3*n.dpr,F.uniforms.uDpr.value=n.dpr,D.uniforms.uLine.value=.55+.22*n.dpr,D.uniforms.uRows.value=Math.round(Math.max(24,Math.min(50,n.cssW/15)));let r=1-Math.exp(-t*3.2),i=Math.sin((e-q)*.22)*.045;J+=(i+K.x*.085-J)*r,Re+=(-K.y*.04-Re)*r;let a=g.getBoundingClientRect().top,o=Math.max(0,Math.min(1,(120-a)/Math.max(1,n.cssH*1.4)));Z+=(o*.32-Z)*r,w.rotation.set(Re+Z,R+J,0),w.updateMatrixWorld(),L.rotation.y=Math.atan2(T.position.x,T.position.z)-R-J;let s=0;if(K.inside){X.copy(T.position),Y.set(K.nx,K.ny,.5).unproject(T).sub(X).normalize(),Ve.copy(w.matrixWorld).invert(),X.applyMatrix4(Ve),Y.transformDirection(Ve);let e=(.06-X.y)/Y.y;if(e>0){Be.copy(X).addScaledVector(Y,e);let t=Be.x/2+.5,n=Be.z+.5;t>-.05&&t<1.05&&n>-.05&&n<1.05&&(D.uniforms.uPointer.value.setX(t).setY(n),s=1)}}ze+=(s-ze)*(1-Math.exp(-t*6)),D.uniforms.uPointer.value.z=ze,v&&(He.set(N.x,N.y+.2,N.z).applyMatrix4(w.matrixWorld).project(T),$.x=(He.x*.5+.5)*n.cssW,$.y=(-He.y*.5+.5)*n.cssH,$.w=n.cssW)},post:()=>{if(!v)return;let{x:e,y:t}=$;Pe||=v.firstElementChild?.offsetWidth??0;let n=e+16+Pe>$.w;n!==Ue&&(Ue=n,v.toggleAttribute(`data-flip`,n)),(Math.abs(e-We)>.25||Math.abs(t-Ge)>.25)&&(We=e,Ge=t,v.style.transform=`translate3d(${e.toFixed(1)}px, ${t.toFixed(1)}px, 0)`),E.uShow.value!==Q&&(Q=E.uShow.value,v.style.opacity=String(Q))}});return()=>{Ke(),window.removeEventListener(`pointermove`,Le);for(let e of[O,k,A,M,L])e.geometry.dispose(),e.material.dispose();P.dispose(),F.dispose(),C.dispose()}};export{S as mountRelief};