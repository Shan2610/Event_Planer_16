const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');

export const fmtDate = (d) => {
  d = new Date(d);
  return `${DAYS[d.getDay()]}, ${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const fmtTime = (d) => {
  d = new Date(d);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const dateKey = (d) => {
  d = new Date(d);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function validateEvent({ name, description, dateTime }, isNew) {
  const errors = {};
  if (!name.trim()) errors.name = 'Enter an event name.';
  else if (name.trim().length > 60) errors.name = 'Keep the name under 60 characters.';
  if (description.length > 300) errors.description = 'Keep the description under 300 characters.';
  if (!(dateTime instanceof Date) || isNaN(dateTime)) errors.dateTime = 'Choose a valid date and time.';
  else if (isNew && dateTime <= new Date()) errors.dateTime = 'Choose a date and time in the future.';
  return errors;
}

export function matchesSearch(event, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    event.name.toLowerCase().includes(q) ||
    dateKey(event.dateTime).includes(q) ||
    fmtDate(event.dateTime).toLowerCase().includes(q)
  );
}
