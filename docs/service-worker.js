if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return c[e]||(r=new Promise(async r=>{if("document"in self){const c=document.createElement("script");c.src=e,document.head.appendChild(c),c.onload=r}else importScripts(e),r()})),r.then(()=>{if(!c[e])throw new Error(`Module ${e} didn’t register its module`);return c[e]})},r=(r,c)=>{Promise.all(r.map(e)).then(e=>c(1===e.length?e[0]:e))},c={require:Promise.resolve(r)};self.define=(r,s,i)=>{c[r]||(c[r]=Promise.resolve().then(()=>{let c={};const a={uri:location.origin+r.slice(1)};return Promise.all(s.map(r=>{switch(r){case"exports":return c;case"module":return a;default:return e(r)}})).then(e=>{const r=i(...e);return c.default||(c.default=r),c})}))}}define("./service-worker.js",["./workbox-24aa846e"],(function(e){"use strict";e.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"./index.html",revision:"7f5c959d5af55687ea9b2bd4c0bd7d25"},{url:"./player.html",revision:"5f72ef1990f57e49310300f52e7bd462"},{url:"3a8ca398e6a5c3b83f4de7c60843a9a0.png",revision:"3a8ca398e6a5c3b83f4de7c60843a9a0"},{url:"color-assets.js?def546e639cad7987f3d",revision:"7cf0c7284706d8dbc5661d1928dfc248"},{url:"editor.css?c96619a49efb47e4f529",revision:"6579b8da332f988ca41517bab5f5e194"},{url:"editor.js?6c5b296314fc5c08e689",revision:"3c2fbf406cc6d8659241c5e95cb34199"},{url:"gradient-assets.js?7f8c98dc05420362c8d2",revision:"c46fde1ba5b5ecb01498566b680d8c47"},{url:"icon.png",revision:"3a8ca398e6a5c3b83f4de7c60843a9a0"},{url:"player.css?c96619a49efb47e4f529",revision:"6579b8da332f988ca41517bab5f5e194"},{url:"player.js?178115fc8ee08ff2cc70",revision:"1c50076e3443ef37550b92bbbf1c9dbb"},{url:"vendors~antdesign-icons.js?7207ab4efd56ae3b2b20",revision:"8954a3619b8579be3874abb4185749d9"},{url:"vendors~feather-icons.js?1b9f87c593be3db5a91a",revision:"ca797f33e7faf39abaef460e20d95153"},{url:"vendors~primer-oct-icons.js?841e1148b6a4a7440437",revision:"04801d9f637c39ec10fcf01432a8f5ca"},{url:"vendors~toast-ui-chart.js?c8f78bb8d15e7f4e0226",revision:"f83aebc071956c5a14238705bb0b908a"}],{})}));
