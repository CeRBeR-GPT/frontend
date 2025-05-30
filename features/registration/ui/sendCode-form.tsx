import { Button } from "@/components/UI/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/components/UI/input"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { useSendCodeForm } from "../model/use-sendCode-form"
import { useRegistration } from "../model/use-registration"

export const SendCodeForm = () => {
    const { form, onSubmit, isSubmitting, showPassword, showConfirmPassword, 
        setShowConfirmPassword, setShowPassword} = useSendCodeForm()
    const { errorMessage } = useRegistration()

    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input placeholder="your@email.com" {...field}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                    <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••" {...field}/>
                        <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                        >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                    </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Подтверждение пароля</FormLabel>
                    <FormControl>
                    <div className="relative">
                        <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••" {...field} />
                        <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                    </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Отправка...</span>
                </div>
                ) : (
                <div className="flex items-center gap-2">
                    <span>Продолжить</span>
                    <ArrowRight className="h-4 w-4" />
                </div>
                )}
            </Button>
            {errorMessage && (<div className="text-red-500 text-sm text-center mt-4">{errorMessage}</div>)}
            </form>
        </Form>
    )
}