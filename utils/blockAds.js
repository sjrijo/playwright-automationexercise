// automationexercise.com serves Google ads and full-screen "vignette" interstitials that
// cover the page and steal clicks. Blocking the ad networks keeps tests deterministic.
// Google Maps is blocked too: it is a slow *synchronous* script that delays the inline scripts
// binding the page's click handlers (cart delete, checkout, contact form), and no test uses the map.
const AD_HOSTS = /googlesyndication|doubleclick|googleadservices|adservice\.google|fundingchoicesmessages|google-analytics|googletagmanager|googletagservices|maps\.google(apis)?\.com/;

/** @param {import('@playwright/test').BrowserContext} context */
async function blockAds(context) {
  await context.route(AD_HOSTS, (route) => route.abort());
}

module.exports = { blockAds, AD_HOSTS };
