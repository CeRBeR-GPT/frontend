import { useMemo, useReducer, useRef, useState } from "react";
import { Message } from "./types";
import MessageItem from "@/components/MessageItem";
import { useCopyMessage } from "@/features/copy-message/model/use-copyMessage";
import { useTheme } from "next-themes";

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

export const useMessage = () => {
    const [messages, dispatchMessages] = useReducer(messagesReducer, []);
    const [isTestMessageShown, setIsTestMessageShown] = useState<boolean>(true);
    const [input, setInput] = useState<string>("")
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const ws = useRef<WebSocket | null>(null)
    const { handleCopyCode, handleCopyTextMarkdown, copiedCode} = useCopyMessage()
    const { theme } = useTheme()


    // const renderedMessages = useMemo(() =>
    //     messages.map((message) => (
    //         <MessageItem key={`${message.id}`} handleCopyTextMarkdown = {handleCopyTextMarkdown} 
    //         message={message} theme={theme} 
    //         onCopy={handleCopyCode} copiedCode={copiedCode} />
    //     )),
    //     [messages, theme, copiedCode, handleCopyCode],
    // )

    return { 
        messages, 
        dispatchMessages, 
        setIsTestMessageShown, 
        isTestMessageShown,
        messagesContainerRef,
        input,
        ws,
        setInput,
        // renderedMessages
    };
};