import { Button } from "@/registry/new-york-v4/ui/button"
import { Input } from "@/registry/new-york-v4/ui/input"
import { Loader2, Save, Send } from "lucide-react"
import React, { useState } from "react"

// Error Boundary Component
export class ChatErrorBoundary extends React.Component<ChatErrorBoundaryProps, ChatErrorBoundaryState> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ChatErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-destructive">Something went wrong</h3>
            <p className="text-muted-foreground">Please refresh the page to continue</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Fuzzy search implementation
export const fuzzySearch = (query: string, ships: Ship[]): Ship[] => {
  if (!query.trim()) return ships.slice(0, 10)

  const searchTerm = query.toLowerCase()

  return ships
    .map((ship): ShipWithScore | null => {
      const name = ship.ship_name.toLowerCase()
      const class_ = ship.ship_class?.toLowerCase() || ''
      const category = ship.ship_category?.toLowerCase() || ''

      if (name === searchTerm) return { ship, score: 100 }
      if (name.startsWith(searchTerm)) return { ship, score: 90 }
      if (name.includes(searchTerm)) return { ship, score: 80 }
      if (class_.includes(searchTerm) || category.includes(searchTerm)) {
        return { ship, score: 70 }
      }

      let score = 0
      let searchIndex = 0

      for (let i = 0; i < name.length && searchIndex < searchTerm.length; i++) {
        if (name[i] === searchTerm[searchIndex]) {
          score += 1
          searchIndex++
        }
      }

      if (searchIndex === searchTerm.length) {
        const fuzzyScore = (score / name.length) * 60
        return { ship, score: fuzzyScore }
      }

      return null
    })
    .filter((item): item is ShipWithScore => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(item => item.ship)
}

export function AutocompleteDropdown({
  show,
  ships,
  position,
  selectedIndex,
  onSelect,
  onMouseEnter,
  forwardRef
}: AutocompleteDropdownProps) {
  if (!show) return null

  return (
    <div
      ref={forwardRef}
      className="absolute z-50 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-80"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="p-2">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
          Ships ({ships.length})
        </div>
        {ships.map((ship, index) => (
          <div
            key={ship.ship_id}
            className={`px-3 py-2 rounded-md cursor-pointer flex flex-col gap-1 ${index === selectedIndex
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent/50'
              }`}
            onClick={() => onSelect(ship)}
            onMouseEnter={() => onMouseEnter(index)}
          >
            <div className="font-medium text-sm">{ship.ship_name}</div>
            <div className="text-xs text-muted-foreground">
              {ship.ship_class} • {ship.ship_category} • {ship.command}
            </div>
          </div>
        ))}
        {ships.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No ships found
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatInput({
  toggleRightSidebar,
  inputValue,
  onChange,
  onKeyDown,
  onSend,
  onSaveChat,
  isLoading,
  forwardRef,
  onModeSelect,
  isDrishtiMode,
  hasMessages,
  isSaved,
}: ChatInputProps & {
  onSaveChat?: () => void;
  hasMessages?: boolean;
  isSaved?: boolean;
}) {
  const [selectedButton, setSelectedButton] = useState<string | null>('browse')
  const [justSaved, setJustSaved] = useState(false)

  const handleButtonClick = (buttonName: 'drishti' | 'browse') => {
    const isCurrentlySelected = selectedButton === buttonName
    const newSelection = isCurrentlySelected ? null : buttonName
    setSelectedButton(newSelection)
    if (onModeSelect) {
      onModeSelect(newSelection)
    }
  }

  const handleSave = () => {
    if (onSaveChat) {
      onSaveChat()
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    }
  }

  const getPlaceholderText = () => {
    if (isDrishtiMode) {
      return "Ask Drishti for visual analysis and insights..."
    }
    return "Get started with questions ..."
  }

  return (
    <div className="p-6 border-border">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/70 border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Input
              ref={forwardRef}
              value={inputValue}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder={getPlaceholderText()}
              className="flex-1 border-0 focus-visible:ring-0 text-base bg-transparent"
              disabled={isLoading}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onSend}
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-3">
              {/* Save Chat Button — only show if there are messages */}
              {hasMessages && (
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-2 transition-all duration-300 ${
                    justSaved
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : isSaved
                      ? 'border-green-400 text-green-600 opacity-60'
                      : 'border-border text-muted-foreground hover:border-[#25547e] hover:text-[#25547e]'
                  }`}
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  <Save className="w-3.5 h-3.5" />
                  {justSaved ? 'Saved!' : isSaved ? 'Saved' : 'Save Chat'}
                </Button>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {inputValue.length} / 3,000
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}