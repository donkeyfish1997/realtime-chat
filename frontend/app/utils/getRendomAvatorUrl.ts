export function getRendomAvatorUrl(str: string): string {
  const number = stringToHashNumber(str);
  return `https://i.pravatar.cc/150?img=${number}`;
}
/**
 * 將任意字串轉換為 1 到 max 之間的偽隨機整數。
 * @param {string} str - 輸入的字串。
 * @param {number} max - 最大的隨機數 (例如 70)。
 * @returns {number} 1 到 max 之間的整數。
 */
function stringToHashNumber(str: string, max = 70) {
  if (str.length === 0) {
    return 1;
  }

  let hash = 0;
  const prime = 31; // 使用質數以提高散列分佈

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // 使用位運算來保持在 32 位整數範圍內，並使用乘法結合字符值
    hash = hash * prime + char;
    // 確保 hash 始終是一個 32 位整數，防止溢出
    hash = hash | 0;
  }

  // 1. 取絕對值，確保結果是正數
  const positiveHash = Math.abs(hash);

  // 2. 使用模數運算將範圍限制在 [0, max - 1]
  const range = positiveHash % max;

  // 3. 加 1，將範圍轉換為 [1, max]
  return range + 1;
}
