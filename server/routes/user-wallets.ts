import { RequestHandler } from "express";
import prisma from "../prisma";

export const getPlatformWallets: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get all transactions grouped by platform
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        kind: 'TASK_REWARD'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Group by platform
    const platformMap = new Map<string, { totalEarned: number; balance: number }>();
    
    transactions.forEach((tx) => {
      const platform = (tx.meta as any)?.platform || 'Manual Tasks';
      
      if (!platformMap.has(platform)) {
        platformMap.set(platform, { totalEarned: 0, balance: 0 });
      }
      
      const data = platformMap.get(platform)!;
      data.totalEarned += tx.amount;
      data.balance += tx.amount; // In real app, subtract withdrawals
    });
    
    // Define platform icons and offerwall URLs
    const platformConfig: Record<string, { icon: string; offerwallUrl?: string }> = {
      'AdGem': {
        icon: '/icons/adgem.png',
        offerwallUrl: `https://api.adgem.com/v1/wall?appid=${process.env.ADGEM_APP_ID}&playerid=${userId}`
      },
      'CPAlead': {
        icon: '/icons/cpalead.png',
        offerwallUrl: `https://cpalead.com/offerwall?user_id=${userId}`
      },
      'Adsterra': {
        icon: '/icons/adsterra.png'
      },
      'Manual Tasks': {
        icon: '/icons/hivecoin.png'
      }
    };
    
    // Convert to array
    const wallets = Array.from(platformMap.entries()).map(([platformName, data]) => {
      const config = platformConfig[platformName] || { icon: '/icons/hivecoin.png' };
      
      return {
        platformName,
        platformIcon: config.icon,
        balance: data.balance,
        totalEarned: data.totalEarned,
        currency: 'USDT',
        offerwallUrl: config.offerwallUrl
      };
    });
    
    // Sort by total earned (descending)
    wallets.sort((a, b) => b.totalEarned - a.totalEarned);
    
    res.json({ wallets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
};

