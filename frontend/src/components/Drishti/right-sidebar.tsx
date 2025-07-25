import { Button } from "@/registry/new-york-v4/ui/button"
import {
    HelpCircle,
    MoreHorizontal
} from "lucide-react"

export default function Rightsidebar() {
  return (
      <div className="w-80 bg-card border-l border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-card-foreground">Projects (7)</h3>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Button variant="outline" className="w-full justify-start h-auto p-3 bg-transparent">
            <div className="text-left">
              <div className="font-medium">New Project</div>
            </div>
          </Button>

          <div className="space-y-3">
            <div className="p-3 hover:bg-accent hover:text-accent-foreground rounded-lg cursor-pointer">
              <div className="font-medium text-sm mb-1">Learning From 100 Years o...</div>
              <div className="text-xs text-muted-foreground">For athletes, high altitude prod...</div>
            </div>

            <div className="p-3 hover:bg-accent hover:text-accent-foreground rounded-lg cursor-pointer">
              <div className="font-medium text-sm mb-1">Research officiants</div>
              <div className="text-xs text-muted-foreground">Maxwell's equations—the foun...</div>
            </div>

            <div className="p-3 hover:bg-accent hover:text-accent-foreground rounded-lg cursor-pointer">
              <div className="font-medium text-sm mb-1">What does a senior lead de...</div>
              <div className="text-xs text-muted-foreground">Physiological respiration involv...</div>
            </div>

            <div className="p-3 hover:bg-accent hover:text-accent-foreground rounded-lg cursor-pointer">
              <div className="font-medium text-sm mb-1">Write a sweet note to your...</div>
              <div className="text-xs text-muted-foreground">In the eighteenth century the G...</div>
            </div>

            <div className="p-3 hover:bg-accent hover:text-accent-foreground rounded-lg cursor-pointer">
              <div className="font-medium text-sm mb-1">Meet with cake bakers</div>
              <div className="text-xs text-muted-foreground">Physical space is often conceiv...</div>
            </div>

            <div className="p-3 hover:bg-accent hover:text-accent-foreground rounded-lg cursor-pointer">
              <div className="font-medium text-sm mb-1">Meet with cake bakers</div>
              <div className="text-xs text-muted-foreground">Physical space is often conceiv...</div>
            </div>
          </div>
        </div>

        {/* Help Button */}
        <div className="absolute bottom-6 right-6">
          <Button
            size="icon"
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>
  )
}
