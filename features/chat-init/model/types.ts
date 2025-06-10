export interface UseChatInitializationProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  ws: React.MutableRefObject<WebSocket | null>;
}
