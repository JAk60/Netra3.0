'use client'
import { useState, useRef, useEffect } from "react"

import { Avatar } from "@/registry/new-york-v4/ui/avatar"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Input } from "@/registry/new-york-v4/ui/input"
import {
  Bot,
  Loader2,
  Mic,
  Paperclip,
  Plus,
  Search,
  Send,
  User
} from "lucide-react"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Autocomplete Dropdown Component
function AutocompleteDropdown({ 
  show, 
  ships, 
  position, 
  selectedIndex, 
  onSelect, 
  onMouseEnter,
  forwardRef 
}) {
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
            className={`px-3 py-2 rounded-md cursor-pointer flex flex-col gap-1 ${
              index === selectedIndex
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

// Welcome Screen Component
function WelcomeScreen({ onQuickAction }) {
  const quickActions = [
    {
      icon: "✏️",
      title: "Write copy",
      action: "Write a professional email"
    },
    {
      icon: "📊", 
      title: "Check reliability",
      action: "What is the reliability of GT 1 over 10 hours?"
    },
    {
      icon: "👤",
      title: "Create avatar", 
      action: "Create a professional avatar"
    },
    {
      icon: "💻",
      title: "Write code",
      action: "Write Python code to analyze data"
    }
  ]

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-black">Welcome to Netra</h2>
          <p className="text-lg text-muted-black border-r bg-black/70 flex flex-col">
            Get started by asking a question about reliability or any other task.
            <span className="text-sm text-muted-black">
              Use @ship_name= to reference specific ships in your queries
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {quickActions.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-16 flex items-center justify-between p-4 hover:bg-accent hover:text-accent-foreground border-border bg-card"
              onClick={() => onQuickAction(item.action)}
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

// Reliability Chart Component
function ReliabilityChart({ toolCalls }) {
  const getReliabilityChartData = (toolCalls) => {
    if (!toolCalls || !Array.isArray(toolCalls)) return null

    const reliabilityTool = toolCalls.find(tool => tool.name === 'get_component_reliability')
    if (!reliabilityTool || !reliabilityTool.result) return null

    const result = reliabilityTool.result

    // Handle single component result
    if (result.data && result.data.reliability_score !== undefined) {
      return [{
        name: result.data.nomenclature || result.data.component_name || 'Component',
        reliability: (result.data.reliability_score * 100).toFixed(2),
        reliabilityDecimal: result.data.reliability_score
      }]
    }

    // Handle multiple component results
    if (result.data && result.data.results && Array.isArray(result.data.results)) {
      return result.data.results
        .filter(item => item.reliability !== null && item.reliability !== undefined)
        .map(item => ({
          name: item.nomenclature || 'Unknown',
          reliability: (item.reliability * 100).toFixed(2),
          reliabilityDecimal: item.reliability
        }))
    }

    return null
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-primary">
            {`Reliability: ${data.reliability}%`}
          </p>
          <p className="text-sm text-muted-foreground">
            {`Score: ${data.reliabilityDecimal.toFixed(4)}`}
          </p>
        </div>
      )
    }
    return null
  }

  const chartData = getReliabilityChartData(toolCalls)
  
  if (!chartData || chartData.length === 0) return null

  return (
    <div className="mt-6">
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">
          Reliability Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="name"
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
              label={{ value: 'Reliability (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="reliability"
              name="Reliability (%)"
              fill="#4F46E5"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 text-sm text-muted-foreground">
          * Reliability scores are shown as percentages. Higher values indicate better reliability.
        </div>
      </div>
    </div>
  )
}

// Message Component
function Message({ message, index }) {
  const hasReliabilityToolCall = (toolCalls) => {
    if (!toolCalls || !Array.isArray(toolCalls)) return false
    return toolCalls.some(tool => tool.name === 'get_component_reliability')
  }

  return (
    <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && (
        <Avatar className="w-8 h-8 mt-1">
          <Bot className="w-4 h-4" />
        </Avatar>
      )}

      <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
        <div className={`rounded-lg p-4 ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground ml-auto'
            : message.isError
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-muted'
        }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Reliability Chart */}
          {message.role === 'assistant' && hasReliabilityToolCall(message.tool_calls) && (
            <ReliabilityChart toolCalls={message.tool_calls} />
          )}

          {/* Tool Calls Display */}
          {message.tool_calls && message.tool_calls.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/20">
              <div className="text-sm text-muted-foreground mb-2">Tool calls:</div>
              {message.tool_calls.map((tool, toolIndex) => (
                <div key={toolIndex} className="bg-background/50 rounded p-3 mb-2 text-sm">
                  <div className="font-medium text-foreground">{tool.name}</div>
                  <div className="text-muted-foreground mt-1">
                    Arguments: {JSON.stringify(tool.arguments, null, 2)}
                  </div>
                  {tool.result && (
                    <div className="text-muted-foreground mt-2">
                      <details className="cursor-pointer">
                        <summary className="hover:text-foreground">View result</summary>
                        <pre className="mt-2 text-xs overflow-x-auto bg-background/80 p-2 rounded">
                          {JSON.stringify(tool.result, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground mt-1 px-4">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {message.role === 'user' && (
        <Avatar className="w-8 h-8 mt-1">
          <User className="w-4 h-4" />
        </Avatar>
      )}
    </div>
  )
}

// Chat Input Component
function ChatInput({ 
  inputValue, 
  onChange, 
  onKeyDown, 
  onSend, 
  isLoading, 
  forwardRef 
}) {
  return (
    <div className="p-6 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Input
              ref={forwardRef}
              value={inputValue}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder="Ask about component reliability or any other question... (Use @ship_name= to reference ships)"
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2" disabled={isLoading}>
                <Paperclip className="w-4 h-4" />
                Attach
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" disabled={isLoading}>
                <Mic className="w-4 h-4" />
                Voice Message
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" disabled={isLoading}>
                <Search className="w-4 h-4" />
                Browse Prompts
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              {inputValue.length} / 3,000
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Netra may generate inaccurate information please confirm first
        </p>
      </div>
    </div>
  )
}

// Main Chat Component
export default function ChatMain({ ships = [] }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [filteredShips, setFilteredShips] = useState([])
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 })
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)

  // Send message function
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setShowWelcome(false)
    setIsLoading(true)

    const messageToSend = inputValue.trim()
    setInputValue("")
    setShowAutocomplete(false)

    try {
      const response = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          conversation_history: messages
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage = {
        role: "assistant",
        content: data.response,
        timestamp: data.timestamp,
        tool_calls: data.tool_calls
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error while processing your message. Please try again.",
        timestamp: new Date().toISOString(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input changes and autocomplete logic
  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)

    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = value.substring(0, cursorPosition)
    const shipNameMatch = textBeforeCursor.match(/@ship_name=([^@\s]*)$/)

    if (shipNameMatch) {
      const searchTerm = shipNameMatch[1].toLowerCase()
      const filtered = ships.filter(ship =>
        ship.ship_name.toLowerCase().includes(searchTerm)
      ).slice(0, 10)

      setFilteredShips(filtered)
      setSelectedIndex(-1)

      if (filtered.length > 0) {
        const input = inputRef.current
        if (input) {
          const rect = input.getBoundingClientRect()
          setAutocompletePosition({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX
          })
        }
        setShowAutocomplete(true)
      } else {
        setShowAutocomplete(false)
      }
    } else {
      setShowAutocomplete(false)
    }
  }

  // Handle ship selection
  const selectShip = (ship) => {
    const cursorPosition = inputRef.current?.selectionStart || 0
    const textBeforeCursor = inputValue.substring(0, cursorPosition)
    const textAfterCursor = inputValue.substring(cursorPosition)

    const newText = textBeforeCursor.replace(/@ship_name=([^@\s]*)$/, `@ship_name=${ship.ship_name} `) + textAfterCursor

    setInputValue(newText)
    setShowAutocomplete(false)
    setSelectedIndex(-1)

    setTimeout(() => {
      inputRef.current?.focus()
      const newCursorPosition = newText.length - textAfterCursor.length
      inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
    }, 0)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showAutocomplete) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => prev < filteredShips.length - 1 ? prev + 1 : prev)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredShips.length) {
          selectShip(filteredShips[selectedIndex])
        } else if (!e.shiftKey) {
          sendMessage()
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowAutocomplete(false)
        setSelectedIndex(-1)
        break
      case 'Tab':
        if (selectedIndex >= 0 && selectedIndex < filteredShips.length) {
          e.preventDefault()
          selectShip(filteredShips[selectedIndex])
        }
        break
    }
  }

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target) &&
        inputRef.current && !inputRef.current.contains(event.target)) {
        setShowAutocomplete(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleQuickAction = (action) => {
    setInputValue(action)
    setShowWelcome(false)
  }

  return (
    <div className="bg-transparent border border-white/80 shadow-lg shadow-[0_3px_10px_rgba(0,0,0,0.2)] rounded-[10px] flex-1 flex flex-col relative ml-4 mr-4 mb-5 mt-4">
      {/* Autocomplete Dropdown */}
      <AutocompleteDropdown
        show={showAutocomplete}
        ships={filteredShips}
        position={autocompletePosition}
        selectedIndex={selectedIndex}
        onSelect={selectShip}
        onMouseEnter={setSelectedIndex}
        forwardRef={autocompleteRef}
      />

      {/* Chat Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showWelcome ? (
          <WelcomeScreen onQuickAction={handleQuickAction} />
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <Message key={index} message={message} index={index} />
              ))}

              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <Avatar className="w-8 h-8 mt-1">
                    <Bot className="w-4 h-4" />
                  </Avatar>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput
        inputValue={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSend={sendMessage}
        isLoading={isLoading}
        forwardRef={inputRef}
      />
    </div>
  )
}