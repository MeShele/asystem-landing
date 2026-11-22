import{_ as e,h as t,i as n,l as r,m as i,n as a,r as o,t as s,v as c}from"./stage-CTPSTSyp.js";var l=16,u=1400,d=1150,f=22,p=250,m=1.5,h={main:0,accent:1,side:2,ghost:3},g={main:46,accent:60,side:28,ghost:40},_=`
uniform vec2 uRes;
uniform vec3 uEye;
uniform float uBleed;
uniform float uT;
uniform float uG;
uniform float uHead;
uniform float uCycle;
uniform float uFirst;
uniform float uFloor;
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
/* глубина, при которой точка с экранной высотой y встаёт на общий пол (лестница) */
float floorDepth(float y) {
  float k = clamp((uFloor + uBleed - uEye.y) / (y + uBleed - uEye.y), 0.2, 1.0);
  return uEye.z * (1.0 / k - 1.0);
}
/* секунд с момента, когда импульс прошёл точку маршрута; 99 — ещё не проходил */
float since(float at) {
  if (at < 0.0) return 99.0;
  float ds = uHead - at;
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
/* прямоугольник со своим радиусом у каждого угла: r = (правый нижний, правый верхний, левый нижний, левый верхний) */
float sdBox(vec2 p, vec2 b, vec4 r) {
  r.xy = p.x > 0.0 ? r.xy : r.zw;
  r.x = p.y > 0.0 ? r.x : r.y;
  vec2 q = abs(p) - b + r.x;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r.x;
}`,v=`
attribute vec4 aRect;
attribute vec4 aMeta;
attribute vec4 aPath;
attribute vec4 aRad;
attribute vec2 aLook;
varying vec2 vP;
varying vec4 vRect;
varying vec4 vMeta;
varying vec4 vPath;
varying vec4 vRad;
varying vec2 vLook;
varying vec2 vS;
${_}
void main() {
  vP = position.xy; vRect = aRect; vMeta = aMeta; vPath = aPath; vRad = aRad; vLook = aLook;
  gl_Position = proj(position);
  // та же точка в пикселях экрана (в координатах схемы)
  vS = (gl_Position.xy * vec2(0.5, -0.5) + 0.5) * uRes - uBleed;
}`,y=`
varying vec2 vP;
varying vec4 vRect;
varying vec4 vMeta;
varying vec4 vPath;
varying vec4 vRad;
varying vec2 vLook;
varying vec2 vS;
${_}`,b=`
${y}
const vec3 MAIN = vec3(0.071, 0.075, 0.065);
const vec3 SIDE = vec3(0.108, 0.116, 0.1);
void main() {
  vec2 p = vP - vRect.xy;
  float sd = sdBox(p, vRect.zw, vRad);
  float aa = max(fwidth(sd), 1e-3);
  float kind = vMeta.x;
  bool glass = vLook.x > 0.5;
  float appear = smoothstep(0.0, 1.0, clamp((uT - vMeta.z) / 0.6, 0.0, 1.0));
  float s = since(vMeta.y);
  float glow = exp(-s * 1.7);
  // свет заявки бежит по узлу от входа к выходу: run — насколько он уже прошёл эту точку
  vec2 across = vPath.zw - vPath.xy;
  float span = max(length(across), 1.0);
  float at = vMeta.y < 0.0 ? -1.0 : vMeta.y + clamp(dot(vP - vPath.xy, across / span), 0.0, span);
  float run = trail(at);
  // внутри — мягкое пятно вокруг импульса, без резкого фронта под текстом
  float body = at < 0.0 ? 0.0 : exp(-pow((uHead - at - 30.0) / 75.0, 2.0));
  vec2 dp = vP + uBleed - uPointer.xy;
  float spot = exp(-dot(dp, dp) / 30000.0) * uPointer.z;

  if (kind > 2.5) {
    // пустое место: пунктирный контур сверху и слабее в глубине; дно видно только из-под верха
    if (vMeta.w > 0.5 && sdBox(vS - vRect.xy, vRect.zw, vRad) < 1.0) discard;
    float line = 1.0 - smoothstep(0.55, 0.55 + aa, abs(sd + 0.8));
    float along = (vRect.z - abs(p.x)) < (vRect.w - abs(p.y)) ? p.y : p.x;
    float dash = smoothstep(0.0, 0.1, abs(fract(along / 9.0) - 0.5) - 0.2);
    float a = line * dash * mix(0.32, 0.1, vMeta.w) * appear * (1.0 + spot * 1.5);
    if (a < 0.004) discard;
    gl_FragColor = vec4(FG * a, a);
    return;
  }
  if (vMeta.w > 0.5) {
    // дно стеклянного короба: сплошной тонкий контур, виден только из-под верха
    if (sdBox(vS - vRect.xy, vRect.zw, vRad) < 1.0) discard;
    float line = 1.0 - smoothstep(0.5, 0.5 + aa, abs(sd + 0.7));
    float a = line * (0.2 + glow * 0.3) * appear;
    if (a < 0.004) discard;
    gl_FragColor = vec4(mix(FG, LIME, 0.6) * a, a);
    return;
  }
  if (sd > aa) discard;
  float inside = 1.0 - smoothstep(-aa, aa, sd);
  float rim = 1.0 - smoothstep(0.5, 0.5 + aa * 1.2, abs(sd + 0.9));
  float rr = length(vP - vPath.xy);
  float wave = exp(-pow((rr - s * 380.0) / 26.0, 2.0)) * exp(-s * 1.5);
  float top = clamp(0.5 - p.y / (vRect.w * 2.0), 0.0, 1.0);
  // деление ленты: тонкая черта по левому краю шага
  float cut = vLook.y > 0.5 ? 1.0 - smoothstep(0.4, 1.3, abs(p.x + vRect.z - 0.5)) : 0.0;
  vec3 col; float a = inside;
  if (kind > 0.5 && kind < 1.5) {
    col = LIME * (0.96 + 0.04 * top);
    col = mix(col, vec3(1.0), clamp(wave * 0.26 + body * 0.14 + rim * (0.2 + glow * 0.3 + run * 0.6), 0.0, 1.0));
  } else if (glass) {
    // чертёж: затемнённое стекло и лаймовый контур вместо сплошной плиты
    col = MAIN * 0.85 + LIME * (wave * 0.1 + body * 0.06 + glow * 0.03 + spot * 0.03);
    a = inside * (kind > 1.5 ? 0.42 : 0.6);
    float edge = clamp((kind > 1.5 ? 0.3 : 0.5) + glow * 0.3 + run * 0.6 + spot * 0.35, 0.0, 1.0);
    col = mix(col, mix(FG, LIME, clamp(0.62 + run + glow, 0.0, 1.0)), rim * edge);
    a = max(a, rim * edge * inside);
  } else {
    col = (kind > 1.5 ? SIDE : MAIN) + vec3(0.012) * top;
    col += LIME * (wave * 0.1 + body * 0.055 + glow * 0.03 + spot * 0.03);
    col = mix(col, mix(FG, LIME, clamp(0.3 + glow + run + spot, 0.0, 1.0)), rim * clamp(0.16 + glow * 0.3 + run * 0.85 + spot * 0.4, 0.0, 1.0));
    col = mix(col, mix(FG, LIME, clamp(0.5 + run, 0.0, 1.0)), cut * clamp(0.22 + run * 0.7 + glow * 0.3, 0.0, 1.0));
  }
  a *= appear;
  gl_FragColor = vec4(col * a, a);
}`,x=`
${y}
void main() {
  // свечение вокруг итогового узла: ярче в момент, когда заявка дошла
  float sd = sdBox(vP - vRect.xy, vRect.zw, vRad);
  float appear = smoothstep(0.0, 1.0, clamp((uT - vMeta.z) / 0.6, 0.0, 1.0));
  float glow = exp(-since(vMeta.y) * 1.3);
  float a = exp(-max(sd, 0.0) / 15.0) * (0.13 + glow * 0.3) * appear;
  gl_FragColor = vec4(LIME * a, a);
}`,S=`
${y}
void main() {
  // пол под плитой: мягкая тень, под итоговым узлом — лужица света
  float sd = sdBox(vP - vRect.xy, vRect.zw, vRad);
  float appear = smoothstep(0.0, 1.0, clamp((uG - vMeta.z - 0.2) / 0.9, 0.0, 1.0));
  float soft = 1.0 - smoothstep(-16.0, 20.0, sd);
  if (vMeta.x > 0.5 && vMeta.x < 1.5) {
    float a = soft * (0.07 + exp(-since(vMeta.y) * 1.3) * 0.14) * appear;
    gl_FragColor = vec4(LIME * a, a);
  } else {
    float a = soft * 0.42 * appear;
    gl_FragColor = vec4(vec3(0.0), a);
  }
}`,C=`
${y}
void main() {
  float show = smoothstep(0.0, 1.0, clamp(uG / 1.1, 0.0, 1.0));
  vec2 q = (vP - vRect.xy) / vRect.zw;
  if (vLook.x > 1.5) {
    // земля: тонкая линия и тень под ней, к краям растворяется
    float y = vP.y - (vRect.y - vRect.w);
    float line = 1.0 - smoothstep(0.4, 1.2, abs(y - 0.5));
    float shade = smoothstep(0.0, 2.0, y) * (1.0 - smoothstep(2.0, vRect.w * 2.0, y)) * 0.42;
    float ends = 1.0 - smoothstep(0.78, 1.0, abs(q.x));
    float lit = line * 0.26 * ends * show;
    gl_FragColor = vec4(mix(FG, LIME, 0.5) * lit, max(lit, shade * ends * show));
    return;
  }
  vec2 g = vP / 26.0;
  vec2 l = abs(fract(g - 0.5) - 0.5) / max(fwidth(g), vec2(1e-5));
  float fine = 1.0 - smoothstep(0.4, 1.3, min(l.x, l.y));
  vec2 g5 = vP / 130.0;
  vec2 l5 = abs(fract(g5 - 0.5) - 0.5) / max(fwidth(g5), vec2(1e-5));
  float bold = 1.0 - smoothstep(0.5, 1.5, min(l5.x, l5.y));
  float fade = 1.0 - smoothstep(0.45, 1.0, length(q));
  // к краю холста сетка растворяется, чтобы не было видно обреза
  vec2 sc = vS + uBleed;
  fade *= smoothstep(0.0, 48.0, min(min(sc.x, uRes.x - sc.x), min(sc.y, uRes.y - sc.y)));
  float a = (fine * 0.06 + bold * 0.07) * fade * show;
  gl_FragColor = vec4(LIME * a, a);
}`,w=`
attribute vec4 aWall;
attribute vec4 aMeta;
attribute vec4 aPath;
attribute float aBase;
varying float vDepth;
varying float vDn;
varying vec2 vN;
varying vec2 vXY;
varying vec4 vMeta;
varying float vAt;
${_}
void main() {
  // срез вырастает в глубину вслед за появлением верха; на лестнице — до общего пола
  float g = clamp((uG - aMeta.z - 0.1) / 0.9, 0.0, 1.0);
  g = 1.0 - pow(1.0 - g, 3.0);
  float full = aBase >= 0.0 ? floorDepth(aBase) : aWall.y;
  vDepth = aWall.x * full * g;
  vDn = aWall.x; vN = aWall.zw; vMeta = aMeta; vXY = position.xy;
  vec2 across = aPath.zw - aPath.xy;
  float span = max(length(across), 1.0);
  vAt = aMeta.y < 0.0 ? -1.0 : aMeta.y + clamp(dot(position.xy - aPath.xy, across / span), 0.0, span);
  gl_Position = proj(vec3(position.xy, vDepth));
}`,T=`
varying float vDepth;
varying float vDn;
varying vec2 vN;
varying vec2 vXY;
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
  // кромки сглаживает шейдер: нижнюю — по глубине, боковую — по повороту стенки от глаза
  float a = 1.0 - smoothstep(1.0 - fwidth(vDn) * 1.5, 1.0, vDn);
  a *= smoothstep(0.0, 0.07, dot(normalize(vN), normalize(uEye.xy - vXY - uBleed)));
  if (a < 0.02) discard;
  gl_FragColor = vec4(col * a, a);
}`,E=`
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
}`,D=9,O=`
varying float vSide;
varying vec4 vRoute;
varying float vBorn;
${_}
void main() {
  float x = abs(vSide) * ${D.toFixed(1)};
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
}`,k=`
attribute vec3 aOther;
attribute vec4 aPost;
varying float vV;
varying float vSide;
varying vec2 vBornStyle;
${_}
void main() {
  // тонкая стойка короба: лента экранной ширины вдоль ребра, уходящего в глубину
  float g = clamp((uG - aPost.z - 0.1) / 0.9, 0.0, 1.0);
  g = 1.0 - pow(1.0 - g, 3.0);
  vec4 a = proj(vec3(position.xy, position.z * g));
  vec4 b = proj(vec3(aOther.xy, aOther.z * g));
  vec2 dir = (b.xy - a.xy) * uRes;
  dir = length(dir) > 1e-4 ? normalize(dir) : vec2(0.0, 1.0);
  if (aPost.y > 0.5) dir = -dir;
  a.xy += vec2(-dir.y, dir.x) * aPost.x * 1.6 / uRes;
  vV = aPost.y; vSide = aPost.x; vBornStyle = aPost.zw;
  gl_Position = a;
}`,A=`
varying float vV;
varying float vSide;
varying vec2 vBornStyle;
${_}
void main() {
  float appear = smoothstep(0.0, 1.0, clamp((uT - vBornStyle.x) / 0.6, 0.0, 1.0));
  float core = 1.0 - smoothstep(0.3, 1.0, abs(vSide));
  // пунктир у пустого узла, сплошная лаймовая стойка у стеклянного короба
  bool solid = vBornStyle.y > 0.5;
  float a = core * (solid ? mix(0.42, 0.14, vV) : step(0.45, fract(vV * 7.0)) * mix(0.3, 0.06, vV)) * appear;
  if (a < 0.004) discard;
  gl_FragColor = vec4((solid ? mix(FG, LIME, 0.6) : FG) * a, a);
}`,j=({x:e,y:t,w:n,h:r},[i,a,o,s],c=[])=>{let l=[];return[[e+n-a,t+a,-Math.PI/2,a],[e+n-o,t+r-o,0,o],[e+s,t+r-s,Math.PI/2,s],[e+i,t+i,Math.PI,i]].forEach(([e,n,i,a],o)=>{for(let t=0;t<=7;t++){let r=i+t/7*(Math.PI/2);l.push([e+Math.cos(r)*a,n+Math.sin(r)*a,Math.cos(r),Math.sin(r)])}if(o===1)for(let e of[...c].sort((e,t)=>t-e))l.push([e+.6,t+r,0,1],[e-.6,t+r,0,1])}),l},M=()=>({pos:[],idx:[],rect:[],meta:[],path:[],rad:[],look:[]}),N=(e,t)=>{let n=M(),r=M(),i=M(),a=M(),o={pos:[],idx:[],wall:[],meta:[],path:[],base:[]},s={pos:[],idx:[],side:[],route:[],born:[]},c={pos:[],idx:[],other:[],post:[]},u=e.wide?1:.42,d=e.wide||t===`glass`?t:`chain`,p=e=>e.index*.07,m=e=>{let t=Math.min(l,e.w/2,e.h/2);return[t,t,t,t]},_=(e,t,n,r,i,a,o,s)=>{let{x:c,y:l,w:u,h:d}=n,f=e.pos.length/3;for(let[n,f]of[[c-i,l-i],[c+u+i,l-i],[c-i,l+d+i],[c+u+i,l+d+i]])e.pos.push(n,f,a),e.rect.push(c+u/2,l+d/2,u/2,d/2),e.meta.push(h[t.kind],t.hit,p(t),o),e.path.push(t.from[0],t.from[1],t.to[0],t.to[1]),e.rad.push(r[2],r[1],r[3],r[0]),e.look.push(s[0],s[1]);e.idx.push(f,f+1,f+2,f+2,f+1,f+3)},v=(e,t,n,r,i,a=[])=>{let s=j(e,t,a),c=o.pos.length/3;s.forEach(([t,a,l,u],d)=>{let f=r(t);for(let r of[0,1])o.pos.push(t,a,0),o.wall.push(r,n,l,u),o.meta.push(h[f.kind],f.hit,p(f),0),o.path.push(f.from[0],f.from[1],f.to[0],f.to[1]),o.base.push(i?e.y+e.h:-1);let m=c+d*2,g=c+(d+1)%s.length*2;o.idx.push(m,m+1,g,g,m+1,g+1)})},y=(e,t,n)=>{let{x:r,y:i,w:a,h:o}=e.box,s=Math.min(l,a/2,o/2)*(1-Math.SQRT1_2);for(let[l,u]of[[r+s,i+s],[r+a-s,i+s],[r+a-s,i+o-s],[r+s,i+o-s]]){let r=c.pos.length/3;for(let[r,i]of[[0,-1],[0,1],[1,-1],[1,1]])c.pos.push(l,u,r?t:0),c.other.push(l,u,r?0:t),c.post.push(i,r,p(e),+!!n);c.idx.push(r,r+1,r+2,r+2,r+1,r+3)}},b=d===`strip`?e.nodes.filter(e=>e.hit>=0).sort((e,t)=>e.hit-t.hit):[];if(b.length>1){let e=b[0],t=b[b.length-1],a=Math.min(...b.map(e=>e.box.y)),o=Math.max(...b.map(e=>e.box.y+e.box.h)),s={x:e.box.x,y:a,w:t.box.x+t.box.w-e.box.x,h:o-a},c=Math.min(l,s.h/2),d=g.accent*u;_(i,e,s,[c,c,c,c],40,d+f,0,[0,0]),v(s,[c,c,c,c],d,e=>b.find(t=>e<=t.box.x+t.box.w)??t,!1,b.slice(1).map(e=>e.box.x)),b.forEach((e,i)=>{let s=[i===0?c:0,e===t?c:0,e===t?c:0,i===0?c:0],l={x:e.box.x,y:a,w:e.box.w,h:o-a};_(n,e,l,s,3,0,0,[0,+(i>0&&e.kind!==`accent`)]),e.kind===`accent`&&_(r,e,l,s,56,0,0,[0,0])})}for(let t of e.nodes){if(b.length>1&&b.includes(t))continue;let e=g[t.kind]*u,a=m(t.box);if(t.kind===`ghost`){_(n,t,t.box,a,3,0,0,[0,0]),_(n,t,t.box,a,3,e,1,[0,0]),y(t,e,!1);continue}if(d===`glass`&&t.kind!==`accent`){_(n,t,t.box,a,3,0,0,[1,0]),_(n,t,t.box,a,3,e,1,[1,0]),y(t,e,!0);continue}let o=d===`stairs`;_(n,t,t.box,a,3,0,0,[0,0]),t.kind===`accent`&&_(r,t,t.box,a,56,0,0,[0,0]),o||_(i,t,t.box,a,40,e+f*u,0,[0,0]),v(t.box,a,e,()=>t,o)}if(e.nodes.length&&(d===`glass`||d===`stairs`)){let t=Math.min(...e.nodes.map(e=>e.box.x)),n=Math.max(...e.nodes.map(e=>e.box.x+e.box.w)),r=Math.min(...e.nodes.map(e=>e.box.y)),i=Math.max(...e.nodes.map(e=>e.box.y+e.box.h)),o=e.nodes[0];d===`glass`?_(a,o,{x:t-150,y:r-130,w:n-t+300,h:i-r+260},[0,0,0,0],0,g.main*u,0,[1,0]):_(a,o,{x:t-70,y:e.h,w:n-t+140,h:28},[0,0,0,0],0,0,0,[2,0])}for(let t of e.edges){let e=t.pts;if(e.length<2||d===`stairs`&&!t.dashed)continue;let n=0,r=[0];for(let t=1;t<e.length;t++)n+=Math.hypot(e[t][0]-e[t-1][0],e[t][1]-e[t-1][1]),r.push(n);if(n<2)continue;let i=s.pos.length/3,a=t.after*.07;e.forEach(([o,c],l)=>{let u=e[Math.max(0,l-1)],d=e[Math.min(e.length-1,l+1)],f=Math.hypot(d[0]-u[0],d[1]-u[1])||1,p=-(d[1]-u[1])/f,m=(d[0]-u[0])/f;for(let e of[-1,1])s.pos.push(o+p*e*D,c+m*e*D,1),s.side.push(e),s.route.push(t.s0>=0?t.s0+r[l]:-1,r[l],n,+!!t.dashed),s.born.push(a);if(l<e.length-1){let e=i+l*2;s.idx.push(e,e+1,e+2,e+2,e+1,e+3)}})}return{roof:n,halo:r,shadow:i,ground:a,wall:o,bridge:s,post:c,floor:d===`stairs`?e.h:-1}},P=(e,t)=>{let n=new o;n.setAttribute(`position`,new a(new Float32Array(e.pos),3));for(let[r,[i,o]]of Object.entries(t))n.setAttribute(i,new a(new Float32Array(e[r]),o));return n.setIndex(e.idx),n},F=(a,o,l)=>{let f=new i,h=new n,g={uRes:{value:new e(1,1)},uEye:{value:new c(0,0,u)},uBleed:{value:o},uT:{value:-10},uG:{value:-10},uHead:{value:-1e5},uCycle:{value:1},uFirst:{value:1},uFloor:{value:-1},uPointer:{value:new c(-9999,-9999,0)}},_=(e,n,r,i=!0)=>new t({vertexShader:e,fragmentShader:n,uniforms:g,transparent:!0,premultipliedAlpha:!0,side:2,depthWrite:r,depthTest:i}),y={ground:_(v,C,!1,!1),shadow:_(v,S,!1,!1),halo:_(v,x,!1,!1),wall:_(w,T,!0),roof:_(v,b,!0),bridge:_(E,O,!1),post:_(k,A,!1)},D=[],j=0,M=0,F=e=>{for(let e of D)f.remove(e),e.geometry.dispose();let t=N(e,l),n={rect:[`aRect`,4],meta:[`aMeta`,4],path:[`aPath`,4],rad:[`aRad`,4],look:[`aLook`,2]},i=[[t.ground,y.ground,n],[t.shadow,y.shadow,n],[t.halo,y.halo,n],[t.wall,y.wall,{wall:[`aWall`,4],meta:[`aMeta`,4],path:[`aPath`,4],base:[`aBase`,1]}],[t.roof,y.roof,n],[t.bridge,y.bridge,{side:[`aSide`,1],route:[`aRoute`,4],born:[`aBorn`,1]}],[t.post,y.post,{other:[`aOther`,3],post:[`aPost`,4]}]];D=[],i.forEach(([e,t,n],i)=>{if(!e.idx.length)return;let a=new r(P(e,n),t);a.frustumCulled=!1,a.renderOrder=i,f.add(a),D.push(a)}),j=e.routeLen,M=e.nodes.length,g.uFloor.value=t.floor,g.uCycle.value=Math.max(1,j+m*p)},I={x:0,y:0,seen:!1,on:0},L=e=>{e.pointerType!==`touch`&&(I.x=e.clientX,I.y=e.clientY,I.seen=!0)};window.addEventListener(`pointermove`,L,{passive:!0});let R=-1,z=-1,B=0,V=0,H=null,U=(e,t,n)=>{H!==null&&(R=e-H,z=e,H=null),g.uRes.value.set(n.cssW,n.cssH);let r=a.getBoundingClientRect(),i=window.innerWidth,o=window.innerHeight,s=1-Math.exp(-t*4);B+=((I.seen?(I.x-i/2)*1.2:0)-B)*s,V+=((I.seen?(I.y-o/2)*1.2:0)-V)*s,g.uEye.value.set(i/2-r.left+B,o/2-r.top+d+V,u);let c=I.x-r.left,l=I.y-r.top,f=I.seen&&c>-80&&l>-80&&c<r.width+80&&l<r.height+80?1:0;if(I.on+=(f-I.on)*(1-Math.exp(-t*6)),g.uPointer.value.set(c,l,I.on),R<0)return;g.uT.value=e-R;let m=e-z;g.uG.value=m;let h=m-(1+M*.07);if(h<0||j<=0){g.uHead.value=-1e5,g.uFirst.value=1;return}let _=g.uCycle.value,v=h*p;g.uHead.value=v%_,g.uFirst.value=+(v<_)},W=window.matchMedia(`(pointer: coarse)`).matches,G=s({canvas:a,scene:f,camera:h,maxDpr:W?1.75:1.5,frame:U});return{update:F,start:e=>{R<0&&H===null&&(H=e)},dispose:()=>{G(),window.removeEventListener(`pointermove`,L);for(let e of D)e.geometry.dispose();for(let e of Object.values(y))e.dispose()}}};export{F as mountTowers};