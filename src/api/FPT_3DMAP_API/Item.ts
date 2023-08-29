/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Items`;

export type Item = {
  name: string;
  price: number;
  description: string;
  type: string;
  limitExchange: boolean;
  imageUrl: string;
  status: string;
  id: string;
};

export type addItem = {
  image: string;
  name: string;
  price: number;
  description: string;
  type: string;
  limitExchange: boolean;
  imageUrl: string;
  status: string;
  id: string;
};

export type updateItemData = {
  image: string;
  name: string;
  price: number;
  description: string;
  type: string;
  limitExchange: boolean;
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

export const getPaginatedItems = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<ItemList>(API_BASE_URL);
    const { data } = response.data;
    const { current = 1, pageSize = 5 } = pagination;
    const total = data.length;

    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;

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

export const getItemById = async (itemId: string): Promise<Item> => {
  try {
    const response = await httpApi.get<Item>(`${API_BASE_URL}/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching item:', error);
    throw error;
  }
};

export const createItem = async (itemData: FormData): Promise<Item> => {
  try {
    const response = await httpApi.post(`${API_BASE_URL}/item`, itemData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

export const updateItem = async (id: string, itemData: FormData): Promise<Item> => {
  try {
    const response = await httpApi.put(`${API_BASE_URL}/${id}`, itemData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};
