import { getColorIntensity } from '../statistics/generateMonthlyGrid';

const statistics = [
  {
    day: '2025-07-10',
    providers: [
      {
        provider_name: 'default',
        messages_sent: 10,
        last_activity: '2025-07-10T13:41:13.485Z',
      },
      {
        provider_name: 'deepseek',
        messages_sent: 5,
        last_activity: '2025-07-10T12:41:13.485Z',
      },
    ],
  },
  {
    day: '2025-07-09',
    providers: [
      {
        provider_name: 'default',
        messages_sent: 20,
        last_activity: '2025-07-09T13:41:13.485Z',
      },
    ],
  },
];

describe('getColorIntensity', () => {
  it('Возвращает bg-gray-100 dark:bg-gray-800 при count = 0', () => {
    expect(getColorIntensity(statistics, 0)).toBe('bg-gray-100 dark:bg-gray-800');
  });

  it('Возвращает bg-green-100 dark:bg-green-900 при count = 5', () => {
    expect(getColorIntensity(statistics, 5)).toBe('bg-green-100 dark:bg-green-900');
  });

  it('Возвращает bg-green-300 dark:bg-green-700 при count = 10', () => {
    expect(getColorIntensity(statistics, 10)).toBe('bg-green-300 dark:bg-green-700');
  });

  it('Возвращает bg-green-700 dark:bg-green-300 при count = 20', () => {
    expect(getColorIntensity(statistics, 20)).toBe('bg-green-700 dark:bg-green-300');
  });
});
