import puppeteer from 'puppeteer';
import auth from './auth';

const zoom = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });
  const page = await browser.newPage();
  await page.goto('https://zoom.us/web/sso/login?en=signin');
  await page.waitForSelector('#domain');
  await page.type('#domain', 'berkeley');
  await page.click('.submit.signin');
  await auth(page, 'aivantg', process.env.password);
};

zoom();
