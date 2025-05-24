"use client"
import React, { useCallback, useEffect, useRef, useState } from "react"
import ProviderSelectorDropdown from "@/components/provider-selector-dropdown"
import { Button } from "@/shared/ui/ui/button"
import { ArrowUp } from "lucide-react"
import { Textarea } from "@/shared/ui/ui/textarea"
import { useChangeProvider } from "@/features/change-provider/model/use-changeProvider"
import { useChats } from "@/entities/chat/model/use-chats"
import { useToast } from "@/shared/hooks/use-toast"

const MessageInput = React.memo(
  ({
    value,
    onSubmit,
    onChange
  }: {
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    value: string
    onSubmit: (e: React.FormEvent) => void
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording" | "processing">("idle")
    const recognitionRef = useRef<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()
    const { selectedProvider, availableProviders, handleProviderChange} = useChangeProvider()
    const onProviderChange = handleProviderChange
    const { isLoading } = useChats()
    const isTextFile = (file: File): boolean => {
      const textMimeTypes = [
        "text/plain",
        "text/html",
        "text/css",
        "text/javascript",
        "application/json",
        "application/xml",
        "application/javascript",
        "application/typescript",
        "text/markdown",
        "text/csv",
      ]

      if (textMimeTypes.includes(file.type)) return true

      const textExtensions = [
        ".txt",
        ".md",
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".json",
        ".html",
        ".css",
        ".csv",
        ".xml",
        ".py",
      ]
      const fileName = file.name.toLowerCase()
      return textExtensions.some((ext) => fileName.endsWith(ext))
    }

    const handleFileUpload = useCallback(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    }, [])

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const file = files[0]

        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        if (!isTextFile(file)) {
          toast({
            title: "Неподдерживаемый формат",
            description: "Пожалуйста, загрузите текстовый файл (.txt, .md, .js, .json и т.д.)",
            variant: "destructive",
          })
          return
        }

        if (file.size > 1024 * 1024) {
          toast({
            title: "Файл слишком большой",
            description: "Максимальный размер файла - 1MB",
            variant: "destructive",
          })
          return
        }

        const reader = new FileReader()

        reader.onload = (event) => {
          try {
            const content = event.target?.result as string
            const sample = content.slice(0, 1000)
            const nonPrintableCount = sample.split("").filter((char) => {
              const code = char.charCodeAt(0)
              return code < 32 || code === 127
            }).length

            if (nonPrintableCount > sample.length * 0.1) {
              toast({
                title: "Бинарный файл",
                description: "Файл содержит бинарные данные и не может быть обработан",
                variant: "destructive",
              })
              return
            }

            if (textareaRef.current) {
              const currentValue = textareaRef.current.value
              const newValue = currentValue ? `${currentValue}\n\n${content}` : content
              const syntheticEvent = {
                target: { value: newValue },
              } as React.ChangeEvent<HTMLTextAreaElement>
              onChange(syntheticEvent)
              toast({
                title: "Файл загружен",
                description: `Содержимое файла "${file.name}" добавлено в поле ввода`,
              })
            }
          } catch (error) {
            toast({
              title: "Ошибка чтения файла",
              description: "Не удалось прочитать содержимое файла",
              variant: "destructive",
            })
          }
        }

        reader.onerror = () => {
          toast({
            title: "Ошибка чтения файла",
            description: "Не удалось прочитать содержимое файла",
            variant: "destructive",
          })
        }

        reader.readAsText(file)
      },
      [onChange],
    )

    const adjustTextareaHeight = useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      textarea.style.height = "auto"
      const newHeight = Math.max(60, Math.min(textarea.scrollHeight, 200))
      textarea.style.height = `${newHeight}px`
    }, [])

    useEffect(() => {
      adjustTextareaHeight()
    }, [value, adjustTextareaHeight])

    const startRecording = useCallback(() => {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        toast({
          title: "Не поддерживается",
          description: "Ваш браузер не поддерживает распознавание речи",
          variant: "destructive",
        })
        return
      }

      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()

        const recognition = recognitionRef.current
        recognition.lang = "ru-RU"
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onstart = () => {
          setIsRecording(true)
          setRecordingStatus("recording")
        }

        recognition.onresult = (event: any) => {
          setRecordingStatus("processing")
          const transcript = event.results[0][0].transcript
          if (textareaRef.current) {
            const currentValue = textareaRef.current.value
            const newValue = currentValue ? `${currentValue} ${transcript}` : transcript
            const syntheticEvent = {
              target: { value: newValue },
            } as React.ChangeEvent<HTMLTextAreaElement>

            onChange(syntheticEvent)
          }
        }

        recognition.onerror = (event: any) => {
          setIsRecording(false)
          setRecordingStatus("idle")

          toast({
            title: "Ошибка распознавания",
            description: `Ошибка: ${event.error}`,
            variant: "destructive",
          })
        }

        recognition.onend = () => {
          setIsRecording(false)
          setRecordingStatus("idle")
        }

        recognition.start()
      } catch (error) {
        setIsRecording(false)
        setRecordingStatus("idle")

        toast({
          title: "Ошибка",
          description: "Не удалось запустить распознавание речи",
          variant: "destructive",
        })
      }
    }, [onChange])

    const stopRecording = useCallback(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }, [])

    return (
      <form onSubmit={onSubmit} className="sticky bottom-0 bg-background pt-2 w-full max-w-full pb-safe">
        <div className="relative flex flex-col w-full px-2">
          <div className="flex items-start gap-2 w-full">
            <div className="flex-shrink-0">
              <ProviderSelectorDropdown
                selectedProvider={selectedProvider}
                availableProviders={availableProviders}
                onProviderChange={onProviderChange}
              />
            </div>
            <div className="relative flex-grow w-full">
              <Textarea
                ref={textareaRef}
                placeholder="Напишите ваш запрос..."
                value={value}
                onChange={onChange}
                className="min-h-[60px] max-h-[200px] resize-none rounded-xl border-gray-300 focus:border-primary w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    onSubmit(e)
                  }
                }}
              />
            </div>
          </div>

          <div className="flex justify-end mt-2 gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.md,.js,.ts,.jsx,.tsx,.json,.html,.css,.csv,.xml,text/plain,text/html,text/css,text/javascript,application/json,application/xml"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleFileUpload}
              className="rounded-full w-10 h-10 p-0 flex items-center justify-center transition-colors bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              disabled={isLoading}
              aria-label="Загрузить текстовый файл"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </button>
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`rounded-full w-10 h-10 p-0 flex items-center justify-center transition-colors ${
                recordingStatus === "recording"
                  ? "bg-red-500 text-white animate-pulse"
                  : recordingStatus === "processing"
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
              disabled={isLoading}
              aria-label={isRecording ? "Остановить запись" : "Начать запись голоса"}
            >
              {recordingStatus === "recording" ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
              ) : recordingStatus === "processing" ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
              )}
            </button>
            <Button type="submit" className="rounded-full w-10 h-10 p-0" disabled={!value.trim() || isLoading}>
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Отправить</span>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-2 px-2">
            AI может допускать ошибки. Проверяйте важную информацию.
          </p>
        </div>
      </form>
    )
  },
)

export default MessageInput