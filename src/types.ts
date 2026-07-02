export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Distributor {
  id: string;
  name: string;
  address: string;
  location: string;
  observation?: string;
  photo: string | null;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
