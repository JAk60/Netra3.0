'use client'
import { useDebounce } from "@/hooks/use-debounce"
import { Avatar } from "@/registry/new-york-v4/ui/avatar"
import {
  Bot,
  Loader2
} from "lucide-react"
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Node
} from '@xyflow/react'

import '@xyflow/react/dist/style.css';
import ChatInput, { AutocompleteDropdown, ChatErrorBoundary, fuzzySearch } from "./chat-input"
import Message from "./messages"
import WelcomeScreen from "../welcome"
import useIntentClassifier from "@/hooks/useIntentClassifier"
import MissionConfigDashboard from './mission-config-dashboard'

interface ChatMainProps {
  setDrishtiData: (data: any) => void;
  ships: any[];
  onDrishtiModeChange: (isActive: boolean) => void;
}

export default function ChatMain({ setDrishtiData, ships = [], onDrishtiModeChange }: ChatMainProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    retryCount: 0
  })
  const [inputValue, setInputValue] = useState("")
  const classifier = useIntentClassifier(inputValue, {
    debounceMs: 500,
    minLength: 5,
    enableDebug: true
  });

  const [searchQuery, setSearchQuery] = useState("")
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompletePosition, setAutocompletePosition] = useState<AutocompletePosition>({ top: 0, left: 0 })
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const [isDrishtiMode, setIsDrishtiMode] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 200)

  const filteredShips = useMemo(() => {
    return fuzzySearch(debouncedSearchQuery, ships)
  }, [debouncedSearchQuery, ships])

  const parseHierarchyRequest = useCallback((message: string) => {
    const shipNameMatch = message.match(/@ship_name=([^,@]+)/i)
    const nomenclatureMatch = message.match(/nomenclature=([^,@]+)/i)
    const durationMatch = message.match(/duration=(\d+(?:\.\d+)?)/i)

    if (shipNameMatch && nomenclatureMatch) {
      return {
        shipName: shipNameMatch[1].trim(),
        nomenclature: nomenclatureMatch[1].trim(),
        duration: durationMatch ? parseFloat(durationMatch[1]) : undefined
      }
    }

    return null
  }, [])

  const fetchHierarchy = async (shipName: string, nomenclature: string): Promise<HierarchyResponse> => {
    const encodedShipName = encodeURIComponent(shipName)
    const encodedNomenclature = encodeURIComponent(nomenclature)

    const response = await fetch(
      `http://127.0.0.1:8000/components/hierarchy?nomenclature=${encodedNomenclature}&ship_name=${encodedShipName}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch hierarchy: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  const fetchDrishtiData = async (message: string): Promise<any> => {
    const response = await fetch('http://127.0.0.1:8000/chat/drishti/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        conversation_history: chatState.messages
      }),
      signal: abortControllerRef.current?.signal
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Drishti data: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  const extractShipNames = useCallback((message: string): string[] => {
    const shipNamePattern = /@ship_name=([^@\s,]+(?:\s+[^@\s,]*)*)/g
    const matches: string[] = []
    let match

    while ((match = shipNamePattern.exec(message)) !== null) {
      const shipNamesString = match[1].trim()
      const shipNames = shipNamesString.split(',').map(name => name.trim()).filter(name => name.length > 0)
      matches.push(...shipNames)
    }

    return [...new Set(matches)]
  }, [])

  const handleModeSelection = useCallback((mode: 'drishti' | 'browse' | null) => {
    const isActive = mode === 'drishti'
    setIsDrishtiMode(isActive)
    onDrishtiModeChange(isActive)

    if (!isActive) {
      setDrishtiData(null)
    }
  }, [onDrishtiModeChange, setDrishtiData])

  const sendMessage = async () => {
    if (!inputValue.trim() || chatState.isLoading) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const userMessage: Message = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    }

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }))

    const messageToSend = inputValue.trim()
    const hierarchyRequest = parseHierarchyRequest(messageToSend)

    setInputValue("")
    setShowAutocomplete(false)

    abortControllerRef.current = new AbortController()

    try {
      let assistantMessage: Message

      // Check for mission config intent
      if (classifier.intent === 'MISSION_CONFIG') {
        assistantMessage = {
          role: "assistant",
          content: "Mission Reliability: Please select a configuration from the list below:",
          timestamp: new Date().toISOString(),
          isMissionConfig: true
        }
      }
      // Handle Drishti mode
      else if (isDrishtiMode) {
        try {
          const drishtiResponse = await fetchDrishtiData(messageToSend)
          setDrishtiData(drishtiResponse.ships || null)

          console.log('Drishti response received:', {
            flow: drishtiResponse.ships?.[0]?.reactflow,
            shipName: drishtiResponse.ships?.[0]?.ship_name
          })

          assistantMessage = {
            role: "assistant",
            content: drishtiResponse.response || "Drishti analysis completed successfully.",
            timestamp: new Date().toISOString(),
            drishti_data: drishtiResponse,
            isDrishti: true
          }

        } catch (drishtiError) {
          console.error('Error fetching Drishti data:', drishtiError)
          assistantMessage = {
            role: "assistant",
            content: `Failed to fetch Drishti analysis: ${drishtiError instanceof Error ? drishtiError.message : 'Unknown error'}`,
            timestamp: new Date().toISOString(),
            isError: true
          }
        }
      }
      // Handle hierarchy request
      else if (hierarchyRequest) {
        try {
          const hierarchyData = await fetchHierarchy(
            hierarchyRequest.shipName,
            hierarchyRequest.nomenclature
          )

          assistantMessage = {
            role: "assistant",
            content: `Component hierarchy for ${hierarchyRequest.nomenclature} on ${hierarchyRequest.shipName}${hierarchyRequest.duration ? ` with reliability analysis for ${hierarchyRequest.duration} hours` : ''
              }:`,
            timestamp: new Date().toISOString(),
            hierarchy_data: hierarchyData,
            duration: hierarchyRequest.duration
          }

        } catch (hierarchyError) {
          console.error('Error fetching hierarchy:', hierarchyError)
          assistantMessage = {
            role: "assistant",
            content: `Failed to fetch component hierarchy: ${hierarchyError instanceof Error ? hierarchyError.message : 'Unknown error'}`,
            timestamp: new Date().toISOString(),
            isError: true
          }
        }
      } else {
        // Handle regular chat request
        const extractedShips = extractShipNames(messageToSend)

        const requestBody = {
          message: messageToSend,
          classifier: { intent: classifier.intent || "unknown" },
          conversation_history: chatState.messages,
          filters: {
            ships: extractedShips,
            explain: false
          }
        }

        const response = await fetch('http://127.0.0.1:8000/chat/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        assistantMessage = {
          role: "assistant",
          content: data.response,
          timestamp: data.timestamp,
          tool_calls: data.tool_calls,
          duration: data.duration_hours,
          ai_response: data.ai_response
        }
      }

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
        retryCount: 0
      }))

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('Error sending message:', error)

      const errorMessage: Message = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString(),
        isError: true
      }

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: prev.retryCount + 1
      }))
    }
    console.log({ classifier: classifier.intent });
  }

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    const cursorPosition = e.target.selectionStart || 0
    const textBeforeCursor = value.substring(0, cursorPosition)

    const shipNameMatch = textBeforeCursor.match(/@ship_name=([^@]*?)([^@,\s]*)$/)

    if (shipNameMatch) {
      const searchTerm = shipNameMatch[2]
      setSearchQuery(searchTerm)

      const input = inputRef.current
      if (input) {
        const rect = input.getBoundingClientRect()
        setAutocompletePosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX
        })
      }
      setShowAutocomplete(true)
      setSelectedIndex(-1)
    } else {
      setShowAutocomplete(false)
      setSearchQuery("")
    }
  }, [])

  const selectShip = useCallback((ship: Ship) => {
    const cursorPosition = inputRef.current?.selectionStart || 0
    const textBeforeCursor = inputValue.substring(0, cursorPosition)
    const textAfterCursor = inputValue.substring(cursorPosition)

    const newText = textBeforeCursor.replace(/@ship_name=([^@]*?)([^@,\s]*)$/, (match, existingShips, currentSearch) => {
      const prefix = existingShips.trim() ? existingShips + ', ' : ''
      return `@ship_name=${prefix}${ship.ship_name}`
    }) + textAfterCursor

    setInputValue(newText)
    setShowAutocomplete(false)
    setSelectedIndex(-1)
    setSearchQuery("")

    setTimeout(() => {
      inputRef.current?.focus()
      const newCursorPosition = newText.length - textAfterCursor.length
      inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
    }, 0)
  }, [inputValue])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
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
  }, [showAutocomplete, selectedIndex, filteredShips, selectShip, sendMessage])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleQuickAction = useCallback((action: string) => {
    setInputValue(action)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <ChatErrorBoundary>
      <div className="bg-muted/30 rounded-xl border border-white/80 shadow-lg shadow-[0_3px_10px_rgba(0,0,0,0.2)] rounded-[10px] flex-1 flex flex-col relative ml-4 mr-4 mb-5 mt-4">
        <AutocompleteDropdown
          show={showAutocomplete}
          ships={filteredShips}
          position={autocompletePosition}
          selectedIndex={selectedIndex}
          onSelect={selectShip}
          onMouseEnter={setSelectedIndex}
          forwardRef={autocompleteRef}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {chatState.messages.length === 0 ? (
            <WelcomeScreen onQuickAction={handleQuickAction} />
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {chatState.messages.map((message, index) => (
                  <Message key={index} message={message} index={index} />
                ))}

                {chatState.isLoading && (
                  <div className="flex gap-4 justify-start">
                    <Avatar className="w-8 h-8 mt-1">
                      <Bot className="w-4 h-4" />
                    </Avatar>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-muted-foreground">
                          {isDrishtiMode ? 'Analyzing with Drishti...' : 'Thinking...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <ChatInput
          inputValue={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSend={sendMessage}
          isLoading={chatState.isLoading}
          forwardRef={inputRef}
          onModeSelect={handleModeSelection}
          isDrishtiMode={isDrishtiMode}
        />
      </div>
    </ChatErrorBoundary>
  )
}