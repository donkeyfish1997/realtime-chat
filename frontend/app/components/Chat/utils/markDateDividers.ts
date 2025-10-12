import type { GetHistoricalMessagesDtoOutputItem } from "api/models";
import { format, isSameDay, parseISO, differenceInMinutes } from "date-fns";

/**
 * 遍歷訊息列表，標記哪些訊息上方應該顯示日期分隔線。
 * @param {Array<GetHistoricalMessagesDtoOutputItem>} messages - 訊息陣列 (應為升序: 舊的在前，新的在後)
 * @returns {Array<(GetHistoricalMessagesDtoOutputItem & {isDateDivider: boolean;  dateLabel: string | null;}>} - 帶有 isDateDivider 的訊息陣列
 */
export type messageWithDateDivider = GetHistoricalMessagesDtoOutputItem & {
  isDateDivider: boolean;
  shouldShowTime: boolean;
  dateLabel: string | null;
  timeText: string;
};
const TIME_GAP_MINUTES = 5; // 定義時間間隔閾值

export const markDateDividers = (
  messages: GetHistoricalMessagesDtoOutputItem[],
  today: Date
): messageWithDateDivider[] => {
  // 這裡明確指定返回類型

  const lastIndex = messages.length - 1;

  return messages.reduce((acc, message, index) => {
    const currentMsgDate = parseISO(message.created_at);
    let shouldShowDate = false;
    let shouldShowTime = false; // 預設不顯示時間

    // --- 1. 日期分隔線判斷 ---
    if (index === 0) {
      shouldShowDate = true;
    } else {
      const previousMessage = messages[index - 1];
      const previousMsgDate = parseISO(previousMessage.created_at);

      if (!isSameDay(currentMsgDate, previousMsgDate)) {
        shouldShowDate = true;
      }
    }

    // --- 2. 時間顯示判斷 ---
    if (shouldShowDate || index === 0 || index === lastIndex) {
      // 跨日、第一條或最後一條訊息，強制顯示時間
      shouldShowTime = true;
    } else {
      // 判斷與上一條訊息的時間間隔
      const previousMessage = messages[index - 1];
      const previousMsgDate = parseISO(previousMessage.created_at);

      // 💡 僅當發送者相同時，才考慮時間間隔 (避免不同人訊息一直顯示時間)
      // 如果不是同一個人發的，且間隔超過 1 分鐘，也可以考慮顯示

      // 計算分鐘差
      const minutesDifference = differenceInMinutes(
        currentMsgDate,
        previousMsgDate
      );

      if (minutesDifference >= TIME_GAP_MINUTES) {
        shouldShowTime = true;
      }

      // (可選優化) 確保時間只在連續訊息流的最後一條顯示，但為了簡單起見，這裡不實作
    }

    // 將標記後的訊息對象添加到累積器中
    acc.push({
      ...message,
      isDateDivider: shouldShowDate,
      dateLabel: shouldShowDate
        ? isSameDay(currentMsgDate, today)
          ? "今天"
          : format(currentMsgDate, "yyyy年M月d日")
        : null,
      shouldShowTime: shouldShowTime, // 👈 設置標記
      timeText: format(currentMsgDate, "HH:mm"), // 👈 格式化時間
    });

    return acc;
  }, [] as messageWithDateDivider[]);
};
