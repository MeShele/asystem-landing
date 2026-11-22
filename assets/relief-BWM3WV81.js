import{_ as e,a as t,c as n,d as r,f as i,g as a,h as o,l as s,m as c,n as l,o as u,p as d,r as f,s as p,t as m,u as ee,v as h}from"./stage-CTPSTSyp.js";import{i as g,n as te,t as ne}from"./reliefData-DzQUuJtr.js";var re=.25,ie=.055,_=`vec3(0.714, 1.0, 0.102)`,v=[74.59,42.87],ae=[[72.8,40.53],[73,40.93],[78.39,42.49],[76,41.43],[72.24,42.52],[70.82,40.06],[77.08,42.65]],y=`
uniform float uIntro;
float introK(float u) { return clamp(uIntro * 1.7 - u * 0.7, 0.0, 1.0); }
float introRise(float k) { return 1.0 - pow(1.0 - k, 3.0); }`,oe=`
attribute float aH;
uniform float uHScale;
${y}
varying vec2 vUv;
varying float vH;
varying float vShow;
void main() {
  vUv = uv;
  vH = aH;
  float k = introK(uv.x);
  vShow = smoothstep(0.0, 0.3, k);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, aH * uHScale * introRise(k), position.z, 1.0);
}`,se=`
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
const vec3 LIME = ${_};
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
}`,ce=`
attribute float aH;
attribute float aDown;
uniform float uHScale;
uniform float uDepth;
${y}
varying float vY;
varying float vTop;
varying float vShow;
void main() {
  float k = introK(uv.x);
  vShow = smoothstep(0.0, 0.3, k);
  vTop = aH * uHScale * introRise(k);
  vY = mix(vTop, -uDepth, aDown);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, vY, position.z, 1.0);
}`,le=`
uniform float uDepth;
uniform float uStep;
varying float vY;
varying float vTop;
varying float vShow;
const vec3 LIME = ${_};
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
}`,ue=`
uniform sampler2D tData;
uniform float uIntro;
varying vec2 vUv;
const vec3 LIME = ${_};
void main() {
  float sdB = (texture2D(tData, vUv).g * 2.0 - 1.0) * 16.0;
  float dark = smoothstep(-15.0, 2.0, sdB) * 0.6;
  float rim = exp(-abs(sdB + 3.0) * 0.26) * 0.16;
  float a = clamp(dark + rim, 0.0, 1.0) * uIntro;
  gl_FragColor = vec4(LIME * rim * uIntro, a);
}`,de=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fe=`
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
}`,pe=`
uniform float uTime;
uniform float uShow;
varying float vT;
varying float vSide;
varying vec2 vSeed;
const vec3 LIME = ${_};
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
}`,me=`
attribute float aSize;
uniform float uDpr;
uniform float uTime;
varying float vBig;
void main() {
  vBig = step(9.0, aSize);
  float pulse = 1.0 + vBig * 0.14 * sin(uTime * 2.4);
  gl_PointSize = aSize * uDpr * pulse;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,he=`
uniform float uShow;
varying float vBig;
const vec3 LIME = ${_};
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float disc = smoothstep(mix(0.62, 0.26, vBig), mix(0.42, 0.16, vBig), r);
  float halo = exp(-r * r * 3.5) * mix(0.25, 0.8, vBig);
  float a = clamp(disc + halo, 0.0, 1.0) * smoothstep(1.0, 0.85, r) * uShow;
  gl_FragColor = vec4(mix(LIME, vec3(1.0), disc * vBig * 0.8) * a, a);
}`,ge=`
uniform float uShow;
uniform float uTime;
varying vec2 vUv;
const vec3 LIME = ${_};
void main() {
  float x = abs(vUv.x - 0.5) * 2.0;
  float fade = pow(1.0 - vUv.y, 1.6) * smoothstep(0.0, 0.015, vUv.y);
  float core = exp(-x * x * 220.0);
  float a = (exp(-x * x * 9.0) * 0.34 + core * 0.95) * fade * uShow;
  a *= 0.9 + 0.1 * sin(uTime * 2.4 - vUv.y * 9.0);
  gl_FragColor = vec4(mix(LIME, vec3(1.0), core * 0.6) * a, a);
}`,b=(e,t,n,r=0)=>{let[i,a]=te(t,n);return new h((i-.5)*2,g(e.height,e,i,a)*re+r,a-.5)},_e=(e,t)=>{let n=t/2,r=t+1,i=n+1,a=new Float32Array(r*i*3),o=new Float32Array(r*i*2),s=new Float32Array(r*i);for(let c=0;c<i;c++)for(let i=0;i<r;i++){let l=c*r+i,u=i/t,d=c/n;a[l*3]=(u-.5)*2,a[l*3+1]=0,a[l*3+2]=d-.5,o[l*2]=u,o[l*2+1]=d,s[l]=g(e.height,e,u,d)}let c=[];for(let i=0;i<n;i++)for(let a=0;a<t;a++){if(g(e.border,e,(a+.5)/t,(i+.5)/n)<-3)continue;let o=i*r+a,s=o+1,l=o+r,u=l+1;c.push(o,l,s,s,l,u)}let u=new f;return u.setAttribute(`position`,new l(a,3)),u.setAttribute(`uv`,new l(o,2)),u.setAttribute(`aH`,new l(s,1)),u.setIndex(new l(new Uint32Array(c),1)),u},ve=e=>{let{w:t,h:n,border:r}=e,i=[],a=[],o=[],s=[],c=[],u=(e,r,i,a,o,s)=>{let c=i/(i-s);return[(e+(a-e)*c+.5)/t,(r+(o-r)*c+.5)/n]},d=(t,n)=>{let r=i.length/3;for(let[r,c]of[t,n]){let t=g(e.height,e,r,c);for(let e of[0,1])i.push((r-.5)*2,0,c-.5),a.push(r,c),o.push(t),s.push(e)}c.push(r,r+1,r+2,r+2,r+1,r+3)};for(let e=0;e<n-1;e++)for(let n=0;n<t-1;n++){let i=r[e*t+n],a=r[e*t+n+1],o=r[(e+1)*t+n+1],s=r[(e+1)*t+n],c=(i>0?8:0)|(a>0?4:0)|(o>0?2:0)|s>0;if(c===0||c===15)continue;let l=()=>u(n,e,i,n+1,e,a),f=()=>u(n+1,e,a,n+1,e+1,o),p=()=>u(n,e+1,s,n+1,e+1,o),m=()=>u(n,e,i,n,e+1,s);switch(c){case 1:case 14:d(m(),p());break;case 2:case 13:d(p(),f());break;case 3:case 12:d(m(),f());break;case 4:case 11:d(l(),f());break;case 6:case 9:d(l(),p());break;case 7:case 8:d(m(),l());break;case 5:d(m(),l()),d(p(),f());break;case 10:d(m(),p()),d(l(),f());break}}let p=new f;return p.setAttribute(`position`,new l(new Float32Array(i),3)),p.setAttribute(`uv`,new l(new Float32Array(a),2)),p.setAttribute(`aH`,new l(new Float32Array(o),1)),p.setAttribute(`aDown`,new l(new Float32Array(s),1)),p.setIndex(new l(new Uint32Array(c),1)),p},ye=e=>{let t=b(e,v[0],v[1],.012),n=[],r=[],i=[],a=[],o=[],s=[];ae.forEach(([c,l],u)=>{let d=b(e,c,l,.012),f=.1+d.distanceTo(t)*.2,p=e=>new h().lerpVectors(d,t,e).setY(d.y+(t.y-d.y)*e+Math.sin(Math.PI*e)*f),m=u*.37%1,ee=.11+u*7%5*.012,g=n.length/3;for(let e=0;e<=56;e++){let t=e/56,c=p(t),l=e<56?p((e+1)/56):c.clone().multiplyScalar(2).sub(p((e-1)/56));for(let e of[-1,1])n.push(c.x,c.y,c.z),r.push(l.x,l.y,l.z),i.push(e),a.push(t),o.push(m,ee);if(e<56){let t=g+e*2;s.push(t,t+1,t+2,t+1,t+3,t+2)}}});let c=new f;return c.setAttribute(`position`,new l(new Float32Array(n),3)),c.setAttribute(`aNext`,new l(new Float32Array(r),3)),c.setAttribute(`aSide`,new l(new Float32Array(i),1)),c.setAttribute(`aT`,new l(new Float32Array(a),1)),c.setAttribute(`aSeed`,new l(new Float32Array(o),2)),c.setIndex(s),c},be=e=>{let t=1,n=0,r=1,i=0;for(let a=0;a<e.h;a++)for(let o=0;o<e.w;o++){if(e.border[a*e.w+o]<=0)continue;let s=(o+.5)/e.w,c=(a+.5)/e.h;s<t&&(t=s),s>n&&(n=s),c<r&&(r=c),c>i&&(i=c)}return{u0:t,u1:n,v0:r,v1:i}},x=async({canvas:g,label:_,url:y})=>{let x=await ne(y),xe=window.matchMedia(`(pointer: coarse)`).matches||window.innerWidth<768,S=new t(x.rgba,x.w,x.h,d,a);S.minFilter=p,S.magFilter=p,S.generateMipmaps=!1,S.needsUpdate=!0;let Se=new c,C=new u;Se.add(C);let w=new ee(30,1.5,.1,20),Ce=te(v[0],v[1]),T={uTime:{value:0},uIntro:{value:0},uShow:{value:0}},we={value:re},Te={value:ie},E=new o({vertexShader:oe,fragmentShader:se,transparent:!0,premultipliedAlpha:!0,blending:1,uniforms:{tData:{value:S},uTexel:{value:new e(1/x.w,1/x.h)},uTime:T.uTime,uIntro:T.uIntro,uHScale:we,uRows:{value:50},uLine:{value:.7},uPointer:{value:new h(.5,.5,0)},uCity:{value:new e(Ce[0],Ce[1])}}}),D=new s(_e(x,xe?320:512),E);D.frustumCulled=!1;let O=new s(ve(x),new o({vertexShader:ce,fragmentShader:le,transparent:!0,premultipliedAlpha:!0,side:2,uniforms:{uIntro:T.uIntro,uHScale:we,uDepth:Te,uStep:{value:.0205}}}));O.frustumCulled=!1;let k=new s(new r(2,1),new o({vertexShader:de,fragmentShader:ue,transparent:!0,premultipliedAlpha:!0,depthWrite:!1,side:2,uniforms:{tData:{value:S},uIntro:T.uIntro}}));k.geometry.rotateX(Math.PI/2),k.position.y=-.10500000000000001,k.renderOrder=-1;let A=new o({vertexShader:fe,fragmentShader:pe,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,side:2,uniforms:{uTime:T.uTime,uShow:T.uShow,uRes:{value:new e(1,1)},uWidth:{value:1.5}}}),j=new s(ye(x),A);j.frustumCulled=!1,j.renderOrder=2;let M=b(x,v[0],v[1],.008),Ee=[M.x,M.y,M.z],De=[18];for(let[e,t]of ae){let n=b(x,e,t,.008);Ee.push(n.x,n.y,n.z),De.push(6.5)}let N=new f;N.setAttribute(`position`,new l(new Float32Array(Ee),3)),N.setAttribute(`aSize`,new l(new Float32Array(De),1));let P=new o({vertexShader:me,fragmentShader:he,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,depthTest:!1,uniforms:{uTime:T.uTime,uShow:T.uShow,uDpr:{value:1}}}),F=new i(N,P);F.frustumCulled=!1,F.renderOrder=3;let Oe=.6,I=new s(new r(.1,Oe),new o({vertexShader:de,fragmentShader:ge,transparent:!0,premultipliedAlpha:!0,blending:2,depthWrite:!1,side:2,uniforms:{uTime:T.uTime,uShow:T.uShow}}));I.position.set(M.x,M.y+Oe/2,M.z),I.renderOrder=4,C.add(k,O,D,j,F,I);let ke=.9,Ae=-.12,L=be(x),R=(L.u0-.5)*2,z=(L.u1-.5)*2,B=L.v0-.5,V=L.v1-.5,je=new h(0,1,0),H=(e,t,n)=>new h(e,t,n).applyAxisAngle(je,Ae),U=H((R+z)/2,.03,(B+V)/2),Me=new h(0,Math.sin(ke),Math.cos(ke)),Ne=[H(R,.1,B),H(z,.1,B),H(R,-.055,V),H(z,-.055,V),H(R,-.055,B),H(z,-.055,B)],W=new h,G=0,Pe=0,Fe=(e,t)=>{w.position.copy(U).addScaledVector(Me,e),w.lookAt(U),w.setViewOffset(G,1,0,t,G,1),w.updateMatrixWorld()},Ie=e=>{if(Math.abs(e-G)<.001)return;G=e,Pe=0,w.aspect=e,w.clearViewOffset(),w.updateProjectionMatrix();let t=1,n=14;for(let e=0;e<24;e++){let e=(t+n)/2;w.position.copy(U).addScaledVector(Me,e),w.lookAt(U),w.updateMatrixWorld();let r=!1;for(let e of Ne)W.copy(e).project(w),(Math.abs(W.x)>.96||Math.abs(W.y)>.74)&&(r=!0);r?t=e:n=e}Fe(n,-.1),w.updateProjectionMatrix()},K={x:0,y:0,nx:0,ny:0,inside:!1},Le=e=>{if(e.pointerType===`touch`)return;let t=g.getBoundingClientRect();K.nx=(e.clientX-t.left)/t.width*2-1,K.ny=-((e.clientY-t.top)/t.height*2-1),K.inside=Math.abs(K.nx)<=1&&Math.abs(K.ny)<=1,K.x=Math.max(-1.6,Math.min(1.6,K.nx)),K.y=Math.max(-1.6,Math.min(1.6,K.ny))};window.addEventListener(`pointermove`,Le,{passive:!0});let q=-1,J=0,Re=0,ze=0,Be=new h,Y=new h,X=new h,Z=new n,Ve=new h,He=!1,Ue=0,We=-9,Ge=-9,Q=-1,$={x:0,y:0,w:0},Ke=m({canvas:g,scene:Se,camera:w,maxDpr:xe?1.75:1.5,frame:(e,t,n)=>{Ie(n.cssW/n.cssH),q<0&&(q=e),T.uTime.value=e-q,T.uIntro.value=Math.min(1,(e-q)/2.6),T.uShow.value=Math.max(0,Math.min(1,(e-q-1.7)/1.1)),A.uniforms.uRes.value.set(n.w,n.h),A.uniforms.uWidth.value=1.3*n.dpr,P.uniforms.uDpr.value=n.dpr,E.uniforms.uLine.value=.55+.22*n.dpr,E.uniforms.uRows.value=Math.round(Math.max(24,Math.min(50,n.cssW/15)));let r=1-Math.exp(-t*3.2),i=Math.sin((e-q)*.22)*.045;J+=(i+K.x*.085-J)*r,Re+=(-K.y*.04-Re)*r;let a=g.getBoundingClientRect().top,o=Math.max(0,Math.min(1,(120-a)/Math.max(1,n.cssH*1.4)));Ue+=(o*.32-Ue)*r,C.rotation.set(Re+Ue,Ae+J,0),C.updateMatrixWorld(),I.rotation.y=Math.atan2(w.position.x,w.position.z)-Ae-J;let s=0;if(K.inside){X.copy(w.position),Y.set(K.nx,K.ny,.5).unproject(w).sub(X).normalize(),Z.copy(C.matrixWorld).invert(),X.applyMatrix4(Z),Y.transformDirection(Z);let e=(.06-X.y)/Y.y;if(e>0){Be.copy(X).addScaledVector(Y,e);let t=Be.x/2+.5,n=Be.z+.5;t>-.05&&t<1.05&&n>-.05&&n<1.05&&(E.uniforms.uPointer.value.setX(t).setY(n),s=1)}}ze+=(s-ze)*(1-Math.exp(-t*6)),E.uniforms.uPointer.value.z=ze,_&&(Ve.set(M.x,M.y+.2,M.z).applyMatrix4(C.matrixWorld).project(w),$.x=(Ve.x*.5+.5)*n.cssW,$.y=(-Ve.y*.5+.5)*n.cssH,$.w=n.cssW)},post:()=>{if(!_)return;let{x:e,y:t}=$;Pe||=_.firstElementChild?.offsetWidth??0;let n=e+16+Pe>$.w;n!==He&&(He=n,_.toggleAttribute(`data-flip`,n)),(Math.abs(e-We)>.25||Math.abs(t-Ge)>.25)&&(We=e,Ge=t,_.style.transform=`translate3d(${e.toFixed(1)}px, ${t.toFixed(1)}px, 0)`),T.uShow.value!==Q&&(Q=T.uShow.value,_.style.opacity=String(Q))}});return()=>{Ke(),window.removeEventListener(`pointermove`,Le);for(let e of[D,O,k,j,I])e.geometry.dispose(),e.material.dispose();N.dispose(),P.dispose(),S.dispose()}};export{x as mountRelief};