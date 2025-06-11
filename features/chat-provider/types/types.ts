export interface ProviderSelectorProps {
  availableProviders: string[];
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  userPlan: string;
}
