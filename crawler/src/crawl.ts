import { JSDOM } from "jsdom";

// gets the base url stripping
function normalizeURL(url: string) {
  // programmtic way
  let lower = url.toLowerCase();

  let normal = lower.replace("https://", "http://").replace("http://", "");

  if (normal[normal.length - 1] === "/") {
    normal = normal.slice(0, -1);
  }

  return normal;
}

// gets urls from a tag
//
function getUrlsFromHtml(htmlBody: string, baseUrl: string): string[] {
  const dom = new JSDOM(htmlBody);
  const elements = dom.window.document.getElementsByTagName("a");
  const links: string[] = [];

  for (const ele of elements) {
    let url = new URL(ele.href, baseUrl).href;
    links.push(url);
  }

  return links;
}

export { normalizeURL, getUrlsFromHtml };
