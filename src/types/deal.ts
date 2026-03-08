export interface DealOption {
  name: string;
  values: string[];
}

export interface Deal {
  id: string;
  slug: string;
  title: string;
  description: string;
  originalPrice: number;
  groupPrice: number;
  discountRate: number;
  images: string[];
  category: string;
  supplier: string;
  minQuantity: number;
  maxQuantity: number;
  currentOrders: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'closed' | 'sold_out';
  options?: DealOption[];
}
