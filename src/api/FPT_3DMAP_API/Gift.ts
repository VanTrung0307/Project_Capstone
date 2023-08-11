/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Prizes`;

export type Gift = {
  name: string;
  decription: string;
  quantity: number;
  eventId: string;
  eventName: string;
  status: string;
  id: string;
};

export type addGift = {
  eventId: string;
  name: string;
  decription: string;
  status: string;
  quantity: number;
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
  data: Gift[];
  pagination: Pagination;
}

export const getPaginatedGifts = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await axios.get<GiftList>(API_BASE_URL);
    const { data } = response.data;
    const { current = 1, pageSize = 5 } = pagination;
    const total = data.length;

    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedData = data.slice(startIndex, endIndex);

    let objectCount = 0;

    paginatedData.forEach((item) => {
      objectCount++;
      console.log('Object', objectCount, ':', item);
    });

    console.log('Total objects:', objectCount);

    return {
      data: paginatedData,
      pagination: {
        current,
        pageSize,
        total,
      },
    };
  } catch (error) {
    console.error('Error fetching paginated schools:', error);
    throw error;
  }
};

export const getGiftById = async (giftId: string): Promise<Gift> => {
  try {
    const response = await axios.get<Gift>(`${API_BASE_URL}/${giftId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching gift:', error);
    throw error;
  }
};

export const createGift = async (giftData: addGift): Promise<Gift> => {
  try {
    const response = await axios.post<Gift>(`${API_BASE_URL}/Gift`, giftData);
    return response.data;
  } catch (error) {
    console.error('Error creating gift:', error);
    throw error;
  }
};

export const updateGift = async (giftId: string, giftData: Gift): Promise<Gift> => {
  try {
    const response = await axios.put<Gift>(`${API_BASE_URL}/${giftId}`, giftData);
    return response.data;
  } catch (error) {
    console.error('Error updating gift:', error);
    throw error;
  }
};
