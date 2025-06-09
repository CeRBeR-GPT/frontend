
import Link from "next/link"
import { Bot} from "lucide-react"
import { ThemeToggle } from "@/shared/ui/theme-toggle"
import {NavLinks} from "@/widgets/navigation"

export const Header = () => {

    return(
        <header className="border-b">
          <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Bot className="w-6 h-6" />
              <span>CeRBeR-AI</span>
            </Link>
            <nav className="flex items-center gap-4">
              <NavLinks />
              <ThemeToggle />
            </nav>
          </div>
      </header>
    )
}