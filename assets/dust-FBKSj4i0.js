import{f as e,h as t,m as n,n as r,o as i,r as a,t as o,u as s,v as c}from"./stage-CTPSTSyp.js";import{r as l}from"./reliefData-DzQUuJtr.js";var u=(e,t,n)=>{let r=new Float32Array(t*t),i=new Float32Array(t*t),a=2*n+1;for(let i=0;i<t;i++){let o=0;for(let r=-n;r<=n;r++)o+=e[i*t+Math.min(t-1,Math.max(0,r))];for(let s=0;s<t;s++)r[i*t+s]=o/a,o+=e[i*t+Math.min(t-1,s+n+1)]-e[i*t+Math.max(0,s-n)]}for(let e=0;e<t;e++){let o=0;for(let i=-n;i<=n;i++)o+=r[Math.min(t-1,Math.max(0,i))*t+e];for(let s=0;s<t;s++)i[s*t+e]=o/a,o+=r[Math.min(t-1,s+n+1)*t+e]-r[Math.max(0,s-n)*t+e]}return i},d=e=>{let t=Math.imul(e^2654435769,2246822507);return t=Math.imul(t^t>>>13,3266489909),((t^t>>>16)>>>0)/4294967296},f=(e,t,n)=>{let r=Math.min(t,n),i=new Float32Array(r*r),a=0;for(let n=0;n<r;n++)for(let o=0;o<r;o++){let s=e[(n*t+o)*4+3]/255;i[n*r+o]=s,s>=.1&&a++}let o=u(u(i,r,9),r,9),s=new Float32Array(a*3),c=new Uint8Array(a),l=new Uint8Array(a*4),f=0;for(let e=0;e<r;e++)for(let t=0;t<r;t++){let n=e*r+t,a=i[n];if(a<.1)continue;let u=n*7;s[f*3]=(t+d(u+1))/r*2-1,s[f*3+1]=1-(e+d(u+2))/r*2,s[f*3+2]=(o[n]-.35)*.3,c[f]=Math.round(a*255),l[f*4]=d(u+3)*255,l[f*4+1]=d(u+4)*255,l[f*4+2]=d(u+5)*255,l[f*4+3]=d(u+6)*255,f++}return{n:r,pos:s,ink:c,seed:l}},p=`
attribute vec4 aRnd;
attribute float aInk;
uniform float uGather;
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
  // курсор расталкивает пыль и приподнимает её
  vec2 d = p.xy - uPointer.xy;
  float push = exp(-dot(d, d) * 30.0) * uPointer.z;
  p.xy += normalize(d + 1e-4) * push * (0.02 + aRnd.z * 0.07);
  p.z += push * (0.1 + aRnd.w * 0.3);
  vInk = aInk * smoothstep(0.0, 0.4, k);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (1.0 + (1.0 - e) * 1.2 + push * 1.5);
}`,m=`
varying float vInk;
const vec3 LIME = vec3(0.714, 1.0, 0.102);
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = vInk * smoothstep(1.0, 0.55, r);
  gl_FragColor = vec4(LIME * a, a);
}`,h=null,g=0,_=new Map,v=e=>new Promise((t,n)=>{h||(h=new Worker(new URL(`/assets/dust.worker-AZ2Y3fAc.js`,``+import.meta.url),{type:`module`}),h.addEventListener(`message`,e=>{let{id:t,error:n,...r}=e.data,i=_.get(t);_.delete(t),i&&(n?i.reject(Error(n)):i.resolve(r))}),h.addEventListener(`error`,()=>{for(let e of _.values())e.reject(Error(`dust worker failed`));_.clear(),h=null}));let r=++g;_.set(r,{resolve:t,reject:n}),h.postMessage({id:r,url:new URL(e,location.href).href})}),y=async e=>{if(typeof Worker<`u`&&typeof OffscreenCanvas<`u`)try{return await v(e)}catch{}let{w:t,h:n,px:r}=await l(e);return f(r,t,n)},b=async({canvas:l,url:u})=>{let{n:d,pos:f,ink:h,seed:g}=await y(u),_=new a;_.setAttribute(`position`,new r(f,3)),_.setAttribute(`aInk`,new r(h,1,!0)),_.setAttribute(`aRnd`,new r(g,4,!0));let v=new t({vertexShader:p,fragmentShader:m,transparent:!0,premultipliedAlpha:!0,blending:1,depthTest:!1,depthWrite:!1,uniforms:{uGather:{value:0},uSize:{value:1},uPointer:{value:new c(9,9,0)}}}),b=new e(_,v);b.frustumCulled=!1;let x=new i;x.add(b);let S=new n;S.add(x);let C=1/Math.tan(16*Math.PI/360),w=new s(16,1,.1,30);w.position.set(0,0,C);let T={cx:0,cy:0,seen:!1},E=e=>{e.pointerType!==`touch`&&(T.cx=e.clientX,T.cy=e.clientY,T.seen=!0)};window.addEventListener(`pointermove`,E,{passive:!0});let D=-1,O=0,k=0,A=0,j=o({canvas:l,scene:S,camera:w,maxDpr:1.25,frame:(e,t,n)=>{let r=l.getBoundingClientRect();if(D<0)if(r.top<window.innerHeight*.82&&r.bottom>0)D=e;else return!1;let i=e-D,a=(T.cx-r.left)/r.width*2-1,o=-((T.cy-r.top)/r.height*2-1),s=T.seen&&Math.abs(a)<1.25&&Math.abs(o)<1.25?1:0,c=1-Math.exp(-t*3);if(O+=((s?a*.1:0)-O)*c,k+=((s?-o*.07:0)-k)*c,A+=(s-A)*(1-Math.exp(-t*5)),i>3.2&&!s&&A<.004&&Math.abs(O)+Math.abs(k)<.0015)return!1;w.aspect=n.cssW/n.cssH,w.updateProjectionMatrix(),v.uniforms.uGather.value=Math.min(1,i/2.5),v.uniforms.uSize.value=Math.max(1.15,n.h/d*1.3),x.rotation.set(k,O,0),v.uniforms.uPointer.value.set(a*(r.width/r.height),o,A)}});return()=>{j(),window.removeEventListener(`pointermove`,E),_.dispose(),v.dispose()}};export{b as mountDust};