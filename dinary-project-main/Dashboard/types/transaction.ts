export type TransactionType = 'payment' | 'withdrawal' | 'transfer' | 'refund' | 'reward';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'blocked';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  senderId: string;
  senderType: 'user' | 'merchant' | 'system';
  receiverId: string;
  receiverType: 'user' | 'merchant' | 'system';
  description?: string;
  metadata?: Record<string, any>;
  paymentMethod?: 'qr' | 'direct' | 'link';
  location?: {
    lat: number;
    lng: number;
  };
}
