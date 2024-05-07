import { getUrlsFromHtml, normalizeURL } from "./crawl";
const { argv } = require("node:process");
const args = argv.slice(2);
const abortController = new AbortController();

// crawl page
//
async function crawlPage(
  baseUrl: string,
  currentUrl = baseUrl,
  pages: Record<string, number> = {},
  signal?: AbortSignal
) {
  // Check if the operation has been aborted
  signal?.throwIfAborted();

  // Make sure the currentURL is on the same domain as the baseURL
  if (new URL(baseUrl).hostname !== new URL(currentUrl).hostname) {
    return pages;
  }

  // Get a normalized version of the currentURL
  let normalizedUrl = normalizeURL(currentUrl);

  // If the pages object already has an entry for the normalized version of the current URL,
  // just increment the count and return the current pages
  if (pages[normalizedUrl] !== undefined) {
    pages[normalizedUrl]++;
    return pages;
  }

  pages[normalizedUrl] = 1;

  try {
    let html = await fetchUrl(currentUrl, signal);
    let links = getUrlsFromHtml(html, baseUrl);

    // Recursively crawl each URL found on the page and update the pages to keep an aggregate count
    for (const link of links) {
      pages = await crawlPage(baseUrl, link, pages, signal);
    }
  } catch (err) {
    // console.error("Error:" + err);
  }

  return pages;
}

// fetch the html from the link with a signal to trigger the abort
//
async function fetchUrl(url: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch(url, { signal });

  if (!res.ok) {
    throw new Error("Error getting data");
  }

  if (!res.headers.get("Content-Type")?.includes("text/html")) {
    throw new Error("Data is not text/html");
  }

  return await res.text();
}

// continues the crawl until the abort is triggered by a timeout
//
async function crawlWithTimeout(baseUrl: string, timeoutSeconds: number): Promise<any> {
  const timeoutId = setTimeout(() => {
    abortController.abort();
    console.log(`Crawling process timed out after ${timeoutSeconds} seconds`);
  }, timeoutSeconds * 1000);

  try {
    return await crawlPage(baseUrl, baseUrl, {}, abortController.signal);
  } catch (err: any) {
    if (err.name === "AbortError") {
      // console.log('Crawling process aborted due to timeout');
    } else {
      // console.error('Error during crawling:', err);
    }
    return {};
  } finally {
    clearTimeout(timeoutId);
  }
}

// main
// gathers a list of the internal links of a website
//
async function main() {
  if (args.length !== 1) {
    console.error("Needs just one url argument");
    process.exit();
  }

  console.log(`Crawler starting with ${args[0]} \n`);
  const pages = await crawlWithTimeout(args[0], 10);
  const sortedPages = Object.fromEntries(Object.entries(pages).sort((a: any, b: any) => b[1] - a[1]));

  console.log("===============");
  console.log("STARTING REPORT");
  console.log("===============");
  for (const page in sortedPages) {
    console.log(`Found ${sortedPages[page]} internal links to ${page}`);
  }
  console.log("===============\n");

  process.exit();
}

main();
