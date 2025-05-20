import { useRef, useState } from "react";
import { Message } from "./types";
import { useMessageContext } from "@/shared/contexts/MessageContext";

export const useMessage = () => {
    const { messages, dispatchMessages } = useMessageContext();
    const [isTestMessageShown, setIsTestMessageShown] = useState<boolean>(true);
    const [input, setInput] = useState<string>("")
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const ws = useRef<WebSocket | null>(null)

    return { 
        messages, 
        dispatchMessages, 
        setIsTestMessageShown, 
        isTestMessageShown,
        messagesContainerRef,
        input,
        ws,
        setInput,
    };
};