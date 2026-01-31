'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  RotateCcw,
  Target,
  Calendar,
  Users,
  Award,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ObjectiveTemplate {
  id: string;
  name: string;
  description: string;
  category: 'revenue' | 'users' | 'transactions' | 'engagement';
  targetType: 'percentage' | 'absolute' | 'ratio';
  defaultTarget: number;
  unit: string;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  rewards: {
    points: number;
    badge?: string;
    bonus?: number;
  };
}

interface NotificationSettings {
  id: string;
  type: 'progress' | 'deadline' | 'completion' | 'failure';
  enabled: boolean;
  threshold?: number;
  recipients: string[];
  template: string;
}

export default function WeeklyObjectivesConfigPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'settings' | 'notifications'>('templates');
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);

  // Mock data for objective templates
  const [templates, setTemplates] = useState<ObjectiveTemplate[]>([
    {
      id: '1',
      name: 'Augmentation du chiffre d\'affaires',
      description: 'Augmenter le chiffre d\'affaires hebdomadaire de X%',
      category: 'revenue',
      targetType: 'percentage',
      defaultTarget: 15,
      unit: '%',
      priority: 'high',
      isActive: true,
      rewards: {
        points: 500,
        badge: 'Revenue Booster',
        bonus: 1000
      }
    },
    {
      id: '2',
      name: 'Acquisition d\'utilisateurs',
      description: 'Acquérir X nouveaux utilisateurs actifs',
      category: 'users',
      targetType: 'absolute',
      defaultTarget: 100,
      unit: 'utilisateurs',
      priority: 'high',
      isActive: true,
      rewards: {
        points: 300,
        badge: 'User Magnet'
      }
    },
    {
      id: '3',
      name: 'Volume de transactions',
      description: 'Traiter X transactions dans la semaine',
      category: 'transactions',
      targetType: 'absolute',
      defaultTarget: 500,
      unit: 'transactions',
      priority: 'medium',
      isActive: true,
      rewards: {
        points: 200
      }
    },
    {
      id: '4',
      name: 'Taux d\'engagement',
      description: 'Maintenir un taux d\'engagement de X%',
      category: 'engagement',
      targetType: 'percentage',
      defaultTarget: 80,
      unit: '%',
      priority: 'medium',
      isActive: false,
      rewards: {
        points: 150,
        badge: 'Engagement Expert'
      }
    }
  ]);

  // Mock data for notification settings
  const [notifications, setNotifications] = useState<NotificationSettings[]>([
    {
      id: '1',
      type: 'progress',
      enabled: true,
      threshold: 50,
      recipients: ['admin@dinary.com', 'manager@dinary.com'],
      template: 'Progression de {objectiveName}: {progress}% atteint'
    },
    {
      id: '2',
      type: 'deadline',
      enabled: true,
      threshold: 24,
      recipients: ['admin@dinary.com'],
      template: 'Rappel: {objectiveName} se termine dans {timeLeft} heures'
    },
    {
      id: '3',
      type: 'completion',
      enabled: true,
      recipients: ['admin@dinary.com', 'team@dinary.com'],
      template: 'Félicitations! Objectif {objectiveName} atteint avec {result}'
    },
    {
      id: '4',
      type: 'failure',
      enabled: true,
      recipients: ['admin@dinary.com'],
      template: 'Objectif {objectiveName} non atteint: {progress}% réalisé'
    }
  ]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return '💰';
      case 'users': return '👥';
      case 'transactions': return '💳';
      case 'engagement': return '❤️';
      default: return '📊';
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

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'progress': return <Target className="w-4 h-4" />;
      case 'deadline': return <Calendar className="w-4 h-4" />;
      case 'completion': return <CheckCircle className="w-4 h-4" />;
      case 'failure': return <AlertTriangle className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuration des Objectifs</h1>
          <p className="text-gray-600">Gérer les modèles d'objectifs et paramètres système</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'templates'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Modèles d'Objectifs
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'settings'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Paramètres
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'notifications'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Notifications
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Modèles d'Objectifs</h2>
            <button
              onClick={() => setShowNewTemplate(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau Modèle
            </button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <p className="text-gray-600">{template.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(template.priority)}`}>
                        {template.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {template.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Objectif par défaut</p>
                      <p className="font-semibold">{template.defaultTarget} {template.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-semibold capitalize">{template.targetType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="font-semibold">{template.rewards.points}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Badge</p>
                      <p className="font-semibold">{template.rewards.badge || 'Aucun'}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingTemplate(template.id)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1">
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Paramètres Système</h2>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Généraux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Durée par défaut (jours)</label>
                    <input
                      type="number"
                      defaultValue="7"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Objectifs actifs simultanés (max)</label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Auto-création</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="manual">Manuel</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Participation obligatoire</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="false">Non</option>
                      <option value="true">Oui</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Récompenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Points minimum</label>
                    <input
                      type="number"
                      defaultValue="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Points maximum</label>
                    <input
                      type="number"
                      defaultValue="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bonus maximum (DZD)</label>
                    <input
                      type="number"
                      defaultValue="5000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Réinitialiser
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Configuration des Notifications</h2>
          
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {getNotificationTypeIcon(notification.type)}
                      <div>
                        <h3 className="font-semibold capitalize">{notification.type}</h3>
                        <p className="text-gray-600">{notification.template}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notification.enabled}
                          className="sr-only peer"
                          onChange={() => {
                            setNotifications(prev => prev.map(n => 
                              n.id === notification.id 
                                ? { ...n, enabled: !n.enabled }
                                : n
                            ));
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {notification.threshold && (
                      <div>
                        <p className="text-sm text-gray-600">Seuil de déclenchement</p>
                        <p className="font-semibold">{notification.threshold}{notification.type === 'progress' ? '%' : 'h'}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Destinataires</p>
                      <p className="font-semibold">{notification.recipients.length} personne(s)</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center gap-1">
                      <Edit3 className="w-4 h-4" />
                      Modifier
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
