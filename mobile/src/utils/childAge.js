export function parseDateOfBirth(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value?.toDate === 'function') {
    const date = value.toDate();
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
  }
  if (typeof value !== 'string') {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function getAgeInMonths(dateOfBirth, now = new Date()) {
  const birthDate = parseDateOfBirth(dateOfBirth);
  if (!birthDate) {
    return null;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (birthDate > today) {
    return null;
  }

  let months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    today.getMonth() -
    birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  return months;
}

export function formatChildAge(dateOfBirth, now = new Date()) {
  const ageInMonths = getAgeInMonths(dateOfBirth, now);
  if (ageInMonths === null) {
    return 'Age unavailable';
  }
  if (ageInMonths === 0) {
    return 'Under 1 month old';
  }
  if (ageInMonths < 12) {
    return `${ageInMonths} ${ageInMonths === 1 ? 'month' : 'months'} old`;
  }

  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;
  const yearLabel = `${years} ${years === 1 ? 'year' : 'years'}`;
  if (months === 0) {
    return `${yearLabel} old`;
  }

  return `${yearLabel}, ${months} ${months === 1 ? 'month' : 'months'} old`;
}

export function validateChildProfile({ name, dateOfBirth }, now = new Date()) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return 'Enter the child’s name.';
  }

  const birthDate = parseDateOfBirth(dateOfBirth);
  if (!birthDate) {
    return 'Enter a real date in YYYY-MM-DD format.';
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (birthDate > today) {
    return 'Date of birth cannot be in the future.';
  }

  if (getAgeInMonths(dateOfBirth, now) >= 72) {
    return 'KuraSmart child profiles are for children under 6 years old.';
  }

  return null;
}
