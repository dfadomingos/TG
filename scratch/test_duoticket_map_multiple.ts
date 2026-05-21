import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const links = [
    'https://duoticket.com.br/evento/7391/InClub-is-coming',
    'https://duoticket.com.br/evento/7448/Pagode-360',
    'https://duoticket.com.br/evento/7356/Baile-Brazuca-com-Tropical-Funky'
  ];

  const browser = await puppeteer.launch({ headless: 'new' });

  for (const link of links) {
    console.log('\\nTestando URL:', link);
    const page = await browser.newPage();
    try {
      await page.goto(link, { waitUntil: 'networkidle2', timeout: 15000 });
      const address = await page.evaluate(() => {
        const mapDiv = document.querySelector('.loading-mapa');
        return mapDiv ? mapDiv.textContent?.replace(/\\s+/g, ' ').trim() : null;
      });
      console.log('Address via puppeteer:', address);
    } catch (e) {
      console.log('Erro ao acessar:', e.message);
    }
    await page.close();
  }

  await browser.close();
}

main().catch(console.error).finally(() => prisma.$disconnect());
