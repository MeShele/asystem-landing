import{A as e,E as t,O as n,T as r,_ as i,m as a,o,s,u as c,w as ee,x as te,y as l}from"./pace-CK9a3ieE.js";import{t as ne}from"./live-DFeGTl2H.js";import{c as u,d as re,f as ie,i as ae,o as oe,p as se,r as ce,s as le,t as d,u as ue}from"./kit-CIz0e_KO.js";import{r as de}from"./reliefData-DzQUuJtr.js";var f={size:256,hMin:3112,hMax:7382,summit:[.58,.36]},p=.62,m=.12,h=[[.07,.88],[.25,.68],[.43,.51],f.summit],fe=.14,pe=`
attribute float aH;
uniform float uIntro;
varying vec2 vUv;
varying float vH;
varying float vShow;
void main() {
  vUv = uv; vH = aH;
  // массив поднимается от подножия к вершине
  float k = clamp(uIntro * 1.8 - aH * 0.8, 0.0, 1.0);
  vShow = smoothstep(0.0, 0.3, k);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, aH * ${p.toFixed(2)} * (1.0 - pow(1.0 - k, 3.0)), position.z, 1.0);
}`,me=`
uniform sampler2D tData;
uniform float uTexel;
uniform float uRows;
uniform float uLine;
uniform vec3 uPointer;
varying vec2 vUv;
varying float vH;
varying float vShow;
const vec3 LIME = ${d};
const vec3 SNOW = vec3(0.95, 1.0, 0.86);
void main() {
  float hL = texture2D(tData, vUv - vec2(uTexel, 0.0)).r, hR = texture2D(tData, vUv + vec2(uTexel, 0.0)).r;
  float hU = texture2D(tData, vUv - vec2(0.0, uTexel)).r, hD = texture2D(tData, vUv + vec2(0.0, uTexel)).r;
  float shade = clamp(0.8 + dot(vec2(hR - hL, hD - hU), vec2(1.0, -0.6)) * 5.0, 0.35, 1.35);
  float fv = vUv.y * uRows;
  float wv = fwidth(fv);
  float dl = abs(fract(fv) - 0.5) / max(wv, 1e-5);
  float dense = 1.0 - smoothstep(0.26, 0.5, wv);
  float line = (1.0 - smoothstep(uLine - 0.55, uLine + 0.55, dl)) * dense;
  float alt = smoothstep(0.05, 0.75, vH);
  vec2 pq = vUv - uPointer.xy;
  float spot = exp(-dot(pq, pq) * 60.0) * uPointer.z;
  float lit = mix(0.4, 1.0, alt) * shade + spot * 0.8;
  vec3 col = vec3(0.026, 0.034, 0.022) + LIME * (0.02 + 0.05 * alt + 0.05 * spot);
  float l = clamp(line * lit, 0.0, 1.0) * vShow;
  col += LIME * exp(-dl * dl * 0.16) * dense * lit * 0.12 * vShow;
  col = mix(col, mix(LIME, SNOW, smoothstep(0.62, 0.92, vH)), l);
  // кромка блока
  vec2 e = min(vUv, 1.0 - vUv) / max(fwidth(vUv), vec2(1e-5));
  col = mix(col, LIME, (1.0 - smoothstep(0.8, 1.8, min(e.x, e.y))) * vShow);
  float a = mix(0.88, 1.0, l) * smoothstep(0.0, 0.2, vShow + 0.001);
  gl_FragColor = vec4(col * a, a);
}`,he=`
attribute float aH;
attribute float aDown;
uniform float uIntro;
varying float vY;
varying float vTop;
varying float vShow;
void main() {
  float k = clamp(uIntro * 1.8 - aH * 0.8, 0.0, 1.0);
  vShow = smoothstep(0.0, 0.3, k);
  vTop = aH * ${p.toFixed(2)} * (1.0 - pow(1.0 - k, 3.0));
  vY = mix(vTop, -${m.toFixed(2)}, aDown);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, vY, position.z, 1.0);
}`,ge=`
varying float vY;
varying float vTop;
varying float vShow;
const vec3 LIME = ${d};
void main() {
  // срез блока: горизонтали через равный шаг высоты, ярче у поверхности
  float f = (vY + ${m.toFixed(2)}) / 0.026;
  float w = fwidth(f);
  float dl = abs(fract(f) - 0.5) / max(w, 1e-5);
  float strata = (1.0 - smoothstep(0.35, 1.25, dl)) * (1.0 - smoothstep(0.3, 0.55, w));
  float near = smoothstep(-${m.toFixed(2)}, max(vTop, 0.01), vY);
  vec3 col = vec3(0.02, 0.027, 0.018) + LIME * 0.03 * near;
  col = mix(col, LIME, strata * mix(0.12, 0.5, near) * vShow);
  float a = 0.95 * smoothstep(0.0, 0.2, vShow + 0.001) * smoothstep(-${m.toFixed(2)}, -${m.toFixed(2)} + fwidth(vY) * 1.5, vY);
  gl_FragColor = vec4(col * a, a);
}`,_e=async({canvas:d,labels:m,url:_e})=>{let{w:g,px:_}=await de(_e),v=new Float32Array(g*g),ve=new Uint8Array(_.length);ve.set(_);for(let e=0;e<g*g;e++)v[e]=_[e*4]/255;let y=(e,t)=>{let n=Math.min(g-1.001,Math.max(0,e*g-.5)),r=Math.min(g-1.001,Math.max(0,t*g-.5)),i=Math.floor(n),a=Math.floor(r),o=n-i,s=r-a,c=a*g+i;return v[c]*(1-o)*(1-s)+v[c+1]*o*(1-s)+v[c+g]*(1-o)*s+v[c+g+1]*o*s},b=(t,n,r=0)=>new e((t-.5)*2,y(t,n)*p+r,(n-.5)*2),x=ie(),S=new r,C=new a;S.add(C);let w=new te(28,1.5,.1,40),T=new c(ve,g,g,ee,n);T.minFilter=i,T.magFilter=i,T.needsUpdate=!0;let E={value:0};await u();let D=40401,O=new Float32Array(D*3),k=new Float32Array(D*2),A=new Float32Array(D),j=new Uint32Array(4e4*6);for(let e=0,t=0;e<=200;e++)for(let n=0;n<=200;n++,t++){let r=n/200,i=e/200;O[t*3]=(r-.5)*2,O[t*3+2]=(i-.5)*2,k[t*2]=r,k[t*2+1]=i,A[t]=y(r,i)}for(let e=0,t=0;e<200;e++)for(let n=0;n<200;n++){let r=e*201+n,i=r+1,a=r+200+1,o=a+1;j[t++]=r,j[t++]=a,j[t++]=i,j[t++]=i,j[t++]=a,j[t++]=o}await u();let M=new s;M.setAttribute(`position`,new o(O,3)),M.setAttribute(`uv`,new o(k,2)),M.setAttribute(`aH`,new o(A,1)),M.setIndex(new o(j,1));let N=new t({vertexShader:pe,fragmentShader:me,transparent:!0,premultipliedAlpha:!0,uniforms:{tData:{value:T},uTexel:{value:1/g},uIntro:E,uRows:{value:64},uLine:{value:.8},uPointer:{value:new e(.5,.5,0)}}}),P=new l(M,N);P.frustumCulled=!1;let F=[],I=[],L=[],ye=[],R=e=>{let t=F.length/3;for(let n=0;n<=200;n++){let[r,i]=e(n/200),a=y(r,i);for(let e of[0,1])F.push((r-.5)*2,0,(i-.5)*2),I.push(a),L.push(e);if(n<200){let e=t+n*2;ye.push(e,e+1,e+2,e+2,e+1,e+3)}}};R(e=>[e,1]),R(e=>[e,0]),R(e=>[0,e]),R(e=>[1,e]);let z=new s;z.setAttribute(`position`,new o(new Float32Array(F),3)),z.setAttribute(`aH`,new o(new Float32Array(I),1)),z.setAttribute(`aDown`,new o(new Float32Array(L),1)),z.setIndex(ye);let be=new t({vertexShader:he,fragmentShader:ge,transparent:!0,premultipliedAlpha:!0,side:2,uniforms:{uIntro:E}}),xe=new l(z,be);xe.frustumCulled=!1,C.add(xe,P),await u();let B=[],V=[];for(let e=0;e<h.length-1;e++){V.push(B.length);for(let t=0;t<26;t++){let n=t/26;B.push(b(h[e][0]+(h[e+1][0]-h[e][0])*n,h[e][1]+(h[e+1][1]-h[e][1])*n,.012))}}V.push(B.length),B.push(b(f.summit[0],f.summit[1],.012));let H=re(x,[{pts:B,phase:0,speed:fe}],.42);H.renderOrder=2,C.add(H);let U=h.map(([e,t],n)=>{let r=b(e,t),i=n===h.length-1,a=i?.62:.3,o=ce(x,r,a,i?1.5:1);return o.renderOrder=3,C.add(o),{b:o,tagAt:r.clone().setY(r.y+a),t:V[n]/(B.length-1),gain:i?1.5:1}}),Se=se(m,U.map(e=>e.tagAt)),W=ue(d),G=.4,Ce=.56,K=new e(0,1,0),we=new e(.06,.2,-.05).applyAxisAngle(K,G),q=new e,J=new e,Y=new e,Te=0,X=-1,Z=0,Q=0,$=0,Ee=ne({canvas:d,scene:S,camera:w,maxDpr:1.5,frame:(t,n,r)=>{let i=r.cssW/r.cssH;if(Math.abs(i-Te)>.001){Te=i;let t=[];for(let n of[-1,1])for(let r of[-1,1])t.push(new e(n,-.12,r).applyAxisAngle(K,G));t.push(U[3].tagAt.clone().setY(U[3].tagAt.y+.3).applyAxisAngle(K,G)),oe(w,i,we,new e(0,Math.sin(Ce),Math.cos(Ce)),t,[.98,.94,.96])}X<0&&(X=t);let a=t-X;x.uTime.value=a,x.uShow.value=ae((a-1.5)/.9),E.value=Math.min(1,a/2.4),N.uniforms.uLine.value=.55+.22*r.dpr,N.uniforms.uRows.value=Math.round(Math.max(30,Math.min(70,r.cssW/9))),H.material.uniforms.uRes.value.set(r.w,r.h),H.material.uniforms.uWidth.value=1.5*r.dpr;let o=le(a,0,fe);for(let e of U){let t=o-e.t;e.b.material.uniforms.uGain.value=e.gain*(1+(t>0?Math.exp(-t*6):0))}let s=1-Math.exp(-n*3);Z+=(Math.sin(a*.2)*.06+W.p.nx*.1-Z)*s,Q+=(-W.p.ny*.04-Q)*s,C.rotation.set(Q,G+Z,0),C.updateMatrixWorld();for(let e of U)e.b.rotation.y=-(G+Z);let c=0;if(W.p.inside){Y.copy(w.position),J.set(W.p.nx,W.p.ny,.5).unproject(w).sub(Y).normalize(),C.worldToLocal(Y),J.applyAxisAngle(K,-(G+Z));let e=(.2-Y.y)/J.y;e>0&&(q.copy(Y).addScaledVector(J,e),N.uniforms.uPointer.value.setX(q.x/2+.5).setY(q.z/2+.5),c=1)}$+=(c-$)*(1-Math.exp(-n*6)),N.uniforms.uPointer.value.z=$,Se.place(C,w,r,ae((a-1.9)/.7))},post:Se.write});return()=>{Ee(),W.off(),M.dispose(),N.dispose(),z.dispose(),be.dispose(),T.dispose(),H.geometry.dispose(),H.material.dispose();for(let e of U)e.b.geometry.dispose(),e.b.material.dispose()}};export{_e as mountPeak};