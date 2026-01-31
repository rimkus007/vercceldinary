"use client";

import { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock,
  Calendar,
  BarChart3,
  AlertTriangle,
  Award,
  Zap,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Edit
} from 'lucide-react';

interface Objective {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'global' | 'regional';
  category: 'transactions' | 'referrals' | 'engagement' | 'milestones';
  status: 'active' | 'paused' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  target: {
    metric: string;
    value: number;
    unit: string;
  };
  progress: {
    current: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    weeklyChange: number;
  };
  participants: {
    total: number;
    active: number;
    completed: number;
  };
  timeline: {
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
  rewards: {
    individual: string;
    collective?: string;
  };
  regions?: string[];
  userTypes?: string[];
  createdAt: string;
  lastUpdated: string;
}

interface ProgressMetrics {
  totalObjectives: number;
  activeObjectives: number;
  completedThisWeek: number;
  overallProgress: number;
  participationRate: number;
  successRate: number;
}

export default function WeeklyObjectivesProgressPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [filteredObjectives, setFilteredObjectives] = useState<Objective[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockObjectives: Objective[] = [
      {
        id: '1',
        title: 'Weekly Transaction Boost',
        description: 'Increase transaction volume by 25% compared to last week',
        type: 'global',
        category: 'transactions',
        status: 'active',
        priority: 'high',
        target: {
          metric: 'Transaction Volume',
          value: 125,
          unit: '% of last week'
        },
        progress: {
          current: 87.5,
          percentage: 70,
          trend: 'up',
          weeklyChange: 12.3
        },
        participants: {
          total: 5420,
          active: 4230,
          completed: 1890
        },
        timeline: {
          startDate: '2025-06-01',
          endDate: '2025-06-07',
          daysRemaining: 3
        },
        rewards: {
          individual: '100 XP + 50 Coins per user',
          collective: '2x XP Multiplier for all users if target reached'
        },
        regions: ['All'],
        userTypes: ['all'],
        createdAt: '2025-06-01',
        lastUpdated: '2025-06-02'
      },
      {
        id: '2',
        title: 'Referral Champions',
        description: 'Generate 500 new user referrals this week',
        type: 'global',
        category: 'referrals',
        status: 'active',
        priority: 'medium',
        target: {
          metric: 'New Referrals',
          value: 500,
          unit: 'users'
        },
        progress: {
          current: 342,
          percentage: 68.4,
          trend: 'up',
          weeklyChange: 8.7
        },
        participants: {
          total: 2140,
          active: 1680,
          completed: 156
        },
        timeline: {
          startDate: '2025-06-01',
          endDate: '2025-06-07',
          daysRemaining: 3
        },
        rewards: {
          individual: '200 XP + Referral Master Badge',
          collective: 'Bonus weekend XP event'
        },
        regions: ['All'],
        userTypes: ['all'],
        createdAt: '2025-06-01',
        lastUpdated: '2025-06-02'
      },
      {
        id: '3',
        title: 'Alger Region Challenge',
        description: 'Achieve 90% daily login rate for Alger users',
        type: 'regional',
        category: 'engagement',
        status: 'active',
        priority: 'medium',
        target: {
          metric: 'Daily Login Rate',
          value: 90,
          unit: '%'
        },
        progress: {
          current: 85.2,
          percentage: 94.7,
          trend: 'up',
          weeklyChange: 3.2
        },
        participants: {
          total: 1240,
          active: 1056,
          completed: 0
        },
        timeline: {
          startDate: '2025-06-01',
          endDate: '2025-06-07',
          daysRemaining: 3
        },
        rewards: {
          individual: '50 XP per day + Regional Champion Badge'
        },
        regions: ['Alger'],
        userTypes: ['all'],
        createdAt: '2025-06-01',
        lastUpdated: '2025-06-02'
      },
      {
        id: '4',
        title: 'Premium User Milestone',
        description: 'Premium users complete 1000 combined transactions',
        type: 'team',
        category: 'milestones',
        status: 'active',
        priority: 'low',
        target: {
          metric: 'Combined Transactions',
          value: 1000,
          unit: 'transactions'
        },
        progress: {
          current: 756,
          percentage: 75.6,
          trend: 'stable',
          weeklyChange: 0.8
        },
        participants: {
          total: 340,
          active: 298,
          completed: 0
        },
        timeline: {
          startDate: '2025-06-01',
          endDate: '2025-06-07',
          daysRemaining: 3
        },
        rewards: {
          individual: 'Premium Boost Pack + 150 XP',
          collective: 'Exclusive Premium Features Preview'
        },
        regions: ['All'],
        userTypes: ['premium'],
        createdAt: '2025-06-01',
        lastUpdated: '2025-06-02'
      },
      {
        id: '5',
        title: 'Weekend Engagement Surge',
        description: 'Maintain 80% user activity during weekend days',
        type: 'global',
        category: 'engagement',
        status: 'completed',
        priority: 'medium',
        target: {
          metric: 'Weekend Activity Rate',
          value: 80,
          unit: '%'
        },
        progress: {
          current: 82.4,
          percentage: 103,
          trend: 'up',
          weeklyChange: 5.2
        },
        participants: {
          total: 4850,
          active: 4850,
          completed: 4850
        },
        timeline: {
          startDate: '2025-05-25',
          endDate: '2025-05-31',
          daysRemaining: 0
        },
        rewards: {
          individual: '75 XP + Weekend Warrior Badge',
          collective: 'Monday Bonus XP Event (completed)'
        },
        regions: ['All'],
        userTypes: ['all'],
        createdAt: '2025-05-25',
        lastUpdated: '2025-05-31'
      }
    ];

    setTimeout(() => {
      setObjectives(mockObjectives);
      setFilteredObjectives(mockObjectives);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter objectives
  useEffect(() => {
    let filtered = objectives;

    if (searchTerm) {
      filtered = filtered.filter(obj =>
        obj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(obj => obj.status === selectedFilter);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(obj => obj.category === selectedCategory);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(obj => obj.priority === selectedPriority);
    }

    setFilteredObjectives(filtered);
  }, [objectives, searchTerm, selectedFilter, selectedCategory, selectedPriority]);

  const getStatusColor = (status: Objective['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: Objective['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const metrics: ProgressMetrics = {
    totalObjectives: objectives.length,
    activeObjectives: objectives.filter(obj => obj.status === 'active').length,
    completedThisWeek: objectives.filter(obj => obj.status === 'completed').length,
    overallProgress: objectives.reduce((sum, obj) => sum + obj.progress.percentage, 0) / objectives.length || 0,
    participationRate: objectives.reduce((sum, obj) => sum + (obj.participants.active / obj.participants.total), 0) / objectives.length * 100 || 0,
    successRate: (objectives.filter(obj => obj.status === 'completed').length / objectives.length) * 100 || 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Objectives Progress</h1>
            <p className="text-gray-600">Track progress and performance of weekly objectives</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <BarChart3 className="w-5 h-5 mr-2" />
              Analytics
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Target className="w-5 h-5 mr-2" />
              Create Objective
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Objectives</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalObjectives}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeObjectives}</p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.completedThisWeek}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.overallProgress.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Participation</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.participationRate.toFixed(1)}%</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{metrics.successRate.toFixed(1)}%</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search objectives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="transactions">Transactions</option>
              <option value="referrals">Referrals</option>
              <option value="engagement">Engagement</option>
              <option value="milestones">Milestones</option>
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Objectives List */}
      <div className="space-y-6">
        {filteredObjectives.map((objective) => (
          <div key={objective.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{objective.title}</h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(objective.status)}`}>
                      {objective.status}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(objective.priority)}`}>
                      {objective.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{objective.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(objective.timeline.startDate).toLocaleDateString()} - {new Date(objective.timeline.endDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {objective.timeline.daysRemaining} days remaining
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {objective.participants.total} participants
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Target & Progress */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-gray-900">Progress</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(objective.progress.trend, objective.progress.weeklyChange)}
                      <span className={`text-sm font-medium ${
                        objective.progress.trend === 'up' ? 'text-green-600' : 
                        objective.progress.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {objective.progress.weeklyChange > 0 ? '+' : ''}{objective.progress.weeklyChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {objective.target.metric}: {objective.progress.current.toFixed(1)} / {objective.target.value} {objective.target.unit}
                      </span>
                      <span className="text-sm text-gray-600">{objective.progress.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          objective.progress.percentage >= 100 ? 'bg-green-500' :
                          objective.progress.percentage >= 75 ? 'bg-blue-500' :
                          objective.progress.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(objective.progress.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Participants Stats */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Participation</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="text-sm font-medium text-gray-900">{objective.participants.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active</span>
                      <span className="text-sm font-medium text-green-600">{objective.participants.active}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="text-sm font-medium text-blue-600">{objective.participants.completed}</span>
                    </div>
                    <div className="pt-2">
                      <div className="text-sm text-gray-600 mb-1">
                        Activity Rate: {((objective.participants.active / objective.participants.total) * 100).toFixed(1)}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(objective.participants.active / objective.participants.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rewards & Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900 mb-1">Rewards</h5>
                  <div className="text-sm text-gray-600">
                    <div>Individual: {objective.rewards.individual}</div>
                    {objective.rewards.collective && (
                      <div>Collective: {objective.rewards.collective}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {objective.status === 'active' && (
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  )}
                  {objective.status === 'paused' && (
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Play className="w-4 h-4" />
                      Resume
                    </button>
                  )}
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredObjectives.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No objectives found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
