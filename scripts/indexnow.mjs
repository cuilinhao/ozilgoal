// Submit every sitemap URL to IndexNow (Bing, Yandex, Naver, Seznam) after a production deploy.
// Bing feeds ChatGPT and Copilot search, so a new domain is not found there until Bing has crawled it.
// Usage: node scripts/indexnow.mjs [--dry-run]
const site = 'https://ozilgoal-aivideo.com';
const key = 'bdfaff693d2aef8f6eb62e06aeca7f9e';
const keyLocation = `${site}/${key}.txt`;
const dryRun = process.argv.includes('--dry-run');

const hosted = await fetch(keyLocation, {signal: AbortSignal.timeout(30000)});
const hostedKey = (await hosted.text()).trim();
if (!hosted.ok || hostedKey !== key) throw new Error(`${keyLocation} returned ${hosted.status} "${hostedKey.slice(0, 40)}"; deploy public/${key}.txt first`);

const sitemap = await fetch(`${site}/sitemap.xml`, {signal: AbortSignal.timeout(30000)});
if (!sitemap.ok) throw new Error(`sitemap.xml returned ${sitemap.status}`);
const urlList = [...new Set([...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].trim()))];
if (!urlList.length || urlList.some(url => !url.startsWith(`${site}/`) && url !== site)) throw new Error('sitemap.xml must list only canonical site URLs');

console.log(`${urlList.length} URLs from sitemap.xml`);
if (dryRun) {
  console.log(urlList.join('\n'));
  process.exit(0);
}
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: {'Content-Type': 'application/json; charset=utf-8'},
  body: JSON.stringify({host: new URL(site).host, key, keyLocation, urlList}),
  signal: AbortSignal.timeout(30000),
});
// 200 and 202 both mean accepted; 202 is returned while the key is still being verified.
console.log(`IndexNow ${response.status} ${await response.text()}`.trim());
if (response.status !== 200 && response.status !== 202) process.exit(1);
