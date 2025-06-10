'use client';

import React, { useEffect, useRef, useState } from 'react';

import { ArrowUp } from 'lucide-react';

import { useChats } from '@/entities/chat/model';
import { useChangeProvider } from '@/features/change-provider/model';
import { Button } from '@/shared/ui/button';
import { DucumentIcon } from '@/shared/ui/document-icon';
import ProviderSelectorDropdown from '@/shared/ui/provider-selector-dropdown';
import { SpeechIcon } from '@/shared/ui/speech-icon';
import { Textarea } from '@/shared/ui/textarea';

import { useMessageOptions } from '../model/use-message-options';

const MessageInput = React.memo(
  ({
    value,
    onSubmit,
    onChange,
  }: {
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    value: string;
    onSubmit: (e: React.FormEvent) => void;
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { selectedProvider, availableProviders, handleProviderChange } = useChangeProvider();
    const onProviderChange = handleProviderChange;
    const { isLoading } = useChats();
    const {
      handleFileUpload,
      handleFileChange,
      adjustTextareaHeight,
      stopRecording,
      startRecording,
      isRecording,
      recordingStatus,
    } = useMessageOptions(onChange, textareaRef, fileInputRef, recognitionRef);

    useEffect(() => {
      adjustTextareaHeight();
    }, [value, adjustTextareaHeight]);

    return (
      <form
        onSubmit={onSubmit}
        className="pb-safe sticky bottom-0 w-full max-w-full bg-background pt-2"
      >
        <div className="relative flex w-full flex-col px-2">
          <div className="flex w-full items-start gap-2">
            <div className="flex-shrink-0">
              <ProviderSelectorDropdown
                selectedProvider={selectedProvider}
                availableProviders={availableProviders}
                onProviderChange={onProviderChange}
              />
            </div>
            <div className="relative w-full flex-grow">
              <Textarea
                ref={textareaRef}
                placeholder="Напишите ваш запрос..."
                value={value}
                onChange={onChange}
                className="max-h-[200px] min-h-[60px] w-full resize-none rounded-xl border-gray-300 focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
              />
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
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
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 p-0 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              disabled={isLoading}
              aria-label="Загрузить текстовый файл"
            >
              <DucumentIcon />
            </button>
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex h-10 w-10 items-center justify-center rounded-full p-0 transition-colors ${
                recordingStatus === 'recording'
                  ? 'animate-pulse bg-red-500 text-white'
                  : recordingStatus === 'processing'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
              disabled={isLoading}
              aria-label={isRecording ? 'Остановить запись' : 'Начать запись голоса'}
            >
              {recordingStatus === 'recording' ? (
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-white"></span>
                </span>
              ) : recordingStatus === 'processing' ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <SpeechIcon />
              )}
            </button>
            <Button
              type="submit"
              className="h-10 w-10 rounded-full p-0"
              disabled={!value.trim() || isLoading}
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Отправить</span>
            </Button>
          </div>

          <p className="mt-2 px-2 text-center text-xs text-muted-foreground">
            AI может допускать ошибки. Проверяйте важную информацию.
          </p>
        </div>
      </form>
    );
  }
);

export default MessageInput;
