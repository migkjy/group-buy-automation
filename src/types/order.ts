export interface Order {
  id: string;
  dealId: string;
  dealTitle: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
