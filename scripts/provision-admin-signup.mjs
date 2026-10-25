import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const config = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8')
  .split(/\r?\n/).filter((line) => /^[A-Z_]+=/.test(line))
  .map((line) => {
    const separator = line.indexOf('=');
    return [line.slice(0, separator), line.slice(separator + 1).trim()];
  }));

const url = config.VITE_SUPABASE_URL;
const key = config.VITE_SUPABASE_PUBLISHABLE_KEY;
const email = config.VITE_SUPABASE_ADMIN_EMAIL;
if (!url || !key || !email) throw new Error('Missing Supabase URL, publishable key, or admin email in .env');
if (!process.stdin.isTTY) throw new Error('Run this script in an interactive terminal.');

const pin = await new Promise((resolve, reject) => {
  let digits = '';
  process.stdout.write('Admin PIN (input hidden): ');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  const onData = (buffer) => {
    for (const keypress of buffer.toString('utf8')) {
      if (keypress === '\r' || keypress === '\n') {
        process.stdin.off('data', onData);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write('\n');
        if (!/^\d{6}$/.test(digits)) reject(new Error('PIN must contain six digits.'));
        else resolve(digits);
        return;
      }
      if (keypress === '\u0003') process.exit(130);
      if (keypress === '\u007f' || keypress === '\b') digits = digits.slice(0, -1);
      else if (/^\d$/.test(keypress) && digits.length < 6) digits += keypress;
    }
  };
  process.stdin.on('data', onData);
});

const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await client.auth.signUp({ email, password: pin });
if (error) throw new Error(`Supabase Auth signup failed: ${error.message}`);
if (!data.user) throw new Error('Supabase Auth did not return a user.');
process.stdout.write(`Signup accepted for ${email}. Email confirmation may still be required.\n`);
