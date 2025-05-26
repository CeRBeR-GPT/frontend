// shared/hooks/useAutoScroll.ts
import { useEffect, RefObject } from 'react';
import { scrollToBottom } from '../utils/scrollToButton';

export const useAutoScroll = (
  messagesContainerRef: RefObject<HTMLDivElement | null>,
  dependencies: any[],
  options: {
    delay?: number;
    smooth?: boolean;
    onlyIfNotLoading?: boolean;
  } = {}
) => {
  const { delay = 100, smooth = true, onlyIfNotLoading = true } = options;

  useEffect(() => {
    if (!messagesContainerRef.current || (onlyIfNotLoading && dependencies[1])) return;

    const timer = setTimeout(() => {
      scrollToBottom(messagesContainerRef, { behavior: smooth ? 'smooth' : 'auto' });
    }, delay);

    return () => clearTimeout(timer);
  }, [...dependencies]);
};