import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(project, 'build');
const assets = join(output, 'assets');
mkdirSync(assets, { recursive: true });

for (const name of ['upi-primary.jpeg', 'upi-secondary.jpeg', 'upi-hdfc.png']) {
  if (!existsSync(join(assets, name))) throw new Error(`Missing original QR asset: build/assets/${name}`);
}

const accounts = [
  {
    number: '01', qr: 'upi-primary.jpeg', holder: 'Naseela Nazar',
    account: '30990695716', ifsc: 'SBIN0010692', upi: 'naseela324@oksbi',
    extra: '9048313713', extraType: 'gpay',
  },
  {
    number: '02', qr: 'upi-secondary.jpeg', holder: 'Muhammed Ashkar N',
    account: '3439967725', ifsc: 'SBIN0007253', upi: 'ashkarn534-1@oksbi',
    extra: '9745527474', extraType: 'phone',
  },
  {
    number: '03', qr: 'upi-hdfc.png', holder: 'SHAFI S',
    account: '50100912757807', ifsc: 'HDFC0004275', upi: 'shafi.azar122@okhdfcbank',
    extra: 'Savings Account · HDFC Bank Pattoor', extraType: 'branch',
  },
];

const translations = {
  en: {
    lang: 'en', eyebrow: 'MEDICAL SUPPORT APPEAL', updated: '23 OCT 2026',
    title: 'Stand with Azhar Shafi',
    subtitle: 'Your contribution can help his family meet urgent treatment costs.',
    incident: 'Azhar, 32, from Kazhakkottam, was seriously injured in a road accident at Marthandam on 22 October 2026. He is in the ICU at Ananthapuri Hospital, Thiruvananthapuram, with a severe head injury and bleeding in the brain.',
    estimate: 'Treatment estimate', collected: 'Contributions collected', remaining: 'Still needed to reach target',
    lakh20: '₹20 lakh', lakh3: '₹3 lakh', lakh17: '₹17 lakh',
    surgery: '₹5 lakh has already been paid towards surgery.',
    scanTitle: 'Scan a QR to contribute',
    scanNote: 'Choose any UPI account below. Confirm the payee and UPI ID in your payment app.',
    labels: ['Primary account', 'Secondary account', 'HDFC account'],
    holder: 'Account holder', account: 'Account number', ifsc: 'IFSC', upi: 'UPI ID',
    gpay: 'GPay number', phone: 'Contact number', branch: 'Account / branch',
    reference: 'Reference Contacts', support: 'For UPI transaction issues',
    bottom: 'Every contribution matters. Thank you for supporting Azhar and his family.',
  },
  ml: {
    lang: 'ml', eyebrow: 'ചികിത്സാ സഹായ അഭ്യർത്ഥന', updated: '23 ഒക്ടോബർ 2026',
    title: 'അസ്ഹർ ഷാഫിക്കൊപ്പം നിൽക്കൂ',
    subtitle: 'അടിയന്തര ചികിത്സാചെലവുകൾ നേരിടാൻ നിങ്ങളുടെ സഹായം കുടുംബത്തിന് കരുത്താകും.',
    incident: '32 വയസ്സുള്ള കഴക്കൂട്ടം സ്വദേശിയായ അസ്ഹർ 2026 ഒക്ടോബർ 22-ന് മാർത്താണ്ഡത്ത് ഉണ്ടായ റോഡപകടത്തിൽ ഗുരുതരമായി പരിക്കേറ്റു. തലയിൽ ഗുരുതര പരിക്കും തലച്ചോറിൽ രക്തസ്രാവവും ഉള്ളതിനാൽ തിരുവനന്തപുരം അനന്തപുരി ആശുപത്രിയിലെ ഐസിയുവിൽ ചികിത്സയിലാണ്.',
    estimate: 'ചികിത്സാചെലവ്', collected: 'സമാഹരിച്ചത്', remaining: 'ലക്ഷ്യത്തിലെത്താൻ ബാക്കി',
    lakh20: '₹20 ലക്ഷം', lakh3: '₹3 ലക്ഷം', lakh17: '₹17 ലക്ഷം',
    surgery: 'ശസ്ത്രക്രിയയ്ക്കായി ₹5 ലക്ഷം ഇതിനകം അടച്ചിട്ടുണ്ട്.',
    scanTitle: 'സംഭാവന നൽകാൻ QR സ്കാൻ ചെയ്യൂ',
    scanNote: 'താഴെയുള്ള ഏതെങ്കിലും UPI അക്കൗണ്ട് തിരഞ്ഞെടുക്കാം. പണമടയ്ക്കും മുമ്പ് ആപ്പിൽ പേരും UPI ID-യും പരിശോധിക്കുക.',
    labels: ['പ്രാഥമിക അക്കൗണ്ട്', 'രണ്ടാമത്തെ അക്കൗണ്ട്', 'HDFC അക്കൗണ്ട്'],
    holder: 'അക്കൗണ്ട് ഉടമ', account: 'അക്കൗണ്ട് നമ്പർ', ifsc: 'IFSC', upi: 'UPI ID',
    gpay: 'GPay നമ്പർ', phone: 'ഫോൺ നമ്പർ', branch: 'അക്കൗണ്ട് / ശാഖ',
    reference: 'റഫറൻസ് കോൺടാക്ടുകൾ', support: 'UPI ഇടപാട് പ്രശ്നങ്ങൾക്ക്',
    bottom: 'ഓരോ സംഭാവനയും വിലപ്പെട്ടതാണ്. അസ്ഹറിനും കുടുംബത്തിനും പിന്തുണ നൽകുന്നതിന് നന്ദി.',
  },
};

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

function accountCard(account, index, t) {
  const extraLabel = t[account.extraType];
  return `<article class="account-card">
    <div class="qr-wrap"><img src="assets/${account.qr}" alt="QR code for ${escape(account.upi)}"></div>
    <div class="account-copy">
      <div class="account-top"><span class="account-index">${account.number}</span><span class="account-type">${escape(t.labels[index])}</span></div>
      <div class="holder-label">${escape(t.holder)}</div>
      <div class="holder">${escape(account.holder)}</div>
      <div class="upi-line"><span class="data-label">${escape(t.upi)}</span><strong>${escape(account.upi)}</strong></div>
      <div class="data-grid">
        <div><span class="data-label">${escape(t.account)}</span><strong>${account.account}</strong></div>
        <div><span class="data-label">${escape(t.ifsc)}</span><strong>${account.ifsc}</strong></div>
      </div>
      <div class="extra"><span>${escape(extraLabel)}:</span> <strong>${escape(account.extra)}</strong></div>
    </div>
  </article>`;
}

function document(t) {
  return `<!doctype html>
<html lang="${t.lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Support Azhar Shafi - ${t.lang === 'en' ? 'English' : 'Malayalam'} poster</title>
<style>
@page { size: A4 portrait; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { background: #dce8e6; color: #18343c; font-family: Arial, 'Nirmala UI', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.poster { width: 1240px; height: 1754px; overflow: hidden; padding: 48px 54px 37px; position: relative; background: #f7faf8; box-shadow: 0 18px 70px #1b40401f; }
.poster::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 13px; background: #11736e; }
.topline { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; color: #246d69; font-size: 18px; font-weight: 800; letter-spacing: 2px; }
.topline .date { color: #4d696e; font-weight: 700; letter-spacing: .5px; }
h1 { font-size: 61px; line-height: 1.08; letter-spacing: -2.1px; margin: 0 0 11px; color: #123f47; }
.subtitle { font-size: 25px; line-height: 1.28; font-weight: 700; margin: 0 0 19px; color: #16736c; }
.incident { font-size: 21px; line-height: 1.39; margin: 0; max-width: 1100px; color: #2a444a; }
.funding { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border: 1px solid #bfd7d1; border-radius: 17px; background: #e7f3ef; margin-top: 23px; padding: 17px 10px 13px; }
.funding-item { padding: 0 19px; border-right: 1px solid #bbd4ce; }
.funding-item:last-child { border-right: 0; }
.funding-item span { display: block; color: #4b666a; font-size: 17px; line-height: 1.2; font-weight: 700; }
.funding-item strong { display: block; color: #104d53; font-size: 36px; line-height: 1.1; margin-top: 4px; letter-spacing: -1px; white-space: nowrap; }
.funding-item.collected strong { color: #087a65; }
.funding-bar { height: 7px; background: #c6dcd5; border-radius: 10px; overflow: hidden; margin: 11px 19px 0; grid-column: 1 / -1; }
.funding-bar::before { content: ''; width: 15%; height: 100%; display: block; background: #0c8d72; }
.surgery { margin: 9px 1px 0; font-size: 17px; line-height: 1.2; color: #53696e; font-weight: 700; }
.scan-heading { display: flex; align-items: baseline; gap: 15px; margin: 22px 0 5px; }
.scan-heading h2 { color: #123f47; font-size: 34px; margin: 0; line-height: 1.15; letter-spacing: -.7px; }
.scan-heading .line { height: 2px; background: #b4d2ca; flex: 1; }
.scan-note { color: #4f686b; font-size: 17px; margin: 0 0 15px; line-height: 1.25; }
.accounts { display: grid; gap: 13px; }
.account-card { height: 320px; display: grid; grid-template-columns: 295px 1fr; gap: 19px; align-items: center; border: 1px solid #cfdfda; border-radius: 19px; background: #fff; padding: 16px; box-shadow: 0 3px 14px #244d4710; }
.qr-wrap { width: 286px; height: 286px; background: white; border: 1px solid #e0e7e3; display: grid; place-items: center; border-radius: 8px; overflow: hidden; }
.qr-wrap img { display: block; width: 280px; height: 280px; object-fit: contain; }
.account-copy { min-width: 0; align-self: stretch; padding: 5px 1px 0; }
.account-top { display: flex; align-items: center; gap: 9px; color: #1b7067; font-size: 18px; font-weight: 800; margin-bottom: 10px; }
.account-index { display: inline-grid; place-items: center; width: 33px; height: 33px; border-radius: 50%; color: white; background: #13776b; font-size: 17px; }
.holder-label, .data-label { color: #64777b; font-size: 15px; font-weight: 700; display: block; line-height: 1.1; }
.holder { color: #153d45; font-size: 28px; font-weight: 800; line-height: 1.1; margin: 2px 0 9px; }
.upi-line { border-radius: 9px; background: #eef7f3; padding: 8px 11px; margin-bottom: 10px; }
.upi-line strong { color: #0c6158; font-size: 23px; letter-spacing: -.2px; line-height: 1.25; }
.data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.data-grid strong { font-size: 21px; line-height: 1.16; color: #223e45; display: block; margin-top: 3px; }
.extra { color: #63767a; font-size: 16px; margin-top: 8px; white-space: nowrap; }
.extra strong { color: #28474c; }
.footer { display: grid; grid-template-columns: 1fr 1fr; gap: 19px; margin-top: 19px; border-top: 2px solid #d3e3de; padding-top: 15px; }
.footer-label { color: #177064; font-size: 18px; font-weight: 800; margin: 0 0 5px; }
.footer-numbers { color: #153b43; font-size: 19px; font-weight: 800; line-height: 1.35; margin: 0; }
.footer .support { border-left: 2px solid #d3e3de; padding-left: 23px; }
.thanks { margin-top: 13px; color: #597276; font-size: 16px; line-height: 1.2; }
.ml { font-family: 'Nirmala UI', Arial, sans-serif; }
.ml h1 { font-size: 50px; line-height: 1.32; letter-spacing: -.5px; margin-bottom: 8px; }
.ml .subtitle { font-size: 22px; margin-bottom: 14px; }
.ml .incident { font-size: 19px; line-height: 1.38; }
.ml .funding { margin-top: 18px; }
.ml .funding-item span { font-size: 16px; }
.ml .funding-item strong { font-size: 33px; }
.ml .scan-heading { margin-top: 16px; }
.ml .scan-heading h2 { font-size: 29px; }
.ml .scan-note { font-size: 16px; }
.ml .account-card { height: 310px; }
.ml .qr-wrap { height: 276px; width: 276px; }
.ml .qr-wrap img { width: 270px; height: 270px; }
.ml .holder { font-size: 27px; }
.ml .account-top { margin-bottom: 7px; }
.ml .upi-line { margin-bottom: 7px; padding: 6px 10px; }
.ml .footer { margin-top: 16px; }
@media print { html, body { width: 210mm; height: 297mm; background: white; } .poster { zoom: .64; box-shadow: none; } }
</style></head><body><main class="poster ${t.lang}">
  <header>
    <div class="topline"><span>${escape(t.eyebrow)}</span><span class="date">${escape(t.updated)}</span></div>
    <h1>${escape(t.title)}</h1>
    <p class="subtitle">${escape(t.subtitle)}</p>
    <p class="incident">${escape(t.incident)}</p>
  </header>
  <section class="funding" aria-label="Funding progress">
    <div class="funding-item"><span>${escape(t.estimate)}</span><strong>${escape(t.lakh20)}</strong></div>
    <div class="funding-item collected"><span>${escape(t.collected)}</span><strong>${escape(t.lakh3)}</strong></div>
    <div class="funding-item"><span>${escape(t.remaining)}</span><strong>${escape(t.lakh17)}</strong></div>
    <div class="funding-bar" aria-hidden="true"></div>
  </section>
  <p class="surgery">${escape(t.surgery)}</p>
  <div class="scan-heading"><h2>${escape(t.scanTitle)}</h2><span class="line" aria-hidden="true"></span></div>
  <p class="scan-note">${escape(t.scanNote)}</p>
  <section class="accounts" aria-label="UPI account options">${accounts.map((account, i) => accountCard(account, i, t)).join('')}</section>
  <footer>
    <div class="footer">
      <div><p class="footer-label">${escape(t.reference)}</p><p class="footer-numbers">+91 70129 57194 · +91 81295 90761<br>+91 96336 59500</p></div>
      <div class="support"><p class="footer-label">${escape(t.support)}</p><p class="footer-numbers">8891590046</p></div>
    </div>
    <p class="thanks">${escape(t.bottom)}</p>
  </footer>
</main></body></html>`;
}

for (const [language, t] of Object.entries(translations)) {
  writeFileSync(join(output, `azhar-support-${language === 'en' ? 'english' : 'malayalam'}.html`), document(t), 'utf8');
}
