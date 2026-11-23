import { expect, it } from 'vitest';
import { number } from './shared';

it('la precisión de lectura conserva el signo y distingue valores pequeños de cero', () => {
  expect(number(99)).toBe('99.00');
  expect(number(261.2898, 4)).toBe('261.2898');
  expect(number(0.00002)).toBe('2.00e-5');
  expect(number(-0.0002)).toBe('-2.00e-4');
  expect(number(0, 4)).toBe('0.0000');
  expect(number(-0)).toBe('0.00');
  expect(number(1234567)).toBe('1.23e+6');
});
