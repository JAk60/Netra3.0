'use client'
import { useDebounce } from "@/hooks/use-debounce"
import { Avatar } from "@/registry/new-york-v4/ui/avatar"

import {
  Bot,
  Loader2
} from "lucide-react"
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import useIntentClassifier, { IntentType } from "@/hooks/useIntentClassifier"
import '@xyflow/react/dist/style.css'
import WelcomeScreen from "../welcome"
import ChatInput, { AutocompleteDropdown, ChatErrorBoundary, fuzzySearch } from "./chat-input"
import MessageComponent from "./messages"
import { saveSession } from "@/store/chat_history_store"

// ── Base URL — change once here if your backend moves ──────────────────────
const API_BASE = 'http://127.0.0.1:8000'

interface ChatMainProps {
  setDrishtiData: (data: any) => void;
  ships: any[];
  onDrishtiModeChange: (isActive: boolean) => void;
  initialMessages?: any[];
}

export default function ChatMain({ setDrishtiData, ships = [], onDrishtiModeChange, initialMessages }: ChatMainProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: initialMessages || [],
    isLoading: false,
    error: null,
    retryCount: 0
  })
  const [inputValue, setInputValue] = useState("")
  const [isSaved, setIsSaved] = useState(!!initialMessages && initialMessages.length > 0)

  // classifier now returns intent + matched_ships only — no dead fields
  const classifier = useIntentClassifier(inputValue);

  const [searchQuery, setSearchQuery] = useState("")
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompletePosition, setAutocompletePosition] = useState<AutocompletePosition>({ top: 0, left: 0 })
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const [isDrishtiMode, setIsDrishtiMode] = useState(false)
  const [historyIndex, setHistoryIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 200)

  const filteredShips = useMemo(() => {
    return fuzzySearch(debouncedSearchQuery, ships)
  }, [debouncedSearchQuery, ships])

  const userMessages = useMemo(
    () => chatState.messages.filter(m => m.role === 'user').map(m => m.content),
    [chatState.messages]
  )

  useEffect(() => {
    if (chatState.messages.length > 0) {
      setIsSaved(false)
    }
  }, [chatState.messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatState.messages, chatState.isLoading])

  const handleSaveChat = useCallback(() => {
    if (chatState.messages.length === 0) return;
    const saved = saveSession(chatState.messages);
    if (saved) {
      setIsSaved(true);
    }
  }, [chatState.messages]);

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

  const fetchHierarchy = useCallback(async (shipName: string, nomenclature: string): Promise<HierarchyResponse> => {
    const encodedShipName = encodeURIComponent(shipName)
    const encodedNomenclature = encodeURIComponent(nomenclature)

    const response = await fetch(
      `${API_BASE}/components/hierarchy?nomenclature=${encodedNomenclature}&ship_name=${encodedShipName}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch hierarchy: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }, [])

  const fetchDrishtiData = useCallback(async (message: string, messages: Message[]): Promise<any> => {
    const response = await fetch(`${API_BASE}/chat/drishti/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversation_history: messages }),
      signal: abortControllerRef.current?.signal
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Drishti data: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }, [])

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

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || chatState.isLoading) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // ── Resolve the final intent safely ────────────────────────────────────
    // If classifier errored due to MULTI_INTENT but MISSION_CONFIG was one
    // of the matched intents (e.g. "mission reliability"), honour MISSION_CONFIG.
    // Otherwise use classifier.intent, falling back to GENERAL.
    const resolvedIntent: string = (() => {
      if (classifier.error?.code === 'MULTI_INTENT') {
        if (classifier.intents?.includes(IntentType.MISSION_CONFIG)) {
          return IntentType.MISSION_CONFIG
        }
        return IntentType.GENERAL
      }
      return classifier.intent ?? IntentType.GENERAL
    })()

    console.debug('[sendMessage] classifier →', {
      input:    inputValue,
      resolved: resolvedIntent,
      raw:      classifier,
    })

    const userMessage: Message = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    }

    const currentMessages = chatState.messages

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
    setHistoryIndex(-1)

    abortControllerRef.current = new AbortController()

    try {
      let assistantMessage: Message

      // ── MISSION_CONFIG ──────────────────────────────────────────────────
      if (resolvedIntent === IntentType.MISSION_CONFIG) {
        assistantMessage = {
          role: "assistant",
          content: "Mission Reliability: Please select a configuration from the list below:",
          timestamp: new Date().toISOString(),
          isMissionConfig: true
        }
      }
      // ── DRISHTI MODE ────────────────────────────────────────────────────
      else if (isDrishtiMode) {
        try {
          const drishtiResponse = await fetchDrishtiData(messageToSend, currentMessages)
          setDrishtiData(drishtiResponse.ships || null)

          assistantMessage = {
            role: "assistant",
            content: drishtiResponse.response || "Drishti analysis completed successfully.",
            timestamp: new Date().toISOString(),
            drishti_data: drishtiResponse,
            isDrishti: true
          }
        } catch (drishtiError) {
          assistantMessage = {
            role: "assistant",
            content: `Failed to fetch Drishti analysis: ${drishtiError instanceof Error ? drishtiError.message : 'Unknown error'}`,
            timestamp: new Date().toISOString(),
            isError: true
          }
        }
      }
      // ── HIERARCHY REQUEST ───────────────────────────────────────────────
      else if (hierarchyRequest) {
        try {
          const hierarchyData = await fetchHierarchy(hierarchyRequest.shipName, hierarchyRequest.nomenclature)

          assistantMessage = {
            role: "assistant",
            content: `Component hierarchy for ${hierarchyRequest.nomenclature} on ${hierarchyRequest.shipName}${hierarchyRequest.duration ? ` with reliability analysis for ${hierarchyRequest.duration} hours` : ''}:`,
            timestamp: new Date().toISOString(),
            hierarchy_data: hierarchyData,
            duration: hierarchyRequest.duration
          }
        } catch (hierarchyError) {
          assistantMessage = {
            role: "assistant",
            content: `Failed to fetch component hierarchy: ${hierarchyError instanceof Error ? hierarchyError.message : 'Unknown error'}`,
            timestamp: new Date().toISOString(),
            isError: true
          }
        }
      }
      // ── ALL OTHER INTENTS → backend ─────────────────────────────────────
      else {
        // Build classifier payload — lean shape for backend Stage 0.
        // If classifier errored, send safe defaults.
        const classifierPayload = {
          intent:  resolvedIntent,
          intents: classifier.error ? [resolvedIntent] : (classifier.intents ?? [resolvedIntent]),
          matched: classifier.error ? 'no_signal:general' : (classifier.matched ?? 'no_signal:general'),
          signals: classifier.error
            ? {
                matched_ships:      [],
                has_multiple_ships: false,
                has_negation:       false,
                has_comparison:     false,
              }
            : {
                matched_ships:      classifier.signals?.matched_ships      ?? [],
                has_multiple_ships: classifier.signals?.has_multiple_ships ?? false,
                has_negation:       classifier.signals?.has_negation       ?? false,
                has_comparison:     classifier.signals?.has_comparison     ?? false,
              },
        }

        const requestBody = {
          query:                messageToSend,
          classifier:           classifierPayload,
          conversation_history: currentMessages,
          filters: {
            ships:   extractShipNames(messageToSend),
            explain: false,
          },
        }

        console.debug('[chat] POST /chat payload:', JSON.stringify(requestBody, null, 2))

        const response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          const errorBody = await response.text()
          console.error(`[chat] ${response.status} response:`, errorBody)
          throw new Error(`HTTP ${response.status}: ${errorBody}`)
        }

        const data = await response.json()

        if (data.error && !data.response) {
          assistantMessage = {
            role:      "assistant",
            content:   data.error,
            timestamp: data.timestamp ?? new Date().toISOString(),
            isError:   true,
          }
        } else {
          assistantMessage = {
            role:        "assistant",
            content:     data.response,
            timestamp:   data.timestamp,
            tool_calls:  data.tool_calls,
            duration:    data.duration_hours,
            ai_response: data.ai_response,
            signals:     classifierPayload.signals
          }
        }
      }

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
        retryCount: 0
      }))

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return

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
  }, [
    inputValue,
    chatState.isLoading,
    chatState.messages,
    isDrishtiMode,
    classifier,
    parseHierarchyRequest,
    fetchHierarchy,
    fetchDrishtiData,
    extractShipNames,
    setDrishtiData
  ])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setHistoryIndex(-1)

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

    const newText = textBeforeCursor.replace(/@ship_name=([^@]*?)([^@,\s]*)$/, (match, existingShips) => {
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
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const newIndex = Math.min(historyIndex + 1, userMessages.length - 1)
        setHistoryIndex(newIndex)
        setInputValue(userMessages[userMessages.length - 1 - newIndex] ?? '')
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const newIndex = Math.max(historyIndex - 1, -1)
        setHistoryIndex(newIndex)
        setInputValue(newIndex === -1 ? '' : userMessages[userMessages.length - 1 - newIndex] ?? '')
        return
      }
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
  }, [showAutocomplete, selectedIndex, filteredShips, selectShip, sendMessage, historyIndex, userMessages])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof Node) {
        if (autocompleteRef.current && !autocompleteRef.current.contains(target) &&
          inputRef.current && !inputRef.current.contains(target)) {
          setShowAutocomplete(false)
          setSelectedIndex(-1)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleQuickAction = useCallback((action: string) => {
    setInputValue(action)
    setTimeout(() => inputRef.current?.focus(), 0)
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
      <div className="shadow-lg shadow-[0_3px_10px_rgba(0,0,0,0.2)] rounded-[10px] flex-1 flex flex-col relative ml-4 mr-4 mb-5 mt-4">
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
                  <MessageComponent key={index} message={message} index={index} />
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

                <div ref={bottomRef} />
              </div>
            </div>
          )}
        </div>

        <ChatInput
          inputValue={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSend={sendMessage}
          onSaveChat={handleSaveChat}
          isLoading={chatState.isLoading}
          forwardRef={inputRef}
          onModeSelect={handleModeSelection}
          isDrishtiMode={isDrishtiMode}
          hasMessages={chatState.messages.length > 0}
          isSaved={isSaved}
        />
      </div>
    </ChatErrorBoundary>
  )
}