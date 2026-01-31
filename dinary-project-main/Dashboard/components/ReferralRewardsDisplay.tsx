"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Store, Copy, Check, Zap, TrendingUp, ShoppingCart, UserPlus, RefreshCw } from 'lucide-react';

interface ReferralReward {
  id: string;
  type: string;
  targetType: 'USER' | 'MERCHANT';
  yourReward: number;
  friendReward: number;
  requiredAction: string;
  description: string;
}

interface ReferralRewardsDisplayProps {
  token: string;
  userRole: 'USER' | 'MERCHANT';
  referralCode?: string;
}

export default function ReferralRewardsDisplay({ token, userRole, referralCode }: ReferralRewardsDisplayProps) {
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchRewards = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${baseUrl}/admin/referral-rules/public/${userRole}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Impossible de récupérer les récompenses');
      }

      const data = await response.json();
      setRewards(data.rewards);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRewards();
    }
  }, [token, userRole]);

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      FIRST_TRANSACTION: 'Première transaction',
      FIRST_RECHARGE: 'Première recharge',
      FIRST_SALE: 'Première vente',
      ACCOUNT_CREATED: 'Création du compte',
    };
    return labels[action] || action;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'FIRST_TRANSACTION':
        return <TrendingUp className="h-4 w-4" />;
      case 'FIRST_RECHARGE':
        return <Zap className="h-4 w-4" />;
      case 'FIRST_SALE':
        return <ShoppingCart className="h-4 w-4" />;
      case 'ACCOUNT_CREATED':
        return <UserPlus className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dinary-turquoise"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec Code de Parrainage */}
      <div className="bg-gradient-to-r from-dinary-turquoise to-blue-500 text-white p-8 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">💫 Parrainez et Gagnez !</h1>
            <p className="text-lg opacity-90">
              Invitez vos amis et gagnez des récompenses
            </p>
          </div>
          <Button
            onClick={fetchRewards}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {referralCode && (
          <div className="mt-6 bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg">
            <p className="text-sm mb-2 opacity-90">Votre code de parrainage :</p>
            <div className="flex items-center gap-3">
              <code className="text-2xl font-bold tracking-wider">{referralCode}</code>
              <Button
                onClick={copyReferralCode}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copier
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs mt-2 opacity-75">
              Partagez ce code avec vos amis pour qu'ils s'inscrivent
            </p>
          </div>
        )}
      </div>

      {/* Cartes de Récompenses */}
      {rewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewards.map((reward) => (
            <Card key={reward.id} className="hover:shadow-lg transition-shadow border-2 hover:border-dinary-turquoise">
              <CardHeader className={`${
                reward.targetType === 'USER' 
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50' 
                  : 'bg-gradient-to-r from-purple-50 to-pink-50'
              }`}>
                <div className="flex items-center gap-3">
                  {reward.targetType === 'USER' ? (
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  ) : (
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Store className="h-8 w-8 text-purple-600" />
                    </div>
                  )}
                  <CardTitle className="text-lg">
                    {reward.targetType === 'USER' 
                      ? 'Parrainez un Ami' 
                      : 'Parrainez un Marchand'}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                {/* Votre Récompense */}
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <p className="text-sm text-green-700 mb-1 font-medium">
                    🎁 Vous gagnez
                  </p>
                  <p className="text-4xl font-bold text-green-600">
                    {reward.yourReward.toLocaleString()} DA
                  </p>
                </div>

                {/* Récompense du Filleul */}
                {reward.friendReward > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-700 mb-1 font-medium">
                      🎉 Votre filleul gagne
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reward.friendReward.toLocaleString()} DA
                    </p>
                  </div>
                )}

                {/* Action Requise */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    {getActionIcon(reward.requiredAction)}
                    <p className="text-sm font-semibold text-gray-700">
                      Action requise :
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    {getActionLabel(reward.requiredAction)}
                  </p>
                </div>

                {/* Description */}
                <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
                  <strong>Comment ça marche ?</strong> Partagez votre code. 
                  Quand votre filleul effectue{' '}
                  <strong>{getActionLabel(reward.requiredAction).toLowerCase()}</strong>, 
                  vous recevez automatiquement{' '}
                  <strong className="text-dinary-turquoise">{reward.yourReward} DA</strong>
                  {reward.friendReward > 0 && (
                    <> et votre filleul reçoit{' '}
                    <strong className="text-dinary-turquoise">{reward.friendReward} DA</strong></>
                  )} !
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aucune récompense de parrainage disponible pour le moment.</p>
            <p className="text-sm mt-2">Revenez plus tard !</p>
          </CardContent>
        </Card>
      )}

      {/* Information Supplémentaire */}
      {rewards.length > 0 && (
        <div className="bg-dinary-turquoise bg-opacity-10 border-2 border-dinary-turquoise p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Comment maximiser vos gains ?
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-dinary-turquoise font-bold">1.</span>
              <span>Partagez votre code sur les réseaux sociaux</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dinary-turquoise font-bold">2.</span>
              <span>Envoyez votre code à vos amis par message</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dinary-turquoise font-bold">3.</span>
              <span>Plus vous parrainez, plus vous gagnez !</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dinary-turquoise font-bold">4.</span>
              <span>Les récompenses sont créditées automatiquement</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

