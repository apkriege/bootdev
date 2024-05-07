import{ test, expect } from "@jest/globals";
import { getUrlsFromHtml, normalizeURL } from "../src/crawl";

test("it should remove https:// from the beginning and trailing slash", () => {
  const urls = [
    'HTTPS://blog.boot.dev/path/',
    'HTTP://blog.boot.dev/path/',
    'https://blog.boot.dev/path/', 
    'http://blog.boot.dev/path/',
    'https://blog.boot.dev/path',
    'http://blog.boot.dev/path',
    '/testing'
  ]
  
  const expectedUrl = 'blog.boot.dev/path'

  expect(normalizeURL(urls[0])).toBe(expectedUrl)
  expect(normalizeURL(urls[1])).toBe(expectedUrl)
  expect(normalizeURL(urls[2])).toBe(expectedUrl)
  expect(normalizeURL(urls[3])).toBe(expectedUrl)
})

test("it should create a list of urls from the a tag", () => {
  const baseUrl = 'https://blog.boot.dev'

  const htmlBody = `
    <html>
      <body>
          <a href="https://blog.boot.dev"><span>Go to Boot.dev root</span></a>
          <a href="https://blog.boot.dev/path"><span>Go to Boot.dev path</span></a>
          <a href="https://blog.boot.dev/something"><span>Go to Boot.dev something</span></a>    
          <a href="/test">Testing</a>    
      </body>
    </html>
  `
  const urls = getUrlsFromHtml(htmlBody, baseUrl);
  console.log(urls);

  expect(urls.length).toBeGreaterThanOrEqual(1)
  expect(urls.length).toEqual(4)
  expect(urls[3]).toContain(baseUrl)
})
