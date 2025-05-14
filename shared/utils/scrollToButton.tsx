// shared/utils/scrollToBottom.ts
import { RefObject } from 'react';

interface ScrollOptions {
  behavior?: 'auto' | 'smooth';
  offset?: number;
}

export const scrollToBottom = (
  containerRef: RefObject<HTMLDivElement | null>,
  options: ScrollOptions = { behavior: 'smooth' }
) => {
  if (containerRef.current) {
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: options.behavior,
    });
  }
};