
export enum UserRole {
  MANAGER = 'MANAGER',
  USER = 'USER'
}

export enum ShiftType {
  A = 'A',
  B = 'B'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  password?: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  localCode: string;
  barCode: string;
  price: number;
}

export interface CartItem extends Product {
  cartQuantity: number;
  editedPrice: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SaleRecord {
  id: string;
  timestamp: number;
  userId: string;
  shift: ShiftType;
  items: SaleItem[];
  totalAmount: number;
}

export interface ShiftRecord {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  type: ShiftType;
  isActive: boolean;
}

export interface AppState {
  currentUser: User | null;
  activeShift: ShiftRecord | null;
  products: Product[];
  sales: SaleRecord[];
  users: User[];
}
