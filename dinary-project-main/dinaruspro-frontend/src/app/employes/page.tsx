'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

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
    ]
  },
];

// Liste des rôles disponibles dans l'entreprise
const availableRoles = [
  'Gérant(e)',
  'Vendeur(se)',
  'Comptable',
  'Stagiaire',
  'Responsable Marketing',
  'Assistant(e)',
  'Responsable Stock'
];

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newAchievement, setNewAchievement] = useState<{employeeId: number, achievement: Achievement} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const defaultNewEmployee: Omit<Employee, 'id'> = {
    name: '',
    role: '',
    contact: '',
    image: 'https://randomuser.me/api/portraits/lego/1.jpg',
    dateEmbauche: new Date().toISOString().split('T')[0],
    salaire: 30000,
    performance: 80,
    ventesMois: 0,
    niveau: 1,
    exp: 0,
    badges: [],
    achievements: [
      { id: 1, title: "Première Journée", description: "A rejoint l'équipe", icon: "🎉", unlocked: true },
    ]
  };
  
  const [newEmployee, setNewEmployee] = useState(defaultNewEmployee);

  useEffect(() => {
    // Déclenchement de confetti lorsqu'un nouvel achievement est débloqué
    if (showConfetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setTimeout(() => {
        setShowConfetti(false);
        setNewAchievement(null);
      }, 3000);
    }
  }, [showConfetti]);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const id = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    setEmployees([...employees, { id, ...newEmployee }]);
    setNewEmployee(defaultNewEmployee);
    setShowAddForm(false);
    
    // Célébration pour un nouvel employé
    setShowConfetti(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setCurrentEmployee(employee);
    setShowEditForm(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;
    
    // Vérifier si la performance a augmenté pour débloquer un succès
    const oldEmployee = employees.find(e => e.id === currentEmployee.id);
    if (oldEmployee && currentEmployee.performance && oldEmployee.performance && 
        currentEmployee.performance > oldEmployee.performance + 10) {
      // Débloquer un nouvel achievement
      const updatedEmployee = {...currentEmployee};
      if (updatedEmployee.achievements) {
        const unlockedAchievement = updatedEmployee.achievements.find(a => !a.unlocked);
        if (unlockedAchievement) {
          unlockedAchievement.unlocked = true;
          setNewAchievement({
            employeeId: currentEmployee.id,
            achievement: unlockedAchievement
          });
          setShowConfetti(true);
        }
      }
      
      // Ajouter un badge si performance > 90
      if (currentEmployee.performance >= 90 && (!currentEmployee.badges || !currentEmployee.badges.includes('💯'))) {
        updatedEmployee.badges = [...(currentEmployee.badges || []), '💯'];
      }
      
      // Mise à jour de l'employé avec les nouvelles récompenses
      setCurrentEmployee(updatedEmployee);
    }
    
    setEmployees(employees.map(emp => 
      emp.id === currentEmployee.id ? currentEmployee : emp
    ));
    setShowEditForm(false);
    setCurrentEmployee(null);
  };

  const handleUnlockAchievement = (employeeId: number, achievementId: number) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === employeeId && emp.achievements) {
        const updatedAchievements = emp.achievements.map(ach => {
          if (ach.id === achievementId) {
            const updatedAch = { ...ach, unlocked: true };
            // Afficher une célébration
            setNewAchievement({
              employeeId: employeeId,
              achievement: updatedAch
            });
            setShowConfetti(true);
            return updatedAch;
          }
          return ach;
        });
        
        return { ...emp, achievements: updatedAchievements };
      }
      return emp;
    });
    
    setEmployees(updatedEmployees);
  };

  const handleRemoveEmployee = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const viewEmployeeStats = (id: number) => {
    router.push(`/employes/${id}`);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateLevelProgress = (exp: number = 0) => {
    // Simple formule pour calculer la progression dans le niveau
    return (exp % 100) / 100 * 100;
  };

  return (
    <main className="p-4 pb-24 bg-gradient-to-b from-white to-blue-50 min-h-screen">
      {/* Header classement/top employés */}
      <header className="mb-8">
        <h1 className="text-xl font-bold text-center text-gray-800 mb-4 tracking-tight">Classement des employés</h1>
        <div className="flex justify-center gap-4 mb-4">
          {employees
            .sort((a, b) => (b.performance || 0) - (a.performance || 0))
            .slice(0, 3)
            .map((emp, idx) => (
              <div key={emp.id} className={`flex flex-col items-center p-2 rounded-xl border ${idx === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'} shadow-sm`}> 
                <img src={emp.image} alt={emp.name} className="w-12 h-12 rounded-full border-2 border-white mb-1" />
                <span className="font-semibold text-gray-700 text-sm">{emp.name}</span>
                <span className="text-xs text-gray-400">Niv. {emp.niveau || 1}</span>
                <span className="text-xs font-bold text-green-500">{emp.performance || 0}%</span>
                <span className="mt-1 text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
              </div>
            ))}
        </div>
      </header>

      {/* Recherche et ajout */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 text-sm bg-white"
        />
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-purple-700 transition"
        >
          + Ajouter
        </button>
      </div>

      {/* Liste des employés épurée */}
      <div className="space-y-3 mb-8">
        {filteredEmployees.map(employee => (
          <div 
            key={employee.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition"
          >
            <img 
              src={employee.image} 
              alt={employee.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-gray-800 truncate">{employee.name}</span>
                {employee.badges && employee.badges.map((badge, i) => (
                  <span key={i} className="text-base">{badge}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{employee.role}</span>
                <span>·</span>
                <span>Niv. {employee.niveau || 1}</span>
                <span>·</span>
                <span>{employee.performance || 0}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full mt-2">
                <div 
                  className="h-1.5 bg-purple-400 rounded-full transition-all"
                  style={{ width: `${calculateLevelProgress(employee.exp)}%` }}
                ></div>
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <button
                onClick={() => viewEmployeeStats(employee.id)}
                className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-purple-100 hover:text-purple-600 text-base"
                title="Voir fiche"
              >👁️</button>
              <button
                onClick={() => handleEditEmployee(employee)}
                className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600 text-base"
                title="Éditer"
              >✏️</button>
              <button 
                onClick={() => handleRemoveEmployee(employee.id)}
                className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-500 text-base"
                title="Supprimer"
              >✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Animation confetti et notification d'achievement */}
      {newAchievement && (
        <div className="fixed inset-x-0 top-1/4 mx-auto w-64 bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-lg shadow-lg text-white text-center transform animate-bounce-once z-50">
          <p className="text-xl mb-1">{newAchievement.achievement.icon}</p>
          <p className="font-bold">{newAchievement.achievement.title}</p>
          <p className="text-xs text-amber-200 mt-1">{newAchievement.achievement.description}</p>
        </div>
      )}

      {/* Bouton pour ajouter un employé */}
      {!showAddForm && !showEditForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span> Ajouter un employé
        </button>
      )}

      {/* Formulaire d'ajout d'employé */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Nouvel employé</h3>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input
                type="text"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
              <select
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                required
              >
                <option value="">Sélectionner un rôle</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <input
                type="text"
                value={newEmployee.contact}
                onChange={(e) => setNewEmployee({...newEmployee, contact: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche</label>
              <input
                type="date"
                value={newEmployee.dateEmbauche}
                onChange={(e) => setNewEmployee({...newEmployee, dateEmbauche: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salaire annuel (DA)</label>
              <input
                type="number"
                value={newEmployee.salaire}
                onChange={(e) => setNewEmployee({...newEmployee, salaire: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-all"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulaire de modification d'employé */}
      {showEditForm && currentEmployee && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/50 pt-16 flex items-start justify-center">
          <div className="bg-white rounded-xl p-5 shadow-xl w-full max-w-md mx-4 animate-slide-up">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Modifier l'employé</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={currentEmployee.name}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
                <select
                  value={currentEmployee.role}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                >
                  <option value="">Sélectionner un rôle</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  value={currentEmployee.contact}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche</label>
                <input
                  type="date"
                  value={currentEmployee.dateEmbauche}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, dateEmbauche: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salaire annuel (DA)</label>
                <input
                  type="number"
                  value={currentEmployee.salaire}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, salaire: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Performance (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentEmployee.performance}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, performance: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>{currentEmployee.performance}%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ventes du mois (DA)</label>
                <input
                  type="number"
                  value={currentEmployee.ventesMois}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, ventesMois: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Styles pour les animations personnalisées */}
      <style jsx global>{`
        @keyframes bounce-once {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-30px); }
          60% { transform: translateY(-15px); }
        }
        
        @keyframes slide-up {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-bounce-once {
          animation: bounce-once 1s;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}