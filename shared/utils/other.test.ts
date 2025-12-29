import { formatExpireDate } from '../utils/other';

describe('formatExpireDate', () => {
  it('возвращает null при пустом значении', () => {
    expect(formatExpireDate(null)).toBeNull();
    expect(formatExpireDate(undefined)).toBeNull();
    expect(formatExpireDate('')).toBeNull();
  });

  it('корректно форматирует валидную дату', () => {
    expect(formatExpireDate('2023-05-15')).toBe('15 мая 2023');
    expect(formatExpireDate('2023-12-31T00:00:00.000Z')).toBe('31 декабря 2023');
    expect(formatExpireDate(new Date(2023, 0, 1))).toBe('1 января 2023');
  });

  it('использует русскую локаль для форматирования', () => {
    const result = formatExpireDate('2023-05-15');
    expect(result).toContain('мая');
    expect(result).not.toContain('May');
  });
});
