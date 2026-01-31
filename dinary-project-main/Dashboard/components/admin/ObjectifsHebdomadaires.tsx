'use client'

import { useState } from 'react';
import { 
  Target, CheckCircle, Clock, TrendingUp, 
  Users, CreditCard, Star, Award,
  Calendar, BarChart3, Plus, Edit
} from 'lucide-react';

interface WeeklyObjective {
  id: string;
  title: string;
  description: string;
  category: 'growth' | 'quality' | 'revenue' | 'engagement';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string[];
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
  }[];
}

// Mock data
const mockObjectives: WeeklyObjective[] = [
  {
    id: '1',
    title: 'Augmenter les inscriptions',
    description: 'Atteindre 1000 nouvelles inscriptions cette semaine',
    category: 'growth',
    priority: 'high',
    startDate: '2025-05-26',
    endDate: '2025-06-02',
    currentValue: 750,
    targetValue: 1000,
    unit: 'inscriptions',
    progress: 75,
    status: 'in_progress',
    assignedTo: ['Équipe Marketing', 'Équipe Produit'],
    milestones: [
      { id: 'm1', title: 'Lancer campagne publicitaire', completed: true, completedAt: '2025-05-27' },
      { id: 'm2', title: 'Optimiser processus inscription', completed: true, completedAt: '2025-05-28' },
      { id: 'm3', title: 'Atteindre 500 inscriptions', completed: true, completedAt: '2025-05-30' },
      { id: 'm4', title: 'Atteindre objectif final', completed: false }
    ]
  },
  {
    id: '2',
    title: 'Améliorer le taux de conversion',
    description: 'Passer de 12% à 15% de taux de conversion des visiteurs',
    category: 'quality',
    priority: 'medium',
    startDate: '2025-05-26',
    endDate: '2025-06-02',
    currentValue: 13.5,
    targetValue: 15,
    unit: '%',
    progress: 50,
    status: 'in_progress',
    assignedTo: ['Équipe UX', 'Équipe Analytics'],
    milestones: [
      { id: 'm5', title: 'Analyser points de friction', completed: true, completedAt: '2025-05-27' },
      { id: 'm6', title: 'Implémenter améliorations UX', completed: true, completedAt: '2025-05-29' },
      { id: 'm7', title: 'Tests A/B nouvelles pages', completed: false },
      { id: 'm8', title: 'Atteindre 15% conversion', completed: false }
    ]
  },
  {
    id: '3',
    title: 'Volume de transactions',
    description: 'Traiter 50M DA de transactions cette semaine',
    category: 'revenue',
    priority: 'high',
    startDate: '2025-05-26',
    endDate: '2025-06-02',
    currentValue: 52000000,
    targetValue: 50000000,
    unit: 'DA',
    progress: 104,
    status: 'completed',
    assignedTo: ['Équipe Commercial', 'Équipe Partenariats'],
    milestones: [
      { id: 'm9', title: 'Signer 3 nouveaux partenaires', completed: true, completedAt: '2025-05-28' },
      { id: 'm10', title: 'Atteindre 25M DA', completed: true, completedAt: '2025-05-29' },
      { id: 'm11', title: 'Atteindre 40M DA', completed: true, completedAt: '2025-05-31' },
      { id: 'm12', title: 'Dépasser objectif 50M DA', completed: true, completedAt: '2025-06-01' }
    ]
  },
  {
    id: '4',
    title: 'Engagement utilisateurs',
    description: 'Atteindre 85% d\'utilisateurs actifs quotidiens',
    category: 'engagement',
    priority: 'medium',
    startDate: '2025-05-26',
    endDate: '2025-06-02',
    currentValue: 78,
    targetValue: 85,
    unit: '%',
    progress: 60,
    status: 'in_progress',
    assignedTo: ['Équipe Produit', 'Équipe Support'],
    milestones: [
      { id: 'm13', title: 'Lancer programme fidélité', completed: true, completedAt: '2025-05-27' },
      { id: 'm14', title: 'Améliorer notifications push', completed: false },
      { id: 'm15', title: 'Organiser événements gamifiés', completed: false },
      { id: 'm16', title: 'Atteindre 85% engagement', completed: false }
    ]
  }
];

export default function ObjectifsHebdomadaires() {
  const [objectives] = useState<WeeklyObjective[]>(mockObjectives);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'growth': return <TrendingUp className="w-4 h-4" />;
      case 'quality': return <Star className="w-4 h-4" />;
      case 'revenue': return <CreditCard className="w-4 h-4" />;
      case 'engagement': return <Users className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'growth': return 'text-green-600 bg-green-50';
      case 'quality': return 'text-blue-600 bg-blue-50';
      case 'revenue': return 'text-purple-600 bg-purple-50';
      case 'engagement': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'not_started': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const filteredObjectives = objectives.filter(objective => 
    selectedCategory === 'all' || objective.category === selectedCategory
  );

  const formatValue = (value: number, unit: string) => {
    if (unit === 'DA') {
      return `${(value / 1000000).toFixed(1)}M DA`;
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'growth': return 'Croissance';
      case 'quality': return 'Qualité';
      case 'revenue': return 'Revenus';
      case 'engagement': return 'Engagement';
      default: return category;
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'overdue': return 'En retard';
      case 'not_started': return 'Pas commencé';
      default: return status;
    }
  };

  const completedObjectives = objectives.filter(o => o.status === 'completed').length;
  const totalObjectives = objectives.length;
  const overallProgress = objectives.reduce((sum, obj) => sum + obj.progress, 0) / objectives.length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Objectifs Hebdomadaires</h3>
            <p className="text-sm text-gray-500">Suivi des objectifs pour la semaine du 26 mai au 2 juin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-500">Progression globale</div>
            <div className="text-lg font-semibold text-blue-600">{overallProgress.toFixed(0)}%</div>
          </div>
          <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Terminés</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{completedObjectives}/{totalObjectives}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">En cours</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {objectives.filter(o => o.status === 'in_progress').length}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-800">Moyenne</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{overallProgress.toFixed(0)}%</div>
        </div>
      </div>

      {/* Filtre par catégorie */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Toutes
        </button>
        {['growth', 'quality', 'revenue', 'engagement'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              selectedCategory === category 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {getCategoryIcon(category)}
            {getCategoryName(category)}
          </button>
        ))}
      </div>

      {/* Liste des objectifs */}
      <div className="space-y-4">
        {filteredObjectives.map((objective) => (
          <div key={objective.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-800">{objective.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(objective.category)}`}>
                    {getCategoryName(objective.category)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(objective.priority)}`}>
                    {objective.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(objective.status)}`}>
                    {getStatusName(objective.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{objective.description}</p>
                
                {/* Progression */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progression</span>
                    <span className="font-medium">
                      {formatValue(objective.currentValue, objective.unit)} / {formatValue(objective.targetValue, objective.unit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(objective.progress)}`}
                      style={{ width: `${Math.min(objective.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {objective.progress.toFixed(0)}%
                  </div>
                </div>

                {/* Équipes assignées */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Users className="w-4 h-4" />
                  <span>Équipes: {objective.assignedTo.join(', ')}</span>
                </div>

                {/* Milestones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {objective.milestones.map((milestone) => (
                    <div 
                      key={milestone.id} 
                      className={`flex items-center gap-2 text-sm p-2 rounded ${
                        milestone.completed ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={milestone.completed ? 'line-through' : ''}>{milestone.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                {objective.status === 'completed' && (
                  <div className="p-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredObjectives.length === 0 && (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun objectif trouvé pour cette catégorie</p>
        </div>
      )}
    </div>
  );
}
