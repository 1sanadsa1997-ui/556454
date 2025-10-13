import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, ExternalLink } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

interface PlatformWallet {
  platformName: string;
  platformIcon: string;
  balance: number;
  totalEarned: number;
  currency: string;
  offerwallUrl?: string;
}

export function PlatformWallets() {
  const [wallets, setWallets] = useState<PlatformWallet[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchWallets();
  }, []);
  
  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/user/platform-wallets');
      setWallets(data.wallets || []);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted" />
            <CardContent className="h-24 bg-muted/50" />
          </Card>
        ))}
      </div>
    );
  }
  
  if (wallets.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No earning platforms available yet. Start completing tasks to earn!
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {wallets.map((wallet) => (
        <Card key={wallet.platformName} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardTitle className="text-sm font-medium">
              {wallet.platformName}
            </CardTitle>
            <img 
              src={wallet.platformIcon} 
              alt={wallet.platformName}
              className="h-10 w-10 rounded-lg shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/icons/hivecoin.png';
              }}
            />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {wallet.balance.toLocaleString()} HP
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              ≈ ${(wallet.balance / 100).toFixed(2)} {wallet.currency}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-muted-foreground">
                Total earned: {wallet.totalEarned.toLocaleString()} HP
              </p>
            </div>
            {wallet.offerwallUrl && (
              <a
                href={wallet.offerwallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Visit Offerwall
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

