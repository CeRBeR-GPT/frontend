import { useReducer, useState } from "react";
import { Message } from "./types";

export const useMessage = () => {
    const [messages, dispatchMessages] = useReducer(messagesReducer, []);
    const [isTestMessageShown, setIsTestMessageShown] = useState<boolean>(true);
    
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

    return { 
        messages, 
        dispatchMessages, 
        setIsTestMessageShown, 
        isTestMessageShown 
    };
};