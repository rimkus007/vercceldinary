'use client'

import { useState } from 'react';
import { 
  Trophy, Star, Zap, Gift, 
  Users, Award, Target, Crown,
  TrendingUp, Medal, Coins, Flame,
  BarChart3
} from 'lucide-react';

interface GamificationStats {
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
  achievements: Achievement[];
  challenges: Challenge[];
  streaks: Streak[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  progress?: number;
  maxProgress?: number;
}

interface LeaderboardEntry {
  rank: number;
  userName: string;
  points: number;
  level: number;
  trend: 'up' | 'down' | 'same';
  change: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'transactions' | 'social' | 'engagement' | 'special';
  progress: number;
  target: number;
  reward: string;
  unlocked: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  timeLeft: string;
  participants: number;
  reward: string;
  difficulty: 'easy' | 'medium' | 'hard';
  progress: number;
}

interface Streak {
  id: string;
  type: 'daily_login' | 'transactions' | 'referrals';
  current: number;
  best: number;
  multiplier: number;
}

// Mock data
const mockStats: GamificationStats = {
  totalPoints: 12450,
  level: 8,
  nextLevelPoints: 15000,
  badges: [
    {
      id: '1',
      name: 'Maître des Transactions',
      description: '1000 transactions réussies',
      icon: 'trophy',
      rarity: 'legendary',
      unlockedAt: '2025-05-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Ambassadeur',
      description: '50 parrainages réussis',
      icon: 'users',
      rarity: 'epic',
      unlockedAt: '2025-05-20T14:30:00Z'
    },
    {
      id: '3',
      name: 'Fidèle',
      description: '30 jours de connexion consécutifs',
      icon: 'flame',
      rarity: 'rare',
      unlockedAt: '2025-05-25T09:15:00Z'
    },
    {
      id: '4',
      name: 'En cours...',
      description: 'Effectuer 10 recharges cette semaine',
      icon: 'target',
      rarity: 'common',
      unlockedAt: '',
      progress: 7,
      maxProgress: 10
    }
  ],
  leaderboard: [
    { rank: 1, userName: 'Ahmed K.', points: 25800, level: 12, trend: 'up', change: 2 },
    { rank: 2, userName: 'Fatima B.', points: 23400, level: 11, trend: 'same', change: 0 },
    { rank: 3, userName: 'Omar M.', points: 21900, level: 10, trend: 'down', change: -1 },
    { rank: 4, userName: 'Amina L.', points: 19600, level: 10, trend: 'up', change: 1 },
    { rank: 5, userName: 'Karim D.', points: 18200, level: 9, trend: 'up', change: 3 }
  ],
  achievements: [
    {
      id: '1',
      title: 'Premier Million',
      description: 'Atteindre 1M DA de transactions',
      category: 'transactions',
      progress: 850000,
      target: 1000000,
      reward: '500 points bonus',
      unlocked: false
    },
    {
      id: '2',
      title: 'Roi du Parrainage',
      description: 'Parrainer 100 nouveaux utilisateurs',
      category: 'social',
      progress: 73,
      target: 100,
      reward: 'Badge exclusif',
      unlocked: false
    }
  ],
  challenges: [
    {
      id: '1',
      title: 'Défi Hebdomadaire',
      description: 'Effectuer 20 transactions cette semaine',
      timeLeft: '3j 14h',
      participants: 1250,
      reward: '1000 points',
      difficulty: 'medium',
      progress: 65
    },
    {
      id: '2',
      title: 'Super Challenge',
      description: 'Parrainer 5 amis ce mois-ci',
      timeLeft: '12j 8h',
      participants: 890,
      reward: 'Badge Légende',
      difficulty: 'hard',
      progress: 40
    }
  ],
  streaks: [
    { id: '1', type: 'daily_login', current: 15, best: 32, multiplier: 1.5 },
    { id: '2', type: 'transactions', current: 8, best: 12, multiplier: 1.2 },
    { id: '3', type: 'referrals', current: 3, best: 7, multiplier: 2.0 }
  ]
};

export default function StatistiquesGamification() {
  const [stats] = useState<GamificationStats>(mockStats);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements' | 'challenges'>('overview');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'epic': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'rare': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'common': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return <Trophy className="w-6 h-6" />;
      case 'users': return <Users className="w-6 h-6" />;
      case 'flame': return <Flame className="w-6 h-6" />;
      case 'target': return <Target className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'daily_login': return <Flame className="w-4 h-4" />;
      case 'transactions': return <Zap className="w-4 h-4" />;
      case 'referrals': return <Users className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getStreakName = (type: string) => {
    switch (type) {
      case 'daily_login': return 'Connexion quotidienne';
      case 'transactions': return 'Transactions quotidiennes';
      case 'referrals': return 'Parrainages hebdomadaires';
      default: return type;
    }
  };

  const levelProgress = ((stats.totalPoints / stats.nextLevelPoints) * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Statistiques de Gamification</h3>
            <p className="text-sm text-gray-500">Engagement et progression des utilisateurs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm text-gray-500">Niveau actuel</div>
            <div className="text-2xl font-bold text-yellow-600">
              <Crown className="w-6 h-6 inline mr-1" />
              {stats.level}
            </div>
          </div>
        </div>
      </div>

      {/* Progression du niveau */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700">Progression vers le niveau {stats.level + 1}</span>
          <span className="text-sm text-gray-600">{stats.totalPoints.toLocaleString()} / {stats.nextLevelPoints.toLocaleString()} points</span>
        </div>
        <div className="w-full bg-white rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(levelProgress, 100)}%` }}
          ></div>
        </div>
        <div className="text-right text-sm text-gray-600 mt-1">
          {levelProgress.toFixed(1)}%
        </div>
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'badges', label: 'Badges', icon: <Medal className="w-4 h-4" /> },
          { id: 'achievements', label: 'Succès', icon: <Award className="w-4 h-4" /> },
          { id: 'challenges', label: 'Défis', icon: <Target className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-white text-yellow-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Points totaux</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalPoints.toLocaleString()}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Medal className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Badges</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.badges.filter(b => b.unlockedAt).length}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Série active</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{Math.max(...stats.streaks.map(s => s.current))}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">Classement</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">#15</div>
            </div>
          </div>

          {/* Séries actives */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Séries actives</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.streaks.map((streak) => (
                <div key={streak.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getStreakIcon(streak.type)}
                    <span className="font-medium text-gray-700">{getStreakName(streak.type)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-orange-600">{streak.current}</div>
                      <div className="text-xs text-gray-500">Record: {streak.best}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">x{streak.multiplier}</div>
                      <div className="text-xs text-gray-500">Multiplicateur</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Classement */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Classement Général</h4>
            <div className="space-y-2">
              {stats.leaderboard.map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      entry.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                      entry.rank === 2 ? 'bg-gray-100 text-gray-600' :
                      entry.rank === 3 ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {entry.rank}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{entry.userName}</div>
                      <div className="text-sm text-gray-500">Niveau {entry.level}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-800">{entry.points.toLocaleString()} pts</div>
                    <div className={`text-xs flex items-center gap-1 ${
                      entry.trend === 'up' ? 'text-green-600' :
                      entry.trend === 'down' ? 'text-red-600' :
                      'text-gray-500'
                    }`}>
                      {entry.trend === 'up' && '↗'} 
                      {entry.trend === 'down' && '↘'}
                      {entry.change !== 0 && Math.abs(entry.change)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.badges.map((badge) => (
            <div key={badge.id} className={`border rounded-lg p-4 ${getRarityColor(badge.rarity)}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getBadgeIcon(badge.icon)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{badge.name}</h4>
                  <p className="text-sm opacity-75">{badge.description}</p>
                </div>
              </div>
              {badge.progress !== undefined && badge.maxProgress && !badge.unlockedAt && (
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progression</span>
                    <span>{badge.progress}/{badge.maxProgress}</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                    <div 
                      className="bg-current h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="text-xs opacity-60">
                {badge.unlockedAt ? 
                  `Débloqué le ${new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}` :
                  'En cours...'
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {stats.achievements.map((achievement) => (
            <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                    {achievement.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">{achievement.reward}</div>
                  <div className="text-xs text-gray-500">Récompense</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progression</span>
                  <span>{achievement.progress.toLocaleString()} / {achievement.target.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {((achievement.progress / achievement.target) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {stats.challenges.map((challenge) => (
            <div key={challenge.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{challenge.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>⏰ {challenge.timeLeft}</span>
                    <span>👥 {challenge.participants} participants</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">{challenge.reward}</div>
                  <div className="text-xs text-gray-500">Récompense</div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progression</span>
                  <span>{challenge.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${challenge.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
