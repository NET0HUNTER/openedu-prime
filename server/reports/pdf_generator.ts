import fs from 'node:fs';
import puppeteer, { type Browser } from 'puppeteer-core';

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

function findChromePath(): string | null {
  for (const p of CHROME_PATHS) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return null;
}

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser | null> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }
  const chromePath = findChromePath();
  if (!chromePath) return null;

  try {
    browserInstance = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    });
    return browserInstance;
  } catch (err) {
    console.warn('[PDF Generator] Failed to launch Chrome for PDF generation:', err);
    return null;
  }
}

function escapeFooterHtml(val: string): string {
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface PdfGenerationOptions {
  displayHeaderFooter?: boolean;
  footerText?: string;
}

export async function generatePdfFromHtml(
  html: string,
  paperformat: 'a4' | 'letter' = 'letter',
  opts: PdfGenerationOptions = {},
): Promise<Buffer | null> {
  const browser = await getBrowser();
  if (!browser) return null;

  const useFooter = opts.displayHeaderFooter !== false;
  const safeFooter = escapeFooterHtml(opts.footerText || '');

  const footerTemplate = `
    <div style="width:100%; font-family: Lato, Arial, sans-serif; font-size: 9px; color: #6c757d; padding: 5px 15mm 0 15mm; border-top: 1px solid #212529; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
      <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
      <span style="text-align:right; max-width: 75%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${safeFooter}</span>
    </div>
  `;

  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({
      format: paperformat === 'a4' ? 'A4' : 'Letter',
      printBackground: true,
      displayHeaderFooter: useFooter,
      headerTemplate: '<div></div>',
      footerTemplate: useFooter ? footerTemplate : '<div></div>',
      margin: useFooter
        ? { top: '14mm', bottom: '20mm', left: '15mm', right: '15mm' }
        : { top: '12mm', bottom: '12mm', left: '15mm', right: '15mm' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await page.close().catch(() => {});
  }
}
