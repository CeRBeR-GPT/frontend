

export type UserData = {
    id: string,
    email: string,
    plan: string,
    plan_expire_date: Date,
    available_message_count: number,
    message_length_limit: number,
    message_count_limit: number
} | null

export interface ApiError extends Error {
    response?: {
      status: number;
      data?: any;
    };
  }