/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Items`;

export type Item = {
  name: string;
  price: number;
  description: string;
  type: string;
  limitExchange: string //boolean
  status: string;
  id: string;
};

export type ItemList = {
  data: Item[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: ItemList;
  pagination: Pagination;
}

export const getItems = async () => {
  try {
    const response = await axios.get<ItemList>(API_BASE_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};

export const getItemById = async (itemId: string) => {
  try {
    const response = await axios.get<Item>(`${API_BASE_URL}/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching item:', error);
    throw error;
  }
};

export const createItem = async (itemData: Item) => {
  try {
    const response = await axios.post<Item>(API_BASE_URL, itemData);
    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

export const updateItem = async (itemId: string, itemData: Item) => {
  try {
    const response = await axios.put<Item>(`${API_BASE_URL}/${itemId}`, itemData);
    return response.data;
  } catch (error) {
    console.error('Error updating item:', error);
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
