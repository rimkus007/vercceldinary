'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  contact: string;
  image: string;
  dateEmbauche?: string;
  salaire?: number;
  performance?: number;
  ventesMois?: number;
  niveau?: number;
  exp?: number;
  badges?: string[];
  achievements?: Achievement[];
  competences?: { nom: string; niveau: number }[];
  ventesParMois?: { mois: string; montant: number }[];
  objectifs?: { nom: string; progression: number; total: number }[];
  activitesRecentes?: { date: string; description: string; type: string }[];
}

const initialEmployees: Employee[] = [
  { 
    id: 1, 
    name: 'Sofia Benali', 
    role: 'Gérante', 
    contact: '0661234567',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    dateEmbauche: '2023-01-15',
    salaire: 65000,
    performance: 95,
    ventesMois: 12500,
    niveau: 8,
    exp: 780,
    badges: ['🏆', '🌟', '💯'],
    achievements: [
      { id: 1, title: "Leader Exemplaire", description: "A dirigé l'équipe vers un record de ventes", icon: "👑", unlocked: true },
      { id: 2, title: "Visionnaire", description: "A mis en place 3 nouvelles stratégies de vente", icon: "🔮", unlocked: true },
      { id: 3, title: "Mentor", description: "A formé 5 nouveaux employés", icon: "📚", unlocked: false }
    ],
    competences: [
      { nom: "Leadership", niveau: 95 },
      { nom: "Communication", niveau: 90 },
      { nom: "Négociation", niveau: 85 },
      { nom: "Résolution de problèmes", niveau: 92 },
      { nom: "Gestion d'équipe", niveau: 88 }
    ],
    ventesParMois: [
      { mois: "Jan", montant: 10200 },
      { mois: "Fév", montant: 11500 },
      { mois: "Mar", montant: 9800 },
      { mois: "Avr", montant: 12300 },
      { mois: "Mai", montant: 12500 }
    ],
    objectifs: [
      { nom: "Augmenter les ventes de 15%", progression: 83, total: 100 },
      { nom: "Former 3 nouveaux employés", progression: 2, total: 3 },
      { nom: "Réduire les coûts opérationnels", progression: 65, total: 100 },
    ],
    activitesRecentes: [
      { date: "10 Mai", description: "A supervisé une vente de 5000 DA", type: "vente" },
      { date: "09 Mai", description: "A commencé la formation d'un nouvel employé", type: "formation" },
      { date: "07 Mai", description: "A participé à la réunion stratégique", type: "reunion" },
      { date: "05 Mai", description: "A finalisé l'inventaire mensuel", type: "admin" },
      { date: "03 Mai", description: "A réalisé une vente de 3500 DA", type: "vente" },
    ]
  },
  { 
    id: 2, 
    name: 'Karim Hadj', 
    role: 'Vendeur', 
    contact: '0662345678',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    dateEmbauche: '2023-03-22',
    salaire: 42000,
    performance: 88,
    ventesMois: 8200,
    niveau: 5,
    exp: 420,
    badges: ['🚀', '🌱'],
    achievements: [
      { id: 1, title: "Première Vente", description: "A réalisé sa première vente", icon: "🎯", unlocked: true },
      { id: 2, title: "Expert en Vente", description: "A atteint 100 ventes", icon: "💼", unlocked: true },
      { id: 3, title: "Vendeur du Mois", description: "A été nommé vendeur du mois", icon: "🏅", unlocked: false }
    ],
    competences: [
      { nom: "Vente", niveau: 88 },
      { nom: "Service client", niveau: 92 },
      { nom: "Connaissance des produits", niveau: 85 },
      { nom: "Communication", niveau: 80 },
      { nom: "Gestion du temps", niveau: 75 }
    ],
    ventesParMois: [
      { mois: "Jan", montant: 6500 },
      { mois: "Fév", montant: 7200 },
      { mois: "Mar", montant: 6800 },
      { mois: "Avr", montant: 7800 },
      { mois: "Mai", montant: 8200 }
    ],
    objectifs: [
      { nom: "Atteindre 10000 DA de ventes mensuelles", progression: 82, total: 100 },
      { nom: "Obtenir certification de vente avancée", progression: 40, total: 100 },
      { nom: "Améliorer la satisfaction client", progression: 90, total: 100 },
    ],
    activitesRecentes: [
      { date: "10 Mai", description: "A réalisé une vente de 2800 DA", type: "vente" },
      { date: "08 Mai", description: "A participé à l'atelier de formation", type: "formation" },
      { date: "07 Mai", description: "A géré 5 clients", type: "client" },
      { date: "05 Mai", description: "A réalisé une vente de 2200 DA", type: "vente" },
      { date: "02 Mai", description: "A réorganisé l'espace d'exposition", type: "admin" },
    ]
  },
  { 
    id: 3, 
    name: 'Amina Kaci', 
    role: 'Comptable', 
    contact: '0663456789',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    dateEmbauche: '2023-05-10',
    salaire: 48000,
    performance: 91,
    ventesMois: 0,
    niveau: 4,
    exp: 350,
    badges: ['📊', '💼'],
    achievements: [
      { id: 1, title: "Organisateur", description: "A optimisé le système de comptabilité", icon: "📋", unlocked: true },
      { id: 2, title: "Économe", description: "A réduit les coûts de 10%", icon: "💰", unlocked: true },
      { id: 3, title: "Comptable Certifié", description: "A obtenu une certification professionnelle", icon: "🎓", unlocked: false }
    ],
    competences: [
      { nom: "Comptabilité", niveau: 95 },
      { nom: "Analyse financière", niveau: 88 },
      { nom: "Organisation", niveau: 92 },
      { nom: "Logiciels financiers", niveau: 85 },
      { nom: "Gestion budgétaire", niveau: 90 }
    ],
    ventesParMois: [],
    objectifs: [
      { nom: "Optimiser le système comptable", progression: 75, total: 100 },
      { nom: "Réduire les délais de paiement", progression: 60, total: 100 },
      { nom: "Finaliser le rapport annuel", progression: 90, total: 100 },
    ],
    activitesRecentes: [
      { date: "10 Mai", description: "A préparé le rapport financier hebdomadaire", type: "rapport" },
      { date: "09 Mai", description: "A traité les factures mensuelles", type: "admin" },
      { date: "08 Mai", description: "A rencontré l'auditeur externe", type: "reunion" },
      { date: "06 Mai", description: "A optimisé le système de facturation", type: "admin" },
      { date: "04 Mai", description: "A participé à la formation fiscale", type: "formation" },
    ]
  }
];

export default function EmployeeDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardType, setRewardType] = useState<'badge' | 'level' | ''>('');
  const [showPulseEffect, setShowPulseEffect] = useState(false);
  
  useEffect(() => {
    // Simulation de chargement des données
    setTimeout(() => {
      const foundEmployee = initialEmployees.find(emp => emp.id === parseInt(params.id));
      if (foundEmployee) {
        setEmployee(foundEmployee);
      }
      setLoading(false);
      
      // Effet visuel pour attirer l'attention
      setTimeout(() => {
        setShowPulseEffect(true);
        setTimeout(() => setShowPulseEffect(false), 2000);
      }, 1000);
    }, 500);
  }, [params.id]);

  const handleUnlockAchievement = async (achievementId: number) => {
    if (!employee) return;
    
    const updatedEmployee = {...employee};
    if (updatedEmployee.achievements) {
      const achievement = updatedEmployee.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        setEmployee(updatedEmployee);
        
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleAddBadge = async () => {
    if (!employee) return;
    
    // Liste des badges disponibles
    const availableBadges = ['🏆', '🌟', '💯', '🚀', '🌱', '📊', '💼', '🔥', '⚡', '💡'];
    
    // Trouver un badge que l'employé n'a pas encore
    const newBadge = availableBadges.find(badge => 
      !employee.badges?.includes(badge)
    );
    
    if (newBadge) {
      const updatedEmployee = {...employee};
      updatedEmployee.badges = [...(updatedEmployee.badges || []), newBadge];
      setEmployee(updatedEmployee);
      
      // Afficher modal de récompense
      setRewardType('badge');
      setShowRewardModal(true);
      
      // Lancer les confettis
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };
  
  const handleLevelUp = async () => {
    if (!employee) return;
    
    const updatedEmployee = {...employee};
    updatedEmployee.niveau = (updatedEmployee.niveau || 1) + 1;
    updatedEmployee.exp = 0;
    setEmployee(updatedEmployee);
    
    // Afficher modal de récompense
    setRewardType('level');
    setShowRewardModal(true);
    
    // Lancer des confettis plus spectaculaires
    const confetti = (await import('canvas-confetti')).default;
    const end = Date.now() + 1000;
    
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const calculateLevelProgress = (exp: number = 0) => {
    return (exp % 100) / 100 * 100;
  };

  if (loading) {
    return (
      <main className="p-4 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 shadow-lg"></div>
          <div className="h-5 bg-gray-200 rounded w-40 mx-auto shadow"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto mt-3 shadow"></div>
          <div className="mt-8 flex gap-3 justify-center">
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!employee) {
    return (
      <main className="p-4 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
        <div className="text-center py-10 max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Employé non trouvé</h2>
          <p className="text-gray-600 mb-8">Nous n'avons pas pu trouver l'employé avec l'ID: {params.id}</p>
          <Link href="/employes" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-md">
            Retour à la liste
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 pb-28 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      {/* Header amélioré */}
      <header className="mb-8 relative">
        <Link href="/employes" className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all">
          <span className="text-gray-600 text-xl">←</span>
        </Link>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center">
          Profil de Talent
        </h1>
      </header>

      {/* Carte profil améliorée */}
      <div className="bg-white rounded-2xl p-6 shadow-xl mb-8 relative overflow-hidden">
        {/* Badge d'étoile en fond avec effet */}
        <div className="absolute -right-12 -top-12 opacity-5">
          <div className="text-[150px]">⭐</div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative mx-auto sm:mx-0">
              <div className={`rounded-full p-1 ${showPulseEffect ? 'bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse' : 'bg-gradient-to-r from-purple-300 to-blue-300'}`}>
                <img 
                  src={employee.image} 
                  alt={employee.name} 
                  className="w-28 h-28 rounded-full object-cover border-4 border-white"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-base font-bold border-2 border-white shadow-lg">
                {employee.niveau || 1}
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 justify-center sm:justify-start">
                <h2 className="text-2xl font-bold text-gray-800">{employee.name}</h2>
                <div className="flex gap-1 justify-center sm:justify-start mt-1 sm:mt-0">
                  {employee.badges && employee.badges.map((badge, i) => (
                    <span key={i} className="animate-pulse text-xl">{badge}</span>
                  ))}
                </div>
              </div>
              <div className="mt-1">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-full">
                  {employee.role}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 justify-center sm:justify-start text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="text-purple-500">📅</span> Embauché le: {employee.dateEmbauche}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-purple-500">📞</span> {employee.contact}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-purple-500">🆔</span> #{employee.id}
                </div>
              </div>
            </div>
          </div>
          
          {/* Barre de progression améliorée */}
          <div className="mt-6 bg-gray-50 p-4 rounded-xl shadow-inner">
            <div className="flex justify-between items-center text-sm mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-700">Niveau {employee.niveau || 1}</span>
                <div className="px-2 py-0.5 bg-purple-100 rounded text-xs text-purple-700">
                  {100 - (employee.exp || 0)} XP pour niveau {(employee.niveau || 1) + 1}
                </div>
              </div>
              <span className="font-medium text-gray-500">{employee.exp || 0}/100 XP</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 relative"
                style={{ width: `${calculateLevelProgress(employee.exp)}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 overflow-hidden rounded-full">
                  <div className="absolute inset-0 animate-pulse-slow"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions rapides améliorées */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:justify-center">
            <button
              onClick={handleAddBadge}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:opacity-95 transition-all font-medium shadow flex items-center justify-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-125 transition-all">🎖️</span> 
              <span>Attribuer un badge</span>
            </button>
            <button
              onClick={handleLevelUp}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:opacity-95 transition-all font-medium shadow flex items-center justify-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-125 transition-all">⬆️</span>
              <span>Augmenter le niveau</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Tableau de bord à onglets améliorés */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Onglets améliorés */}
        <div className="flex">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-4 text-base font-medium flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' 
              ? 'bg-gradient-to-br from-purple-50 to-blue-50 text-purple-700' 
              : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            <span className={`text-xl ${activeTab === 'stats' ? 'scale-110' : ''} transition-all`}>📊</span>
            <span>Statistiques</span>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-4 text-base font-medium flex flex-col items-center gap-1 transition-all ${activeTab === 'achievements' 
              ? 'bg-gradient-to-br from-purple-50 to-blue-50 text-purple-700' 
              : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            <span className={`text-xl ${activeTab === 'achievements' ? 'scale-110' : ''} transition-all`}>🏆</span>
            <span>Succès</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-4 text-base font-medium flex flex-col items-center gap-1 transition-all ${activeTab === 'activity' 
              ? 'bg-gradient-to-br from-purple-50 to-blue-50 text-purple-700' 
              : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            <span className={`text-xl ${activeTab === 'activity' ? 'scale-110' : ''} transition-all`}>📝</span>
            <span>Activité</span>
          </button>
        </div>
        
        {/* Contenu des onglets améliorés */}
        <div className="p-5">
          {activeTab === 'stats' && (
            <div className="space-y-8">
              {/* Résumé statistique */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-sm border border-purple-200 transition-transform hover:scale-[1.02] hover:shadow-md">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl mb-3 shadow-md">
                    ⭐
                  </div>
                  <h4 className="text-sm text-gray-500 font-medium">PERFORMANCE</h4>
                  <div className="flex items-end gap-1 mt-1">
                    <p className="text-3xl font-bold text-purple-700">{employee.performance || 0}</p>
                    <p className="text-lg font-bold text-purple-600">%</p>
                  </div>
                  <div className={`mt-2 text-xs font-medium ${employee.performance && employee.performance > 90 ? 'text-green-600' : 'text-amber-600'}`}>
                    {employee.performance && employee.performance > 90 ? '↗ Excellent' : '→ Bon'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm border border-green-200 transition-transform hover:scale-[1.02] hover:shadow-md">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl mb-3 shadow-md">
                    💵
                  </div>
                  <h4 className="text-sm text-gray-500 font-medium">SALAIRE</h4>
                  <div className="flex items-end gap-1 mt-1">
                    <p className="text-3xl font-bold text-green-700">{(employee.salaire || 0).toLocaleString()}</p>
                    <p className="text-lg font-bold text-green-600">DA</p>
                  </div>
                  <div className="mt-2 text-xs font-medium text-gray-500">
                    Mensuel
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm border border-blue-200 transition-transform hover:scale-[1.02] hover:shadow-md">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl mb-3 shadow-md">
                    {employee.role.toLowerCase().includes('vendeur') ? '💰' : '🏅'}
                  </div>
                  <h4 className="text-sm text-gray-500 font-medium">
                    {employee.role.toLowerCase().includes('vendeur') ? 'VENTES' : 'EXPÉRIENCE'}
                  </h4>
                  <div className="flex items-end gap-1 mt-1">
                    <p className="text-3xl font-bold text-blue-700">
                      {employee.role.toLowerCase().includes('vendeur') 
                        ? (employee.ventesMois || 0).toLocaleString()
                        : employee.exp || 0}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {employee.role.toLowerCase().includes('vendeur') ? 'DA' : 'XP'}
                    </p>
                  </div>
                  <div className="mt-2 text-xs font-medium text-blue-600">
                    {employee.role.toLowerCase().includes('vendeur') ? 'Ce mois-ci' : 'Progression actuelle'}
                  </div>
                </div>
              </div>
              
              {/* Compétences améliorées */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center mb-5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-md mr-3">
                    🧠
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Compétences & Expertise</h3>
                </div>
                
                <div className="space-y-4">
                  {employee.competences?.map((competence, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800">{competence.nom}</span>
                        <div className="flex items-center">
                          <span className={`text-sm font-bold ${
                            competence.niveau > 90 ? 'text-green-600' : 
                            competence.niveau > 75 ? 'text-blue-600' : 'text-amber-600'
                          }`}>
                            {competence.niveau}/100
                          </span>
                          <span className="ml-2 text-xs">
                            {competence.niveau > 90 ? '🔥 Maîtrise' : 
                             competence.niveau > 75 ? '👍 Avancé' : '👌 Intermédiaire'}
                          </span>
                        </div>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner flex">
                        <div 
                          className={`h-full rounded-full ${
                            competence.niveau > 90 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            competence.niveau > 75 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                            'bg-gradient-to-r from-amber-400 to-amber-500'
                          } relative`}
                          style={{ width: `${competence.niveau}%` }}
                        >
                          <div className="absolute inset-0 bg-white opacity-20">
                            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-45deg] animate-shine"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Graphique des ventes améliorées */}
              {employee.ventesParMois && employee.ventesParMois.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <div className="flex items-center mb-5">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-md mr-3">
                      📈
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Performance de Ventes</h3>
                  </div>
                  
                  <div className="h-48 flex items-end justify-between gap-2 pt-8 relative">
                    {/* Ligne d'objectif améliorée */}
                    <div className="absolute top-4 left-0 right-0 border-t-2 border-dashed border-red-400 flex justify-end">
                      <div className="absolute -top-4 right-0 bg-red-100 px-2 py-1 rounded-lg border border-red-200">
                        <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                          <span>🎯</span> Objectif: 10000 DA
                        </span>
                      </div>
                    </div>
                    
                    {employee.ventesParMois.map((data, index) => (
                      <div key={index} className="flex flex-col items-center flex-1 group">
                        <div className="text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {data.montant.toLocaleString()} DA
                        </div>
                        <div className="w-full">
                          <div 
                            className={`w-full rounded-t-lg ${
                              data.montant >= 10000 ? 'bg-gradient-to-b from-green-400 to-green-500' : 'bg-gradient-to-b from-blue-400 to-blue-500'
                            } relative overflow-hidden`}
                            style={{ height: `${(data.montant / 15000) * 100}%` }}
                          >
                            <div className="absolute inset-0 bg-white opacity-20">
                              <div className="w-full h-full bg-gradient-to-b from-transparent via-white to-transparent animate-pulse-slow"></div>
                            </div>
                          </div>
                        </div>
                        <div className="w-full h-1 bg-gray-200"></div>
                        <span className="text-sm font-medium text-gray-600 mt-2">{data.mois}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Objectifs améliorés */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center mb-5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xl shadow-md mr-3">
                    🎯
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Objectifs & Missions</h3>
                </div>
                
                <div className="space-y-5">
                  {employee.objectifs?.map((objectif, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {(objectif.progression / objectif.total) * 100 >= 100 ? '🏆' : 
                             (objectif.progression / objectif.total) * 100 >= 50 ? '🔄' : '🚀'}
                          </span>
                          <span className="font-medium text-gray-800">{objectif.nom}</span>
                        </div>
                        <span className="font-bold text-gray-700">
                          {Math.round((objectif.progression / objectif.total) * 100)}%
                        </span>
                      </div>
                      
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full ${
                            (objectif.progression / objectif.total) * 100 >= 100 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            (objectif.progression / objectif.total) * 100 >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                            'bg-gradient-to-r from-amber-400 to-amber-500'
                          } relative`}
                          style={{ width: `${(objectif.progression / objectif.total) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-white opacity-20">
                            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-45deg] animate-shine"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-right mt-1 text-gray-500">
                        {objectif.progression} / {objectif.total} {objectif.total === 100 ? '%' : 'unités'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'achievements' && (
            <div className="space-y-8">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xl shadow-md mr-3">
                  🏆
                </div>
                <h3 className="text-lg font-bold text-gray-800">Trophées & Récompenses</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {employee.achievements?.map((achievement) => (
                  <div 
                    key={achievement.id}
                    onClick={() => !achievement.unlocked && handleUnlockAchievement(achievement.id)}
                    className={`p-5 rounded-xl flex items-center gap-4 cursor-pointer transition-all transform hover:scale-[1.02] ${
                      achievement.unlocked 
                      ? 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 shadow-md' 
                      : 'bg-gray-50 border border-gray-200 opacity-75'
                    }`}
                  >
                    <div className={`min-w-[60px] h-[60px] rounded-xl flex items-center justify-center text-2xl shadow-md ${
                      achievement.unlocked 
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' 
                      : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-400'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <h4 className={`font-bold ${achievement.unlocked ? 'text-amber-800' : 'text-gray-400'}`}>
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          achievement.unlocked 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {achievement.unlocked ? '✓ Débloqué' : '🔒 Verrouillé'}
                        </span>
                        {!achievement.unlocked && (
                          <span className="text-xs text-purple-600 font-medium">
                            Cliquer pour débloquer →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <div className="flex items-center mb-5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-md mr-3">
                    🎖️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Collection de badges</h3>
                    <p className="text-sm text-gray-500">Sélectionnez un badge à attribuer</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
                  {['🏆', '🌟', '💯', '🚀', '🌱', '📊', '💼', '🔥', '⚡', '💡'].map((badge, index) => (
                    <button 
                      key={index}
                      onClick={handleAddBadge}
                      className={`aspect-square p-3 text-2xl flex items-center justify-center rounded-xl ${
                        employee.badges?.includes(badge) 
                          ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                          : 'bg-gradient-to-br from-purple-100 to-purple-200 shadow-md hover:shadow-lg hover:scale-110 transition-all transform border border-purple-200'
                      }`}
                      disabled={employee.badges?.includes(badge)}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={handleAddBadge}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:opacity-90 transition-all text-sm font-medium"
                  >
                    Attribuer un badge aléatoire
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-md mr-3">
                  📝
                </div>
                <h3 className="text-lg font-bold text-gray-800">Journal d'activités</h3>
              </div>
              
              <div className="space-y-1 relative">
                {/* Ligne de temps verticale */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {employee.activitesRecentes?.map((activite, index) => (
                  <div key={index} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 text-white shadow-md ${
                      activite.type === 'vente' ? 'bg-gradient-to-br from-green-400 to-green-600' : 
                      activite.type === 'formation' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                      activite.type === 'reunion' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                      activite.type === 'client' ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                      'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}>
                      {activite.type === 'vente' ? '💰' : 
                       activite.type === 'formation' ? '📚' :
                       activite.type === 'reunion' ? '👥' :
                       activite.type === 'client' ? '👤' :
                       '📝'}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{activite.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{activite.date}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activite.type === 'vente' ? 'bg-green-100 text-green-700' : 
                          activite.type === 'formation' ? 'bg-blue-100 text-blue-700' :
                          activite.type === 'reunion' ? 'bg-purple-100 text-purple-700' :
                          activite.type === 'client' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {activite.type === 'vente' ? 'Vente' : 
                          activite.type === 'formation' ? 'Formation' :
                          activite.type === 'reunion' ? 'Réunion' :
                          activite.type === 'client' ? 'Client' :
                          activite.type === 'admin' ? 'Admin' :
                          activite.type === 'rapport' ? 'Rapport' : 'Autre'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Formulaire d'ajout d'activité amélioré */}
              <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>✏️</span> Ajouter une nouvelle activité
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="Description de l'activité..." 
                      className="col-span-2 p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" 
                    />
                    <select className="p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm">
                      <option value="">Type d'activité</option>
                      <option value="vente">Vente</option>
                      <option value="formation">Formation</option>
                      <option value="reunion">Réunion</option>
                      <option value="client">Client</option>
                      <option value="admin">Administrative</option>
                    </select>
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:opacity-95 transition-all font-medium">
                    Ajouter l'activité
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de récompense amélioré */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 transform animate-scale-in text-center shadow-2xl border-t-8 border-t-purple-500">
            {rewardType === 'badge' && (
              <>
                <div className="text-7xl mb-6 animate-bounce py-2">🎖️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Nouveau badge débloqué !</h3>
                <p className="text-gray-600 mb-6 text-lg">Félicitations ! Vous venez d'attribuer un nouveau badge à {employee.name}. Continuez à encourager ses performances !</p>
              </>
            )}
            
            {rewardType === 'level' && (
              <>
                <div className="text-7xl mb-6 animate-bounce py-2">🎊</div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">NIVEAU SUPÉRIEUR !</h3>
                <p className="text-gray-600 mb-2">Félicitations ! {employee.name} est maintenant</p>
                <div className="text-3xl font-bold text-purple-700 mb-4">Niveau {employee.niveau}</div>
                <p className="text-gray-600 mb-6">De nouvelles compétences et récompenses sont maintenant disponibles !</p>
              </>
            )}
            
            <button
              onClick={() => setShowRewardModal(false)}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:opacity-90 transition-all font-medium text-lg"
            >
              Continuer
            </button>
          </div>
        </div>
      )}
      
      {/* Styles pour les animations personnalisées */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        @keyframes shine {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
        
        .animate-shine {
          animation: shine 3s infinite;
        }
      `}</style>
    </main>
  );
}