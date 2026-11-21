import{_ as e,a as t,b as n,c as r,d as i,f as a,g as o,h as s,i as c,l,m as u,n as d,o as f,p,s as m,t as ee,u as h,v as g,x as _,y as te}from"./reliefData-DldKLAk9.js";var ne=.25,re=.055,v=`vec3(0.714, 1.0, 0.102)`,y=[74.59,42.87],ie=[[72.8,40.53],[73,40.93],[78.39,42.49],[76,41.43],[72.24,42.52],[70.82,40.06],[77.08,42.65]],b=`
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
  float a = 0.94 * smoothstep(0.0, 0.2, vShow + 0.001);
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
}`,x=(e,t,n,r=0)=>{let[i,a]=d(t,n);return new _((i-.5)*2,c(e.height,e,i,a)*ne+r,a-.5)},ge=(e,t)=>{let n=t/2,r=t+1,i=n+1,a=new Float32Array(r*i*3),o=new Float32Array(r*i*2),s=new Float32Array(r*i);for(let l=0;l<i;l++)for(let i=0;i<r;i++){let u=l*r+i,d=i/t,f=l/n;a[u*3]=(d-.5)*2,a[u*3+1]=0,a[u*3+2]=f-.5,o[u*2]=d,o[u*2+1]=f,s[u]=c(e.height,e,d,f)}let l=[];for(let i=0;i<n;i++)for(let a=0;a<t;a++){if(c(e.border,e,(a+.5)/t,(i+.5)/n)<-3)continue;let o=i*r+a,s=o+1,u=o+r,d=u+1;l.push(o,u,s,s,u,d)}let u=new m;return u.setAttribute(`position`,new f(a,3)),u.setAttribute(`uv`,new f(o,2)),u.setAttribute(`aH`,new f(s,1)),u.setIndex(new f(new Uint32Array(l),1)),u},_e=e=>{let{w:t,h:n,border:r}=e,i=[],a=[],o=[],s=[],l=[],u=(e,r,i,a,o,s)=>{let c=i/(i-s);return[(e+(a-e)*c+.5)/t,(r+(o-r)*c+.5)/n]},d=(t,n)=>{let r=i.length/3;for(let[r,l]of[t,n]){let t=c(e.height,e,r,l);for(let e of[0,1])i.push((r-.5)*2,0,l-.5),a.push(r,l),o.push(t),s.push(e)}l.push(r,r+1,r+2,r+2,r+1,r+3)};for(let e=0;e<n-1;e++)for(let n=0;n<t-1;n++){let i=r[e*t+n],a=r[e*t+n+1],o=r[(e+1)*t+n+1],s=r[(e+1)*t+n],c=(i>0?8:0)|(a>0?4:0)|(o>0?2:0)|s>0;if(c===0||c===15)continue;let l=()=>u(n,e,i,n+1,e,a),f=()=>u(n+1,e,a,n+1,e+1,o),p=()=>u(n,e+1,s,n+1,e+1,o),m=()=>u(n,e,i,n,e+1,s);switch(c){case 1:case 14:d(m(),p());break;case 2:case 13:d(p(),f());break;case 3:case 12:d(m(),f());break;case 4:case 11:d(l(),f());break;case 6:case 9:d(l(),p());break;case 7:case 8:d(m(),l());break;case 5:d(m(),l()),d(p(),f());break;case 10:d(m(),p()),d(l(),f());break}}let p=new m;return p.setAttribute(`position`,new f(new Float32Array(i),3)),p.setAttribute(`uv`,new f(new Float32Array(a),2)),p.setAttribute(`aH`,new f(new Float32Array(o),1)),p.setAttribute(`aDown`,new f(new Float32Array(s),1)),p.setIndex(new f(new Uint32Array(l),1)),p},ve=e=>{let t=x(e,y[0],y[1],.012),n=[],r=[],i=[],a=[],o=[],s=[];ie.forEach(([c,l],u)=>{let d=x(e,c,l,.012),f=.1+d.distanceTo(t)*.2,p=e=>new _().lerpVectors(d,t,e).setY(d.y+(t.y-d.y)*e+Math.sin(Math.PI*e)*f),m=u*.37%1,ee=.11+u*7%5*.012,h=n.length/3;for(let e=0;e<=56;e++){let t=e/56,c=p(t),l=e<56?p((e+1)/56):c.clone().multiplyScalar(2).sub(p((e-1)/56));for(let e of[-1,1])n.push(c.x,c.y,c.z),r.push(l.x,l.y,l.z),i.push(e),a.push(t),o.push(m,ee);if(e<56){let t=h+e*2;s.push(t,t+1,t+2,t+1,t+3,t+2)}}});let c=new m;return c.setAttribute(`position`,new f(new Float32Array(n),3)),c.setAttribute(`aNext`,new f(new Float32Array(r),3)),c.setAttribute(`aSide`,new f(new Float32Array(i),1)),c.setAttribute(`aT`,new f(new Float32Array(a),1)),c.setAttribute(`aSeed`,new f(new Float32Array(o),2)),c.setIndex(s),c},ye=e=>{let t=1,n=0,r=1,i=0;for(let a=0;a<e.h;a++)for(let o=0;o<e.w;o++){if(e.border[a*e.w+o]<=0)continue;let s=(o+.5)/e.w,c=(a+.5)/e.h;s<t&&(t=s),s>n&&(n=s),c<r&&(r=c),c>i&&(i=c)}return{u0:t,u1:n,v0:r,v1:i}},S=async({canvas:c,label:v,url:b})=>{let S=await ee(b),be=window.matchMedia(`(pointer: coarse)`).matches||window.innerWidth<768,C=new r(S.rgba,S.w,S.h,o,te);C.minFilter=h,C.magFilter=h,C.generateMipmaps=!1,C.needsUpdate=!0;let xe=new e,w=new l;xe.add(w);let T=new p(30,1.5,.1,20),Se=d(y[0],y[1]),E={uTime:{value:0},uIntro:{value:0},uShow:{value:0}},Ce={value:ne},we={value:re},D=new g({vertexShader:ae,fragmentShader:oe,transparent:!0,premultipliedAlpha:!0,blending:1,uniforms:{tData:{value:C},uTexel:{value:new n(1/S.w,1/S.h)},uTime:E.uTime,uIntro:E.uIntro,uHScale:Ce,uRows:{value:50},uLine:{value:.7},uPointer:{value:new _(.5,.5,0)},uCity:{value:new n(Se[0],Se[1])}}}),O=new a(ge(S,be?320:512),D);O.frustumCulled=!1;let k=new a(_e(S),new g({vertexShader:se,fragmentShader:ce,transparent:!0,premultipliedAlpha:!0,side:2,uniforms:{uIntro:E.uIntro,uHScale:Ce,uDepth:we,uStep:{value:.0205}}}));k.frustumCulled=!1;let A=new a(new u(2,1),new g({vertexShader:ue,fragmentShader:le,transparent:!0,premultipliedAlpha:!0,depthWrite:!1,side:2,uniforms:{tData:{value:C},uIntro:E.uIntro}}));A.geometry.rotateX(Math.PI/2),A.position.y=-.10500000000000001,A.renderOrder=-1;let j=new g({vertexShader:de,fragmentShader:fe,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,side:2,uniforms:{uTime:E.uTime,uShow:E.uShow,uRes:{value:new n(1,1)},uWidth:{value:1.5}}}),M=new a(ve(S),j);M.frustumCulled=!1,M.renderOrder=2;let N=x(S,y[0],y[1],.008),Te=[N.x,N.y,N.z],Ee=[18];for(let[e,t]of ie){let n=x(S,e,t,.008);Te.push(n.x,n.y,n.z),Ee.push(6.5)}let P=new m;P.setAttribute(`position`,new f(new Float32Array(Te),3)),P.setAttribute(`aSize`,new f(new Float32Array(Ee),1));let F=new g({vertexShader:pe,fragmentShader:me,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,depthTest:!1,uniforms:{uTime:E.uTime,uShow:E.uShow,uDpr:{value:1}}}),I=new s(P,F);I.frustumCulled=!1,I.renderOrder=3;let De=.6,L=new a(new u(.1,De),new g({vertexShader:ue,fragmentShader:he,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,side:2,uniforms:{uTime:E.uTime,uShow:E.uShow}}));L.position.set(N.x,N.y+De/2,N.z),L.renderOrder=4,w.add(A,k,O,M,I,L);let Oe=.9,R=-.12,z=ye(S),B=(z.u0-.5)*2,V=(z.u1-.5)*2,H=z.v0-.5,ke=z.v1-.5,Ae=new _(0,1,0),U=(e,t,n)=>new _(e,t,n).applyAxisAngle(Ae,R),W=U((B+V)/2,.03,(H+ke)/2),je=new _(0,Math.sin(Oe),Math.cos(Oe)),Me=[U(B,.1,H),U(V,.1,H),U(B,-.055,ke),U(V,-.055,ke),U(B,-.055,H),U(V,-.055,H)],G=new _,K=0,Ne=0,Pe=(e,t)=>{T.position.copy(W).addScaledVector(je,e),T.lookAt(W),T.setViewOffset(K,1,0,t,K,1),T.updateMatrixWorld()},Fe=e=>{if(Math.abs(e-K)<.001)return;K=e,Ne=0,T.aspect=e,T.clearViewOffset(),T.updateProjectionMatrix();let t=1,n=14;for(let e=0;e<24;e++){let e=(t+n)/2;T.position.copy(W).addScaledVector(je,e),T.lookAt(W),T.updateMatrixWorld();let r=!1;for(let e of Me)G.copy(e).project(T),(Math.abs(G.x)>.96||Math.abs(G.y)>.74)&&(r=!0);r?t=e:n=e}Pe(n,-.1),T.updateProjectionMatrix()},q={x:0,y:0,nx:0,ny:0,inside:!1},Ie=e=>{if(e.pointerType===`touch`)return;let t=c.getBoundingClientRect();q.nx=(e.clientX-t.left)/t.width*2-1,q.ny=-((e.clientY-t.top)/t.height*2-1),q.inside=Math.abs(q.nx)<=1&&Math.abs(q.ny)<=1,q.x=Math.max(-1.6,Math.min(1.6,q.nx)),q.y=Math.max(-1.6,Math.min(1.6,q.ny))};window.addEventListener(`pointermove`,Ie,{passive:!0});let J=-1,Y=0,Le=0,Re=0,X=new _,Z=new _,Q=new _,ze=new i,Be=new _,Ve=!1,He=0,Ue=-9,We=-9,$=-1,Ge=t({canvas:c,scene:xe,camera:T,maxDpr:be?2:1.75,frame:(e,t,n)=>{Fe(n.cssW/n.cssH),J<0&&(J=e),E.uTime.value=e-J,E.uIntro.value=Math.min(1,(e-J)/2.6),E.uShow.value=Math.max(0,Math.min(1,(e-J-1.7)/1.1)),j.uniforms.uRes.value.set(n.w,n.h),j.uniforms.uWidth.value=1.3*n.dpr,F.uniforms.uDpr.value=n.dpr,D.uniforms.uLine.value=.55+.22*n.dpr,D.uniforms.uRows.value=Math.round(Math.max(24,Math.min(50,n.cssW/15)));let r=1-Math.exp(-t*3.2),i=Math.sin((e-J)*.22)*.045;Y+=(i+q.x*.085-Y)*r,Le+=(-q.y*.04-Le)*r;let a=c.getBoundingClientRect().top,o=Math.max(0,Math.min(1,(120-a)/Math.max(1,n.cssH*1.4)));He+=(o*.32-He)*r,w.rotation.set(Le+He,R+Y,0),w.updateMatrixWorld(),L.rotation.y=Math.atan2(T.position.x,T.position.z)-R-Y;let s=0;if(q.inside){Q.copy(T.position),Z.set(q.nx,q.ny,.5).unproject(T).sub(Q).normalize(),ze.copy(w.matrixWorld).invert(),Q.applyMatrix4(ze),Z.transformDirection(ze);let e=(.06-Q.y)/Z.y;if(e>0){X.copy(Q).addScaledVector(Z,e);let t=X.x/2+.5,n=X.z+.5;t>-.05&&t<1.05&&n>-.05&&n<1.05&&(D.uniforms.uPointer.value.setX(t).setY(n),s=1)}}if(Re+=(s-Re)*(1-Math.exp(-t*6)),D.uniforms.uPointer.value.z=Re,v){Be.set(N.x,N.y+.2,N.z).applyMatrix4(w.matrixWorld).project(T);let e=(Be.x*.5+.5)*n.cssW,t=(-Be.y*.5+.5)*n.cssH;Ne||=v.firstElementChild?.offsetWidth??0;let r=e+16+Ne>n.cssW;r!==Ve&&(Ve=r,v.toggleAttribute(`data-flip`,r)),(Math.abs(e-Ue)>.25||Math.abs(t-We)>.25)&&(Ue=e,We=t,v.style.transform=`translate3d(${e.toFixed(1)}px, ${t.toFixed(1)}px, 0)`),E.uShow.value!==$&&($=E.uShow.value,v.style.opacity=String($))}}});return()=>{Ge(),window.removeEventListener(`pointermove`,Ie);for(let e of[O,k,A,M,L])e.geometry.dispose(),e.material.dispose();P.dispose(),F.dispose(),C.dispose()}};export{S as mountRelief};