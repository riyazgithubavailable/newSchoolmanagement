import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, MessageSquare, PenSquare, Search, SendHorizonal } from "lucide-react";
import { toast } from "sonner";

import {
  useContacts,
  useConversations,
  useMessages,
  useSendMessage,
  useStartConversation,
} from "@/hooks/useTeacherQueries";
import type { Contact, ContactType, Conversation } from "@/types/school";
import { getInitials } from "@/lib/nameUtils";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  PageHeader,
  PageShell,
  Pill,
  errorMessage,
  fmtDate,
  fmtRelative,
  fmtTime,
  inputClass,
  primaryBtn,
} from "@/components/shared/PageKit";

const TYPE_STYLE: Record<ContactType, string> = {
  Parent: "bg-blue-50 text-blue-700",
  Principal: "bg-amber-50 text-amber-700",
  Teacher: "bg-emerald-50 text-emerald-700",
};

const AVATAR_STYLE: Record<ContactType, string> = {
  Parent: "bg-blue-100 text-blue-800",
  Principal: "bg-amber-100 text-amber-800",
  Teacher: "bg-emerald-100 text-emerald-800",
};

function Avatar({ contact, size = "md" }: { contact: Contact; size?: "md" | "sm" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        AVATAR_STYLE[contact.type],
        size === "md" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs",
      )}
    >
      {getInitials(contact.name)}
    </div>
  );
}

export default function TeacherMessages() {
  const { data: conversations = [], isLoading, isError, error, refetch } = useConversations();
  const start = useStartConversation();
  const [params, setParams] = useSearchParams();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);

  // deep link: /teacher/messages?to=<contactId>
  const { data: contacts } = useContacts();
  useEffect(() => {
    const to = params.get("to");
    if (!to || !contacts) return;
    const contact = contacts.find((c) => c.id === to);
    setParams({}, { replace: true });
    if (!contact) {
      toast.error("Contact not found.");
      return;
    }
    start.mutate(contact, { onSuccess: (c) => setActiveId(c.id) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, contacts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? conversations.filter((c) => `${c.contact.name} ${c.contact.subtitle}`.toLowerCase().includes(q))
      : conversations;
  }, [conversations, search]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const onPickContact = (contact: Contact) => {
    start.mutate(contact, {
      onSuccess: (c) => {
        setActiveId(c.id);
        setNewOpen(false);
      },
      onError: (e) => toast.error(errorMessage(e)),
    });
  };

  return (
    <PageShell>
      <PageHeader
        icon={<MessageSquare size={25} />}
        title="Messages"
        description="Chat with parents, the principal and colleagues."
        actions={
          <button type="button" className={primaryBtn} onClick={() => setNewOpen(true)}>
            <PenSquare size={17} /> New Message
          </button>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading conversations..." />
      ) : isError ? (
        <ErrorState message={errorMessage(error)} onRetry={refetch} />
      ) : (
        <div className="grid h-[calc(100dvh-260px)] min-h-[480px] overflow-hidden rounded-2xl border border-[#E8E4D9] bg-white shadow-sm md:grid-cols-[320px_1fr]">
          {/* Conversation list */}
          <aside className={cn("flex min-h-0 flex-col border-r border-[#F0EDE4]", active && "hidden md:flex")}>
            <div className="border-b border-[#F0EDE4] p-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className={`${inputClass} pl-9`}
                  placeholder="Search conversations"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="p-6 text-center text-sm text-gray-500">No conversations found.</li>
              )}
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-[#F7F5EF] px-4 py-3 text-left transition hover:bg-[#FBF9F3]",
                      c.id === activeId && "bg-[#F5F3ED]",
                    )}
                  >
                    <Avatar contact={c.contact} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("truncate text-sm text-[#0F1B33]", c.unreadCount ? "font-bold" : "font-semibold")}>
                          {c.contact.name}
                        </p>
                        <span className="shrink-0 text-[11px] text-gray-400">{fmtRelative(c.lastMessageAt)}</span>
                      </div>
                      <p className="truncate text-xs text-gray-400">{c.contact.subtitle}</p>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p className={cn("truncate text-xs", c.unreadCount ? "font-semibold text-gray-700" : "text-gray-500")}>
                          {c.lastMessage || "No messages yet"}
                        </p>
                        {c.unreadCount > 0 && (
                          <span className="shrink-0 rounded-full bg-[#2463d4] px-1.5 text-[10px] font-bold text-white">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Thread */}
          <section className={cn("min-h-0 flex-col", active ? "flex" : "hidden md:flex")}>
            {active ? (
              <Thread conversation={active} onBack={() => setActiveId(null)} />
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <EmptyState
                  title="Select a conversation"
                  description="Pick a chat from the list or start a new message."
                />
              </div>
            )}
          </section>
        </div>
      )}

      <NewMessageModal open={newOpen} onClose={() => setNewOpen(false)} onPick={onPickContact} busy={start.isPending} />
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */

function Thread({ conversation, onBack }: { conversation: Conversation; onBack: () => void }) {
  const { data: messages = [], isLoading } = useMessages(conversation.id);
  const send = useSendMessage();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, conversation.id]);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    send.mutate(
      { conversationId: conversation.id, text: value },
      { onSuccess: () => setText(""), onError: (e) => toast.error(errorMessage(e)) },
    );
  };

  // group by calendar day
  const groups = useMemo(() => {
    const out: { day: string; items: typeof messages }[] = [];
    messages.forEach((m) => {
      const day = m.sentAt.slice(0, 10);
      const last = out[out.length - 1];
      if (last?.day === day) last.items.push(m);
      else out.push({ day, items: [m] });
    });
    return out;
  }, [messages]);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-[#F0EDE4] px-4 py-3">
        <button type="button" onClick={onBack} className="rounded-lg p-1.5 hover:bg-gray-100 md:hidden" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <Avatar contact={conversation.contact} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[#0F1B33]">{conversation.contact.name}</p>
          <p className="truncate text-xs text-gray-500">{conversation.contact.subtitle}</p>
        </div>
        <Pill className={TYPE_STYLE[conversation.contact.type]}>{conversation.contact.type}</Pill>
      </header>

      <div className="flex-1 overflow-y-auto bg-[#FBF9F3] px-4 py-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-gray-500">
            Start the conversation with {conversation.contact.name}.
          </p>
        ) : (
          groups.map((g) => (
            <div key={g.day} className="space-y-2">
              <p className="my-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {fmtDate(g.day, { weekday: "short", day: "2-digit", month: "short" })}
              </p>
              {g.items.map((m) => (
                <div key={m.id} className={cn("flex", m.fromMe ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                      m.fromMe ? "rounded-br-sm bg-[#0F1B33] text-white" : "rounded-bl-sm bg-white text-gray-800",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={cn("mt-1 text-right text-[10px]", m.fromMe ? "text-white/60" : "text-gray-400")}>
                      {fmtTime(m.sentAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-[#F0EDE4] p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          rows={1}
          value={text}
          maxLength={1000}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Type a message…  (Shift+Enter for new line)"
          className={`${inputClass} max-h-32 min-h-[44px] resize-none`}
        />
        <button
          type="submit"
          disabled={!text.trim() || send.isPending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F1B33] text-white transition hover:bg-[#1c3154] disabled:opacity-40"
          aria-label="Send"
        >
          <SendHorizonal size={18} />
        </button>
      </form>
    </>
  );
}

/* ------------------------------------------------------------------ */

function NewMessageModal({
  open,
  onClose,
  onPick,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (c: Contact) => void;
  busy: boolean;
}) {
  const { data: contacts = [], isLoading } = useContacts();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"All" | ContactType>("All");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter(
      (c) =>
        (type === "All" || c.type === type) &&
        (!q || `${c.name} ${c.subtitle}`.toLowerCase().includes(q)),
    );
  }, [contacts, search, type]);

  return (
    <Modal open={open} onClose={onClose} title="New Message" description="Choose who you want to message.">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            autoFocus
            className={`${inputClass} pl-9`}
            placeholder="Search by name or student"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={`${inputClass} sm:w-36`}
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          aria-label="Contact type"
        >
          <option value="All">Everyone</option>
          <option value="Parent">Parents</option>
          <option value="Teacher">Teachers</option>
          <option value="Principal">Principal</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <ul className="max-h-[50dvh] divide-y divide-[#F7F5EF] overflow-y-auto rounded-xl border border-[#F0EDE4]">
          {list.length === 0 && <li className="p-6 text-center text-sm text-gray-500">No contacts found.</li>}
          {list.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => onPick(c)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#FBF9F3] disabled:opacity-60"
              >
                <Avatar contact={c} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0F1B33]">{c.name}</p>
                  <p className="truncate text-xs text-gray-500">{c.subtitle}</p>
                </div>
                <Pill className={TYPE_STYLE[c.type]}>{c.type}</Pill>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
