import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import { Message } from "./types";
import { throttle } from "lodash-es"
import { useChats } from "@/entities/chat/model/use-chats";
import MessageItem from "@/components/MessageItem";
import { useCopyMessage } from "@/features/copy-message/model/use-copyMessage";
import { useTheme } from "next-themes";

export const useMessage = () => {
    const [messages, dispatchMessages] = useReducer(messagesReducer, []);
    const [isTestMessageShown, setIsTestMessageShown] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [input, setInput] = useState<string>("")
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const ws = useRef<WebSocket | null>(null)
    const { handleCopyCode, handleCopyTextMarkdown, copiedCode} = useCopyMessage()
    const { theme } = useTheme()

    function messagesReducer(state: Message[], action: { type: string; payload?: any }): Message[] {
        switch (action.type) {
            case "ADD":
                return [...state, action.payload];
            case "SET":
                return Array.isArray(action.payload) ? action.payload : [];
            case "CLEAR":
                return [];
            default:
                return state;
        }
    }

    const renderedMessages = useMemo(() =>
        messages.map((message) => (
            <MessageItem key={`${message.id}`} handleCopyTextMarkdown = {handleCopyTextMarkdown} 
            message={message} theme={theme} 
            onCopy={handleCopyCode} copiedCode={copiedCode} />
        )),
        [messages, theme, copiedCode, handleCopyCode],
    )

    const throttledSubmit = useMemo(
        () =>
            throttle((input: string) => {
                if (!input.trim() || isLoading) return
        
                const userMessage: Message = {
                id: Date.now(),
                text: input,
                message_belong: "user",
                timestamp: new Date(),
                }
        
                dispatchMessages({ type: "ADD", payload: userMessage })
                setIsLoading(true)
                setInput("")
        
                if (ws.current) { ws.current.send(input) }
            }, 500),
        [isLoading],
      )
    
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }, [])

    return { 
        messages, 
        dispatchMessages, 
        setIsTestMessageShown, 
        isTestMessageShown,
        messagesContainerRef,
        throttledSubmit,
        input,
        handleInputChange,
        ws,
        setInput,
        renderedMessages
    };
};