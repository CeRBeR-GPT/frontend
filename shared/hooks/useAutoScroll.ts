'use client';

import { RefObject, useEffect } from 'react';

import { scrollToBottom } from '../utils';

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
