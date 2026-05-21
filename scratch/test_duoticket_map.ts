import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ev = await prisma.evento.findFirst({
    where: { 
      link_compra: { contains: 'duoticket' },
      titulo: { contains: 'Barril 10' }
    }
  });

  if (!ev || !ev.link_compra) return console.log('Evento não encontrado');

  console.log('Testando Puppeteer para URL:', ev.link_compra);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto(ev.link_compra, { waitUntil: 'networkidle2' });

  // Pega todo o body HTML
  const content = await page.content();
  console.log(content.includes('loading-mapa'));

  // Tenta extrair elementos
  const address = await page.evaluate(() => {
    // Procura na classe loading-mapa
    const mapDiv = document.querySelector('.loading-mapa');
    return mapDiv ? mapDiv.textContent : null;
  });

  console.log('Address via puppeteer:', address);

  await browser.close();
}

main().catch(console.error).finally(() => prisma.$disconnect());
