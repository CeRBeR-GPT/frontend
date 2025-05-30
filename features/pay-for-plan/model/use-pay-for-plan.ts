import { formatExpireDate } from "@/shared/utils/other";
import { newPaymentApi } from "./api";
import { useUser } from "@/shared/contexts/user-context";
import { useRouter } from "next/navigation";

export const usePayForPlan = () => {

    const router = useRouter()
    const { userData } = useUser()

    const plan =
          userData?.plan === "default"
              ? "Базовый"
              : userData?.plan === "premium"
                  ? "Премиум"
                  : userData?.plan === "business"
                      ? "Бизнес"
                      : ""
    
    const expireDate = formatExpireDate(userData?.plan_expire_date)
    const isPaidPlan = userData?.plan === "premium" || userData?.plan === "business"
    
    const payForPlan = async (plan: string) => {
        try {
            const response = await newPaymentApi(plan)
            router.replace(response.data.url)
        } catch (error) {
        
        }
    }

  return { payForPlan, plan, expireDate,  isPaidPlan};
};
