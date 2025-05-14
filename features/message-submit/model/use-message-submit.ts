// features/message-submit/model/use-message-submit.ts
import { useCallback, useMemo } from 'react';
import { throttle } from 'lodash-es';

export const useMessageSubmit = (
  input: string,
  setInput: (value: string) => void,
  isLoading: boolean,
  setIsLoading: (value: boolean) => void,
  dispatchMessages: (action: any) => void,
  ws: React.MutableRefObject<WebSocket | null>
) => {
  const throttledSubmit = useMemo(() =>
    throttle((inputText: string) => {
      if (!inputText.trim() || isLoading) return;

      const userMessage = {
        id: Date.now(),
        text: inputText,
        message_belong: "user" as const,
        timestamp: new Date(),
      };

      dispatchMessages({ type: "ADD", payload: userMessage });
      setIsLoading(true);
      setInput("");

      if (ws.current) {
        ws.current.send(inputText);
      }
    }, 500),
    [isLoading, dispatchMessages, setIsLoading, setInput, ws]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      throttledSubmit(input);
    },
    [input, throttledSubmit]
  );

  return { handleSubmit };
};