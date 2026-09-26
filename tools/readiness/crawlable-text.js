"use strict";
// What a crawler without JavaScript execution actually receives.
//
// Every interactive view on this site renders from window.* data scripts, so a
// page can be perfectly correct in a browser and completely empty to an AI
// crawler. This module is the single measurement used by both the pre-publish
// report (check-crawlable.js) and the release gate (verify-site-seo.js), so the
// two can never disagree about what "crawlable" means.
// Calibrated against measurements of the live site, not chosen for roundness:
// the three app shells (/ , /library/ , /software/) carry 327–350 characters of
// navigation chrome and nothing else, while the thinnest page with real content
// (/about/) carries 866. 700 is over twice the chrome floor and below every
// genuine content page, so it separates "empty" from "thin" without forcing
// padding anywhere. Re-measure with check-crawlable.js before changing it.
const MIN_INDEXABLE_TEXT = 700;

function readableText(html) {
  return String(html ?? "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    // Entities are decoded after tag removal and count as one character each.
    .replace(/&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,7}|#x[0-9a-fA-F]{1,6});/g, "x")
    .replace(/\s+/g, " ")
    .trim();
}

const readableLength = html => readableText(html).length;

module.exports = {readableText, readableLength, MIN_INDEXABLE_TEXT};
