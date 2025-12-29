import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import DashboardShell from '../../components/dashboard/DashboardShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiUrl, authHeaders } from '../../config/api.js';
import { cn } from '@/lib/utils';

// ponytail: polling (10s) not push; upgrade to SSE/WS when latency matters
const POLL_MS = 10000;

async function api(path, opts = {}) {
  const r = await fetch(apiUrl(path), { headers: authHeaders({ 'Content-Type': 'application/json' }), ...opts });
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${r.status}`);
  }
  return r.json();
}

function NewConversation({ draft, setDraft, sending, onSend, onCancel }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="border-b p-3 text-sm font-medium">{t('messages.newTitle')}</div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-sm text-muted-foreground">{t('messages.newHint')}</p>
        <Textarea
          rows={3}
          placeholder={t('messages.placeholder')}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={onSend} disabled={sending || !draft.trim()}>
            {sending ? <Loader2 className="animate-spin" /> : <Send />} {t('messages.sendFirst')}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            {t('messages.cancel')}
          </Button>
        </div>
      </div>
    </>
  );
}

function MessagesInner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const pendingTo = searchParams.get('to');
  const meId = Number(user?.userId);
  const isPatient = user?.userType === 'patient';
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const loadThreads = useCallback(async (selectFirst = false) => {
    try {
      const list = await api('/messages/threads');
      setThreads(list);
      if (selectFirst && list.length > 0) setActiveId((cur) => cur ?? list[0].id);
    } catch {
      setError(t('messages.errThreads'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadMessages = useCallback(async (id) => {
    if (!id) return;
    try {
      setMessages(await api(`/messages/threads/${id}`));
    } catch {
      /* keep stale */
    }
  }, []);

  useEffect(() => {
    loadThreads(true);
  }, [loadThreads]);

  // Deep-link ?to=<userId>: jump to existing thread, else show new-conversation pane
  useEffect(() => {
    if (!pendingTo) return;
    const hit = threads.find((t) => String(t.other_id) === String(pendingTo));
    if (hit) {
      setActiveId(hit.id);
      setSearchParams({});
    }
  }, [pendingTo, threads, setSearchParams]);

  // ponytail: single interval drives both polls; split when traffic grows
  useEffect(() => {
    const t = setInterval(() => {
      loadThreads();
      if (activeId) loadMessages(activeId);
    }, POLL_MS);
    return () => clearInterval(t);
  }, [activeId, loadThreads, loadMessages]);

  useEffect(() => {
    loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    try {
      await api('/messages/messages', { method: 'POST', body: JSON.stringify({ conv_id: activeId, text }) });
      setDraft('');
      await loadMessages(activeId);
      loadThreads();
    } catch (e) {
      setError(e.message || t('messages.errSend'));
    } finally {
      setSending(false);
    }
  };

  const active = threads.find((t) => t.id === activeId);
  const pendingNew = pendingTo && !threads.some((t) => String(t.other_id) === String(pendingTo));

  const startThread = async () => {
    const text = draft.trim();
    if (!text || !pendingTo || sending) return;
    setSending(true);
    try {
      const msg = await api('/messages/messages', { method: 'POST', body: JSON.stringify({ other_id: Number(pendingTo), text }) });
      setDraft('');
      setSearchParams({});
      const list = await api('/messages/threads');
      setThreads(list);
      setActiveId(msg.conv_id);
    } catch (e) {
      setError(e.message || t('messages.errStart'));
    } finally {
      setSending(false);
    }
  };

  const cancelNew = () => { setSearchParams({}); setDraft(''); setError(''); };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> {t('messages.loading')}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <h1 className="mb-4 text-2xl font-semibold">{t('messages.title')}</h1>
        {pendingTo ? (
          <Card className="flex min-h-[40vh] flex-col overflow-hidden">
            <NewConversation draft={draft} setDraft={setDraft} sending={sending} onSend={startThread} onCancel={cancelNew} />
          </Card>
        ) : (
          <>
            <Alert>
              <p className="mb-2">
                {isPatient ? t('messages.emptyLinkedPatient') : t('messages.emptyLinkedOther')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link to="/wheelchairs">{t('messages.browse')}</Link>
                </Button>
              </div>
            </Alert>
          </>
        )}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-4 p-4 md:grid-cols-[280px_1fr]">
      <Card className="max-h-[70vh] overflow-y-auto p-2">
        {threads.map((th) => (
          <button
            key={th.id}
            onClick={() => setActiveId(th.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-md p-3 text-left hover:bg-accent',
              th.id === activeId && 'bg-accent'
            )}
          >
            <Avatar>
              <AvatarFallback>{(th.other_name || '?').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{th.other_name}</span>
                {th.unread > 0 && <Badge>{th.unread}</Badge>}
              </span>
              <span className="block truncate text-xs capitalize text-muted-foreground">{th.other_role}</span>
              <span className="block truncate text-xs text-muted-foreground">{th.last_text}</span>
            </span>
          </button>
        ))}
      </Card>

      <Card className="flex max-h-[70vh] min-h-[50vh] flex-col overflow-hidden">
        {pendingNew ? (
          <NewConversation draft={draft} setDraft={setDraft} sending={sending} onSend={startThread} onCancel={cancelNew} />
        ) : active ? (
          <>
            <div className="border-b p-3 text-sm font-medium">
              {active.other_name} <span className="font-normal capitalize text-muted-foreground">· {active.other_role}</span>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
              {messages.map((m) => {
                const mine = m.sender_id === meId;
                return (
                  <div key={m.id} className={cn('max-w-[85%] rounded-2xl px-4 py-2 text-sm', mine ? 'self-end rounded-br-sm bg-primary text-primary-foreground' : 'self-start rounded-bl-sm bg-muted')}>
                    {m.text}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="flex items-end gap-2 border-t p-3">
              <Textarea
                rows={1}
                className="min-h-[40px] resize-none"
                placeholder={t('messages.placeholder')}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <Button size="icon" onClick={send} disabled={sending || !draft.trim()} aria-label={t('messages.sendAria')}>
                {sending ? <Loader2 className="animate-spin" /> : <Send />}
              </Button>
            </div>
          </>
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">{t('messages.selectThread')}</p>
        )}
      </Card>
      {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
    </div>
  );
}

const Messages = () => {
  const { user } = useAuth();
  const t = user?.userType;
  if (t === 'patient' || t === 'vendor') {
    return (
      <DashboardShell role={t}>
        <MessagesInner />
      </DashboardShell>
    );
  }
  return <MessagesInner />;
};

export default Messages;
