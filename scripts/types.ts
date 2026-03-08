export interface TrendingProduct {
  rank: number;
  keyword: string;
  category: string;
  searchVolume: number;
  growthRate: number; // percentage
  products: NaverProduct[];
  trendScore: number;
}

export interface NaverProduct {
  title: string;
  link: string;
  image: string;
  price: number;
  mallName: string;
  reviewCount: number;
  category1: string;
  category2: string;
}

export interface GroupBuyDeal {
  id: string;
  product: NaverProduct;
  originalPrice: number;
  groupBuyPrice: number;
  minQuantity: number;
  currentOrders: number;
  deadline: string; // ISO date
  status: 'active' | 'closed' | 'cancelled';
  supplierEmail: string;
  supplierName: string;
}

export interface Order {
  orderId: string;
  dealId: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  totalPrice: number;
  address: string;
  orderedAt: string;
  trackingNumber?: string;
  carrier?: string;
  deliveryStatus?: DeliveryStatus;
}

export type DeliveryStatus =
  | 'preparing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered';

export interface SocialPost {
  platform: 'instagram' | 'kakao_channel';
  text: string;
  hashtags: string[];
  imageCaption: string;
  scheduledAt?: string;
}

export interface KakaoNotification {
  templateCode: string;
  recipientPhone: string;
  variables: Record<string, string>;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface PurchaseOrder {
  poNumber: string;
  supplierName: string;
  supplierEmail: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PipelineResult {
  step: string;
  success: boolean;
  message: string;
  data?: unknown;
  timestamp: string;
}
