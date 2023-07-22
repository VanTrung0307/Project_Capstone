/* eslint-disable prettier/prettier */
import axios from 'axios';
// import { Priority } from '@app/constants/enums/priorities';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Users`;

// export interface Tag {
//   status: string;
//   priority: Priority;
// }

export type User = {
  schoolname: string;
  roleId: string;
  email: string;
  password: string;
  phoneNumber: number;
  gender: string;
  fullname: string;
  username: string;
  // status?: Tag[];
  status: string;
  id: string;
};

export type UserList = {
  data: User[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: User[];
  pagination: Pagination;
}

export const getPaginatedUsers = async () => {
  try {
    const response = await axios.get<UserList>(API_BASE_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

export const createUser = async (userData: User) => {
  try {
    const response = await axios.post<User>(API_BASE_URL, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: User) => {
  try {
    const response = await axios.put<User>(`${API_BASE_URL}/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users?email=${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};
