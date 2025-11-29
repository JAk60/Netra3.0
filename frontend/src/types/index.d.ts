// Add these type definitions to your types file (e.g., frontend/src/types/index.d.ts)

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
  tool_calls?: ToolCall[]
  duration?: number
  ai_response?: AIResponse | string
  hierarchy_data?: HierarchyResponse
  drishti_data?: any
  isDrishti?: boolean
  isError?: boolean
  isMissionConfig?: boolean  // NEW: For mission configuration
}

interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  retryCount: number
}

interface ToolCall {
  name: string
  arguments: any
  result?: any
}

interface AIResponse {
  result?: any[]
  generated_sql?: string
  execution_status?: string
  records_retrieved?: number
}

interface HierarchyResponse {
  component_id: string
  component_name: string
  nomenclature: string
  ship_name?: string
  department_id?: string
  children?: ComponentNode[]
  reliability?: number
}

interface ComponentNode {
  component_id: string
  component_name: string
  nomenclature: string
  children?: ComponentNode[]
  reliability?: number
}

interface Ship {
  ship_id: string
  ship_name: string
  ship_class?: string
  ship_category?: string
  command?: string
}

interface ShipWithScore {
  ship: Ship
  score: number
}

interface AutocompletePosition {
  top: number
  left: number
}

interface AutocompleteDropdownProps {
  show: boolean
  ships: Ship[]
  position: AutocompletePosition
  selectedIndex: number
  onSelect: (ship: Ship) => void
  onMouseEnter: (index: number) => void
  forwardRef: React.RefObject<HTMLDivElement>
}

interface ChatInputProps {
  toggleRightSidebar?: (show: boolean) => void
  inputValue: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onSend: () => void
  isLoading: boolean
  forwardRef: React.RefObject<HTMLInputElement>
  onModeSelect?: (mode: 'drishti' | 'browse' | null) => void
  isDrishtiMode?: boolean
}

interface MessageProps {
  message: Message
  index: number
}

interface ChatErrorBoundaryProps {
  children: React.ReactNode
}

interface ChatErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

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

interface ReactFlowHierarchyProps {
  hierarchyData: HierarchyResponse
  duration?: number
}

interface ReliabilityData {
  name: string
  shortName: string
  reliability: string
  ship: string
}

interface ReliabilityChartProps {
  toolCalls: ToolCall[]
}