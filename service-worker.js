"use strict";var precacheConfig=[["/ru-event-planner/index.html","2847ce14746890cf1e6df343bec1b0a1"],["/ru-event-planner/static/css/main.e39e3b6b.css","5a8b1637114bd91f833870df5e4eba50"],["/ru-event-planner/static/js/main.ddd49ca9.js","5dc83286beb0ebe0fbecfdba677e496c"],["/ru-event-planner/static/media/X.44df71d0.svg","44df71d00537cc577137f7efcb4e8396"],["/ru-event-planner/static/media/add.f5a7691b.svg","f5a7691bc0b6022fbcaf3f9f5a17de33"],["/ru-event-planner/static/media/arrow-back.74636974.svg","7463697496e2ee7a378a5dba321287e3"],["/ru-event-planner/static/media/backup.7dd873c6.svg","7dd873c6b4451bdee11d4707ca4fd542"],["/ru-event-planner/static/media/browse.6e8effc3.svg","6e8effc3c273181d44596c03b85d359b"],["/ru-event-planner/static/media/clear-color.c98bbaaf.svg","c98bbaafc94e69644a8cd5ceaa6bbedc"],["/ru-event-planner/static/media/delete.d67582a0.svg","d67582a0003e6b73d109480402ac5a62"],["/ru-event-planner/static/media/edit.1526eb38.svg","1526eb3876f9f9d5acc9df3efcbae0a7"],["/ru-event-planner/static/media/email.6bdee372.svg","6bdee37202a155a0c68042d6529a6806"],["/ru-event-planner/static/media/github.7f3dbd8c.svg","7f3dbd8c1a4c91ec469504f86828370e"],["/ru-event-planner/static/media/linkedin.2db0d565.svg","2db0d5658bc373be45a80266362d65b4"],["/ru-event-planner/static/media/search.27fedd6a.svg","27fedd6a77ef716c49a1b536d8e59ad5"],["/ru-event-planner/static/media/set-color.a666fa3d.svg","a666fa3d7a46777f4778ead13a362b88"],["/ru-event-planner/static/media/spinner.f31134c8.gif","f31134c89d2ffcbacbbfd318ef8ab4cf"],["/ru-event-planner/static/media/telegram.23159f36.svg","23159f36fd45b6b8cd8538508c1f2101"],["/ru-event-planner/static/media/vkontakte.9a50d048.svg","9a50d048d0ca3897116944b0aab98854"],["/ru-event-planner/static/media/warning.57b2929a.svg","57b2929a6169d3bfef1c6b50bbfd2443"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,n){var t=new URL(e);return"/"===t.pathname.slice(-1)&&(t.pathname+=n),t.toString()},cleanResponse=function(n){return n.redirected?("body"in n?Promise.resolve(n.body):n.blob()).then(function(e){return new Response(e,{headers:n.headers,status:n.status,statusText:n.statusText})}):Promise.resolve(n)},createCacheKey=function(e,n,t,a){var r=new URL(e);return a&&r.pathname.match(a)||(r.search+=(r.search?"&":"")+encodeURIComponent(n)+"="+encodeURIComponent(t)),r.toString()},isPathWhitelisted=function(e,n){if(0===e.length)return!0;var t=new URL(n).pathname;return e.some(function(e){return t.match(e)})},stripIgnoredUrlParameters=function(e,t){var n=new URL(e);return n.hash="",n.search=n.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(n){return t.every(function(e){return!e.test(n[0])})}).map(function(e){return e.join("=")}).join("&"),n.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var n=e[0],t=e[1],a=new URL(n,self.location),r=createCacheKey(a,hashParamName,t,/\.\w{8}\./);return[a.toString(),r]}));function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(a){return setOfCachedUrls(a).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(n){if(!t.has(n)){var e=new Request(n,{credentials:"same-origin"});return fetch(e).then(function(e){if(!e.ok)throw new Error("Request for "+n+" returned a response with status "+e.status);return cleanResponse(e).then(function(e){return a.put(n,e)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(n){return n.keys().then(function(e){return Promise.all(e.map(function(e){if(!t.has(e.url))return n.delete(e)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(n){if("GET"===n.request.method){var e,t=stripIgnoredUrlParameters(n.request.url,ignoreUrlParametersMatching),a="index.html";(e=urlsToCacheKeys.has(t))||(t=addDirectoryIndex(t,a),e=urlsToCacheKeys.has(t));var r="/ru-event-planner/index.html";!e&&"navigate"===n.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],n.request.url)&&(t=new URL(r,self.location).toString(),e=urlsToCacheKeys.has(t)),e&&n.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(t)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(e){return console.warn('Couldn\'t serve response for "%s" from cache: %O',n.request.url,e),fetch(n.request)}))}});