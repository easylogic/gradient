if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return c[e]||(r=new Promise(async r=>{if("document"in self){const c=document.createElement("script");c.src=e,document.head.appendChild(c),c.onload=r}else importScripts(e),r()})),r.then(()=>{if(!c[e])throw new Error(`Module ${e} didn’t register its module`);return c[e]})},r=(r,c)=>{Promise.all(r.map(e)).then(e=>c(1===e.length?e[0]:e))},c={require:Promise.resolve(r)};self.define=(r,i,s)=>{c[r]||(c[r]=Promise.resolve().then(()=>{let c={};const n={uri:location.origin+r.slice(1)};return Promise.all(i.map(r=>{switch(r){case"exports":return c;case"module":return n;default:return e(r)}})).then(e=>{const r=s(...e);return c.default||(c.default=r),c})}))}}define("./service-worker.js",["./workbox-24aa846e"],(function(e){"use strict";e.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"./index.html",revision:"7f8ce70cb663f9fe1d7b4ac7eac5af74"},{url:"3a8ca398e6a5c3b83f4de7c60843a9a0.png",revision:"3a8ca398e6a5c3b83f4de7c60843a9a0"},{url:"icon.png",revision:"3a8ca398e6a5c3b83f4de7c60843a9a0"},{url:"main.css?e20ce02b79c9bdc23531",revision:"c0f2c05c402aebb109c49f3eafe165b2"},{url:"main.js?46984e6fcb173b0568fe",revision:"d2416d141aa405f2db0531fb9538bed5"},{url:"vendors~main.js?d1e9460fdff256ebbdac",revision:"e0bc252f827bf0625dea96929cc31460"}],{})}));
