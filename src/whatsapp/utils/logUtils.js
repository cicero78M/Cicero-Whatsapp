/**
 * Utility functions for logging
 */

/**
 * Truncate text for logging purposes
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {string} Truncated text with ellipsis if needed
 */
export function truncateForLog(text, maxLength = 50) {
  if (!text) {
    return '[empty]';
  }
  
  const str = String(text);
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.substring(0, maxLength) + '...';
}

/**
 * Format message for logging
 * @param {object} message - WhatsApp message object
 * @returns {string} Formatted message string
 */
export function formatMessageForLog(message) {
  const from = message.from || '[unknown]';
  const body = truncateForLog(message.body);
  return `from=${from}, body=${body}`;
}

export default {
  truncateForLog,
  formatMessageForLog,
};
