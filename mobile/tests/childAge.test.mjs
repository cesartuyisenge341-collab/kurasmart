import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatChildAge,
  getAgeInMonths,
  parseDateOfBirth,
  validateChildProfile,
} from '../src/utils/childAge.js';

const today = new Date(2026, 10, 18);

test('rejects invalid calendar dates and future dates', () => {
  assert.equal(parseDateOfBirth('2025-02-29'), null);
  assert.equal(
    validateChildProfile(
      { name: 'Ari', dateOfBirth: '2026-11-19' },
      today,
    ),
    'Date of birth cannot be in the future.',
  );
});

test('accepts children through age five and rejects ages six and older', () => {
  assert.equal(
    validateChildProfile(
      { name: 'Ari', dateOfBirth: '2021-11-18' },
      today,
    ),
    null,
  );
  assert.match(
    validateChildProfile(
      { name: 'Ari', dateOfBirth: '2020-11-18' },
      today,
    ),
    /under 6 years old/,
  );
});

test('formats age in months and years', () => {
  assert.equal(getAgeInMonths('2025-11-18', today), 12);
  assert.equal(formatChildAge('2025-11-18', today), '1 year old');
  assert.equal(formatChildAge('2026-10-18', today), '1 month old');
  assert.equal(
    formatChildAge({ toDate: () => new Date(2025, 10, 18) }, today),
    '1 year old',
  );
});
