import { RequestHandler } from "express";
import prisma from "../prisma";
import fetch from "node-fetch";

const CPALEAD_ADVERTISER_ID = process.env.CPALEAD_ADVERTISER_ID || "8983bc07-3c30-4a51-afd8-1021cc1d2148";
const CPALEAD_PIN = process.env.CPALEAD_PIN || "6586";
const CPALEAD_POSTBACK_URL = process.env.CPALEAD_POSTBACK_URL || "https://net.go2trck.org/adv_pbk";

/**
 * CPAlead Postback Handler
 * Receives conversion notifications from CPAlead
 */
export const handleCPALeadPostback: RequestHandler = async (req, res) => {
  try {
    const {
      user_id,
      amount,
      offer_id,
      transaction_id,
      publisher_id,
      campaign_id,
      status
    } = req.query as Record<string, string>;

    console.log('CPAlead postback received:', req.query);

    if (!user_id || !amount || !transaction_id) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Check for duplicate transaction
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        meta: {
          path: ['cpalead_transaction_id'],
          equals: transaction_id
        }
      }
    });

    if (existingTransaction) {
      console.log('Duplicate CPAlead transaction:', transaction_id);
      return res.json({ success: true, message: 'Duplicate transaction' });
    }

    // Get user and apply level multiplier
    const user = await prisma.user.findUnique({
      where: { id: user_id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Level multipliers
    const multipliers: Record<number, number> = {
      0: 1.15,
      1: 1.35,
      2: 1.55,
      3: 1.75,
    };

    const multiplier = multipliers[user.level] || 1;
    const baseAmount = Math.round(parseFloat(amount) * 100); // Convert to HivePoints
    const finalAmount = Math.round(baseAmount * multiplier);

    // Update user balance
    await prisma.user.update({
      where: { id: user_id },
      data: {
        hivePoints: {
          increment: finalAmount
        }
      }
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: user_id,
        amount: finalAmount,
        kind: 'TASK_REWARD',
        meta: {
          platform: 'CPAlead',
          cpalead_transaction_id: transaction_id,
          cpalead_offer_id: offer_id,
          cpalead_publisher_id: publisher_id,
          cpalead_campaign_id: campaign_id,
          cpalead_status: status,
          original_amount: baseAmount,
          multiplier: multiplier,
          level: user.level
        }
      }
    });

    console.log(`CPAlead conversion processed: User ${user_id} earned ${finalAmount} HP (${baseAmount} * ${multiplier})`);

    res.json({ success: true, amount: finalAmount });
  } catch (err) {
    console.error('CPAlead postback error:', err);
    res.status(500).json({ error: String(err) });
  }
};

/**
 * Block Publisher on CPAlead
 * Sends postback to CPAlead to block a publisher
 */
export const blockPublisher: RequestHandler = async (req, res) => {
  try {
    const { publisher_id, campaign_id } = req.body as {
      publisher_id: string;
      campaign_id?: string;
    };

    if (!publisher_id) {
      return res.status(400).json({ error: 'Missing publisher_id' });
    }

    let postbackUrl = `${CPALEAD_POSTBACK_URL}?id=${CPALEAD_ADVERTISER_ID}&pin=${CPALEAD_PIN}&b=${publisher_id}`;
    
    if (campaign_id) {
      postbackUrl += `&c=${campaign_id}`;
    }

    const response = await fetch(postbackUrl);
    const result = await response.text();

    console.log(`CPAlead publisher ${publisher_id} blocked:`, result);

    res.json({ success: true, message: 'Publisher blocked successfully' });
  } catch (err) {
    console.error('CPAlead block publisher error:', err);
    res.status(500).json({ error: String(err) });
  }
};

/**
 * Favorite Publisher on CPAlead
 * Sends postback to CPAlead to favorite a publisher
 */
export const favoritePublisher: RequestHandler = async (req, res) => {
  try {
    const { publisher_id } = req.body as { publisher_id: string };

    if (!publisher_id) {
      return res.status(400).json({ error: 'Missing publisher_id' });
    }

    const postbackUrl = `${CPALEAD_POSTBACK_URL}?id=${CPALEAD_ADVERTISER_ID}&pin=${CPALEAD_PIN}&f=${publisher_id}`;

    const response = await fetch(postbackUrl);
    const result = await response.text();

    console.log(`CPAlead publisher ${publisher_id} favorited:`, result);

    res.json({ success: true, message: 'Publisher favorited successfully' });
  } catch (err) {
    console.error('CPAlead favorite publisher error:', err);
    res.status(500).json({ error: String(err) });
  }
};

/**
 * Get CPAlead Offerwall URL for user
 */
export const getCPALeadOfferwallUrl: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // CPAlead offerwall URL would be provided by CPAlead
    // This is a placeholder - replace with actual CPAlead offerwall URL
    const offerwallUrl = `https://cpalead.com/offerwall?user_id=${userId}`;

    res.json({ offerwallUrl });
  } catch (err) {
    console.error('CPAlead offerwall URL error:', err);
    res.status(500).json({ error: String(err) });
  }
};

