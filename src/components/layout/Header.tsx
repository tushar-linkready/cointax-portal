'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, Menu, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/services';
import { getInitials, timeAgo } from '@/lib/utils';
import type { Notification } from '@/lib/types';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!profile) return;
    getNotifications(profile.id)
      .then(setNotifications)
      .catch(console.error);
  }, [profile]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (notifId: string) => {
    try {
      await markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!profile) return;
    try {
      await markAllNotificationsRead(profile.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (!profile) return null;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-navy-800">Dashboard</h1>
      </div>

      {/* Right: notifications + avatar */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg z-50">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs font-medium text-[#0d9488] hover:text-[#0a7c72]"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        notif.is_read
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-teal-50/40 hover:bg-teal-50/60'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notif.is_read ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
                          {notif.title}
                        </p>
                        {notif.message && (
                          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                            {notif.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#0d9488]" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-sm font-semibold text-white">
            {getInitials(profile.full_name)}
          </div>
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            {profile.full_name}
          </span>
        </div>
      </div>
    </header>
  );
}
