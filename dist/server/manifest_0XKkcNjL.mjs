import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_Cd4mn7xh.mjs';
import 'es-module-lexer';
import { n as decodeKey } from './chunks/astro/server_Cq_iU0aJ.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///home/Walter/home/chatbridgeia/","adapterName":"@astrojs/node","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/node.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/audit-submission","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/audit-submission\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"audit-submission","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/audit-submission.ts","pathname":"/api/audit-submission","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"inline","value":"const l=document.getElementById(\"contact-form\"),x=document.getElementById(\"form-success\");l?.addEventListener(\"submit\",async e=>{e.preventDefault();const t=new FormData(l),o=Object.fromEntries(t),n=l.dataset.webhook,s=l.querySelector('button[type=\"submit\"]'),r=s.innerHTML;s.innerHTML='<span class=\"animate-spin\">⏳</span> Enviando...',s.disabled=!0;try{n&&n!==\"#\"?await fetch(n,{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({...o,timestamp:new Date().toISOString(),source:\"chatbridge-website\"})}):await new Promise(c=>setTimeout(c,1e3)),l.classList.add(\"hidden\"),x?.classList.remove(\"hidden\")}catch(c){console.error(\"Error:\",c),s.innerHTML=r,s.disabled=!1,alert(\"Hubo un error. Por favor intenta de nuevo.\")}});const i=document.getElementById(\"navbar\"),O=document.getElementById(\"mobile-menu-btn\"),u=document.getElementById(\"mobile-menu\"),p=document.getElementById(\"menu-icon\"),h=document.getElementById(\"close-icon\");O?.addEventListener(\"click\",()=>{u?.classList.toggle(\"hidden\"),p?.classList.toggle(\"hidden\"),h?.classList.toggle(\"hidden\")});u?.querySelectorAll(\"a\").forEach(e=>{e.addEventListener(\"click\",()=>{u.classList.add(\"hidden\"),p?.classList.remove(\"hidden\"),h?.classList.add(\"hidden\")})});let v=0;window.addEventListener(\"scroll\",()=>{const e=window.scrollY;i&&(e>50?i.classList.add(\"scrolled\"):i.classList.remove(\"scrolled\"),e>v&&e>100?i.style.transform=\"translateY(-100%)\":i.style.transform=\"translateY(0)\"),v=e});const B={root:null,rootMargin:\"0px\",threshold:.1},q=new IntersectionObserver(e=>{e.forEach(t=>{t.isIntersecting&&t.target.classList.add(\"visible\")})},B);document.querySelectorAll(\".reveal, .reveal-left, .reveal-right, .reveal-scale\").forEach(e=>{q.observe(e)});const a=document.createElement(\"div\");a.className=\"cursor-follower\";document.body.appendChild(a);let y=0,E=0,d=0,m=0;const g=.1;document.addEventListener(\"mousemove\",e=>{y=e.clientX,E=e.clientY});function b(){d+=(y-d)*g,m+=(E-m)*g,a.style.left=d+\"px\",a.style.top=m+\"px\",requestAnimationFrame(b)}b();document.addEventListener(\"mouseleave\",()=>{a.style.opacity=\"0\"});document.addEventListener(\"mouseenter\",()=>{a.style.opacity=\"1\"});document.querySelectorAll(\".magnetic-btn\").forEach(e=>{e.addEventListener(\"mousemove\",t=>{const o=t,n=e.getBoundingClientRect(),s=o.clientX-n.left-n.width/2,r=o.clientY-n.top-n.height/2;e.style.transform=`translate(${s*.3}px, ${r*.3}px)`}),e.addEventListener(\"mouseleave\",()=>{e.style.transform=\"translate(0, 0)\"})});function A(e){const t=parseInt(e.getAttribute(\"data-target\")||\"0\"),o=2e3,n=0,s=performance.now();function r(c){const w=c-s,f=Math.min(w/o,1),I=1-Math.pow(1-f,4),S=Math.floor(n+(t-n)*I);e.textContent=S.toLocaleString(),f<1&&requestAnimationFrame(r)}requestAnimationFrame(r)}const L=new IntersectionObserver(e=>{e.forEach(t=>{t.isIntersecting&&(A(t.target),L.unobserve(t.target))})},{threshold:.5});document.querySelectorAll(\".count-up\").forEach(e=>L.observe(e));window.addEventListener(\"scroll\",()=>{const e=window.pageYOffset;document.querySelectorAll(\"[data-parallax]\").forEach(t=>{const o=parseFloat(t.dataset.parallax||\"0.5\");t.style.transform=`translateY(${e*o}px)`})});\n"}],"styles":[{"type":"external","src":"/_assets/index.CpKVj4w2.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/home/Walter/home/chatbridgeia/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/node@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/api/audit-submission@_@ts":"pages/api/audit-submission.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","/home/Walter/home/chatbridgeia/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","\u0000@astrojs-manifest":"manifest_0XKkcNjL.mjs","@astrojs/react/client.js":"_assets/client.CCnnPT9T.js","/astro/hoisted.js?q=0":"_assets/hoisted.BRvEbtaL.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_assets/index.CpKVj4w2.css","/favicon.svg","/_assets/client.CCnnPT9T.js","/images/dashboard-mockup.png","/images/hero-automation.png","/images/logo.png","/images/tech-pattern.png"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"R93gUtU+1f/x2CXc6zZ5JsY7A9827cwaWiFH2NoVjkQ=","experimentalEnvGetSecretEnabled":false});

export { manifest };
