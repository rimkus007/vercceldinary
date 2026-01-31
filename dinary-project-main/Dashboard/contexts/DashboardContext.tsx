'use client';

import { createContext, useContext, useReducer, useEffect, useState } from 'react';

// Types for our statistics
export interface DashboardStats {
  totalUsers: {
    value: number;
    change: number;
    period: string;
  };
  activeTransactions: {
    value: number;
    change: number;
    period: string;
  };
  dailyRevenue: {
    value: number;
    change: number;
    period: string;
  };
  activeMerchants: {
    value: number;
    change: number;
    period: string;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'success' | 'info';
    message: string;
    time: string;
  }>;
  chartsData: {
    transactions: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        fill: boolean;
        borderColor: string;
        tension: number;
      }>;
    };
    userActivity: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string;
      }>;
    };
    revenueDistribution: {
      labels: string[];
      datasets: Array<{
        data: number[];
        backgroundColor: string[];
      }>;
    };
  };
}

// Actions interface
type Action =
  | { type: 'UPDATE_STATS'; payload: Partial<DashboardStats> }
  | { type: 'ADD_ALERT'; payload: DashboardStats['alerts'][0] }
  | { type: 'REMOVE_ALERT'; payload: string }
  | { type: 'UPDATE_CHART_DATA'; payload: { chartType: keyof DashboardStats['chartsData']; data: any } }
  | { type: 'SET_PERIOD'; payload: 'day' | 'week' | 'month' | 'year' };

// Initial state
const initialState: DashboardStats = {
  totalUsers: {
    value: 12547,
    change: 15.2,
    period: 'vs last month'
  },
  activeTransactions: {
    value: 843,
    change: 4.7,
    period: 'vs yesterday'
  },
  dailyRevenue: {
    value: 126750,
    change: -2.3,
    period: 'vs yesterday'
  },
  activeMerchants: {
    value: 234,
    change: 8.1,
    period: 'vs last month'
  },
  alerts: [
    { id: '1', type: 'warning', message: '5 nouveaux signalements de fraude à vérifier', time: '2 min' },
    { id: '2', type: 'success', message: 'Mise à jour du système effectuée avec succès', time: '15 min' },
    { id: '3', type: 'info', message: '12 nouvelles demandes de vérification KYC', time: '1h' },
    { id: '4', type: 'warning', message: 'Pic de transactions détecté chez le marchand #M567', time: '2h' }
  ],
  chartsData: {
    transactions: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Transactions',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    userActivity: {
      labels: ['00h', '04h', '08h', '12h', '16h', '20h'],
      datasets: [{
        label: 'Utilisateurs actifs',
        data: [230, 150, 320, 480, 520, 450],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }]
    },
    revenueDistribution: {
      labels: ['Paiements', 'Recharges', 'Transferts', 'Retraits'],
      datasets: [{
        data: [45, 25, 20, 10],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
      }]
    }
  }
};

// Create context
const DashboardContext = createContext<{
  state: DashboardStats;
  dispatch: React.Dispatch<Action>;
  currentPeriod: 'day' | 'week' | 'month' | 'year';
  setCurrentPeriod: React.Dispatch<React.SetStateAction<'day' | 'week' | 'month' | 'year'>>;
} | null>(null);

// Reducer function
function dashboardReducer(state: DashboardStats, action: Action): DashboardStats {
  switch (action.type) {
    case 'UPDATE_STATS':
      return { ...state, ...action.payload };
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.payload, ...state.alerts].slice(0, 10) // Keep only last 10 alerts
      };
    case 'REMOVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload)
      };
    case 'UPDATE_CHART_DATA':
      return {
        ...state,
        chartsData: {
          ...state.chartsData,
          [action.payload.chartType]: action.payload.data
        }
      };
    default:
      return state;
  }
}

// Provider component
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const [currentPeriod, setCurrentPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');

  // Update data based on period
  useEffect(() => {
    const updateDataForPeriod = () => {
      const now = new Date();
      const labels = [];
      const transactionData = [];
      const userActivityData = [];

      if (currentPeriod === 'day') {
        // Hourly data for the current day
        for (let i = 0; i < 24; i++) {
          labels.push(`${i}h`);
          transactionData.push(Math.floor(Math.random() * 100));
          userActivityData.push(Math.floor(Math.random() * 1000));
        }
      } else if (currentPeriod === 'week') {
        // Daily data for the week
        const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        days.forEach(day => {
          labels.push(day);
          transactionData.push(Math.floor(Math.random() * 500));
          userActivityData.push(Math.floor(Math.random() * 5000));
        });
      } else if (currentPeriod === 'month') {
        // Daily data for the month
        for (let i = 1; i <= 30; i++) {
          labels.push(`${i}`);
          transactionData.push(Math.floor(Math.random() * 1000));
          userActivityData.push(Math.floor(Math.random() * 10000));
        }
      } else {
        // Monthly data for the year
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        months.forEach(month => {
          labels.push(month);
          transactionData.push(Math.floor(Math.random() * 10000));
          userActivityData.push(Math.floor(Math.random() * 50000));
        });
      }

      // Update transaction chart data
      dispatch({
        type: 'UPDATE_CHART_DATA',
        payload: {
          chartType: 'transactions',
          data: {
            labels,
            datasets: [{
              label: 'Transactions',
              data: transactionData,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          }
        }
      });

      // Update user activity chart data
      dispatch({
        type: 'UPDATE_CHART_DATA',
        payload: {
          chartType: 'userActivity',
          data: {
            labels,
            datasets: [{
              label: 'Utilisateurs actifs',
              data: userActivityData,
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
            }]
          }
        }
      });

      // Update overall stats based on period
      dispatch({
        type: 'UPDATE_STATS',
        payload: {
          totalUsers: {
            value: Math.floor(10000 + Math.random() * 5000),
            change: Math.floor(-20 + Math.random() * 40),
            period: `vs last ${currentPeriod}`
          },
          activeTransactions: {
            value: Math.floor(500 + Math.random() * 1000),
            change: Math.floor(-10 + Math.random() * 20),
            period: `vs last ${currentPeriod}`
          },
          dailyRevenue: {
            value: Math.floor(100000 + Math.random() * 50000),
            change: Math.floor(-15 + Math.random() * 30),
            period: `vs last ${currentPeriod}`
          },
          activeMerchants: {
            value: Math.floor(200 + Math.random() * 100),
            change: Math.floor(-5 + Math.random() * 15),
            period: `vs last ${currentPeriod}`
          }
        }
      });
    };

    // Initial update
    updateDataForPeriod();

    // Set up periodic updates
    const interval = setInterval(updateDataForPeriod, 5000);
    return () => clearInterval(interval);
  }, [currentPeriod]);

  // Simulate real-time alerts
  useEffect(() => {
    const alertTypes = ['warning', 'success', 'info'] as const;
    const alertMessages = [
      'Nouvelle demande de vérification KYC',
      'Transaction suspecte détectée',
      'Pic d\'activité utilisateur',
      'Mise à jour système effectuée',
      'Nouveau commerçant en attente de validation'
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance to add a new alert
        const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const message = alertMessages[Math.floor(Math.random() * alertMessages.length)];
        
        dispatch({
          type: 'ADD_ALERT',
          payload: {
            id: Date.now().toString(),
            type,
            message,
            time: 'à l\'instant'
          }
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardContext.Provider value={{ state, dispatch, currentPeriod, setCurrentPeriod }}>
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook to use the dashboard context
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
