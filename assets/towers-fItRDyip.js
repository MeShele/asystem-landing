import{_ as e,h as t,i as n,l as r,m as i,n as a,r as o,t as s,v as c}from"./stage-LowWm-hD.js";var l=16,u=1400,d=1150,f=22,p=250,m=1.5,h={main:0,accent:1,side:2,ghost:3},g={main:46,accent:60,side:28,ghost:40},_=`
uniform vec2 uRes;
uniform vec3 uEye;
uniform float uBleed;
uniform float uT;
uniform float uG;
uniform float uHead;
uniform float uCycle;
uniform float uFirst;
uniform vec3 uPointer;
const vec3 LIME = vec3(0.714, 1.0, 0.102);
const vec3 FG = vec3(0.93, 0.95, 0.9);
const float SPEED = ${p.toFixed(1)};
/* окно: точки в плоскости стекла (z = 0) неподвижны, точки в глубине сходятся к глазу */
vec4 proj(vec3 p) {
  vec2 s = p.xy + uBleed;
  s = uEye.xy + (s - uEye.xy) * (uEye.z / (uEye.z + p.z));
  return vec4(s.x / uRes.x * 2.0 - 1.0, 1.0 - s.y / uRes.y * 2.0, -0.98 + p.z * 0.0006, 1.0);
}
/* секунд с момента, когда импульс вошёл в узел; 99 — ещё не входил */
float since(float hit) {
  if (hit < 0.0) return 99.0;
  float ds = uHead - hit;
  if (ds < 0.0) { if (uFirst > 0.5) return 99.0; ds += uCycle; }
  return ds / SPEED;
}
/* хвост света за импульсом в точке маршрута at (px пути); -1 — вне маршрута */
float trail(float at) {
  if (at < 0.0) return 0.0;
  float dt = uHead - at;
  if (dt < 0.0) { if (uFirst > 0.5) return 0.0; dt += uCycle; }
  return exp(-dt / 120.0) * smoothstep(0.0, 4.0, dt);
}
float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}`,v=`
attribute vec4 aRect;
attribute vec4 aMeta;
attribute vec4 aPath;
varying vec2 vP;
varying vec4 vRect;
varying vec4 vMeta;
varying vec4 vPath;
varying vec2 vS;
${_}
void main() {
  vP = position.xy; vRect = aRect; vMeta = aMeta; vPath = aPath;
  gl_Position = proj(position);
  // та же точка в пикселях экрана (в координатах схемы)
  vS = (gl_Position.xy * vec2(0.5, -0.5) + 0.5) * uRes - uBleed;
}`,y=`
varying vec2 vP;
varying vec4 vRect;
varying vec4 vMeta;
varying vec4 vPath;
varying vec2 vS;
${_}
const vec3 MAIN = vec3(0.071, 0.075, 0.065);
const vec3 SIDE = vec3(0.108, 0.116, 0.1);
void main() {
  vec2 p = vP - vRect.xy;
  float sd = sdBox(p, vRect.zw, ${l.toFixed(1)});
  float aa = max(fwidth(sd), 1e-3);
  float kind = vMeta.x;
  float appear = smoothstep(0.0, 1.0, clamp((uT - vMeta.z) / 0.6, 0.0, 1.0));
  float s = since(vMeta.y);
  float glow = exp(-s * 1.7);
  // свет заявки бежит по плите от входа к выходу: run — насколько он уже прошёл эту точку
  vec2 across = vPath.zw - vPath.xy;
  float span = max(length(across), 1.0);
  float at = vMeta.y < 0.0 ? -1.0 : vMeta.y + clamp(dot(vP - vPath.xy, across / span), 0.0, span);
  float run = trail(at);
  // внутри плиты — мягкое пятно вокруг импульса, без резкого фронта под текстом
  float body = at < 0.0 ? 0.0 : exp(-pow((uHead - at - 30.0) / 75.0, 2.0));
  vec2 dp = vP + uBleed - uPointer.xy;
  float spot = exp(-dot(dp, dp) / 30000.0) * uPointer.z;

  if (kind > 2.5) {
    // пустое место: пунктирный контур сверху и слабее в глубине; дно видно только из-под верха
    if (vMeta.w > 0.5 && sdBox(vS - vRect.xy, vRect.zw, ${l.toFixed(1)}) < 1.0) discard;
    float line = 1.0 - smoothstep(0.55, 0.55 + aa, abs(sd + 0.8));
    float along = (vRect.z - abs(p.x)) < (vRect.w - abs(p.y)) ? p.y : p.x;
    float dash = smoothstep(0.0, 0.1, abs(fract(along / 9.0) - 0.5) - 0.2);
    float a = line * dash * mix(0.32, 0.1, vMeta.w) * appear * (1.0 + spot * 1.5);
    if (a < 0.004) discard;
    gl_FragColor = vec4(FG * a, a);
    return;
  }
  if (sd > aa) discard;
  float inside = 1.0 - smoothstep(-aa, aa, sd);
  float rim = 1.0 - smoothstep(0.5, 0.5 + aa * 1.2, abs(sd + 0.9));
  float rr = length(vP - vPath.xy);
  float wave = exp(-pow((rr - s * 380.0) / 26.0, 2.0)) * exp(-s * 1.5);
  float top = clamp(0.5 - p.y / (vRect.w * 2.0), 0.0, 1.0);
  vec3 col;
  if (kind > 0.5 && kind < 1.5) {
    col = LIME * (0.96 + 0.04 * top);
    col = mix(col, vec3(1.0), clamp(wave * 0.26 + body * 0.14 + rim * (0.2 + glow * 0.3 + run * 0.6), 0.0, 1.0));
  } else {
    col = (kind > 1.5 ? SIDE : MAIN) + vec3(0.012) * top;
    col += LIME * (wave * 0.1 + body * 0.055 + glow * 0.03 + spot * 0.03);
    col = mix(col, mix(FG, LIME, clamp(0.3 + glow + run + spot, 0.0, 1.0)), rim * clamp(0.16 + glow * 0.3 + run * 0.85 + spot * 0.4, 0.0, 1.0));
  }
  float a = inside * appear;
  gl_FragColor = vec4(col * a, a);
}`,b=`
varying vec2 vP;
varying vec4 vRect;
varying vec4 vMeta;
varying vec4 vPath;
${_}
void main() {
  // свечение вокруг итогового узла: ярче в момент, когда заявка дошла
  float sd = sdBox(vP - vRect.xy, vRect.zw, ${l.toFixed(1)});
  float appear = smoothstep(0.0, 1.0, clamp((uT - vMeta.z) / 0.6, 0.0, 1.0));
  float glow = exp(-since(vMeta.y) * 1.3);
  float a = exp(-max(sd, 0.0) / 15.0) * (0.13 + glow * 0.3) * appear;
  gl_FragColor = vec4(LIME * a, a);
}`,x=`
varying vec2 vP;
varying vec4 vRect;
varying vec4 vMeta;
varying vec4 vPath;
${_}
void main() {
  // пол под плитой: мягкая тень, под итоговым узлом — лужица света
  float sd = sdBox(vP - vRect.xy, vRect.zw, ${l.toFixed(1)});
  float appear = smoothstep(0.0, 1.0, clamp((uG - vMeta.z - 0.2) / 0.9, 0.0, 1.0));
  float soft = 1.0 - smoothstep(-16.0, 20.0, sd);
  if (vMeta.x > 0.5 && vMeta.x < 1.5) {
    float a = soft * (0.07 + exp(-since(vMeta.y) * 1.3) * 0.14) * appear;
    gl_FragColor = vec4(LIME * a, a);
  } else {
    float a = soft * 0.42 * appear;
    gl_FragColor = vec4(vec3(0.0), a);
  }
}`,S=`
attribute vec4 aWall;
attribute vec4 aMeta;
attribute vec4 aPath;
varying float vDepth;
varying float vDn;
varying vec2 vN;
varying vec4 vMeta;
varying float vAt;
${_}
void main() {
  // столб вырастает в глубину вслед за появлением крыши
  float g = clamp((uG - aMeta.z - 0.1) / 0.9, 0.0, 1.0);
  g = 1.0 - pow(1.0 - g, 3.0);
  vDepth = aWall.x * aWall.y * g;
  vDn = aWall.x; vN = aWall.zw; vMeta = aMeta;
  vec2 across = aPath.zw - aPath.xy;
  float span = max(length(across), 1.0);
  vAt = aMeta.y < 0.0 ? -1.0 : aMeta.y + clamp(dot(position.xy - aPath.xy, across / span), 0.0, span);
  gl_Position = proj(vec3(position.xy, vDepth));
}`,C=`
varying float vDepth;
varying float vDn;
varying vec2 vN;
varying vec4 vMeta;
varying float vAt;
${_}
void main() {
  float kind = vMeta.x;
  // срез плиты: горизонтали через равный шаг глубины, свет гаснет вниз
  float f = vDepth / 8.0;
  float w = fwidth(f);
  float dl = abs(fract(f) - 0.5) / max(w, 1e-5);
  float line = (1.0 - smoothstep(0.4, 1.2, dl)) * (1.0 - smoothstep(0.3, 0.55, w));
  float fade = 1.0 - vDn;
  float light = 0.7 + 0.3 * dot(normalize(vN), normalize(vec2(-0.5, 0.86)));
  float s = since(vAt);
  float wave = exp(-pow((vDn - s * 1.9) * 3.2, 2.0)) * exp(-s * 0.9);
  vec3 base = kind > 0.5 && kind < 1.5 ? vec3(0.2, 0.29, 0.04) : kind > 1.5 ? vec3(0.062, 0.068, 0.058) : vec3(0.04, 0.05, 0.036);
  vec3 col = base * (0.6 + 0.4 * fade) * light;
  float lit = (0.2 + 0.5 * fade) * light + wave * 0.9;
  col = mix(col, LIME, clamp(line * lit, 0.0, 1.0));
  col += LIME * wave * 0.07;
  gl_FragColor = vec4(col, 1.0);
}`,w=`
attribute float aSide;
attribute vec4 aRoute;
attribute float aBorn;
varying float vSide;
varying vec4 vRoute;
varying float vBorn;
${_}
void main() {
  vSide = aSide; vRoute = aRoute; vBorn = aBorn;
  gl_Position = proj(position);
}`,T=9,E=`
varying float vSide;
varying vec4 vRoute;
varying float vBorn;
${_}
void main() {
  float x = abs(vSide) * ${T.toFixed(1)};
  float core = 1.0 - smoothstep(0.55, 1.45, x);
  float halo = exp(-x * x / 13.0);
  // мост прорастает от своего узла
  float rev = clamp((uG - vBorn - 0.25) / 0.55, 0.0, 1.0);
  float shown = 1.0 - smoothstep(rev * vRoute.z - 5.0, rev * vRoute.z + 0.01, vRoute.y);
  float a; vec3 col;
  if (vRoute.w > 0.5) {
    a = core * step(0.45, fract(vRoute.y / 9.0)) * 0.3;
    col = FG;
  } else {
    float comet = trail(vRoute.x), head = 0.0;
    if (vRoute.x >= 0.0) { float dt = uHead - vRoute.x; if (dt > 0.0) head = exp(-dt * dt / 140.0); }
    a = core * (0.5 + comet * 0.5) + halo * (0.05 + comet * 0.5 + head * 0.5);
    col = mix(LIME, vec3(1.0), clamp(comet * core * 0.7 + head * 0.5, 0.0, 1.0));
  }
  a *= shown;
  if (a < 0.003) discard;
  gl_FragColor = vec4(col * a, a);
}`,D=`
attribute vec3 aOther;
attribute vec3 aPost;
varying float vV;
varying float vSide;
varying float vBorn;
${_}
void main() {
  // тонкая стойка пустого узла: лента экранной ширины вдоль ребра, уходящего в глубину
  float g = clamp((uG - aPost.z - 0.1) / 0.9, 0.0, 1.0);
  g = 1.0 - pow(1.0 - g, 3.0);
  vec4 a = proj(vec3(position.xy, position.z * g));
  vec4 b = proj(vec3(aOther.xy, aOther.z * g));
  vec2 dir = (b.xy - a.xy) * uRes;
  dir = length(dir) > 1e-4 ? normalize(dir) : vec2(0.0, 1.0);
  if (aPost.y > 0.5) dir = -dir;
  a.xy += vec2(-dir.y, dir.x) * aPost.x * 1.6 / uRes;
  vV = aPost.y; vSide = aPost.x; vBorn = aPost.z;
  gl_Position = a;
}`,O=`
varying float vV;
varying float vSide;
varying float vBorn;
${_}
void main() {
  float appear = smoothstep(0.0, 1.0, clamp((uT - vBorn) / 0.6, 0.0, 1.0));
  float a = (1.0 - smoothstep(0.3, 1.0, abs(vSide))) * step(0.45, fract(vV * 7.0)) * mix(0.3, 0.06, vV) * appear;
  if (a < 0.004) discard;
  gl_FragColor = vec4(FG * a, a);
}`,k=(e,t,n,r,i)=>{let a=[],o=[[e+n-i,t+i,-Math.PI/2],[e+n-i,t+r-i,0],[e+i,t+r-i,Math.PI/2],[e+i,t+i,Math.PI]];for(let[e,t,n]of o)for(let r=0;r<=7;r++){let o=n+r/7*(Math.PI/2);a.push([e+Math.cos(o)*i,t+Math.sin(o)*i,Math.cos(o),Math.sin(o)])}return a},A=(e,t)=>{let n={pos:[],idx:[],rect:[],meta:[],path:[]},r={pos:[],idx:[],rect:[],meta:[],path:[]},i={pos:[],idx:[],rect:[],meta:[],path:[]},a={pos:[],idx:[],wall:[],meta:[],path:[]},o={pos:[],idx:[],side:[],route:[],born:[]},s={pos:[],idx:[],other:[],post:[]},c=(e,t,n,r,i)=>{let{x:a,y:o,w:s,h:c}=t.box,l=e.pos.length/3,u=t.index*.07;for(let[l,d]of[[a-n,o-n],[a+s+n,o-n],[a-n,o+c+n],[a+s+n,o+c+n]])e.pos.push(l,d,r),e.rect.push(a+s/2,o+c/2,s/2,c/2),e.meta.push(h[t.kind],t.hit,u,i),e.path.push(t.from[0],t.from[1],t.to[0],t.to[1]);e.idx.push(l,l+1,l+2,l+2,l+1,l+3)};for(let o of e.nodes){let{x:e,y:u,w:d,h:p}=o.box,m=g[o.kind]*t,_=o.index*.07,v=Math.min(l,d/2,p/2);if(c(n,o,3,0,0),o.kind===`accent`&&c(r,o,56,0,0),o.kind===`ghost`){c(n,o,3,m,1);let t=v*(1-Math.SQRT1_2);for(let[n,r]of[[e+t,u+t],[e+d-t,u+t],[e+d-t,u+p-t],[e+t,u+p-t]]){let e=s.pos.length/3;for(let[e,t]of[[0,-1],[0,1],[1,-1],[1,1]])s.pos.push(n,r,e?m:0),s.other.push(n,r,e?0:m),s.post.push(t,e,_);s.idx.push(e,e+1,e+2,e+2,e+1,e+3)}continue}c(i,o,40,m+f*t,0);let y=k(e,u,d,p,v),b=a.pos.length/3;y.forEach(([e,t,n,r],i)=>{for(let i of[0,1])a.pos.push(e,t,0),a.wall.push(i,m,n,r),a.meta.push(h[o.kind],o.hit,_,0),a.path.push(o.from[0],o.from[1],o.to[0],o.to[1]);let s=b+i*2,c=b+(i+1)%y.length*2;a.idx.push(s,s+1,c,c,s+1,c+1)})}for(let t of e.edges){let e=t.pts;if(e.length<2)continue;let n=0,r=[0];for(let t=1;t<e.length;t++)n+=Math.hypot(e[t][0]-e[t-1][0],e[t][1]-e[t-1][1]),r.push(n);let i=o.pos.length/3,a=t.after*.07;e.forEach(([s,c],l)=>{let u=e[Math.max(0,l-1)],d=e[Math.min(e.length-1,l+1)],f=Math.hypot(d[0]-u[0],d[1]-u[1])||1,p=-(d[1]-u[1])/f,m=(d[0]-u[0])/f;for(let e of[-1,1])o.pos.push(s+p*e*T,c+m*e*T,1),o.side.push(e),o.route.push(t.s0>=0?t.s0+r[l]:-1,r[l],n,+!!t.dashed),o.born.push(a);if(l<e.length-1){let e=i+l*2;o.idx.push(e,e+1,e+2,e+2,e+1,e+3)}})}return{roof:n,halo:r,shadow:i,wall:a,bridge:o,post:s}},j=(e,t)=>{let n=new o;n.setAttribute(`position`,new a(new Float32Array(e.pos),3));for(let[r,[i,o]]of Object.entries(t))n.setAttribute(i,new a(new Float32Array(e[r]),o));return n.setIndex(e.idx),n},M=(a,o)=>{let l=new i,f=new n,h={uRes:{value:new e(1,1)},uEye:{value:new c(0,0,u)},uBleed:{value:o},uT:{value:-10},uG:{value:-10},uHead:{value:-1e5},uCycle:{value:1},uFirst:{value:1},uPointer:{value:new c(-9999,-9999,0)}},g=(e,n,r,i=!0)=>new t({vertexShader:e,fragmentShader:n,uniforms:h,transparent:!0,premultipliedAlpha:!0,side:2,depthWrite:r,depthTest:i}),_={shadow:g(v,x,!1,!1),halo:g(v,b,!1,!1),wall:g(S,C,!0),roof:g(v,y,!0),bridge:g(w,E,!1),post:g(D,O,!1)},T=[],k=0,M=0,N=e=>{for(let e of T)l.remove(e),e.geometry.dispose();let t=A(e,e.wide?1:.42),n={rect:[`aRect`,4],meta:[`aMeta`,4],path:[`aPath`,4]},i=[[t.shadow,_.shadow,n],[t.halo,_.halo,n],[t.wall,_.wall,{wall:[`aWall`,4],meta:[`aMeta`,4],path:[`aPath`,4]}],[t.roof,_.roof,n],[t.bridge,_.bridge,{side:[`aSide`,1],route:[`aRoute`,4],born:[`aBorn`,1]}],[t.post,_.post,{other:[`aOther`,3],post:[`aPost`,3]}]];T=[],i.forEach(([e,t,n],i)=>{if(!e.idx.length)return;let a=new r(j(e,n),t);a.frustumCulled=!1,a.renderOrder=i,l.add(a),T.push(a)}),k=e.routeLen,M=e.nodes.length,h.uCycle.value=Math.max(1,k+m*p)},P={x:0,y:0,cx:0,cy:0,seen:!1,on:0},F=e=>{e.pointerType!==`touch`&&(P.x=e.clientX,P.y=e.clientY,P.seen=!0)};window.addEventListener(`pointermove`,F,{passive:!0});let I=-1,L=-1,R=0,z=0,B=null,V=s({canvas:a,scene:l,camera:f,maxDpr:2,frame:(e,t,n)=>{B!==null&&(I=e-B,L=e,B=null),h.uRes.value.set(n.cssW,n.cssH);let r=a.getBoundingClientRect(),i=window.innerWidth,o=window.innerHeight,s=1-Math.exp(-t*4);R+=((P.seen?(P.x-i/2)*1.2:0)-R)*s,z+=((P.seen?(P.y-o/2)*1.2:0)-z)*s,h.uEye.value.set(i/2-r.left+R,o/2-r.top+d+z,u);let c=P.x-r.left,l=P.y-r.top,f=P.seen&&c>-80&&l>-80&&c<r.width+80&&l<r.height+80?1:0;if(P.on+=(f-P.on)*(1-Math.exp(-t*6)),h.uPointer.value.set(c,l,P.on),I<0)return;h.uT.value=e-I;let m=e-L;h.uG.value=m;let g=m-(1+M*.07);if(g<0||k<=0){h.uHead.value=-1e5,h.uFirst.value=1;return}let _=h.uCycle.value,v=g*p;h.uHead.value=v%_,h.uFirst.value=+(v<_)}});return{update:N,start:e=>{I<0&&B===null&&(B=e)},dispose:()=>{V(),window.removeEventListener(`pointermove`,F);for(let e of T)e.geometry.dispose();for(let e of Object.values(_))e.dispose()}}};export{M as mountTowers};