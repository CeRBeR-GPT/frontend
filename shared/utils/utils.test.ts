import { cn } from '../utils/utils';

describe('cn', () => {
  it('объединяет строковые классы', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('обрабатывает условные классы', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional');
    expect(cn('base', false && 'conditional')).toBe('base');
  });

  it('разрешает конфликты Tailwind', () => {
    expect(cn('p-2 p-4')).toBe('p-4');
    expect(cn('text-red text-blue')).toBe('text-blue');
  });

  it('работает с объектами', () => {
    expect(cn({ 'bg-white': true, 'text-black': false })).toBe('bg-white');
  });

  it('сохраняет порядок классов', () => {
    expect(cn('hover:bg-red', 'bg-blue')).toBe('hover:bg-red bg-blue');
  });

  it('обрабатывает dark-классы', () => {
    expect(cn('dark:bg-black', 'bg-white')).toBe('dark:bg-black bg-white');
  });

  it('игнорирует undefined/null/false', () => {
    expect(cn('base', undefined, null, false)).toBe('base');
  });
});
