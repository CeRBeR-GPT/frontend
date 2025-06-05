
import { useEffect } from 'react';

export const useLockBodyScroll = (isLocked = true) => {
  useEffect(() => {
    if (isLocked) {
      document.documentElement.classList.add("overflow-hidden");
    } else {
      document.documentElement.classList.remove("overflow-hidden");
    }

    return () => {
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [isLocked]);
};