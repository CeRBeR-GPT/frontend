import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { useAuth } from "@/hooks/use-auth"

interface SubscriptionProps{
    plan: string
}
const Subscription = ({plan}: SubscriptionProps) => {
    const {userData} = useAuth()

    return(
        <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Ваша подписка</CardTitle>
                <CardDescription>Управляйте вашим тарифным планом</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Использовано сообщений</span>
                      <span className="text-sm font-medium">
                        {userData ? userData.message_count_limit - userData.available_message_count : 0} /{" "}
                        {userData?.message_count_limit || 0}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${
                            userData
                              ? (
                                  (userData.message_count_limit - userData.available_message_count) /
                                    userData.message_count_limit
                                ) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium mb-1">{plan} тариф</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      У вас активирован {plan} тариф с ограничением в {userData?.message_count_limit || 0} сообщений в
                      день.
                    </p>
                    <Button variant="outline" size="sm">
                      Управление тарифом
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
    )
}

export default Subscription