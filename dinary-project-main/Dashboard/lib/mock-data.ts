// Dashboard stats
export const stats = {
  activeUsers: 5842,
  dailyPayments: 18947,
  activeMerchants: 318,
  boostPoints: 42853,
};

// User stats
export const userStats = {
  totalUsers: 5842,
  activeUsers: 4210,
  inactiveUsers: 1120,
  blockedUsers: 512,
  pendingVerification: 24,
  averageBalance: 68.5,
  topPoints: 1450,
  newUsersToday: 37,
  pendingRecharges: 18,
  // Nouvelles statistiques pour les niveaux
  averageLevel: 3,
  highestLevel: 15,
  totalXpEarned: 1523850,
  totalStarPoints: 32450,
};

// Recharge requests
export const rechargeRequests = [
  {
    id: 'rech001',
    userId: 'u001',
    userName: 'Sophie Martin',
    amount: 100.00,
    requestDate: '2023-11-05T15:30:00',
    status: 'pending', // pending, approved, rejected
    paymentMethod: 'bank_transfer',
    reference: 'REF12345',
    proofUrl: '/proof/bank-transfer-123.jpg',
    notes: ''
  },
  {
    id: 'rech002',
    userId: 'u002',
    userName: 'Thomas Bernard',
    amount: 50.00,
    requestDate: '2023-11-05T12:15:00',
    status: 'pending',
    paymentMethod: 'mobile_money',
    reference: 'MM78945',
    proofUrl: '/proof/mm-receipt-456.jpg',
    notes: ''
  },
  {
    id: 'rech003',
    userId: 'u004',
    userName: 'Lucas Petit',
    amount: 200.00,
    requestDate: '2023-11-04T18:45:00',
    status: 'pending',
    paymentMethod: 'bank_transfer',
    reference: 'REF54321',
    proofUrl: '/proof/bank-transfer-789.jpg',
    notes: ''
  },
  {
    id: 'rech004',
    userId: 'u007',
    userName: 'Marie Dupont',
    amount: 75.00,
    requestDate: '2023-11-04T09:20:00',
    status: 'approved',
    paymentMethod: 'mobile_money',
    reference: 'MM45678',
    proofUrl: '/proof/mm-receipt-012.jpg',
    notes: 'Validated by admin'
  },
  {
    id: 'rech005',
    userId: 'u010',
    userName: 'Jean Leroy',
    amount: 150.00,
    requestDate: '2023-11-03T14:10:00',
    status: 'rejected',
    paymentMethod: 'bank_transfer',
    reference: 'REF98765',
    proofUrl: '/proof/bank-transfer-345.jpg',
    notes: 'Reference number incorrect'
  }
];

// Pending user verifications
export const pendingVerifications = [
  {
    id: 'ver001',
    userId: 'u015',
    userName: 'Philippe Rousseau',
    email: 'philippe.r@example.com',
    phone: '+33 6 78 90 12 34',
    submissionDate: '2023-11-05T08:45:00',
    documentType: 'id_card',
    documentUrls: ['/docs/id-front-123.jpg', '/docs/id-back-123.jpg'],
    status: 'pending' // pending, approved, rejected
  },
  {
    id: 'ver002',
    userId: 'u023',
    userName: 'Isabelle Moreau',
    email: 'isabelle.m@example.com',
    phone: '+33 6 34 56 78 90',
    submissionDate: '2023-11-04T16:30:00',
    documentType: 'passport',
    documentUrls: ['/docs/passport-456.jpg'],
    status: 'pending'
  },
  {
    id: 'ver003',
    userId: 'u031',
    userName: 'Antoine Girard',
    email: 'antoine.g@example.com',
    phone: '+33 6 12 34 56 78',
    submissionDate: '2023-11-03T11:20:00',
    documentType: 'driving_license',
    documentUrls: ['/docs/license-789.jpg'],
    status: 'pending'
  }
];

// Données pour les revenus de la plateforme
export const platformRevenues = {
  summary: {
    totalCommissions: 256784.50,
    paymentCommissions: 180230.25,
    withdrawalCommissions: 42554.25,
    transferFees: 34000.00,
    baridiMobBalance: 1256890.75,
    todayCommissions: 3450.50,
    weeklyCommissions: 18675.25,
    monthlyCommissions: 85230.75,
    pendingRecharges: 32500.00,
    pendingWithdrawals: 78650.00,
    lastSync: '2023-11-06T10:32:45'  },
  recentTransactions: [
    {
      id: 'TX982567',
      type: 'payment',
      amount: 15600.00,
      commission: 234.00,
      timestamp: '2023-11-06T09:45:20',
      details: 'Paiement chez Café de Paris'
    },
    {
      id: 'TX982566',
      type: 'withdrawal',
      amount: 32500.00,
      commission: 325.00,
      timestamp: '2023-11-06T09:32:15',
      details: 'Retrait Librairie Moderne'
    },
    {
      id: 'TX982565',
      type: 'transfer',
      amount: 1200.00,
      commission: 5.00,
      timestamp: '2023-11-06T09:15:40',
      details: 'Virement instantané Ahmed à Karim'
    },
    {
      id: 'TX982564',
      type: 'payment',
      amount: 8750.00,
      commission: 131.25,
      timestamp: '2023-11-06T08:50:12',
      details: 'Paiement chez Épicerie du Quartier'
    },
    {
      id: 'TX982563',
      type: 'transfer',
      amount: 2500.00,
      commission: 5.00,
      timestamp: '2023-11-06T08:22:05',
      details: 'Virement instantané Sofia à Malik'
    },
    {
      id: 'TX982562',
      type: 'payment',
      amount: 5300.00,
      commission: 79.50,
      timestamp: '2023-11-05T19:15:30',
      details: 'Paiement chez La Boulangerie'
    },
    {
      id: 'TX982561',
      type: 'withdrawal',
      amount: 25000.00,
      commission: 250.00,
      timestamp: '2023-11-05T18:40:22',
      details: 'Retrait Café de Paris'    },
    {
      id: 'TX982560',
      type: 'recharge',
      amount: 10000.00,
      commission: 0.00,
      timestamp: '2023-11-05T17:30:10',
      details: 'Recharge compte par Ahmed'
    }
  ],
  commissionsChartData: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    datasets: [
      {
        label: 'Commissions sur paiements',
        data: [12500, 13200, 14800, 16300, 15500, 17700, 18800, 19500, 21000, 22500, 23700],
        borderColor: '#4DD0E1',
        backgroundColor: 'rgba(77, 208, 225, 0.2)',
      },
      {
        label: 'Commissions sur retraits',
        data: [2500, 2800, 3200, 3600, 3900, 4100, 4300, 4500, 4800, 5100, 5400],
        borderColor: '#66BB6A',
        backgroundColor: 'rgba(102, 187, 106, 0.2)',
      },
      {
        label: 'Frais de virements',
        data: [1500, 1700, 1900, 2200, 2500, 2700, 2900, 3200, 3500, 3800, 4000],
        borderColor: '#FFA726',
        backgroundColor: 'rgba(255, 167, 38, 0.2)',
      }
    ]
  }
};

// Chart data
export const chartData = {  // Payment volume data
  payments: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Payment Volume (DZD)',
        data: [12500, 16200, 14800, 18300, 21500, 19700, 22800],
        borderColor: '#4DD0E1',
        backgroundColor: 'rgba(77, 208, 225, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  },
  // User signup data
  users: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'New Users',
        data: [483, 512, 678, 734, 859, 792, 904],
        backgroundColor: '#FFC107',
        borderRadius: 6,
      },
    ],
  },
};

// User data for admin/users page
export const users = [
  {
    id: 'u001',
    name: 'Sophie Martin',
    email: 'sophie.m@example.com',
    phone: '+33 6 12 34 56 78',
    status: 'active',
    registered: '2023-03-15',
    lastActive: '2023-11-05',
    points: 750,
    level: 5,
    xp: 1250,
    xpToNextLevel: 1500,
    starPoints: 120,
    transactions: 43,
    avatar: '',
  },  {
    id: 'u002',
    name: 'Thomas Bernard',
    email: 'thomas.b@example.com',
    phone: '+33 6 23 45 67 89',
    status: 'active',
    registered: '2023-04-22',
    lastActive: '2023-11-04',
    points: 320,
    level: 2,
    xp: 520,
    xpToNextLevel: 750,
    starPoints: 45,
    transactions: 17,
    avatar: '',
  },  {
    id: 'u003',
    name: 'Emma Dubois',
    email: 'emma.d@example.com',
    phone: '+33 6 34 56 78 90',
    status: 'inactive',
    registered: '2023-02-08',
    lastActive: '2023-09-18',
    points: 180,
    level: 1,
    xp: 180,
    xpToNextLevel: 500,
    starPoints: 15,
    transactions: 8,
    avatar: '',
  },  {
    id: 'u004',
    name: 'Lucas Petit',
    email: 'lucas.p@example.com',
    phone: '+33 6 45 67 89 01',
    status: 'active',
    registered: '2023-05-30',
    lastActive: '2023-11-06',
    points: 890,
    level: 7,
    xp: 3150,
    xpToNextLevel: 3500,
    starPoints: 210,
    transactions: 51,
    avatar: '',
  },  {
    id: 'u005',
    name: 'Julie Robert',
    email: 'julie.r@example.com',
    phone: '+33 6 56 78 90 12',
    status: 'blocked',
    registered: '2023-01-17',
    lastActive: '2023-08-30',
    points: 210,
    level: 2,
    xp: 580,
    xpToNextLevel: 750,
    starPoints: 30,
    transactions: 15,
    avatar: '',
  },  {
    id: 'u006',
    name: 'Antoine Moreau',
    email: 'antoine.m@example.com',
    phone: '+33 6 67 89 01 23',
    status: 'active',
    registered: '2023-06-11',
    lastActive: '2023-11-05',
    points: 610,
    level: 4,
    xp: 980,
    xpToNextLevel: 1200,
    starPoints: 95,
    transactions: 39,
    avatar: '',
  },
];

// Merchant data for admin/merchants page
export const merchants = [
  {
    id: 'm001',
    name: 'Café de Paris',
    email: 'contact@cafeparis.com',
    phone: '+33 1 23 45 67 89',
    status: 'verified',
    registered: '2023-02-10',
    lastActive: '2023-11-05',
    balance: 3874.50,
    points: 1250,
    level: 6,
    starPoints: 320,
    transactions: 256,
    address: '15 Rue de Rivoli, Paris',
    category: 'Restaurant',
    rating: 4.8,
  },  {
    id: 'm002',
    name: 'Boulangerie Saint Michel',
    email: 'info@boulangerie-stmichel.com',
    phone: '+33 1 34 56 78 90',
    status: 'pending',
    registered: '2023-10-05',
    lastActive: '2023-11-04',
    points: 180,
    level: 1,
    starPoints: 25,
    balance: 720.25,
    transactions: 48,
    address: '8 Boulevard Saint Michel, Paris',
    category: 'Bakery',
    rating: 4.5,
  },
  {
    id: 'm003',
    name: 'Librairie Moderne',
    email: 'contact@librairiemodern.fr',
    phone: '+33 1 45 67 89 01',
    status: 'verified',
    registered: '2023-03-22',
    lastActive: '2023-11-02',
    balance: 2150.75,
    transactions: 183,
    address: '24 Rue des Écoles, Paris',
    category: 'Retail',
    rating: 4.6,
  },
  {
    id: 'm004',
    name: 'Épicerie du Quartier',
    email: 'service@epicerieduquartier.fr',
    phone: '+33 1 56 78 90 12',
    status: 'blocked',
    registered: '2023-01-18',
    lastActive: '2023-09-15',
    balance: 0,
    transactions: 97,
    address: '5 Rue Mouffetard, Paris',
    category: 'Grocery',
    rating: 3.9,
  },
];

// Mock data for merchants
export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  type: 'self-registered' | 'sponsored' | 'suggested';
  businessType: string;
  location: {
    address: string;
    city: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
    type: string;
    status: string;
  }>;
  revenue: number;
  customersCount: number;
  rating: number;
  productsCount: number;
  lastActive: string;
  suggestion?: {
    id: string;
    suggestedBy: string;
    suggestedAt: string;
    status: 'pending' | 'contacted' | 'approved' | 'rejected';
    notes?: string;
  };
}

export const merchantsData: Merchant[] = [{
  id: '1',
  name: 'Pâtisserie Amandine',
  email: 'contact@patisserie-amandine.com',
  phone: '+213123456789',
  status: 'active',
  type: 'self-registered',
  businessType: 'Pâtisserie',
  location: {
    address: '123 Rue des Pâtissiers',
    city: 'Alger',
    postalCode: '16000',
    coordinates: {
      lat: 36.7538,
      lng: 3.0588
    }
  },
  transactions: [
    {
      id: 't1',
      date: '2024-01-15T10:00:00',
      amount: 1500,
      type: 'payment',
      status: 'completed'
    }
  ],
  revenue: 150000,
  customersCount: 250,
  rating: 4.8,
  productsCount: 45,
  lastActive: '2024-01-15T10:00:00'
}, {
  id: '2',
  name: 'Restaurant Méditerranée',
  email: 'info@restaurant-mediterranee.com',
  phone: '+213123456790',
  status: 'active',
  type: 'sponsored',
  businessType: 'Restaurant',
  location: {
    address: '456 Boulevard de la Mer',
    city: 'Oran',
    postalCode: '31000',
    coordinates: {
      lat: 35.6969,
      lng: -0.6331
    }
  },
  transactions: [
    {
      id: 't2',
      date: '2024-01-14T15:30:00',
      amount: 2500,
      type: 'payment',
      status: 'completed'
    }
  ],
  revenue: 280000,
  customersCount: 450,
  rating: 4.5,
  productsCount: 60,
  lastActive: '2024-01-14T15:30:00'
}];

// Withdrawal requests for admin/withdrawals page
export const withdrawals = [
  {
    id: 'w001',
    merchantId: 'm001',
    merchantName: 'Café de Paris',
    amount: 1200.00,
    requestDate: '2023-11-03',
    status: 'pending',
    bankInfo: {
      name: 'BNP Paribas',
      iban: 'FR76 3000 6000 0112 3456 7890 189',
    },
  },
  {
    id: 'w002',
    merchantId: 'm003',
    merchantName: 'Librairie Moderne',
    amount: 850.50,
    requestDate: '2023-11-04',
    status: 'pending',
    bankInfo: {
      name: 'Société Générale',
      iban: 'FR76 3000 7000 0112 3456 7890 143',
    },
  },
  {
    id: 'w003',
    merchantId: 'm001',
    merchantName: 'Café de Paris',
    amount: 980.25,
    requestDate: '2023-10-28',
    status: 'approved',
    bankInfo: {
      name: 'BNP Paribas',
      iban: 'FR76 3000 6000 0112 3456 7890 189',
    },
    processedDate: '2023-10-30',
  },
  {
    id: 'w004',
    merchantId: 'm004',
    merchantName: 'Épicerie du Quartier',
    amount: 1500.00,
    requestDate: '2023-10-25',
    status: 'rejected',
    bankInfo: {
      name: 'Crédit Agricole',
      iban: 'FR76 3000 8000 0112 3456 7890 192',
    },
    processedDate: '2023-10-26',
    rejectionReason: 'Account verification required',
  },
];

// Missions data for admin/missions page
export const missions = [
  {
    id: 'mis001',
    title: 'First Purchase',
    description: 'Make your first purchase with Dinary',
    points: 100,
    type: 'onboarding',
    status: 'active',
    completions: 3842,
    createdAt: '2023-01-10',
  },
  {
    id: 'mis002',
    title: 'Refer a Friend',
    description: 'Invite a friend who registers and makes a transaction',
    points: 250,
    type: 'referral',
    status: 'active',
    completions: 1256,
    createdAt: '2023-01-15',
  },
  {
    id: 'mis003',
    title: 'Payment Streak',
    description: 'Make 5 purchases in 7 days',
    points: 150,
    type: 'engagement',
    status: 'active',
    completions: 876,
    createdAt: '2023-02-05',
  },
  {
    id: 'mis004',
    title: 'Complete Profile',
    description: 'Fill all profile information',
    points: 75,
    type: 'onboarding',
    status: 'inactive',
    completions: 4231,
    createdAt: '2023-01-05',
  },
];