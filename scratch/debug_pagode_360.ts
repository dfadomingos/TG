import puppeteer from 'puppeteer';

async function main() {
  const link = 'https://duoticket.com.br/evento/7448/Pagode-360';
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  try {
    await page.goto(link, { waitUntil: 'networkidle2', timeout: 15000 });
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasLoadingMapa = await page.evaluate(() => !!document.querySelector('.loading-mapa'));
    const loadingMapaHtml = await page.evaluate(() => document.querySelector('.loading-mapa')?.innerHTML || null);
    
    console.log('Has .loading-mapa:', hasLoadingMapa);
    console.log('loading-mapa HTML:', loadingMapaHtml);
    console.log('Body Text snippet:', bodyText.substring(0, 1000));
  } catch (e) {
    console.error('Error:', e);
  }
  await browser.close();
}

main();
