import { query } from '../repository/db.js';

/**
 * Get Instagram post count for a client
 */
export async function getInstaPostCount(clientId, period = 'daily', periodValue = null, startDate = null, endDate = null, options = {}) {
  try {
    const dbClient = options.db || query;
    let whereClause = 'client_id = $1';
    const params = [clientId];

    if (period === 'custom' && startDate && endDate) {
      whereClause += ' AND created_at >= $2 AND created_at <= $3';
      params.push(startDate, endDate);
    }

    const { rows } = await dbClient(
      `SELECT COUNT(*) as count FROM instagram_posts WHERE ${whereClause}`,
      params
    );
    return parseInt(rows[0]?.count || 0, 10);
  } catch (err) {
    console.error('[postCountService] Error getting Instagram post count:', err);
    return 0;
  }
}

/**
 * Get TikTok post count for a client
 */
export async function getTiktokPostCount(clientId, period = 'daily', periodValue = null, startDate = null, endDate = null, options = {}) {
  try {
    const dbClient = options.db || query;
    let whereClause = 'client_id = $1';
    const params = [clientId];

    if (period === 'custom' && startDate && endDate) {
      whereClause += ' AND created_at >= $2 AND created_at <= $3';
      params.push(startDate, endDate);
    }

    const { rows } = await dbClient(
      `SELECT COUNT(*) as count FROM tiktok_posts WHERE ${whereClause}`,
      params
    );
    return parseInt(rows[0]?.count || 0, 10);
  } catch (err) {
    console.error('[postCountService] Error getting TikTok post count:', err);
    return 0;
  }
}
