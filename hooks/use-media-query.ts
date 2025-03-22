"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Устанавливаем начальное значение
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    // Создаем колбэк для обновления состояния
    const listener = () => {
      setMatches(media.matches)
    }

    // Добавляем слушатель
    media.addEventListener("change", listener)

    // Очищаем слушатель при размонтировании
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [matches, query])

  return matches
}