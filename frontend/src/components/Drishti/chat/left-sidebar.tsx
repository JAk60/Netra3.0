import { Avatar, AvatarFallback, AvatarImage } from "@/registry/new-york-v4/ui/avatar"
import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Input } from "@/registry/new-york-v4/ui/input"
import {
  FileText,
  FolderOpen,
  HelpCircle,
  History,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Telescope,
  Users
} from "lucide-react"

export default function Leftsidebar() {
  return (
    <div className="
 w-64 rounded-md bg-gradient-to-b from-[#9BA0AC]/60 to-[#1a1d25]/60 border-r  flex flex-col">
      {/* Logo and Header with Animation */}
      <div className="ml-4 p-4 border-b ">
        <div className="flex justify-start items-center">
          <Telescope className="w-12 h-12 animate-[jumpThenMirror_20s_ease-in-out_infinite]"/>
          <span className="font-[amita] text-4xl flex mt-1 ml-3">
            दृष्टि
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        {/* <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search"
            className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
            ⌘K
          </span>
        </div> */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <Button
          variant="default"
          className="w-full justify-start gap-3 bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground"
        >
          <MessageSquare className="w-4 h-4" />
          New Chat
        </Button>

        {/* <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <FolderOpen className="w-4 h-4" />
          Projects
        </Button> */}

        {/* <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <FileText className="w-4 h-4" />
          Templates
        </Button> */}

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <FileText className="w-4 h-4" />
          Documents
          <Plus className="w-4 h-4 ml-auto" />
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <History className="w-4 h-4" />
          History
        </Button>
      </nav>

      {/* Settings & Help */}
      <div className="p-4 space-y-1 border-t border-sidebar-border">
        <div className="text-sm font-medium text-muted-foreground mb-2">Settings & Help</div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </Button>
      </div>

      {/* User Profile */}
      {/* <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>EC</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground">Jhon Doe</div>
            <div className="text-xs text-muted-foreground truncate">hey@unspace.agency</div>
          </div>
        </div>
      </div> */}
    </div>
  )
}