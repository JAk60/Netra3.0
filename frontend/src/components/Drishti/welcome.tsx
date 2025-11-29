interface WelcomeScreenProps {
  onQuickAction?: (action: string) => void
}

import { Button } from "@/registry/new-york-v4/ui/button"
import {
    Bot,
    Plus
} from "lucide-react"

export default function WelcomeScreen({ onQuickAction }: WelcomeScreenProps) {
  const quickActions = [
    {
      icon: "🚢",
      title: "Component Hierarchy",
      action: "@ship_name=INS ONE, nomenclature=GT 1"
    },
    {
      icon: "📊",
      title: "Reliability Analysis",
      action: "@ship_name=INS ONE, nomenclature=GT 1, duration=40"
    },
    {
      icon: "🔍",
      title: "Search Components",
      action: "Show me all components for INS ONE"
    },
    {
      icon: "💻",
      title: "Mission configuration",
      action: "let's perform mission configuration"
    }
  ]

  const handleQuickAction = (action: string) => {
    if (onQuickAction) {
      onQuickAction(action)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-normal text-5xl font-bold text-white tracking-tight">Welcome to Netra</h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            <p className="py-1 font-normal bg-muted/80 rounded-2xl text-lg text-white leading-relaxed">
              Version 3.0
            </p>
            {/* <p className="text-sm text-gray-300">
              Use: <code className="bg-gray-700 px-2 py-1 rounded">@ship_name=SHIP_NAME, nomenclature=NOMENCLATURE, duration=HOURS</code>
            </p> */}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {quickActions.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-16 flex items-center justify-between p-4 hover:bg-accent hover:text-accent-foreground border-border bg-card/70"
              onClick={() => handleQuickAction(item.action)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground">{item.icon}</span>
                </div>
                <span className="font-medium">{item.title}</span>
              </div>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}