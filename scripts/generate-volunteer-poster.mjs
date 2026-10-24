import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(project, 'build');
mkdirSync(output, { recursive: true });

const appeal = JSON.parse(readFileSync(join(project, 'data.json'), 'utf8'));
const { accounts } = appeal;
const rupees = (amount) => `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
const status = new Date(appeal.payments.upiStatusAt);
const statusDate = status.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
const statusTime = status.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).replace(':00', '').toUpperCase();
const statusStamp = `${statusDate}, ${statusTime}`;

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

const cards = accounts.map((item, index) => {
  const y = 585 + index * 185;
  return `<g>
    <rect x="70" y="${y}" width="940" height="165" rx="18" fill="#ffffff" stroke="#c9dedb" stroke-width="2"/>
    <rect x="92" y="${y + 22}" width="54" height="54" rx="14" fill="#dcefeb"/>
    <text x="119" y="${y + 58}" text-anchor="middle" class="number">${String(index + 1).padStart(2, '0')}</text>
    <text x="170" y="${y + 63}" class="holder">${escape(item.holder)}</text>
    <text x="170" y="${y + 110}" class="data-label">ACCOUNT NUMBER</text>
    <text x="170" y="${y + 142}" class="data">${escape(item.number)}</text>
    <text x="705" y="${y + 110}" class="data-label">IFSC</text>
    <text x="705" y="${y + 142}" class="data">${escape(item.ifsc)}</text>
  </g>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" role="img" aria-labelledby="title description">
  <title id="title">Volunteer for Azhar Shafi</title>
  <desc id="description">Collect cash contributions and transfer by NEFT to one of three listed bank accounts. UPI and GPay are ${escape(appeal.payments.upiStatus)} as of ${escape(statusStamp)}.</desc>
  <style>
    text { font-family: Arial, 'Nirmala UI', sans-serif; }
    .eyebrow { font-size: 25px; font-weight: 700; fill: #296c71; letter-spacing: 1.8px; }
    .headline { font-size: 74px; font-weight: 800; fill: #103d45; letter-spacing: -2px; }
    .body { font-size: 29px; fill: #355a60; }
    .status { font-size: 29px; font-weight: 800; fill: #80501d; }
    .status-note { font-size: 24px; fill: #755c3d; }
    .section { font-size: 40px; font-weight: 800; fill: #103d45; }
    .section-note { font-size: 25px; fill: #4f7074; }
    .number { font-size: 24px; font-weight: 800; fill: #135d65; }
    .holder { font-size: 37px; font-weight: 800; fill: #153f47; }
    .data-label { font-size: 19px; font-weight: 700; fill: #668186; letter-spacing: 1px; }
    .data { font-size: 29px; font-weight: 700; fill: #174c54; }
    .footer { font-size: 23px; fill: #426469; }
  </style>
  <rect width="1080" height="1350" fill="#f1f8f6"/>
  <rect width="1080" height="15" fill="#0d6670"/>
  <text x="70" y="85" class="eyebrow">SUPPORT FOR AZHAR SHAFI</text>
  <text x="70" y="184" class="headline">Take a step</text>
  <text x="70" y="263" class="headline">for Azhar.</text>
  <text x="72" y="321" class="body">Volunteer to collect cash contributions.</text>
  <text x="72" y="362" class="body">Transfer the collected amount by NEFT.</text>
  <rect x="70" y="399" width="940" height="100" rx="16" fill="#fff0d9"/>
  <text x="97" y="442" class="status">UPI / GPay ${escape(appeal.payments.upiStatus)}</text>
  <text x="97" y="477" class="status-note">${escape(appeal.payments.upiStatusReason)} · ${escape(statusStamp)}</text>
  <text x="70" y="548" class="section">Choose any one bank account</text>
  ${cards}
  <text x="70" y="1195" class="footer">${escape(rupees(appeal.funding.collected))} collected toward ${escape(rupees(appeal.funding.target))} goal.</text>
  <text x="70" y="1231" class="footer">Questions? Call ${escape(appeal.contacts.reference[0].display)}</text>
  <line x1="70" x2="1010" y1="1260" y2="1260" stroke="#bcd7d2" stroke-width="2"/>
  <text x="70" y="1307" class="section-note">Check the recipient. Every contribution helps.</text>
</svg>`;

writeFileSync(join(output, 'azhar-volunteer-poster.svg'), svg, 'utf8');

const message = `Please take a step for ${appeal.person.name}. We still have a long way to go to meet the ${rupees(appeal.funding.target)} treatment goal. ${rupees(appeal.funding.collected)} has been collected so far.\n\nIf you can volunteer to collect cash contributions, please transfer the collected amount by NEFT to any ONE of these bank accounts:\n\n${accounts.map((account, index) => `${index + 1}. ${account.holder} — ${account.number} — IFSC ${account.ifsc}`).join('\n')}\n\nUPI and GPay are currently ${appeal.payments.upiStatus} because their limits were reached on ${statusStamp}. Please check the recipient name before sending a bank transfer.\n\nQuestions about the appeal: ${appeal.contacts.reference[0].display}\n`;
writeFileSync(join(output, 'azhar-volunteer-whatsapp.txt'), message, 'utf8');
