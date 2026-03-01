const HISTORY_KEY = 'netra_chat_history';
const MAX_SESSIONS = 10;

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  messages: any[];
}

export function getAllSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return [];
  }
}

export function saveSession(messages: any[]): ChatSession | null {
  if (!messages || messages.length === 0) return null;

  try {
    const sessions = getAllSessions();

    const firstUserMsg = messages.find(m => m.role === 'user');
    const lastMsg = messages[messages.length - 1];

    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '')
      : 'Untitled Chat';

    const lastMessage =
      lastMsg.role === 'assistant'
        ? lastMsg.content.slice(0, 120) + (lastMsg.content.length > 120 ? '...' : '')
        : '';

    const newSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title,
      lastMessage,
      timestamp: new Date().toISOString(),
      messageCount: messages.length,
      messages,
    };

    // Prepend new session, keep max 10
    const updated = [newSession, ...sessions].slice(0, MAX_SESSIONS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return newSession;
  } catch {
    return null;
  }
}

export function deleteSession(id: string): void {
  try {
    const sessions = getAllSessions().filter(s => s.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
  } catch {}
}

export function clearAllSessions(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}