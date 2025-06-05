import { useRef, useState } from "react";
import { useMessageContext } from "@/shared/contexts/MessageContext";

export const useMessage = () => {
    const { messages, dispatchMessages } = useMessageContext();
    const [input, setInput] = useState<string>("")
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const ws = useRef<WebSocket | null>(null)

    return { 
        messages, 
        dispatchMessages, 
        messagesContainerRef,
        input,
        ws,
        setInput,
    };
};