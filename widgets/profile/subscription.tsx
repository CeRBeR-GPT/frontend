

import { useUser } from "@/shared/contexts/user-context"
import { Button } from "../../shared/ui/UI/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/UI/card"

const Subscription = () => {
    const {userData} = useUser()

    const plan = userData?.plan === "default" ? "Базовый" : userData?.plan === "premium" ? "Премиум"
        : userData?.plan === "business" ? "Бизнес"  : ""

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