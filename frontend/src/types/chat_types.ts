// Types
interface Ship {
  ship_id: string
  ship_name: string
  ship_class?: string
  ship_category?: string
  command?: string
}

interface ComponentNode {
  component_id: string
  component_name: string
  nomenclature: string
  children: ComponentNode[]
  reliability?: number
  isLoading?: boolean
}

interface HierarchyResponse {
  component_id: string
  component_name: string
  nomenclature: string
  ship_name: string
  department_id: string
  children: ComponentNode[]
}

interface ToolCall {
  name: string
  arguments: Record<string, any>
  result?: any
}

interface AIResponse {
  generated_sql?: string
  records_retrieved?: number
  result?: Record<string, any>[]
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  tool_calls?: ToolCall[]
  ai_response?: AIResponse
  hierarchy_data?: HierarchyResponse
  duration?: number
  isError?: boolean
}

interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  retryCount: number
}

interface AutocompletePosition {
  top: number
  left: number
}

interface ShipWithScore {
  ship: Ship
  score: number
}

interface ReliabilityData {
  name: string
  reliability: string
  ship: string
}

interface ChatErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ChatErrorBoundaryProps {
  children: React.ReactNode
}

// React Flow Node Data Interface - Updated to match second code
interface ComponentNodeData {
  component_id: string
  component_name: string
  nomenclature: string
  ship_name?: string
  department_id?: string
  level: number
  isRoot: boolean
  reliability?: number
  duration?: string
}

interface MessageProps {
    message: Message
    index: number
}


// Main Chat Component Props
interface ChatMainProps {
  setDrishtiData: (data: any) => void;
  ships?: Ship[]
  toggleRightSidebar: () => void;
  showRightSidebar: boolean;
};

// Chat Input Component Props
interface ChatInputProps {
  toggleRightSidebar: (open: boolean) => void
  inputValue: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onSend: () => void
  isLoading: boolean
  forwardRef: React.RefObject<HTMLInputElement>
  selectedMode?: string | null
  onModeChange?: (mode: string | null) => void
}
// Reliability Chart Component Props
interface ReliabilityChartProps {
  toolCalls: ToolCall[]
}


// SQL Results Table Component
interface SQLResultsTableProps {
  aiResponse: AIResponse
}

// Autocomplete Dropdown Component Props
interface AutocompleteDropdownProps {
  show: boolean
  ships: Ship[]
  position: AutocompletePosition
  selectedIndex: number
  onSelect: (ship: Ship) => void
  onMouseEnter: (index: number) => void
  forwardRef: React.RefObject<HTMLDivElement>
}