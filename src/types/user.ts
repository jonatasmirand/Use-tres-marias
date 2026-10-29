export type UserRole = "admin" | "customer";
export type UserStatus = "active" | "blocked";

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_sign_in_at: string | null;
  orders_count?: number;
  blocked_at?: string | null;
  blocked_reason?: string | null;
}

export interface GetUsersFilter {
  search?: string;
  role?: "all" | UserRole;
  status?: "all" | UserStatus;
  page?: number;
  perPage?: number;
}

export interface GetUsersResponse {
  users: ManagedUser[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface InviteAdminInput {
  email: string;
  name?: string;
  password?: string;
}

export interface BlockUserInput {
  block: boolean;
  reason?: string;
}

