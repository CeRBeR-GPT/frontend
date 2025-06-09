"use client"

import { Check, X, Zap, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../shared/ui/card"
import { Button } from "../../../shared/ui/button"
import { Badge } from "../../../shared/ui/badge"
import { usePayForPlan } from "../model"

const Tarifs = () => {
  const { expireDate, isPaidPlan, payForPlan, plan} = usePayForPlan()

  return (
      <div className="mb-8 w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Доступные тарифы</h2>
          {isPaidPlan && expireDate && (
              <Badge
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
              >
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Текущий тариф действует до {expireDate} года
              </Badge>
          )}
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className={plan !== "Базовый" ? "border-2 border-gray-200" : "border-2 border-primary"}>
            <CardHeader>
              <CardTitle>Базовый</CardTitle>
              <CardDescription>Для начинающих пользователей</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">Бесплатно</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>10 сообщений в день</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Ограничение: 2000 символов</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Возможность создать до 5 чатов</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Доступ к стандартному gpt-3.5 и DeepSeek</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Сообщения старше 7 дней удаляются</span>
                </li>
              </ul>
            </CardContent>
            {plan === "Базовый" && (
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Текущий план
                  </Button>
                </CardFooter>
            )}
          </Card>
          <Card className={plan !== "Премиум" ? "border-2 border-gray-200" : "border-2 border-primary"}>
            <CardHeader>
              <CardTitle>Премиум</CardTitle>
              <CardDescription>Для активных пользователей</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">999₽</span>
                <span className="text-muted-foreground"> / месяц</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>50 сообщений в день</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Ограничение: 10000 символов</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Возможность создать до 20 чатов</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Провайдеры предыдущего тарифа + gpt-4o-mini</span>
                </li>
              </ul>
            </CardContent>
            {plan === "Премиум" && (
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Текущий план
                  </Button>
                </CardFooter>
            )}
            {plan === "Базовый" && (
                <CardFooter>
                  <Button onClick={() => payForPlan("premium")} className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Обновить
                  </Button>
                </CardFooter>
            )}
          </Card>
          <Card className={plan !== "Бизнес" ? "border-2 border-gray-200" : "border-2 border-primary"}>
            <CardHeader>
              <CardTitle>Бизнес</CardTitle>
              <CardDescription>Не могу существовать без AI</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">2999₽</span>
                <span className="text-muted-foreground"> / месяц</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>100 сообщений в день</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Ограничение: 20000 символов</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Возможность создать до 50 чатов</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Провайдеры предыдущего тарифа + gpt-4o и gpt-4</span>
                </li>
              </ul>
            </CardContent>
            {plan === "Бизнес" && (
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Текущий план
                  </Button>
                </CardFooter>
            )}
            {plan === "Премиум" && (
                <CardFooter>
                  <Button onClick={() => payForPlan("business")} className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Обновить
                  </Button>
                </CardFooter>
            )}
            {plan === "Базовый" && (
                <CardFooter>
                  <Button onClick={() => payForPlan("business")} className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Обновить
                  </Button>
                </CardFooter>
            )}
          </Card>
        </div>
      </div>
  )
}

export default Tarifs
