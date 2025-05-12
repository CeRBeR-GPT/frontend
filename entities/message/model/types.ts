
export interface Message {
  id: number
  text: string
  message_belong: "user" | "assistant"
  timestamp: Date
}