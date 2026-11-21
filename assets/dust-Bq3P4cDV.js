import{f as e,h as t,m as n,n as r,o as i,r as a,t as o,u as s,v as c}from"./stage-LowWm-hD.js";import{r as l}from"./reliefData-DzQUuJtr.js";var u=`
attribute vec4 aRnd;
attribute float aInk;
uniform float uGather;
uniform float uTime;
uniform float uSize;
uniform vec3 uPointer;
varying float vInk;
void main() {
  // слёт: у каждой частицы своя задержка, от центра к краям
  float k = clamp((uGather * 1.75 - aRnd.x * 0.5 - length(position.xy) * 0.22) / 0.95, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - k, 4.0);
  vec3 away = (aRnd.yzw - 0.5) * vec3(1.1, 1.1, 3.2);
  away.xy += normalize(position.xy + 1e-4) * (0.25 + aRnd.x * 0.5);
  vec3 p = mix(position + away, position, e);
  p.z += sin(uTime * 0.8 + aRnd.y * 6.283) * 0.008;
  // курсор расталкивает пыль и приподнимает её
  vec2 d = p.xy - uPointer.xy;
  float push = exp(-dot(d, d) * 30.0) * uPointer.z;
  p.xy += normalize(d + 1e-4) * push * (0.02 + aRnd.z * 0.07);
  p.z += push * (0.1 + aRnd.w * 0.3);
  vInk = aInk * smoothstep(0.0, 0.4, k);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (1.0 + (1.0 - e) * 1.2 + push * 1.5);
}`,d=`
varying float vInk;
const vec3 LIME = vec3(0.714, 1.0, 0.102);
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = vInk * smoothstep(1.0, 0.55, r);
  gl_FragColor = vec4(LIME * a, a);
}`,f=(e,t,n)=>{let r=new Float32Array(t*t),i=new Float32Array(t*t),a=2*n+1;for(let i=0;i<t;i++){let o=0;for(let r=-n;r<=n;r++)o+=e[i*t+Math.min(t-1,Math.max(0,r))];for(let s=0;s<t;s++)r[i*t+s]=o/a,o+=e[i*t+Math.min(t-1,s+n+1)]-e[i*t+Math.max(0,s-n)]}for(let e=0;e<t;e++){let o=0;for(let i=-n;i<=n;i++)o+=r[Math.min(t-1,Math.max(0,i))*t+e];for(let s=0;s<t;s++)i[s*t+e]=o/a,o+=r[Math.min(t-1,s+n+1)*t+e]-r[Math.max(0,s-n)*t+e]}return i},p=async e=>{let{w:t,h:n,px:r}=await l(e),i=Math.min(t,n),a=new Float32Array(i*i);for(let e=0;e<i;e++)for(let n=0;n<i;n++)a[e*i+n]=r[(e*t+n)*4+3]/255;return{n:i,ink:a}},m=e=>{let t=Math.imul(e^2654435769,2246822507);return t=Math.imul(t^t>>>13,3266489909),((t^t>>>16)>>>0)/4294967296},h=()=>new Promise(e=>setTimeout(e,0)),g=async({canvas:l,url:g})=>{let{n:_,ink:v}=await p(g);await h();let y=f(f(v,_,9),_,9);await h();let b=0;for(let e=0;e<_*_;e++)v[e]>=.1&&b++;let x=new Float32Array(b*3),S=new Uint8Array(b),C=new Uint8Array(b*4),w=0;for(let e=0;e<_;e++)for(let t=0;t<_;t++){let n=e*_+t,r=v[n];if(r<.1)continue;x[w*3]=(t+m(n*7+1))/_*2-1,x[w*3+1]=1-(e+m(n*7+2))/_*2,x[w*3+2]=(y[n]-.35)*.3,S[w]=Math.round(r*255);let i=n*7;C[w*4]=m(i+3)*255,C[w*4+1]=m(i+4)*255,C[w*4+2]=m(i+5)*255,C[w*4+3]=m(i+6)*255,w++}let T=new a;T.setAttribute(`position`,new r(x,3)),T.setAttribute(`aInk`,new r(S,1,!0)),T.setAttribute(`aRnd`,new r(C,4,!0));let E=new t({vertexShader:u,fragmentShader:d,transparent:!0,premultipliedAlpha:!0,blending:1,depthTest:!1,depthWrite:!1,uniforms:{uGather:{value:0},uTime:{value:0},uSize:{value:1},uPointer:{value:new c(9,9,0)}}}),D=new e(T,E);D.frustumCulled=!1;let O=new i;O.add(D);let k=new n;k.add(O);let A=1/Math.tan(16*Math.PI/360),j=new s(16,1,.1,30);j.position.set(0,0,A);let M={x:9,y:9,on:0},N=e=>{if(e.pointerType===`touch`)return;let t=l.getBoundingClientRect();if(t.bottom<0||t.top>window.innerHeight){M.on=0;return}let n=(e.clientX-t.left)/t.width*2-1,r=-((e.clientY-t.top)/t.height*2-1);M.x=n*(t.width/t.height),M.y=r,M.on=+(Math.abs(n)<1.25&&Math.abs(r)<1.25)};window.addEventListener(`pointermove`,N,{passive:!0});let P=-1,F=0,I=0,L=0,R=o({canvas:l,scene:k,camera:j,maxDpr:1.5,frame:(e,t,n)=>{if(j.aspect=n.cssW/n.cssH,j.updateProjectionMatrix(),P<0){let t=l.getBoundingClientRect();t.top<window.innerHeight*.82&&t.bottom>0&&(P=e)}let r=P<0?0:e-P;E.uniforms.uGather.value=Math.min(1,r/2.5),E.uniforms.uTime.value=r,E.uniforms.uSize.value=Math.max(1.15,n.h/_*1.3);let i=1-Math.exp(-t*3);F+=(Math.sin(r*.35)*.07+(M.on?M.x*.1:0)-F)*i,I+=((M.on?-M.y*.07:0)+Math.sin(r*.27+1.3)*.04-I)*i,O.rotation.set(I,F,0),L+=(M.on-L)*(1-Math.exp(-t*5)),E.uniforms.uPointer.value.set(M.x,M.y,L)}});return()=>{R(),window.removeEventListener(`pointermove`,N),T.dispose(),E.dispose()}};export{g as mountDust};