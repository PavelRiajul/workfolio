import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' });
for (const blockJs of [false, true]) {
  for (const path of ['/', '/work/', '/services/', '/blog/', '/about/']) {
    const p = await b.newPage();
    await p.setViewport({ width: 1440, height: 900 });
    await p.setRequestInterception(true);
    p.on('request', r => (blockJs && /\.js($|\?)/.test(r.url())) ? r.abort() : r.continue());
    await p.goto('http://localhost:4399' + path, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 2200));
    const s = await p.evaluate(() => {
      const inView = el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && r.height > 0; };
      const vis = [...document.querySelectorAll('[data-hero-item], [data-reveal], h1, h2')]
        .filter(inView).filter(el => getComputedStyle(el).display !== 'none');
      const blank = vis.filter(el => +getComputedStyle(el).opacity < 0.9);
      return { checked: vis.length, blank: blank.length,
               who: blank.slice(0,3).map(e => (e.className||e.tagName).toString().slice(0,20)) };
    });
    console.log(`JS ${blockJs?'BLOCKED':'normal '} ${path.padEnd(11)} on-screen elements ${String(s.checked).padStart(3)}   invisible ${s.blank}${s.blank?'  <-- '+s.who.join(', '):''}`);
    await p.close();
  }
}
await b.close();
