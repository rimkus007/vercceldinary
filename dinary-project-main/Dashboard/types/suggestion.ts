export interface SuggestedMerchant {
  id: string;
  name: string;
  address: string;
  category: string;
  location?: {
    lat: number;
    lng: number;
  };
  suggestedBy?: {
    id: string;
    name: string;
    phone: string;
  };
  suggestedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  latitude?: number;
  longitude?: number;
}
