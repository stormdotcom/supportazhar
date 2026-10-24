import { appeal } from './appeal.js';

export const appealImage = '/assets/azhar-medical-appeal.png';
export const additionalAccountsImage = '/assets/azhar-additional-accounts.jpg';
const qrImages = {
  current: '/assets/upi-hdfc.png',
  secondary: '/assets/upi-secondary.jpeg',
  primary: '/assets/upi-primary.jpeg',
};

export const accounts = Object.fromEntries(appeal.accounts.map((account) => [
  account.id,
  {
    ...account,
    holderLabel: account.id === 'current' ? 'Account name' : 'Account holder',
    numberLabel: 'Account number',
    ifscLabel: 'IFSC',
    qrImage: qrImages[account.id],
  },
]));
