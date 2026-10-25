import { appeal } from './appeal.js';

export const appealImage = appeal.site.appealImage;
export const additionalAccountsImage = appeal.site.additionalAccountsImage;

export const accounts = Object.fromEntries(appeal.accounts.map((account) => [
  account.id,
  {
    ...account,
    holderLabel: account.holderLabel ?? 'Account holder',
    numberLabel: 'Account number',
    ifscLabel: 'IFSC',
  },
]));
