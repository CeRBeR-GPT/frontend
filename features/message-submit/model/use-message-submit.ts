// features/message-submit/model/use-message-submit.ts
import { useCallback, useMemo, useState } from 'react';
import { throttle } from 'lodash-es';

export const useMessageSubmit = (
  isLoading: boolean,
  setIsLoading: (value: boolean) => void,
  dispatchMessages: (action: any) => void,
  ws: React.MutableRefObject<WebSocket | null>
) => {
  const [input, setInput] = useState<string>("")
  
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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
  }, [])

  return { handleSubmit, input, handleInputChange };
};