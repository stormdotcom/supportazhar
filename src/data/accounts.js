import { appeal } from './appeal.js';

export const appealImage = '/assets/azhar-medical-appeal.png';
export const additionalAccountsImage = '/assets/azhar-additional-accounts.jpg';

export const accounts = Object.fromEntries(appeal.accounts.map((account) => [
  account.id,
  {
    ...account,
    holderLabel: account.id === 'current' ? 'Account name' : 'Account holder',
    numberLabel: 'Account number',
    ifscLabel: 'IFSC',
  },
]));
