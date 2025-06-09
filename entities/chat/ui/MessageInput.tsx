"use client"
import React, { useEffect, useRef, useState } from "react"
import ProviderSelectorDropdown from "@/shared/ui/provider-selector-dropdown"
import { Button } from "@/shared/ui/button"
import { ArrowUp } from "lucide-react"
import { Textarea } from "@/shared/ui/textarea"
import { useChangeProvider } from "@/features/change-provider/model"
import { useChats } from "@/entities/chat/model"
import { useMessageOptions } from "../model/use-message-options"

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
    const recognitionRef = useRef<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { selectedProvider, availableProviders, handleProviderChange} = useChangeProvider()
    const onProviderChange = handleProviderChange
    const { isLoading } = useChats()
    const { handleFileUpload, handleFileChange, adjustTextareaHeight, stopRecording, startRecording, isRecording, 
      recordingStatus} = useMessageOptions( onChange, textareaRef, fileInputRef, recognitionRef)

    useEffect(() => {
      adjustTextareaHeight()
    }, [value, adjustTextareaHeight])

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