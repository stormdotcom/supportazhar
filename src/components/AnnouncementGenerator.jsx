import React, { useRef, useState } from 'react';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtINR(n) {
  return Number(n).toLocaleString('en-IN');
}

function rupeeWords(n) {
  if (!n || isNaN(n)) return '';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function below100(x) {
    if (x < 20) return ones[x];
    return tens[Math.floor(x / 10)] + (x % 10 ? '-' + ones[x % 10] : '');
  }
  function convert(x) {
    if (x === 0) return '';
    if (x < 100) return below100(x);
    if (x < 1000) return ones[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + below100(x % 100) : '');
    if (x < 100000) return convert(Math.floor(x / 1000)) + ' Thousand' + (x % 1000 ? ' ' + convert(x % 1000) : '');
    if (x < 10000000) return convert(Math.floor(x / 100000)) + ' Lakh' + (x % 100000 ? ' ' + convert(x % 100000) : '');
    return convert(Math.floor(x / 10000000)) + ' Crore' + (x % 10000000 ? ' ' + convert(x % 10000000) : '');
  }
  const result = convert(Math.abs(Math.round(n)));
  return result ? 'Rupees ' + result + ' Only' : 'Zero Rupees';
}

function nowIST() {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date()).replace(',', ',').toUpperCase() + ' IST';
}

function todayIST() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'long', year: 'numeric',
  }).formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return `${p.day} ${p.month} ${p.year}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed: ' + src));
    img.src = src;
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line + (line ? ' ' : '') + words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = words[i];
      cy += lineHeight;
    } else { line = test; }
  }
  if (line) ctx.fillText(line, x, cy);
  return cy + lineHeight;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Canvas: Contribution Collection Update (Type 2 – English) ──────────────
async function drawCollectionUpdate(canvas, data) {
  const W = 900;
  // dynamically calculate height
  const accountCount = (data.accounts || []).length;
  const H = 430 + accountCount * 150 + 160;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const PAD = 60;

  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#0b626a'; ctx.fillRect(0, 0, W, 10);

  // Header
  ctx.fillStyle = '#1a4f55';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('MEDICAL SUPPORT APPEAL', PAD, 55);
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#536e73';
  ctx.font = '13px Arial, sans-serif';
  ctx.fillText(data.timestamp || nowIST(), W - PAD, 55);
  ctx.textAlign = 'left';

  // Title
  ctx.fillStyle = '#103b43';
  ctx.font = 'bold 52px Arial, sans-serif';
  let ty = wrapText(ctx, 'Contribution Collection Update', PAD, 115, W - PAD * 2, 62);

  // Subtitle
  ctx.fillStyle = '#0b626a';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.fillText('Support for ' + (data.personName || 'Azhar Shafi'), PAD, ty + 10);
  ty += 45;

  // Intro
  ctx.fillStyle = '#536e73';
  ctx.font = '16px Arial, sans-serif';
  ty = wrapText(ctx, `The following amounts have been received across the designated support accounts as of ${data.dateLabel || todayIST()}.`, PAD, ty + 8, W - PAD * 2, 24);
  ty += 10;

  const accounts = data.accounts || [];
  const labels = accounts.map((account) => (account.label || 'SUPPORT ACCOUNT').toUpperCase());
  const colors = ['#0b626a', '#17707a', '#1c7a87'];

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    const amount = acc.collected || 0;
    const CARD_H = 135;

    ctx.fillStyle = '#f5fbfa';
    roundRect(ctx, PAD, ty, W - PAD * 2, CARD_H, 14); ctx.fill();
    ctx.strokeStyle = '#d1e9e6'; ctx.lineWidth = 1.5;
    roundRect(ctx, PAD, ty, W - PAD * 2, CARD_H, 14); ctx.stroke();

    // Badge
    ctx.fillStyle = colors[i] || '#0b626a';
    ctx.beginPath(); ctx.arc(PAD + 38, ty + 38, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1).padStart(2, '0'), PAD + 38, ty + 44);
    ctx.textAlign = 'left';

    const LEFT = PAD + 75;
    // Label
    ctx.fillStyle = colors[i] || '#0b626a';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.letterSpacing = '1.5px';
    ctx.fillText(labels[i] || `ACCOUNT ${i + 1}`, LEFT, ty + 26);
    ctx.letterSpacing = '0px';
    // Holder label
    ctx.fillStyle = '#88a0a4'; ctx.font = '12px Arial, sans-serif';
    ctx.fillText('Account Holder:', LEFT, ty + 48);
    // Holder name
    ctx.fillStyle = '#103b43'; ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText(acc.holder || '', LEFT, ty + 72);
    // Number label
    ctx.fillStyle = '#88a0a4'; ctx.font = '12px Arial, sans-serif';
    ctx.fillText('Account Number:', LEFT, ty + 94);
    // Number
    ctx.fillStyle = '#103b43'; ctx.font = 'bold 17px Arial, sans-serif';
    ctx.fillText(acc.number || acc.upiId || '', LEFT, ty + 115);

    // Right side
    const DIVX = PAD + (W - PAD * 2) * 0.52;
    ctx.strokeStyle = '#d1e9e6'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(DIVX, ty + 18); ctx.lineTo(DIVX, ty + CARD_H - 18); ctx.stroke();

    const RX = DIVX + 20;
    ctx.fillStyle = '#88a0a4'; ctx.font = '13px Arial, sans-serif';
    ctx.fillText('Amount Collected:', RX, ty + 30);
    ctx.fillStyle = '#103b43'; ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillText('₹' + fmtINR(amount), RX, ty + 78);
    ctx.fillStyle = '#536e73'; ctx.font = '11px Arial, sans-serif';
    wrapText(ctx, rupeeWords(amount), RX, ty + 98, (W - PAD * 2) * 0.44, 15);

    ty += CARD_H + 18;
  }

  // Total
  const totalAmt = accounts.reduce((s, a) => s + (a.collected || 0), 0);
  const TOTAL_H = 120;
  ctx.fillStyle = '#f0faf8';
  roundRect(ctx, PAD, ty, W - PAD * 2, TOTAL_H, 14); ctx.fill();
  ctx.strokeStyle = '#a8d5cf'; ctx.lineWidth = 2;
  roundRect(ctx, PAD, ty, W - PAD * 2, TOTAL_H, 14); ctx.stroke();

  ctx.fillStyle = '#0b626a'; ctx.font = 'bold 11px Arial, sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('TOTAL CONTRIBUTIONS RECEIVED', PAD + 25, ty + 28);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = '#0b3e44'; ctx.font = 'bold 52px Arial, sans-serif';
  ctx.fillText('₹ ' + fmtINR(totalAmt), PAD + 25, ty + 85);
  ty += TOTAL_H + 16;
  ctx.fillStyle = '#536e73'; ctx.font = '14px Arial, sans-serif';
  ctx.fillText(rupeeWords(totalAmt), PAD + 25, ty + 5);
  ty += 35;

  // Footer
  ctx.fillStyle = '#627a80'; ctx.font = '14px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('We sincerely thank everyone who has contributed and supported Azhar and his family.', W / 2, ty + 10);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#0b626a'; ctx.fillRect(0, H - 8, W, 8);
}

// ─── Canvas: Medical Appeal Poster (Type 1 – Malayalam) ────────────────────
async function drawMedicalAppeal(canvas, data) {
  const W = 900;
  const accountCount = (data.accounts || []).length;
  const H = 500 + accountCount * 160 + 220;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const PAD = 55;

  ctx.fillStyle = '#f5faf9'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#0b626a'; ctx.fillRect(0, 0, W, 10);

  // Header
  ctx.fillStyle = '#0b626a'; ctx.font = 'bold 12px Arial, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('ചികിത്സ സഹായ അഭ്യർത്ഥന', PAD, 52);
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'right'; ctx.fillStyle = '#536e73'; ctx.font = '12px Arial, sans-serif';
  ctx.fillText(data.dateLabel || todayIST(), W - PAD, 52);
  ctx.textAlign = 'left';

  // Title
  ctx.fillStyle = '#0b3e44'; ctx.font = 'bold 64px Arial, sans-serif';
  let ty = wrapText(ctx, data.headline || 'അസ്‌ഹർ ഷാഫിക്കൊപ്പം നിൽക്കൂ', PAD, 115, W - PAD * 2, 76);

  // Subtitle
  ctx.fillStyle = '#1a5e66'; ctx.font = 'bold 22px Arial, sans-serif';
  ty = wrapText(ctx, data.subheadline || '', PAD, ty + 4, W - PAD * 2, 30) + 8;

  // Story
  ctx.fillStyle = '#536e73'; ctx.font = '16px Arial, sans-serif';
  for (const para of (data.story || [])) {
    ty = wrapText(ctx, para, PAD, ty, W - PAD * 2, 26) + 8;
  }
  ty += 14;

  // Divider
  ctx.strokeStyle = '#d1e9e6'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, ty); ctx.lineTo(W - PAD, ty); ctx.stroke();
  ty += 28;

  // Stats boxes
  const target = data.target || 2000000;
  const collected = data.collected || 0;
  const remaining = Math.max(0, target - collected);
  const stats = [
    { label: 'ചികിത്സചെലവ്', value: `₹${fmtINR(Math.round(target / 100000))} ലക്ഷം` },
    { label: 'സമാഹരിച്ചത്', value: `₹${fmtINR(Math.round(collected / 100000))} ലക്ഷം` },
    { label: 'ലക്ഷ്യത്തിലേക്ക് ബാക്കി', value: `₹${fmtINR(Math.round(remaining / 100000))} ലക്ഷം` },
  ];
  const BOX_W = (W - PAD * 2 - 24) / 3;
  for (let i = 0; i < stats.length; i++) {
    const bx = PAD + i * (BOX_W + 12);
    ctx.fillStyle = '#e8f7f5';
    roundRect(ctx, bx, ty, BOX_W, 88, 10); ctx.fill();
    ctx.strokeStyle = '#c5e2de'; ctx.lineWidth = 1;
    roundRect(ctx, bx, ty, BOX_W, 88, 10); ctx.stroke();
    ctx.fillStyle = '#4d7e84'; ctx.font = '12px Arial, sans-serif';
    ctx.fillText(stats[i].label, bx + 14, ty + 26);
    ctx.fillStyle = '#0b3e44'; ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText(stats[i].value, bx + 14, ty + 62);
  }
  ty += 108;

  if (data.surgeryPaid) {
    ctx.fillStyle = '#627a80'; ctx.font = '14px Arial, sans-serif';
    ctx.fillText('ശസ്ത്രക്രിയക്കായി ₹5 ലക്ഷം ഇതിനകം അടച്ചിട്ടുണ്ട്.', PAD, ty);
    ty += 28;
  }

  ty += 10;
  ctx.fillStyle = '#0b3e44'; ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText('സംഭാവന നൽകാൻ QR സ്കാൻ ചെയ്യൂ', PAD, ty);
  ty += 32;
  ctx.fillStyle = '#536e73'; ctx.font = '14px Arial, sans-serif';
  ty = wrapText(ctx, 'താഴെയുള്ള സജീവ UPI അക്കൗണ്ട് ഉപയോഗിക്കൂ. പണമടക്കും മുമ്പ് ആപ്പിൽ പേരും UPI ID-യും പരിശോധിക്കൂ.', PAD, ty, W - PAD * 2, 22);
  ty += 10;

  const accounts = data.accounts || [];

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    const ACARD_H = 148;
    const cardW = W - PAD * 2;

    ctx.fillStyle = '#ffffff';
    roundRect(ctx, PAD, ty, cardW, ACARD_H, 10); ctx.fill();
    ctx.strokeStyle = '#d5e9e6'; ctx.lineWidth = 1.5;
    roundRect(ctx, PAD, ty, cardW, ACARD_H, 10); ctx.stroke();

    const QR_SIZE = 124;
    const qrX = PAD + 12; const qrY = ty + 12;
    try {
      const qrImg = await loadImage(acc.qrImage);
      ctx.drawImage(qrImg, qrX, qrY, QR_SIZE, QR_SIZE);
    } catch {
      ctx.fillStyle = '#e0eeec'; ctx.fillRect(qrX, qrY, QR_SIZE, QR_SIZE);
      ctx.fillStyle = '#0b626a'; ctx.font = 'bold 11px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QR CODE', qrX + QR_SIZE / 2, qrY + QR_SIZE / 2 + 4);
      ctx.textAlign = 'left';
    }

    const INFO_X = qrX + QR_SIZE + 18;
    ctx.fillStyle = '#0b626a'; ctx.font = 'bold 11px Arial, sans-serif';
    ctx.letterSpacing = '0.5px';
    ctx.fillText(`${String(i + 1).padStart(2, '0')} ${acc.label || 'UPI അക്കൗണ്ട്'}`, INFO_X, ty + 26);
    ctx.letterSpacing = '0px';

    ctx.fillStyle = '#88a0a4'; ctx.font = '11px Arial, sans-serif';
    ctx.fillText('അക്കൗണ്ട് ഉടമ', INFO_X, ty + 46);
    ctx.fillStyle = '#103b43'; ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText(acc.holder || '', INFO_X, ty + 70);

    ctx.fillStyle = '#88a0a4'; ctx.font = '11px Arial, sans-serif';
    ctx.fillText('UPI ID', INFO_X, ty + 90);
    ctx.fillStyle = '#103b43'; ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText(acc.upiId || '—', INFO_X, ty + 108);

    ctx.fillStyle = '#103b43'; ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText(acc.number || 'UPI payments only', INFO_X, ty + 130);
    if (acc.ifsc) {
      ctx.fillStyle = '#103b43'; ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText(acc.ifsc, INFO_X + 270, ty + 130);
    }

    ty += ACARD_H + 14;
  }

  // Footer contacts
  ty += 10;
  ctx.strokeStyle = '#d1e9e6'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, ty); ctx.lineTo(W - PAD, ty); ctx.stroke();
  ty += 22;

  ctx.fillStyle = '#103b43'; ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('റഫറൻസ് കോൺടാക്കുകൾ', PAD, ty);
  ctx.fillText('UPI ഇടപാട് പ്രശ്നങ്ങൾക്ക്', W / 2 + 20, ty);
  ty += 22;

  ctx.fillStyle = '#315a60'; ctx.font = '14px Arial, sans-serif';
  for (const c of (data.contacts?.reference || [])) {
    ctx.fillText(c.display || String(c), PAD, ty);
    ty += 20;
  }
  ctx.fillStyle = '#0b626a'; ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText(data.contacts?.transactionSupport || '', W / 2 + 20, ty - 10);

  ty += 16;
  ctx.fillStyle = '#627a80'; ctx.font = '13px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ഓരോ സംഭാവനയും വിലപ്പെട്ടതാണ്. അസ്‌ഹറിനും കുടുംബത്തിനും പിന്നുണ നൽകുന്നതിന് നന്ദി.', W / 2, ty);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#0b626a'; ctx.fillRect(0, H - 8, W, 8);
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="ann-overlay" role="dialog" aria-modal="true">
      <div className="ann-confirm-box">
        <div className="ann-confirm-icon">⚠️</div>
        <p className="ann-confirm-msg">{message}</p>
        <div className="ann-confirm-actions">
          <button className="ann-btn ann-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="ann-btn ann-btn-ok" onClick={onConfirm} autoFocus>Yes, proceed</button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────
function EditModal({ type, fields, onSave, onCancel }) {
  const [local, setLocal] = React.useState(() => JSON.parse(JSON.stringify(fields)));
  function set(key, val) { setLocal(prev => ({ ...prev, [key]: val })); }

  return (
    <div className="ann-overlay" role="dialog" aria-modal="true">
      <div className="ann-modal">
        <div className="ann-modal-header">
          <h3>Edit Announcement Content</h3>
          <button className="ann-modal-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>
        <div className="ann-modal-body">
          {type === 'collection' && (<>
            <label>Timestamp shown on image<input value={local.timestamp || ''} onChange={e => set('timestamp', e.target.value)} /></label>
            <label>Date label (e.g. 24 October 2026)<input value={local.dateLabel || ''} onChange={e => set('dateLabel', e.target.value)} /></label>
            <label>Person name<input value={local.personName || ''} onChange={e => set('personName', e.target.value)} /></label>
          </>)}
          {type === 'appeal' && (<>
            <label>Date label on top right<input value={local.dateLabel || ''} onChange={e => set('dateLabel', e.target.value)} /></label>
            <label>Headline (main title)<input value={local.headline || ''} onChange={e => set('headline', e.target.value)} /></label>
            <label>Subheadline<textarea rows={2} value={local.subheadline || ''} onChange={e => set('subheadline', e.target.value)} /></label>
            {(local.story || []).map((para, idx) => (
              <label key={idx}>Story paragraph {idx + 1}
                <textarea rows={3} value={para} onChange={e => {
                  const s = [...local.story]; s[idx] = e.target.value; set('story', s);
                }} />
              </label>
            ))}
          </>)}
        </div>
        <div className="ann-modal-footer">
          <button className="ann-btn ann-btn-cancel" onClick={onCancel}>Cancel — go back</button>
          <button className="ann-btn ann-btn-ok" onClick={() => onSave(local)}>Save &amp; Generate image</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function AnnouncementGenerator({ metrics, accounts, appeal, onFundSave }) {
  const canvasRef = useRef(null);
  const [confirm, setConfirm] = React.useState(null);
  const [editModal, setEditModal] = React.useState(null);
  const [generating, setGenerating] = React.useState(false);
  const [preview, setPreview] = React.useState(null);
  const [previewType, setPreviewType] = React.useState('');
  const [statusMsg, setStatusMsg] = React.useState('');
  const [adjustOp, setAdjustOp] = React.useState('add');
  const [adjustAccount, setAdjustAccount] = React.useState((accounts?.[0]?.id) || 'primary');
  const [adjustAmount, setAdjustAmount] = React.useState('');

  function askConfirm(message) {
    return new Promise(resolve => {
      setConfirm({
        message,
        onConfirm: () => { setConfirm(null); resolve(true); },
        onCancel: () => { setConfirm(null); resolve(false); },
      });
    });
  }

  function openEditModal(type, fields) {
    return new Promise(resolve => {
      setEditModal({
        type, fields,
        onSave: (saved) => { setEditModal(null); resolve(saved); },
        onCancel: () => { setEditModal(null); resolve(null); },
      });
    });
  }

  async function downloadCanvas(filename) {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    setPreview(dataUrl);
    const a = document.createElement('a');
    a.href = dataUrl; a.download = filename; a.click();
  }

  // ── Collection Update ───────────────────────────────────────────────────
  async function handleGenerateCollection() {
    const ok = await askConfirm(
      'You are about to generate a Contribution Collection Update image. It will show the current fund amounts collected in the listed accounts. The image will be downloaded immediately. Do you want to continue?'
    );
    if (!ok) return;

    const defaultFields = {
      timestamp: nowIST(),
      dateLabel: todayIST(),
      personName: appeal?.person?.name || 'Azhar Shafi',
    };
    const edited = await openEditModal('collection', defaultFields);
    if (!edited) return;

    setGenerating(true); setStatusMsg('Generating image, please wait…');
    try {
      await drawCollectionUpdate(canvasRef.current, {
        ...edited,
        accounts: (accounts || []).map(a => ({
          holder: a.holder,
          label: a.label,
          number: a.number,
          upiId: a.upiId,
          collected: a.collected || 0,
        })),
      });
      const fname = `contribution-update-${new Date().toISOString().slice(0, 10)}.png`;
      await downloadCanvas(fname);
      setPreviewType('collection');
      setStatusMsg('✓ Image downloaded: ' + fname);
    } catch (err) {
      setStatusMsg('Error generating image: ' + err.message);
    } finally { setGenerating(false); }
  }

  // ── Medical Appeal Poster ───────────────────────────────────────────────
  async function handleGenerateAppeal() {
    const ok = await askConfirm(
      'You are about to generate a Medical Appeal poster image with QR codes (Malayalam style). This image is suitable for sharing on WhatsApp and social media. The image will be downloaded immediately. Do you want to continue?'
    );
    if (!ok) return;

    const defaultFields = {
      dateLabel: todayIST(),
      headline: 'അസ്‌ഹർ ഷാഫിക്കൊപ്പം നിൽക്കൂ',
      subheadline: 'അടിയന്തര ചികിത്സാചെലവുകൾ നേരിടാൻ നിങ്ങളുടെ സഹായം കുടുംബത്തിന് കരുത്താകും.',
      story: appeal?.medical?.story || [],
    };
    const edited = await openEditModal('appeal', defaultFields);
    if (!edited) return;

    setGenerating(true); setStatusMsg('Generating image, please wait…');
    try {
      await drawMedicalAppeal(canvasRef.current, {
        ...edited,
        target: Number(metrics?.target_rupees || appeal?.funding?.target || 2000000),
        collected: Number(metrics?.collected_rupees || appeal?.funding?.collected || 0),
        surgeryPaid: Number(metrics?.surgery_paid_rupees || appeal?.funding?.surgeryPaid || 0),
        accounts: (accounts || []).filter(a => a.upiActive).map(a => ({
          label: a.label,
          qrImage: a.qrImage,
          holder: a.holder,
          number: a.number,
          upiId: a.upi_id || a.upiId || '',
          ifsc: a.ifsc || '',
          collected: a.collected || 0,
        })),
        contacts: appeal?.contacts || {},
      });
      const fname = `medical-appeal-${new Date().toISOString().slice(0, 10)}.png`;
      await downloadCanvas(fname);
      setPreviewType('appeal');
      setStatusMsg('✓ Image downloaded: ' + fname);
    } catch (err) {
      setStatusMsg('Error generating image: ' + err.message);
    } finally { setGenerating(false); }
  }

  // ── Fund Adjustment ─────────────────────────────────────────────────────
  async function handleFundAdjust() {
    const amt = parseInt(adjustAmount, 10);
    if (!amt || amt <= 0 || isNaN(amt)) {
      setStatusMsg('Please enter a valid positive rupee amount to continue.');
      return;
    }
    const account = (accounts || []).find(a => a.id === adjustAccount);
    const oldAmt = account?.collected || 0;
    const newAmt = adjustOp === 'add' ? oldAmt + amt : Math.max(0, oldAmt - amt);
    const opLabel = adjustOp === 'add' ? 'add' : 'subtract';
    const accountLabel = account?.label || adjustAccount;

    const ok = await askConfirm(
      `You are about to ${opLabel} ₹${fmtINR(amt)} ${adjustOp === 'add' ? 'to' : 'from'} "${accountLabel}".\n\nCurrent amount: ₹${fmtINR(oldAmt)}\nNew amount after this change: ₹${fmtINR(newAmt)}\n\nThe old amount will not be lost — only the new total will be saved. Are you sure you want to save this change?`
    );
    if (!ok) return;

    if (typeof onFundSave === 'function') {
      try {
        await onFundSave(adjustAccount, newAmt);
        setAdjustAmount('');
        setStatusMsg(`✓ Fund updated. "${accountLabel}" collected amount is now ₹${fmtINR(newAmt)}.`);
      } catch (err) {
        setStatusMsg('Error saving fund: ' + err.message);
      }
    } else {
      setStatusMsg('Fund save handler not connected — please check integration.');
    }
  }

  return (
    <section className="ann-section manage-card">
      <h2>📢 Generate Announcements</h2>
      <p>Create shareable images in two formats. Fund amounts and account details are pre-filled from the current live figures.</p>

      {/* Fund Adjustment */}
      <div className="ann-fund-box">
        <h3 className="ann-fund-title">Adjust Collected Fund Amount</h3>
        <p className="ann-fund-desc">Use add or subtract to update the collected amount for an account. The old amount is always kept safe — only the new total is saved.</p>
        <div className="ann-fund-row">
          <label>Account
            <select value={adjustAccount} onChange={e => setAdjustAccount(e.target.value)}>
              {(accounts || []).map(a => (
                <option key={a.id} value={a.id}>{a.label} — currently ₹{fmtINR(a.collected || 0)}</option>
              ))}
            </select>
          </label>
          <label>Operation
            <select value={adjustOp} onChange={e => setAdjustOp(e.target.value)}>
              <option value="add">➕ Add to existing amount</option>
              <option value="minus">➖ Subtract from existing amount</option>
            </select>
          </label>
          <label>Amount (₹)
            <input type="number" min="1" step="1" placeholder="e.g. 50000" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} />
          </label>
          <button type="button" className="ann-btn ann-btn-fund" onClick={handleFundAdjust} disabled={generating}>
            Save fund change
          </button>
        </div>
      </div>

      {/* Announcement types */}
      <div className="ann-types">
        <div className="ann-type-card">
          <div className="ann-type-icon">🏥</div>
          <h3>Medical Appeal Poster</h3>
          <p>Malayalam-style poster with QR codes for active UPI accounts. Best for WhatsApp and social media sharing.</p>
          <ul className="ann-type-list">
            <li>QR images pre-loaded from existing assets</li>
            <li>Date, headline &amp; story are editable before generation</li>
            <li>Downloaded immediately as PNG</li>
          </ul>
          <button type="button" className="ann-btn ann-btn-primary" onClick={handleGenerateAppeal} disabled={generating}>
            {generating ? 'Generating…' : '🎨 Generate &amp; Download'}
          </button>
        </div>
        <div className="ann-type-card">
          <div className="ann-type-icon">📊</div>
          <h3>Contribution Collection Update</h3>
          <p>English-language update showing amount collected per account and total. Best for status updates and reports.</p>
          <ul className="ann-type-list">
            <li>Shows per-account and total collected amounts</li>
            <li>Date and timestamp are editable before generation</li>
            <li>Downloaded immediately as PNG</li>
          </ul>
          <button type="button" className="ann-btn ann-btn-primary" onClick={handleGenerateCollection} disabled={generating}>
            {generating ? 'Generating…' : '📥 Generate &amp; Download'}
          </button>
        </div>
      </div>

      {statusMsg && <p className="ann-status" role="status">{statusMsg}</p>}

      {preview && (
        <div className="ann-preview">
          <p className="ann-preview-label">
            Preview — {previewType === 'collection' ? 'Contribution Collection Update' : 'Medical Appeal Poster'}
          </p>
          <img src={preview} alt="Generated announcement" className="ann-preview-img" />
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />

      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={confirm.onCancel} />}
      {editModal && <EditModal type={editModal.type} fields={editModal.fields} onSave={editModal.onSave} onCancel={editModal.onCancel} />}
    </section>
  );
}
