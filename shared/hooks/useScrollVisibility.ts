'use client'
import { useEffect, useState, RefObject } from 'react';

export const useScrollVisibility = (
  containerRef: RefObject<HTMLElement | null>,
  dependencies: any[] = [],
  options: {
    showOffset?: number;
    throttleDelay?: number;
  } = {}
) => {
  const { showOffset = 50, throttleDelay = 100 } = options;
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastScrollTop = container.scrollTop;
    let timeoutId: NodeJS.Timeout;

    const handleScrollEvent = () => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtBottom = scrollHeight - (scrollTop + clientHeight) < showOffset;
        const isScrollingDown = scrollTop > lastScrollTop;
        lastScrollTop = scrollTop;
        const hasMoreContentBelow = scrollHeight > clientHeight + scrollTop;
        
        setShowButton(isScrollingDown && hasMoreContentBelow && !isAtBottom);
      }, throttleDelay);
    };

    container.addEventListener('scroll', handleScrollEvent);
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', handleScrollEvent);
    };
  }, [containerRef.current, ...dependencies]);

  return { showButton };
};