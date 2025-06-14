import { useUser } from '@/shared/contexts';

import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';

const Subscription = () => {
  const { userData } = useUser();

  const plan =
    userData?.plan === 'default'
      ? 'Базовый'
      : userData?.plan === 'premium'
        ? 'Премиум'
        : userData?.plan === 'business'
          ? 'Бизнес'
          : '';

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ваша подписка</CardTitle>
          <CardDescription>Управляйте вашим тарифным планом</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Использовано сообщений</span>
                <span className="text-sm font-medium">
                  {userData ? userData.message_count_limit - userData.available_message_count : 0} /{' '}
                  {userData?.message_count_limit || 0}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${
                      userData
                        ? ((userData.message_count_limit - userData.available_message_count) /
                            userData.message_count_limit) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <h4 className="mb-1 font-medium">{plan} тариф</h4>
              <p className="mb-3 text-sm text-muted-foreground">
                У вас активирован {plan} тариф с ограничением в {userData?.message_count_limit || 0}{' '}
                сообщений в день.
              </p>
              <Button variant="outline" size="sm">
                Управление тарифом
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscription;
