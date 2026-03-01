'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAllSessions, deleteSession, clearAllSessions, ChatSession } from '@/store/chat_history_store';
import {
  MessageSquare, Trash2, LayoutGrid, List, Clock,
  RotateCcw, MessageCircle, X, ArrowRight, ChevronRight,
  GripHorizontal
} from 'lucide-react';
import { Button } from '@/registry/new-york-v4/ui/button';
import Message from './messages';

interface HistoryViewProps {
  onResumeChat: (session: ChatSession) => void;
}

const MIN_PANEL_HEIGHT = 120;
const MAX_PANEL_RATIO = 0.85; // max 85% of container height
const DEFAULT_PANEL_HEIGHT = 380;

export default function HistoryView({ onResumeChat }: HistoryViewProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewSession, setPreviewSession] = useState<ChatSession | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(DEFAULT_PANEL_HEIGHT);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  useEffect(() => {
    setSessions(getAllSessions());
  }, []);

  const handleOpenPreview = (session: ChatSession) => {
    setPreviewSession(session);
    setPanelOpen(true);
  };

  const handleClosePreview = () => {
    setPanelOpen(false);
    setTimeout(() => setPreviewSession(null), 300);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    if (previewSession?.id === id) handleClosePreview();
    setTimeout(() => {
      deleteSession(id);
      setSessions(getAllSessions());
      setDeletingId(null);
    }, 300);
  };

  const handleClearAll = () => {
    clearAllSessions();
    setSessions([]);
    handleClosePreview();
  };

  const handleResume = () => {
    if (!previewSession) return;
    handleClosePreview();
    setTimeout(() => onResumeChat(previewSession), 320);
  };

  // ── Drag to resize ──────────────────────────────────────────────────────────
  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartHeight.current = panelHeight;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [panelHeight]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const containerH = containerRef.current.getBoundingClientRect().height;
      const maxH = containerH * MAX_PANEL_RATIO;
      const delta = dragStartY.current - e.clientY; // drag up = bigger
      const newH = Math.min(maxH, Math.max(MIN_PANEL_HEIGHT, dragStartHeight.current + delta));
      setPanelHeight(newH);
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Escape closes panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClosePreview(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (days === 0) return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    if (days === 1) return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div ref={containerRef} className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">

      {/* ── Header ── */}
      <div className="px-8 pt-8 pb-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#25547e] flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Chat History</h1>
              <p className="text-xs text-muted-foreground">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} saved · max 10
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#25547e] text-white' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#25547e] text-white' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {sessions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
                onClick={handleClearAll}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Session list — shrinks when panel is open ── */}
      <div
        className="overflow-y-auto px-8 py-6 transition-all duration-300"
        style={{ flex: 1, minHeight: 0 }}
      >
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-foreground font-medium mb-1">No saved chats yet</p>
              <p className="text-sm text-muted-foreground">
                Start a conversation and click "Save Chat" to preserve it here.
              </p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <GridView
            sessions={sessions}
            deletingId={deletingId}
            activeId={previewSession?.id}
            onOpen={handleOpenPreview}
            onDelete={handleDelete}
            formatDate={formatDate}
          />
        ) : (
          <ListView
            sessions={sessions}
            deletingId={deletingId}
            activeId={previewSession?.id}
            onOpen={handleOpenPreview}
            onDelete={handleDelete}
            formatDate={formatDate}
          />
        )}
      </div>

      {/* ── Bottom preview panel ── */}
      <div
        className={`
          shrink-0 border-t border-border bg-background flex flex-col
          transition-all duration-300 ease-in-out
          ${panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        style={{ height: panelOpen ? panelHeight : 0, overflow: 'hidden' }}
      >
        {/* Drag handle */}
        <div
          onMouseDown={onDragStart}
          className="shrink-0 flex items-center justify-center h-4 cursor-ns-resize group hover:bg-muted/60 transition-colors select-none"
          title="Drag to resize"
        >
          <GripHorizontal className="w-5 h-5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </div>

        {previewSession && (
          <>
            {/* Sticky bar inside panel */}
            <div className="shrink-0 flex items-center gap-3 px-6 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
              <div className="w-7 h-7 rounded-lg bg-[#25547e]/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-[#25547e]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm text-foreground truncate">{previewSession.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {formatDate(previewSession.timestamp)} · {previewSession.messageCount} messages
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  className="gap-1.5 bg-[#25547e] hover:bg-[#25547e]/90 text-white text-xs h-8 px-3"
                  onClick={handleResume}
                >
                  <RotateCcw className="w-3 h-3" />
                  Resume Chat
                  <ArrowRight className="w-3 h-3" />
                </Button>
                <button
                  onClick={handleClosePreview}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {previewSession.messages.map((message: any, index: number) => (
                <Message key={index} message={message} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Grid View ─────────────────────────────────────────────────────────────── */
function GridView({ sessions, deletingId, activeId, onOpen, onDelete, formatDate }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {sessions.map((session: ChatSession) => (
        <div
          key={session.id}
          onClick={() => onOpen(session)}
          className={`
            group relative flex flex-col gap-3 p-5 rounded-xl border bg-card
            cursor-pointer transition-all duration-200
            ${activeId === session.id
              ? 'border-[#25547e] shadow-md shadow-[#25547e]/10 ring-1 ring-[#25547e]/20'
              : 'border-border hover:border-[#25547e]/50 hover:shadow-md'
            }
            ${deletingId === session.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          `}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#25547e]/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-3.5 h-3.5 text-[#25547e]" />
            </div>
            <button
              onClick={(e) => onDelete(e, session.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="font-medium text-sm text-foreground leading-snug line-clamp-2">
            {session.title}
          </h3>

          {session.lastMessage && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {session.lastMessage}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">{formatDate(session.timestamp)}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="w-3 h-3" />
              {session.messageCount}
            </div>
          </div>

          {/* Preview hint pill */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-150 translate-y-1 group-hover:translate-y-0">
            <span className="flex items-center gap-1 text-[10px] font-medium bg-[#25547e] text-white px-2 py-1 rounded-full">
              <ChevronRight className="w-2.5 h-2.5" />
              Preview
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── List View ─────────────────────────────────────────────────────────────── */
function ListView({ sessions, deletingId, activeId, onOpen, onDelete, formatDate }: any) {
  return (
    <div className="flex flex-col gap-2">
      {sessions.map((session: ChatSession, index: number) => (
        <div
          key={session.id}
          onClick={() => onOpen(session)}
          className={`
            group flex items-center gap-4 p-4 rounded-xl border bg-card
            cursor-pointer transition-all duration-200
            ${activeId === session.id
              ? 'border-[#25547e] shadow-sm ring-1 ring-[#25547e]/20'
              : 'border-border hover:border-[#25547e]/50 hover:shadow-sm'
            }
            ${deletingId === session.id ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'}
          `}
        >
          <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-muted-foreground">{index + 1}</span>
          </div>

          <div className="w-8 h-8 rounded-lg bg-[#25547e]/10 flex items-center justify-center shrink-0">
            <MessageSquare className="w-3.5 h-3.5 text-[#25547e]" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground truncate">{session.title}</h3>
            {session.lastMessage && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{session.lastMessage}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-xs text-muted-foreground">{formatDate(session.timestamp)}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="w-3 h-3" />
              {session.messageCount} msgs
            </div>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <span className="flex items-center gap-1 text-[10px] font-medium bg-[#25547e]/10 text-[#25547e] border border-[#25547e]/20 px-2.5 py-1 rounded-full">
              <ChevronRight className="w-2.5 h-2.5" />
              Preview
            </span>
          </div>

          <button
            onClick={(e) => onDelete(e, session.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}