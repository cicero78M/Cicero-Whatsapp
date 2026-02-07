import * as dashboardSubscriptionModel from '../model/dashboardSubscriptionModel.js';
import { query } from '../repository/db.js';

/**
 * Get premium snapshot for a dashboard user
 * @param {Object} user - User object with dashboard_user_id
 * @returns {Promise<{premiumStatus: boolean, premiumTier: string|null, premiumExpiresAt: string|null}>}
 */
export async function getPremiumSnapshot(user) {
  if (!user || !user.dashboard_user_id) {
    return {
      premiumStatus: false,
      premiumTier: null,
      premiumExpiresAt: null,
    };
  }

  try {
    const activeSubscription = await dashboardSubscriptionModel.findActiveByUser(
      user.dashboard_user_id,
    );

    if (!activeSubscription) {
      return {
        premiumStatus: false,
        premiumTier: null,
        premiumExpiresAt: null,
      };
    }

    return {
      premiumStatus: true,
      premiumTier: activeSubscription.tier,
      premiumExpiresAt: activeSubscription.expires_at,
    };
  } catch (err) {
    console.error('[dashboardSubscriptionService] Error getting premium snapshot:', err);
    return {
      premiumStatus: false,
      premiumTier: null,
      premiumExpiresAt: null,
    };
  }
}

/**
 * Create a new subscription and update the cache
 */
export async function createSubscription({ dashboard_user_id, tier, expires_at, status }) {
  try {
    await query('BEGIN');
    const params = { dashboard_user_id, tier, expires_at };
    if (status !== undefined) {
      params.status = status;
    }
    const subscription = await dashboardSubscriptionModel.create(params);

    const { rows } = await query(
      `UPDATE dashboard_user
       SET premium_status = $2, premium_tier = $3, premium_expires_at = $4
       WHERE dashboard_user_id = $1
       RETURNING premium_status, premium_tier, premium_expires_at`,
      [dashboard_user_id, true, tier, expires_at],
    );

    await query('COMMIT');
    return { subscription, cache: rows[0] };
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}

/**
 * Expire a subscription and update the cache
 */
export async function expireSubscription(subscriptionId, expiredAt = null) {
  try {
    await query('BEGIN');
    const subscription = await dashboardSubscriptionModel.expire(subscriptionId, expiredAt);
    
    if (!subscription) {
      await query('ROLLBACK');
      return null;
    }

    const activeSubscription = await dashboardSubscriptionModel.findActiveByUser(
      subscription.dashboard_user_id,
    );

    const premiumStatus = !!activeSubscription;
    const premiumTier = activeSubscription?.tier || null;
    const premiumExpiresAt = activeSubscription?.expires_at || null;

    const { rows } = await query(
      `UPDATE dashboard_user
       SET premium_status = $2, premium_tier = $3, premium_expires_at = $4
       WHERE dashboard_user_id = $1
       RETURNING premium_status, premium_tier, premium_expires_at`,
      [subscription.dashboard_user_id, premiumStatus, premiumTier, premiumExpiresAt],
    );

    await query('COMMIT');
    return { subscription, cache: rows[0] };
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}
