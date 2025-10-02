import { createContext, useContext } from "react";
import type { NotificationContextType } from "./NotificationType";

export const NotificationContext = createContext<NotificationContextType>({
  notify: () => {
    console.error("useNotification must be used within a NotificationProvider");
  },
});
export const useNotification = () => {
  const context = useContext(NotificationContext);
  return context;
};
