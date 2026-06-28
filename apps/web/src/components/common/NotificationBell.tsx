import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, FileText, Check } from "lucide-react";
import { Link } from "react-router-dom";
import useNotifications from "../../../hooks/useNotifications";
import type { NotificationType } from "../../notifications/types/notification";

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

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "proposal_accepted":
        return <CheckCircle size={16} className="text-emerald-500" />;
      case "invoice_paid":
        return <CheckCircle size={16} className="text-indigo-500" />;
      case "reminder":
        return <AlertTriangle size={16} className="text-amber-500" />;
      case "system":
        return <Info size={16} className="text-blue-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                You have no notifications.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex gap-3 px-4 py-3 transition-colors ${
                      notification.is_read ? "bg-white" : "bg-indigo-50/30"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${notification.is_read ? 'text-gray-900' : 'text-indigo-900'}`}>
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      {notification.link_url && (
                        <Link
                          to={notification.link_url}
                          onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                          className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          View Details →
                        </Link>
                      )}
                      {!notification.link_url && !notification.is_read && (
                        <button
                          onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                          className="mt-2 inline-block text-xs font-medium text-gray-500 hover:text-gray-700"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
