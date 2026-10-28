import { appeal } from './appeal.js';

const qrImages = {
  shaina: '/assets/upi-shaina.jpg',
  current: '/assets/upi-hdfc.png',
  secondary: '/assets/upi-secondary.jpeg',
  primary: '/assets/upi-primary.jpeg',
};

export const getAccounts = (appealData = appeal) => Object.fromEntries(appealData.accounts.map((account) => [
  account.id,
  {
    ...account,
    holderLabel: 'Account holder',
    numberLabel: 'Account number',
    ifscLabel: 'IFSC',
    qrImage: qrImages[account.id],
  },
]));
