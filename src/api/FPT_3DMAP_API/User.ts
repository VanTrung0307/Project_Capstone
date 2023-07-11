/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = 'https://localhost:44367/api/Users';

export type User = {
  schoolId: string;
  roleId: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: number;
  gender: boolean;
  status: string;
  id: string;
};

export const getUsers = async () => {
  try {
    const response = await axios.get<User[]>(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

export const getUserById = async (userId: string) => {
  try {
    const response = await axios.get<User>(`${API_BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching player:', error);
    throw error;
  }
};

export const createPlayer = async (userData: User) => {
  try {
    const response = await axios.post<User>(API_BASE_URL, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
};

export const updatePlayer = async (userId: string, userData: User) => {
  try {
    const response = await axios.put<User>(`${API_BASE_URL}/${userId}`, userData);
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
