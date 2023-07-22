/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Items`;

export type Item = {
  name: string;
  price: number;
  description: string;
  type: string;
  limitExchange: boolean; //boolean
  quantity: number;
  imageUrl: string;
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
  data: Item[];
  pagination: Pagination;
}

export const getPaginatedItems = async (pagination: Pagination) => {
  try {
    const response = await axios.get<ItemList>(API_BASE_URL);
    const { data } = response.data;
    const { current = 1, pageSize = 5 } = pagination;
    const total = data.length;

    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Simulate a delay of 1 second using setTimeout
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const paginatedData = data.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        current,
        pageSize,
        total,
      },
    };
  } catch (error) {
    console.error('Error fetching paginated items:', error);
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
