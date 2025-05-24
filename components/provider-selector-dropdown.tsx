"use client"

import { useState } from "react"
import { Check, ChevronDown, Bot, Cpu, Sparkles, Zap, Star } from "lucide-react"
import { Button } from "@/shared/ui/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/ui/dropdown-menu"

interface ProviderSelectorDropdownProps {
  selectedProvider: string
  availableProviders: string[]
  onProviderChange: (provider: string) => void
}

export default function ProviderSelectorDropdown({
  selectedProvider,
  availableProviders,
  onProviderChange,
}: ProviderSelectorDropdownProps) {
  const [open, setOpen] = useState(false)

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "default":
        return <Bot className="w-4 h-4" />
      case "deepseek":
        return <Cpu className="w-4 h-4" />
      case "gpt_4o_mini":
        return <Sparkles className="w-4 h-4" />
      case "gpt_4o":
        return <Zap className="w-4 h-4" />
      case "gpt_4":
        return <Star className="w-4 h-4" />
      default:
        return <Bot className="w-4 h-4" />
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "default":
        return "Стандартный"
      case "deepseek":
        return "DeepSeek"
      case "gpt_4o_mini":
        return "GPT-4o Mini"
      case "gpt_4o":
        return "GPT-4o"
      case "gpt_4":
        return "GPT-4"
      default:
        return provider
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <span className="flex items-center gap-1.5">
            {getProviderIcon(selectedProvider)}
            <span className="hidden sm:inline-block">{getProviderName(selectedProvider)}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {availableProviders.map((provider) => (
          <DropdownMenuItem
            key={provider}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => {
              onProviderChange(provider)
              setOpen(false)
            }}
          >
            <div className="flex items-center gap-2">
              {getProviderIcon(provider)}
              <span>{getProviderName(provider)}</span>
            </div>
            {selectedProvider === provider && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}