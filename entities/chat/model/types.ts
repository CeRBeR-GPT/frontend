
export interface ChatHistory {
  id: string
  title: string
  preview: string
  date: Date
  messages: number
}

export interface Message {
    id: number
    text: string
    message_belong: "user" | "assistant"
    timestamp: Date
}

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}