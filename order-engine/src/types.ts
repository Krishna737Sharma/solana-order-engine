// Ye file define karti hai ki Order kaisa dikhta hai
export interface Order {
  id: string;
  type: 'MARKET' | 'LIMIT' | 'SNIPER';
  side: 'BUY' | 'SELL';
  amount: number;
  token: string;
  status: 'pending' | 'routing' | 'building' | 'submitted' | 'confirmed' | 'failed';
}