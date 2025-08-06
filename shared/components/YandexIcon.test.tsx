import { render } from '@testing-library/react';
import { YandexIcon } from './YandexIcon';

describe('YandexIcon', () => {
  it('корректно рендерится', () => {
    const { container } = render(<YandexIcon />);

    // Получаем SVG через querySelector
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveClass('mr-2 h-5 w-5');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
