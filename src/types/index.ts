// src/types/index.ts

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer' | 'editor';
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
}