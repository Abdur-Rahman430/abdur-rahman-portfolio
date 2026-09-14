import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

import { fetchMessages, updateMessageReadStatus } from '../../services/contactApi.js';
import {
  Mail,
  MailOpen,
  MailCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ExternalLink,
  Loader2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Filter,
} from 'lucide-react';

// ─── Notification Component ──────────────────────────────────────────────────

function Notification({ message, type, onDismiss }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm mb-5 animate-in fade-in duration-200 ${
        isError
          ? 'bg-red-500/10 border-red-500/30 text-red-300'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
      }`}
    >
      {isError ? (
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
      )}
      <span className="flex-1 text-xs sm:text-sm">{message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function MessageSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800" />
          <div className="space-y-1.5">
            <div className="h-4 w-36 bg-zinc-800 rounded" />
            <div className="h-3 w-48 bg-zinc-800/60 rounded" />
          </div>
        </div>
        <div className="h-6 w-20 bg-zinc-800 rounded-full" />
      </div>
      <div className="space-y-2 pt-2 border-t border-zinc-800/50">
        <div className="h-4 w-1/3 bg-zinc-800 rounded" />
        <div className="h-3 w-full bg-zinc-800/40 rounded" />
        <div className="h-3 w-4/5 bg-zinc-800/40 rounded" />
      </div>
    </div>
  );
}

// ─── Date Formatter ───────────────────────────────────────────────────────────

function formatMessageDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '—';
  }
}

// ─── Main Admin Messages Component ────────────────────────────────────────────

export default function AdminMessages() {
  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Status Filter: 'ALL' | 'UNREAD' | 'READ'
  const [filter, setFilter] = useState('ALL');

  // Action status per message ID
  const [updatingId, setUpdatingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);

  // ── Load Messages ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    async function loadMessages() {
      try {
        const params = {
          page,
          limit,
        };
        if (filter === 'UNREAD') params.read = 'false';
        if (filter === 'READ') params.read = 'true';

        const res = await fetchMessages(token, params);

        if (isMounted && res.success && Array.isArray(res.data)) {
          setMessages(res.data);
          setTotalCount(res.total || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(err.message || 'Failed to load messages from server.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [token, page, limit, filter, refreshKey]);

  function handleFilterChange(newFilter) {
    setLoading(true);
    setFilter(newFilter);
    setPage(1);
  }

  function handleManualRefresh() {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
  }

  function handleRetry() {
    setLoading(true);
    setLoadError('');
    setRefreshKey((k) => k + 1);
  }



  // ── Helpers ────────────────────────────────────────────────────────────────
  function showSuccess(msg) {
    setSuccessMessage(msg);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function showError(msg) {
    setErrorMessage(msg);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 6000);
  }

  // ── Toggle Read Status ─────────────────────────────────────────────────────
  async function handleToggleRead(message) {
    if (!token || updatingId) return;

    const newStatus = !message.read;
    setUpdatingId(message._id);

    try {
      const res = await updateMessageReadStatus(message._id, newStatus, token);
      if (res.success && res.data) {
        // Update item in local list
        setMessages((prev) =>
          prev.map((m) => (m._id === message._id ? { ...m, read: newStatus } : m)),
        );
        showSuccess(
          newStatus
            ? `Message from ${message.name} marked as read.`
            : `Message from ${message.name} marked as unread.`,
        );
      } else {
        throw new Error(res.message || 'Failed to update message status');
      }
    } catch (err) {
      showError(err.message || 'Could not update message read status.');
    } finally {
      setUpdatingId(null);
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Messages</h1>
            {totalCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                {totalCount}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Review incoming inquiries and messages submitted through the portfolio contact form.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-700/60 text-xs font-medium transition-all self-start sm:self-auto disabled:opacity-50"
          title="Refresh messages"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications */}
      <Notification
        message={successMessage}
        type="success"
        onDismiss={() => setSuccessMessage('')}
      />
      <Notification
        message={errorMessage}
        type="error"
        onDismiss={() => setErrorMessage('')}
      />

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1 ml-2 hidden sm:inline-block" />
          {[
            { key: 'ALL', label: 'All Inquiries' },
            { key: 'UNREAD', label: 'Unread' },
            { key: 'READ', label: 'Read' },
          ].map(({ key, label }) => {
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => handleFilterChange(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-zinc-500 px-2 flex items-center gap-2">
          <span>
            Showing {messages.length} of {totalCount} total
          </span>
          {unreadCount > 0 && filter === 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {unreadCount} on this page unread
            </span>
          )}
        </div>
      </div>

      {/* Messages List Area */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <MessageSkeleton key={i} />
          ))}
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-200 mb-1">Failed to Load Messages</h3>
          <p className="text-xs text-zinc-400 max-w-md mb-5 leading-relaxed">{loadError}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-500 mb-3.5">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200 mb-1">
            {filter === 'ALL'
              ? 'No messages yet'
              : filter === 'UNREAD'
              ? 'No unread messages'
              : 'No read messages'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            {filter === 'ALL'
              ? 'Inquiries submitted by portfolio visitors through the contact section will appear here.'
              : filter === 'UNREAD'
              ? 'All incoming contact submissions have been reviewed.'
              : 'Messages you have marked as read will be cataloged here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((item) => {
            const isUnread = !item.read;
            const isItemUpdating = updatingId === item._id;

            return (
              <div
                key={item._id}
                className={`relative rounded-2xl p-5 sm:p-6 transition-all border ${
                  isUnread
                    ? 'bg-zinc-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/80'
                }`}
              >
                {/* Header Row: Sender Info, Status Badge & Action */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isUnread
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {isUnread ? <Mail className="w-5 h-5" /> : <MailOpen className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          {item.name}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isUnread
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {isUnread ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Unread
                            </>
                          ) : (
                            <>
                              <MailCheck className="w-3 h-3" />
                              Read
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-zinc-400">
                        <a
                          href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(
                            item.subject || 'Portfolio Inquiry',
                          )}`}
                          className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 group"
                          title="Click to reply via email"
                        >
                          <span>{item.email}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>

                        <span className="text-zinc-600">•</span>

                        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {formatMessageDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleToggleRead(item)}
                      disabled={isItemUpdating}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border disabled:opacity-50 ${
                        isUnread
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800'
                      }`}
                      title={isUnread ? 'Mark this message as read' : 'Mark this message as unread'}
                    >
                      {isItemUpdating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isUnread ? (
                        <MailCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                      <span>{isUnread ? 'Mark Read' : 'Mark Unread'}</span>
                    </button>

                    <a
                      href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(
                        item.subject || 'Portfolio Inquiry',
                      )}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-700/60 transition-colors"
                      title="Reply directly via default email client"
                    >
                      <span>Reply</span>
                    </a>
                  </div>
                </div>

                {/* Subject & Message Content Box */}
                <div className="pt-3 border-t border-zinc-800/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-300">
                      Subject:
                    </span>
                    <span className="text-xs text-zinc-200 font-medium">
                      {item.subject?.trim() || <em className="text-zinc-500 not-italic">No Subject</em>}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/60 text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed select-text font-sans">
                    {item.message}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-zinc-500">
            Page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const prev = Math.max(1, page - 1);
                setPage(prev);
              }}
              disabled={page <= 1 || loading}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700/60 transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs text-zinc-400 font-mono px-2">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                setPage(next);
              }}
              disabled={page >= totalPages || loading}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700/60 transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
