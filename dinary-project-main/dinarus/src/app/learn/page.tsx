'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/layouts/PageHeader';

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState('tous');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(420);
  const [level, setLevel] = useState(3);
  const [showReward, setShowReward] = useState(false);
  const [completedToday, setCompletedToday] = useState(1);
  const [streak, setStreak] = useState(7);
  
  // Catégories de contenu d'apprentissage
  const categories = [
    { id: 'tous', name: 'Tous' },
    { id: 'finance', name: 'Finance' },
    { id: 'entrepreneuriat', name: 'Entrepreneuriat' },
    { id: 'investissement', name: 'Investissement' },
    { id: 'économie', name: 'Économie' }
  ];
  
  // Niveaux et statuts
  const userLevels = [
    { level: 1, title: "Débutant", minPoints: 0, maxPoints: 200 },
    { level: 2, title: "Initié", minPoints: 200, maxPoints: 400 },
    { level: 3, title: "Intermédiaire", minPoints: 400, maxPoints: 700 },
    { level: 4, title: "Avancé", minPoints: 700, maxPoints: 1200 },
    { level: 5, title: "Expert", minPoints: 1200, maxPoints: 2000 },
    { level: 6, title: "Maître", minPoints: 2000, maxPoints: 3000 },
  ]
  
  // Trouver le niveau actuel et calculer la progression
  const currentLevel = userLevels.find(l => l.level === level) || userLevels[0];
  const nextLevel = userLevels.find(l => l.level === level + 1) || currentLevel;
  const levelProgress = ((earnedPoints - currentLevel.minPoints) / (currentLevel.maxPoints - currentLevel.minPoints)) * 100;
  const pointsToNextLevel = nextLevel.minPoints - earnedPoints;
  
  // Contenu d'apprentissage
  const learningContent = [
    {
      id: 1,
      title: 'Stratégies de cashback avancées',
      category: 'finance',
      duration: '8 min',
      level: 'Intermédiaire',
      image: '/icons/cashback.svg',
      imageEmoji: '💸',
      progress: 100,
      isNew: false,
      isPremium: false,
      completedDate: '11 mai 2025',
      xp: 50,
      certification: true,
      author: 'Sarah Laporte',
      authorTitle: 'Experte en finance personnelle',
      slides: [
        {
          title: 'Maximiser vos retours financiers avec le cashback',
          content: 'Les stratégies avancées de cashback peuvent vous permettre d\'optimiser considérablement vos retours sur dépenses quotidiennes. Dans ce module, vous découvrirez comment combiner plusieurs programmes pour multiplier vos avantages.',
          image: '💰'
        },
        {
          title: 'Stratégie de cumul multi-plateformes',
          content: 'Apprenez à superposer intelligemment les offres de cashback de votre carte bancaire, des applications dédiées et des programmes de fidélité des commerçants. Cette approche peut vous faire gagner jusqu\'à 15-20% sur certains achats.',
          image: '📊'
        },
        {
          title: 'Calendrier stratégique des achats',
          content: 'Planifiez vos achats importants pendant les périodes promotionnelles pour maximiser le cashback. Les fins de trimestre et les événements comme le Black Friday offrent souvent des pourcentages de retour doublés.',
          image: '📅'
        },
        {
          title: 'Analyse des conditions et optimisation',
          content: 'Apprenez à lire et analyser les conditions des programmes de cashback pour éviter les pièges et maximiser vos gains. Ces connaissances vous placeront parmi les 5% des utilisateurs qui tirent vraiment profit de ces systèmes.',
          image: '🔍'
        }
      ]
    },
    {
      id: 2,
      title: 'Gestion financière pour entrepreneurs',
      category: 'entrepreneuriat',
      duration: '15 min',
      level: 'Avancé',
      image: '/icons/finance.svg',
      imageEmoji: '📊',
      progress: 60,
      isNew: false,
      isPremium: true,
      xp: 85,
      certification: true,
      author: 'Marc Dubois',
      authorTitle: 'Fondateur & CEO, FinanceHub',
      slides: [
        {
          title: 'Principes de gestion financière stratégique',
          content: 'La maîtrise de la gestion financière est un facteur déterminant pour le succès entrepreneurial. Ce module vous dotera des compétences nécessaires pour prendre des décisions financières éclairées qui soutiendront la croissance de votre entreprise.',
          image: '💼'
        },
        {
          title: 'Séparation des finances personnelles et professionnelles',
          content: 'La distinction claire entre vos finances personnelles et professionnelles est fondamentale pour une gestion saine. Apprenez à établir cette séparation tout en optimisant la fiscalité et la protection de vos actifs personnels.',
          image: '🏢'
        },
        {
          title: 'Gestion de trésorerie prévisionnelle',
          content: 'La prévision et le suivi rigoureux de vos flux de trésorerie vous permettront d\'anticiper les besoins de financement et d\'éviter les crises de liquidité. Maîtrisez les techniques utilisées par les CFO des entreprises performantes.',
          image: '📈'
        }
      ]
    },
    {
      id: 3,
      title: 'Psychologie de l\'investissement',
      category: 'investissement',
      duration: '12 min',
      level: 'Expert',
      image: '/icons/psychology.svg',
      imageEmoji: '🧠',
      progress: 0,
      isNew: true,
      isPremium: true,
      xp: 100,
      certification: true,
      author: 'Dr. Camille Bernard',
      authorTitle: 'Psychologue financière & Investisseure',
      slides: []
    },
    {
      id: 4,
      title: 'Économie comportementale',
      category: 'économie',
      duration: '10 min',
      level: 'Intermédiaire',
      image: '/icons/behavior.svg',
      imageEmoji: '🤝',
      progress: 25,
      isNew: false,
      isPremium: false,
      xp: 70,
      certification: false,
      author: 'Prof. Antoine Moreau',
      authorTitle: 'Université Paris-Dauphine',
      slides: []
    },
    {
      id: 5,
      title: 'Stratégies de croissance pour PME',
      category: 'entrepreneuriat',
      duration: '20 min',
      level: 'Avancé',
      image: '/icons/growth.svg',
      imageEmoji: '📱',
      progress: 0,
      isNew: true,
      isPremium: true,
      xp: 120,
      certification: true,
      author: 'Nadia Larbi',
      authorTitle: 'Consultante en stratégie d\'entreprise',
      slides: []
    },
    {
      id: 6,
      title: 'Comprendre l\'inflation en profondeur',
      category: 'économie',
      duration: '12 min',
      level: 'Intermédiaire',
      image: '/icons/inflation.svg',
      imageEmoji: '📈',
      progress: 0,
      isNew: false,
      isPremium: false,
      xp: 75,
      certification: false,
      author: 'Jean-Michel Pascal',
      authorTitle: 'Analyste économique',
      slides: []
    },
    {
      id: 7,
      title: 'Investissement immobilier: Stratégies avancées',
      category: 'investissement',
      duration: '18 min',
      level: 'Expert',
      image: '/icons/realestate.svg',
      imageEmoji: '🏢',
      progress: 0,
      isNew: false,
      isPremium: true,
      xp: 110,
      certification: true,
      author: 'Sylvie Morel',
      authorTitle: 'Investisseure immobilière',
      slides: []
    },
    {
      id: 8,
      title: 'Optimisation fiscale éthique',
      category: 'finance',
      duration: '14 min',
      level: 'Avancé',
      image: '/icons/tax.svg',
      imageEmoji: '📋',
      progress: 40,
      isNew: false,
      isPremium: true,
      xp: 90,
      certification: true,
      author: 'Pascal Renaud',
      authorTitle: 'Expert-comptable',
      slides: []
    }
  ];
  
  // Parcours d'apprentissage recommandés
  const learningPaths = [
    {
      id: 1,
      title: 'Maîtrise financière',
      description: 'Développez une expertise complète en gestion financière personnelle et professionnelle',
      courses: 8,
      completed: 2,
      time: '2h 30min',
      image: '💼',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Investisseur intelligent',
      description: 'Les stratégies d\'investissement des professionnels adaptées aux particuliers',
      courses: 6,
      completed: 0,
      time: '1h 45min',
      image: '📊',
      color: 'green'
    }
  ];
  
  // Objectifs personnalisés
  const weeklyGoal = 3;
  const weeklyCompletion = 1;
  const weeklyProgress = (weeklyCompletion / weeklyGoal) * 100;
  
  // Filtrer le contenu par catégorie active
  const filteredContent = activeCategory === 'tous' 
    ? learningContent 
    : learningContent.filter(item => item.category === activeCategory);
    
  // Fermer le cours et réinitialiser les slides
  const closeCourse = () => {
    setSelectedCourse(null);
    setCurrentSlide(0);
  };
  
  // Passer à la slide suivante
  const nextSlide = () => {
    if (selectedCourse && currentSlide < selectedCourse.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (selectedCourse) {
      // Fin du cours - ajout des points XP et affichage de la récompense
      const pointsToAdd = selectedCourse.xp;
      setEarnedPoints(prevPoints => prevPoints + pointsToAdd);
      setCompletedToday(prev => prev + 1);
      setShowReward(true);
      
      // Vérifier si l'utilisateur passe au niveau supérieur
      const newTotalPoints = earnedPoints + pointsToAdd;
      const newLevel = userLevels.find(l => 
        newTotalPoints >= l.minPoints && newTotalPoints < l.maxPoints
      )?.level || level;
      
      if (newLevel > level) {
        setLevel(newLevel);
      }
      
      // Masquer la récompense après quelques secondes
      setTimeout(() => {
        setShowReward(false);
        closeCourse();
      }, 5000);
    }
  };
  
  // Revenir à la slide précédente
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  // Calculer le progrès à travers les slides
  const slideProgress = selectedCourse ? 
    ((currentSlide + 1) / selectedCourse.slides.length) * 100 : 0;
  
  // Ouvrir un cours avec ses slides
  const openCourse = (course) => {
    // Vérifier si le cours est premium et demander l'accès si nécessaire
    if (course.isPremium) {
      // Simulation d'un modal pour l'accès premium
      // Dans une vraie application, ceci pourrait rediriger vers une page de paiement
      if (!window.confirm('Ce cours est réservé aux membres premium. Souhaitez-vous accéder à l\'offre premium?')) {
        return;
      }
    }
    setSelectedCourse(course);
    setCurrentSlide(0);
  };

  return (
    <div className="bg-white min-h-screen mb-16 relative">
      <PageHeader 
        title="Académie Dinary" 
        emoji="🎓" 
        actionButton={
          <div className="flex items-center">
            <span className="mr-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold py-1 px-3 rounded-full flex items-center shadow-sm">
              <span className="mr-1.5">⚡</span>
              {earnedPoints} XP
            </span>
            <button className="p-2">
              <span className="text-lg">🔍</span>
            </button>
          </div>
        }
      />
      
      {/* Modal d'achat Premium si nécessaire */}
      {selectedCourse && selectedCourse.isPremium && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          {/* Contenu du modal premium ici */}
        </div>
      )}
      
      {/* Statut de l'utilisateur */}
      <div className="px-5">
        <div className="my-4">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-5 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Niveau {level}: {currentLevel.title}</h2>
              <div className="flex items-center bg-white bg-opacity-20 px-2 py-1 rounded-full">
                <span className="text-sm mr-1">🔥</span>
                <span className="text-sm font-medium">{streak} jours</span>
              </div>
            </div>
            
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5 mb-1">
              <div className="bg-white h-2.5 rounded-full" style={{ width: `${levelProgress}%` }}></div>
            </div>
            
            <div className="flex justify-between text-xs">
              <span>{earnedPoints} XP</span>
              <span>{currentLevel.maxPoints} XP</span>
            </div>
            
            <div className="mt-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Plus que {pointsToNextLevel} XP jusqu'au niveau {level + 1}</p>
                <p className="text-xs opacity-80">{completedToday} cours complétés aujourd'hui</p>
              </div>
              <button className="bg-white text-purple-600 px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-opacity-90">
                Mon profil
              </button>
            </div>
          </div>
        </div>

        {/* Objectif hebdomadaire */}
        <div className="mb-6 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold flex items-center">
              <span className="mr-2">🎯</span>
              Objectif hebdomadaire
            </h3>
            <span className="text-sm font-medium">{weeklyCompletion}/{weeklyGoal} cours</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${weeklyProgress}%` }}></div>
          </div>
          
          <p className="text-xs text-gray-500">Complétez 2 cours de plus cette semaine pour maintenir votre série</p>
        </div>

        {/* Parcours d'apprentissage recommandés */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Parcours recommandés</h2>
            <button className="text-sm text-blue-600 font-medium">Voir tout</button>
          </div>
          
          <div className="space-y-3">
            {learningPaths.map(path => (
              <div 
                key={path.id}
                className={`bg-gradient-to-br rounded-xl p-4 shadow-sm border
                  ${path.color === 'blue' ? 'from-blue-50 to-blue-100 border-blue-200' : ''}
                  ${path.color === 'green' ? 'from-green-50 to-green-100 border-green-200' : ''}
                `}
              >
                <div className="flex items-start">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-3 flex-shrink-0
                    ${path.color === 'blue' ? 'bg-blue-200 text-blue-600' : ''}
                    ${path.color === 'green' ? 'bg-green-200 text-green-600' : ''}
                  `}>
                    {path.image}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{path.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{path.description}</p>
                    
                    <div className="flex justify-between text-xs mb-1.5">
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">{path.courses} cours</span>
                        <span>•</span>
                        <span className="ml-2">{path.time}</span>
                      </div>
                      <span className="font-medium">
                        {path.completed}/{path.courses} complétés
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 bg-opacity-50 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full
                        ${path.color === 'blue' ? 'bg-blue-500' : ''}
                        ${path.color === 'green' ? 'bg-green-500' : ''}
                      `} style={{ width: `${(path.completed / path.courses) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catégories */}
        <div className="mb-6">
          <div className="flex space-x-2 py-2 overflow-x-auto hide-scrollbar">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Cours en cours */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Continuer votre apprentissage</h2>
          
          <div className="space-y-4">
            {filteredContent
              .filter(item => item.progress > 0 && item.progress < 100)
              .map(item => (
                <div 
                  key={item.id} 
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex"
                  onClick={() => openCourse(item)}
                >
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl mr-3 flex-shrink-0 
                    ${item.isPremium ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gray-100'}`}
                  >
                    {item.imageEmoji || '📚'}
                    {item.isPremium && <span className="absolute -top-1 -right-1 text-xs">👑</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium leading-tight flex items-center">
                        {item.title}
                        {item.isPremium && (
                          <span className="ml-2 bg-amber-100 text-amber-800 text-xs py-0.5 px-1.5 rounded-full">Premium</span>
                        )}
                      </h3>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <div className="flex items-center">
                        <span className="mr-2">{item.duration}</span>
                        <span>•</span>
                        <span className="mx-2">{item.level}</span>
                      </div>
                      <span>+{item.xp} XP</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Liste de contenu en grille */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Explorer les cours</h2>
            <div className="flex items-center text-sm">
              <button className="text-gray-500 font-medium">
                Filtrer
              </button>
              <span className="mx-2 text-gray-300">|</span>
              <button className="text-blue-600 font-medium">
                Populaires
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {filteredContent.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => openCourse(item)}
              >
                {/* Image/Icon du cours */}
                <div className={`aspect-[4/3] relative overflow-hidden flex items-center justify-center
                  ${item.category === 'finance' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : ''}
                  ${item.category === 'entrepreneuriat' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : ''}
                  ${item.category === 'investissement' ? 'bg-gradient-to-br from-green-400 to-green-600' : ''}
                  ${item.category === 'économie' ? 'bg-gradient-to-br from-amber-400 to-amber-600' : ''}
                `}>
                  <div className="text-5xl text-white">{item.imageEmoji}</div>
                  
                  {/* Informations sur l'image */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-black bg-opacity-30 text-white text-xs px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                  </div>
                  
                  {item.isPremium && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-amber-400 text-amber-800 text-xs py-0.5 px-2 rounded-md font-medium">
                        PREMIUM
                      </span>
                    </div>
                  )}
                  
                  {item.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 h-1">
                      <div className="bg-white h-1" style={{ width: `${item.progress}%` }}></div>
                    </div>
                  )}
                </div>
                
                {/* Contenu du cours */}
                <div className="p-3">
                  <div className="mb-2">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{item.duration}</span>
                      <span className="mx-1">•</span>
                      <span className="text-blue-600 font-medium">{item.xp} XP</span>
                    </div>
                    
                    {item.isNew && (
                      <span className="bg-green-100 text-green-800 text-xs py-0.5 px-1.5 rounded">
                        Nouveau
                      </span>
                    )}
                    
                    {item.progress === 100 && (
                      <span className="text-green-500 text-lg">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button className="text-blue-600 font-medium text-sm border border-blue-200 rounded-lg px-5 py-2 hover:bg-blue-50">
              Voir plus de cours
            </button>
          </div>
        </div>

        {/* Ressources exclusives */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Ressources exclusives</h2>
          
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 text-white shadow-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl mr-3">
                  🎙️
                </div>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">PODCAST</span>
              </div>
              <span className="bg-amber-400 text-amber-800 text-xs py-0.5 px-2 rounded font-medium">
                PREMIUM
              </span>
            </div>
            
            <h3 className="font-bold text-lg mb-1">Entretien avec les leaders financiers</h3>
            <p className="text-sm text-gray-300 mb-4">Découvrez les secrets des entrepreneurs et investisseurs qui réussissent</p>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">12 épisodes • Mis à jour chaque semaine</span>
              <button className="bg-white text-gray-900 rounded-lg px-3 py-1.5 text-sm font-medium">
                Écouter
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xl mr-3">
                  📊
                </div>
                <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded">WEBINAIRE</span>
              </div>
              <span className="text-xs text-white bg-white bg-opacity-20 py-0.5 px-2 rounded">
                23 MAI • 19:00
              </span>
            </div>
            
            <h3 className="font-bold text-lg mb-1">Nouvelles tendances d&apos;investissement 2025</h3>
            <p className="text-sm text-purple-100 mb-4">Un expert analysera les meilleures opportunités d&apos;investissement actuelles</p>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-200">Présenté par Thomas Girard</span>
              <button className="bg-white text-purple-600 rounded-lg px-3 py-1.5 text-sm font-medium">
                Réserver
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Superposition du cours avec slides */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header du cours */}
            <div className={`
              p-5 text-white
              ${selectedCourse.category === 'finance' ? 'bg-gradient-to-r from-blue-600 to-blue-800' : ''}
              ${selectedCourse.category === 'entrepreneuriat' ? 'bg-gradient-to-r from-purple-600 to-purple-800' : ''}
              ${selectedCourse.category === 'investissement' ? 'bg-gradient-to-r from-green-600 to-green-800' : ''}
              ${selectedCourse.category === 'économie' ? 'bg-gradient-to-r from-amber-600 to-amber-800' : ''}
            `}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center mb-1">
                    <span className="bg-white bg-opacity-20 text-xs px-2 py-0.5 rounded mr-2">
                      {selectedCourse.category}
                    </span>
                    {selectedCourse.isPremium && (
                      <span className="bg-amber-400 text-amber-800 text-xs py-0.5 px-2 rounded">
                        PREMIUM
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold">{selectedCourse.title}</h2>
                </div>
                <button onClick={closeCourse} className="text-white rounded-full bg-white bg-opacity-20 w-8 h-8 flex items-center justify-center hover:bg-opacity-30">
                  ✕
                </button>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span>Par {selectedCourse.author}</span>
                </div>
                <div className="flex items-center">
                  {selectedCourse.slides.length > 0 && (
                    <>
                      <span>{currentSlide + 1}/{selectedCourse.slides.length}</span>
                      <span className="mx-2">•</span>
                    </>
                  )}
                  <span>{selectedCourse.xp} XP</span>
                </div>
              </div>
            </div>
            
            {/* Contenu des slides */}
            {selectedCourse.slides.length > 0 ? (
              <div className="p-6 overflow-y-auto flex-grow">
                {selectedCourse.slides[currentSlide] && (
                  <div className="slide-content">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-5xl mb-6">
                      {selectedCourse.slides[currentSlide].image}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">
                      {selectedCourse.slides[currentSlide].title}
                    </h3>
                    <p className="text-gray-700 text-center text-lg leading-relaxed mb-6">
                      {selectedCourse.slides[currentSlide].content}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 flex-grow flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">
                  🔒
                </div>
                <h3 className="text-xl font-bold mb-2 text-center text-gray-900">
                  Contenu en préparation
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-sm">
                  Ce cours premium sera bientôt disponible. Recevez une notification quand il sera prêt.
                </p>
                <button className="bg-blue-600 text-white rounded-xl px-5 py-2.5 font-medium hover:bg-blue-700">
                  M&apos;alerter
                </button>
              </div>
            )}
            
            {/* Footer avec progression et boutons */}
            <div className="p-4 border-t border-gray-200">
              {selectedCourse.slides.length > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className={`
                    h-2 rounded-full transition-all duration-300
                    ${selectedCourse.category === 'finance' ? 'bg-blue-600' : ''}
                    ${selectedCourse.category === 'entrepreneuriat' ? 'bg-purple-600' : ''}
                    ${selectedCourse.category === 'investissement' ? 'bg-green-600' : ''}
                    ${selectedCourse.category === 'économie' ? 'bg-amber-600' : ''}
                  `} style={{ width: `${slideProgress}%` }}></div>
                </div>
              )}
              
              <div className="flex justify-between">
                <button 
                  onClick={prevSlide} 
                  disabled={currentSlide === 0}
                  className={`px-5 py-2.5 rounded-xl ${
                    currentSlide === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Précédent
                </button>
                
                <button 
                  onClick={nextSlide}
                  className={`px-5 py-2.5 rounded-xl text-white font-medium
                    ${selectedCourse.category === 'finance' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    ${selectedCourse.category === 'entrepreneuriat' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    ${selectedCourse.category === 'investissement' ? 'bg-green-600 hover:bg-green-700' : ''}
                    ${selectedCourse.category === 'économie' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                    ${!selectedCourse.slides.length ? 'bg-gray-600 hover:bg-gray-700' : ''}
                  `}
                >
                  {currentSlide === selectedCourse.slides.length - 1 || !selectedCourse.slides.length ? 'Terminer' : 'Suivant'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Animation de récompense */}
      {showReward && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="reward-animation">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500 opacity-10 rounded-full"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 opacity-10 rounded-full"></div>
              
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center justify-center animate-ping opacity-30">
                  <div className="w-24 h-24 rounded-full bg-amber-300"></div>
                </div>
                
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🏆</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-1 text-gray-900">Félicitations!</h2>
              <p className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                +{selectedCourse?.xp} XP
              </p>
              
              <p className="text-gray-600 mb-5 max-w-xs mx-auto">
                {selectedCourse?.certification ? 
                  "Vous avez terminé ce cours certifiant et gagné des points d'expertise!" : 
                  "Vous avez terminé ce cours et progressé dans votre parcours d'apprentissage!"}
              </p>
              
              <div className="mb-5">
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-800">
                  <span className="mr-2">🔥</span>
                  Série de {streak} jours
                </div>
              </div>
              
              {level > 2 && pointsToNextLevel < 100 && (
                <div className="text-sm text-gray-600 mb-5">
                  Plus que {pointsToNextLevel} XP pour atteindre le niveau {level + 1}!
                </div>
              )}
              
              <button 
                onClick={() => setShowReward(false)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6 py-3 font-bold hover:from-blue-700 hover:to-purple-700 shadow-md"
              >
                Continuer mon apprentissage
              </button>
            </div>
          </div>
          
          <div className="confetti-container">
            {Array(30).fill(0).map((_, i) => (
              <div 
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-5%`,
                  backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][Math.floor(Math.random() * 5)],
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
      
      {/* Styles pour les animations */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        
        .confetti {
          position: absolute;
          animation: confettiFall 5s ease forwards;
        }
        
        .reward-animation {
          animation: scaleIn 0.5s ease-out forwards;
          transform: scale(0.8);
          opacity: 0;
        }
        
        @keyframes scaleIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}