import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLogout } from "../model"

export function Logout(){
    const router = useRouter()
    const { logout } = useLogout()

    const handleLogout = () => {
        logout()
        router.push("/")
      }

    return(
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer flex align-items: center" >
          <LogOut className="mr-2 h-4 w-4 mt-1" />
          <span>Выйти</span>
        </DropdownMenuItem>
    )
}