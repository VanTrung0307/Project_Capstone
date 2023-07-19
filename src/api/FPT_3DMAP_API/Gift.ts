/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Gifts`;

export type Gift = {
  giftName: string;
  decription: string;
  price: number;
  place: string;
  status: string;
  id: string;
};

export type GiftList = {
  data: Gift[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: GiftList;
  pagination: Pagination;
}

export const getGifts = async () => {
  try {
    const response = await axios.get<GiftList>(API_BASE_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching gifts:', error);
    throw error;
  }
};

export const getGiftById = async (giftId: string) => {
  try {
    const response = await axios.get<Gift>(`${API_BASE_URL}/${giftId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching gift:', error);
    throw error;
  }
};

export const createGift = async (giftData: Gift) => {
  try {
    const response = await axios.post<Gift>(API_BASE_URL, giftData);
    return response.data;
  } catch (error) {
    console.error('Error creating gift:', error);
    throw error;
  }
};

export const updateGift = async (giftId: string, giftData: Gift) => {
  try {
    const response = await axios.put<Gift>(`${API_BASE_URL}/${giftId}`, giftData);
    return response.data;
  } catch (error) {
    console.error('Error updating gift:', error);
    throw error;
  }
};

// export const deletePlayer = async (playerId: string) => {
//   try {
//     await axios.delete(`${API_BASE_URL}/${playerId}`);
//     // No response data is needed for delete operations
//   } catch (error) {
//     console.error('Error deleting player:', error);
//     throw error;
//   }
// };
