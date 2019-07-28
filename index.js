const puppeteer = require('puppeteer');
const { writeFile } = require('fs-extra');
(async () => {
  let url = 'https://gmail.com';
  let userCreds = {
    email: 'xxxx',
    password: 'xxxx'
  };
  let browser, page;
  try {
    browser = await puppeteer.launch({headless: true});
    page = await browser.newPage();
    let sel = 'input[type="email"]';
    await page.goto(url, {waitUntil: 'networkidle0'})
      .then(() => page.waitForSelector(sel));
    await page.type(sel, userCreds.email);
    let nextButtonSel = '#next';
    await page.click(nextButtonSel).then(() => page.waitForSelector('[placeholder="Password"]'));
    console.log('typing password');
    await page.type('[placeholder="Password"]', userCreds.password);
    await page.click('#signIn');
    let uiSel = '.UI tr';
    await page.waitFor(uiSel);

    let mails = await page.$$eval(uiSel, elems => {
      let emails = [];
      for(let e of elems) {
        emails.push({
          from: e.querySelector('td:nth-child(5) span span').innerText,
          subject: e.querySelector('span.bog').innerText
        });
      }
      return emails;
    });

    mails = mails.slice(0,10);
    let counter = 1;
    for(let mail of mails) {
      console.log(counter++, `. From: ${mail.from} -`, mail.subject);
    }
  } catch(err) {
    console.log(`Err: ${err.message}`);
    let html = await page.content();
    await writeFile('err.html', html);
    await page.screenshot({
      path: './err.jpg'
    });
  } finally {
    await browser.close();
  }
})();

