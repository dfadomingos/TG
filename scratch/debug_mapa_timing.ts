import puppeteer from 'puppeteer';

async function main() {
  const link = 'https://duoticket.com.br/evento/7435/A-Noite-Delas-No-Barril-10';
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  console.log('Navigating to:', link);
  await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  // Check if .loading-mapa exists and what it contains initially
  const initial = await page.evaluate(() => {
    const el = document.querySelector('.loading-mapa');
    return { exists: !!el, html: el?.innerHTML || '', text: el?.textContent || '' };
  });
  console.log('Initial .loading-mapa:', JSON.stringify(initial));

  // Wait for networkidle
  console.log('Waiting for networkidle0...');
  await page.waitForNetworkIdle({ idleTime: 2000, timeout: 15000 }).catch(() => {
    console.log('networkidle timeout, continuing...');
  });

  // Check again
  const after = await page.evaluate(() => {
    const el = document.querySelector('.loading-mapa');
    return { exists: !!el, html: el?.innerHTML?.substring(0, 500) || '', text: el?.textContent?.replace(/\s+/g, ' ').trim() || '' };
  });
  console.log('After networkidle .loading-mapa:', JSON.stringify(after));
  
  // Also try waiting a bit more
  await new Promise(r => setTimeout(r, 3000));
  
  const final = await page.evaluate(() => {
    const el = document.querySelector('.loading-mapa');
    return { exists: !!el, html: el?.innerHTML?.substring(0, 500) || '', text: el?.textContent?.replace(/\s+/g, ' ').trim() || '' };
  });
  console.log('After 3s extra wait .loading-mapa:', JSON.stringify(final));

  await browser.close();
}

main().catch(console.error);
