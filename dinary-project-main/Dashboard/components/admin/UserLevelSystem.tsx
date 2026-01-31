'use client';

import React from 'react';
import { TrendingUp, Star, Award, Clock } from 'lucide-react';

type UserLevelSystemProps = {
  userType: 'user' | 'merchant';
  level: number;
  xp?: number;
  xpToNextLevel?: number;
  points: number;
  starPoints: number;
  challenges?: {
    title: string;
    description: string;
    progress: number;
    total: number;
    reward: number;
    rewardType: 'points' | 'starPoints' | 'xp';
    status: 'active' | 'completed' | 'locked';
    daysLeft?: number;
  }[];
};

const UserLevelSystem: React.FC<UserLevelSystemProps> = ({
  userType,
  level,
  xp = 0,
  xpToNextLevel = 100,
  points,
  starPoints,
  challenges = []
}) => {
  // Calculate percentage for progress bar
  const xpPercentage = Math.min(Math.round((xp / xpToNextLevel) * 100), 100);
  
  // Helper function to get color classes based on reward type
  const getRewardColorClass = (type: string) => {
    switch (type) {
      case 'points': return 'bg-green-500';
      case 'starPoints': return 'bg-amber-400';
      case 'xp': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Helper function to get challenge status styles
  const getChallengeStatusStyles = (status: string) => {
    switch (status) {
      case 'active': return 'border-amber-200 bg-amber-50';
      case 'completed': return 'border-green-200 bg-green-50';
      case 'locked': return 'border-gray-200 bg-gray-50 opacity-60';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Niveau et Progression */}
      <div className="bg-white border rounded-lg p-5 shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          {userType === 'user' ? 'Progression Utilisateur' : 'Progression Commerçant'}
        </h3>
        
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-12 w-12 rounded-full bg-dinary-turquoise flex items-center justify-center">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-800">{level}</span>
              <span className="text-sm text-gray-500 ml-1">Niveau</span>
            </div>
            {userType === 'user' && (
              <p className="text-xs text-gray-500">
                {xp} / {xpToNextLevel} XP pour niveau {level + 1}
              </p>
            )}
          </div>
        </div>
        
        {userType === 'user' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progression</span>
              <span>{xpPercentage}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-dinary-turquoise rounded-full"
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Points */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-3">
            <div className="flex items-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm font-medium text-gray-800">
                {userType === 'user' ? 'Points Boost' : 'Points Fidélité'}
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900">{points}</div>
          </div>
          
          <div className="border rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Star className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-sm font-medium text-gray-800">Points étoilés</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{starPoints}</div>
          </div>
        </div>
      </div>
      
      {/* Défis et Missions */}
      {challenges.length > 0 && (
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Missions et défis</h3>
          <div className="space-y-4">
            {challenges.map((challenge, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-3 ${getChallengeStatusStyles(challenge.status)}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">
                    {challenge.title}
                    {challenge.status === 'locked' && ' (verrouillé)'}
                  </span>
                  <div className="px-2 py-1 bg-opacity-20 text-xs rounded-full flex items-center">
                    <span className={`h-2 w-2 rounded-full ${getRewardColorClass(challenge.rewardType)} mr-1`}></span>
                    <span>
                      {challenge.reward} 
                      {challenge.rewardType === 'points' ? ' pts' : 
                       challenge.rewardType === 'starPoints' ? ' ★' : ' XP'}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{challenge.description}</p>
                
                <div className="mt-2 w-full bg-white rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getRewardColorClass(challenge.rewardType)}`} 
                    style={{width: `${(challenge.progress / challenge.total) * 100}%`}}
                  ></div>
                </div>
                
                <div className="mt-1 flex justify-between text-xs text-gray-600">
                  <span>{challenge.progress}/{challenge.total} complétés</span>
                  {challenge.status === 'active' && challenge.daysLeft !== undefined && (
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {challenge.daysLeft > 0 ? `${challenge.daysLeft}j restants` : 'Expire aujourd\'hui'}
                    </span>
                  )}
                  {challenge.status === 'completed' && (
                    <span className="font-medium text-green-600">Terminé</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLevelSystem;