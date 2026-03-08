export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Newspaper {
  name: string;
  type: 'image' | 'text';
  url: string;
  selector?: string;
  skipDays?: DayOfWeek[];
}

export interface EmailRecipient {
  name: string;
  address: string;
}
