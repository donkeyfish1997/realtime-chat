import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

import { NotificationContext } from "./NotificationContext";
import type { AlertSeverity, Notification } from "./NotificationType";

/**
 * 💡 NotificationProvider 元件: 放置在 App 的根部
 * 負責管理所有通知的佇列和渲染
 */
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Notification | null>(null);

  // --- A. 處理通知佇列 ---

  // 當 notifications 陣列改變時，嘗試顯示下一個通知
  useEffect(() => {
    if (notifications.length > 0 && !currentItem) {
      // 顯示佇列中的第一個通知
      setCurrentItem(notifications[0]);
      setNotifications((prev) => prev.slice(1));
      setOpen(true);
    }
  }, [notifications, currentItem]);

  // --- B. 觸發通知 (供 useNotification 呼叫) ---

  const notify = useCallback(
    (message: string, severity: AlertSeverity = "info") => {
      const newNotification: Notification = {
        id: Date.now(), // 使用時間戳作為唯一 ID
        message,
        severity,
      };
      // 如果目前沒有正在顯示的通知，則直接顯示；否則加入佇列
      if (!currentItem) {
        setCurrentItem(newNotification);
        setOpen(true);
      } else {
        setNotifications((prev) => [...prev, newNotification]);
      }
    },
    [currentItem]
  );

  // --- C. 處理通知關閉 ---

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    console.log("handleClose", reason);
    if (reason === "clickaway") {
      return; // 點擊通知以外的地方不關閉
    }
    setCurrentItem(null);
    setOpen(false);
  };

  const contextValue = useMemo(() => ({ notify }), [notify]);

  return (
    // 放置在 App 最上層中央
    <NotificationContext.Provider value={contextValue}>
      {children}
      {currentItem && (
        <Snackbar
          key={currentItem.id}
          open={open}
          autoHideDuration={5000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleClose} severity={currentItem.severity}>
            {currentItem.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
}
