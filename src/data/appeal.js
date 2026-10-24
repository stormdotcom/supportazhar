import appeal from '../../data.json';

export { appeal };

export function rupees(amount) {
  return `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
}

export function shortDate(date) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

export function shortStatusDate(dateTime) {
  const date = new Date(dateTime);
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
  const time = date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).replace(':00', '').toUpperCase();
  return `${day}, ${time}`;
}
