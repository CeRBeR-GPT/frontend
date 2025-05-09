import { RefObject } from "react"

export const scrollToRight = (containerRef: RefObject<HTMLElement | null>): void => {
    if (containerRef.current) {
      const scrollContainer = containerRef.current.querySelector(
          '[data-radix-scroll-area-viewport]'
      ) as HTMLElement

      if (scrollContainer) {
        const scrollWidth = scrollContainer.scrollWidth
        const clientWidth = scrollContainer.clientWidth

        if (scrollWidth > clientWidth) {
          scrollContainer.scrollLeft = scrollWidth - clientWidth
        }
      }
    }
  }