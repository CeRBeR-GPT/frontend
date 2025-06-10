export interface ProviderStatistic {
  provider_name: string;
  messages_sent: number;
  last_activity: string;
}

export interface DailyStatistic {
  day: string;
  providers: ProviderStatistic[];
}
