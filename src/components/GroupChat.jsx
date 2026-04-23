import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  MAX_MESSAGE_LENGTH,
  sendGroupMessage,
  subscribeGroupMessages,
} from "../services/groupChat";

function formatTime(ts) {
  const ms = ts?.toMillis?.();
  if (!ms) return "";
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function GroupChat({ groupId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (!groupId) return;
    const unsub = subscribeGroupMessages(groupId, (rows) => {
      setMessages(rows);
      setLoaded(true);
    });
    return unsub;
  }, [groupId]);

  useEffect(() => {
    // Keep the newest message in view.
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setBusy(true);
    try {
      await sendGroupMessage(
        groupId,
        user.uid,
        user.displayName || user.email || "",
        body,
      );
      setBody("");
    } catch (err) {
      setError(err?.message || "Could not send message.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="w-full bg-white dark:bg-[--huddle-card] rounded-2xl shadow-md p-4 flex flex-col gap-3"
      style={{ fontFamily: "'Jost', sans-serif" }}
      data-testid="group-chat"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800 dark:text-[--huddle-text]">Group chat</p>
        <span className="text-[0.65rem] text-gray-500 dark:text-[--huddle-text-sub]">Members only</span>
      </div>

      <div
        ref={scrollerRef}
        className="flex flex-col gap-2 max-h-64 overflow-y-auto bg-amber-50 rounded-xl p-3"
        data-testid="group-chat-messages"
      >
        {!loaded ? (
          <p className="text-xs text-gray-500 dark:text-[--huddle-text-sub] text-center py-6">Loading chat…</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-[--huddle-text-sub] text-center py-6">
            No messages yet. Say hi to kick things off.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.userId === user?.uid;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <div className="flex items-baseline gap-2 text-[0.65rem] text-gray-500 dark:text-[--huddle-text-sub]">
                  <span className="font-semibold">
                    {mine ? "You" : m.displayName || "Member"}
                  </span>
                  <span>{formatTime(m.createdAt)}</span>
                </div>
                <div
                  className={`mt-0.5 rounded-2xl px-3 py-1.5 text-sm max-w-[85%] break-words ${
                    mine ? "bg-sky-950 text-white" : "bg-white dark:bg-[--huddle-card] text-gray-800 dark:text-[--huddle-text] shadow-sm"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a message…"
            maxLength={MAX_MESSAGE_LENGTH}
            aria-label="Message"
            data-testid="group-chat-input"
            className="flex-1 h-10 px-3 rounded-full border border-gray-300 dark:border-[--huddle-border] text-sm outline-none focus:ring-2 focus:ring-amber-200"
          />
          <button
            type="submit"
            disabled={busy || !body.trim()}
            data-testid="group-chat-send"
            className="px-4 h-10 rounded-full bg-sky-950 text-white text-sm font-bold cursor-pointer disabled:opacity-60"
          >
            {busy ? "…" : "Send"}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-700" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
