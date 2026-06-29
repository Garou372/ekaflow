import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, FileText, Check } from "lucide-react";
import { Link } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";
import type { NotificationType } from "../../features/notifications/types/notification";

// ─── Icon map ─────────────────────────────────────────────────────

function getIcon(type: NotificationType) {
  switch (type) {
    case "proposal_accepted":
      return <CheckCircle size={15} style={{ color: "var(--ek-success)" }} />;
    case "invoice_paid":
      return <CheckCircle size={15} style={{ color: "var(--ek-primary)" }} />;
    case "reminder":
      return <AlertTriangle size={15} style={{ color: "var(--ek-warning)" }} />;
    case "system":
      return <Info size={15} style={{ color: "var(--ek-info)" }} />;
    default:
      return <FileText size={15} style={{ color: "var(--ek-text-tertiary)" }} />;
  }
}

// ─── Component ────────────────────────────────────────────────────

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleNotificationClick(id: string, isRead: boolean) {
    if (!isRead) markAsRead(id);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ek-btn-icon relative"
        aria-label="Notifications"
        aria-expanded={isOpen}
        style={{ padding: "8px", borderRadius: 10 }}
      >
        <Bell size={19} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} unread notifications`}
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--ek-danger)",
              border: "2px solid white",
            }}
          />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="ek-dropdown absolute right-0 mt-2 flex flex-col overflow-hidden"
          style={{ width: 360, maxHeight: "80vh", zIndex: 60 }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{
              borderBottom: "1px solid var(--ek-border)",
              background: "var(--ek-bg-subtle)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="font-semibold"
                style={{ fontSize: 14, color: "var(--ek-text-primary)" }}
              >
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  className="ek-badge"
                  style={{
                    background: "var(--ek-primary-100)",
                    color: "var(--ek-primary)",
                    fontSize: 11,
                    padding: "2px 8px",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-xs font-semibold transition-colors"
                style={{ color: "var(--ek-primary)" }}
              >
                <Check size={13} strokeWidth={2.5} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center text-center"
                style={{ padding: "40px 24px", color: "var(--ek-text-tertiary)" }}
              >
                <Bell size={28} strokeWidth={1.5} style={{ marginBottom: 8, opacity: 0.5 }} />
                <p style={{ fontSize: 14, fontWeight: 500 }}>All caught up</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex gap-3 transition-colors"
                  style={{
                    padding: "12px 16px",
                    background: notification.is_read
                      ? "var(--ek-bg-surface)"
                      : "var(--ek-primary-50)",
                    borderBottom: "1px solid var(--ek-border)",
                    cursor: notification.link_url ? "pointer" : "default",
                  }}
                >
                  {/* Icon */}
                  <div style={{ marginTop: 2, flexShrink: 0 }}>
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      className="leading-snug"
                      style={{
                        fontSize: 13,
                        fontWeight: notification.is_read ? 500 : 600,
                        color: notification.is_read
                          ? "var(--ek-text-primary)"
                          : "#1E1B4B",
                      }}
                    >
                      {notification.title}
                    </p>
                    <p
                      className="mt-0.5 line-clamp-2 leading-snug"
                      style={{ fontSize: 12, color: "var(--ek-text-secondary)" }}
                    >
                      {notification.message}
                    </p>
                    <p
                      className="mt-1"
                      style={{ fontSize: 11, color: "var(--ek-text-tertiary)" }}
                    >
                      {new Date(notification.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>

                    {notification.link_url ? (
                      <Link
                        to={notification.link_url}
                        onClick={() =>
                          handleNotificationClick(notification.id, notification.is_read)
                        }
                        className="mt-1.5 inline-block font-semibold transition-colors"
                        style={{ fontSize: 11, color: "var(--ek-primary)" }}
                      >
                        View →
                      </Link>
                    ) : !notification.is_read ? (
                      <button
                        onClick={() =>
                          handleNotificationClick(notification.id, notification.is_read)
                        }
                        className="mt-1.5 inline-block font-medium transition-colors"
                        style={{
                          fontSize: 11,
                          color: "var(--ek-text-tertiary)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
