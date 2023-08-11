/* eslint-disable prettier/prettier */
import { LoginResponse } from '@app/api/FPT_3DMAP_API/Account';

export const persistToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const readToken = (): string => {
  return localStorage.getItem('token') || 'bearerToken';
};

export const persistUser = (user: LoginResponse): void => {
  localStorage.setItem('studentId', JSON.stringify(user));
};

export const readUser = (): LoginResponse | null => {
  const userStr = localStorage.getItem('studentId');

  return userStr ? JSON.parse(userStr) : '';
};

export const deleteToken = (): void => localStorage.removeItem('token');
export const deleteUser = (): void => localStorage.removeItem('studentId');
