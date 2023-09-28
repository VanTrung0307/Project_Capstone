/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/ExchangeHistorys`;

export type ExchangeHistory = {
  id: string;
  playerName: string;
  itemName: string;
  exchangeDate: string;
  createdAt: string;
  quantity: number;
};

export type ExchangeHistoryList = {
  data: ExchangeHistory[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: ExchangeHistory[];
  pagination: Pagination;
}

export const getExchangeHistory = async (playerId: string, pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<ExchangeHistoryList>(`${API_BASE_URL}/exchangehistories/${playerId}`);
    const { data } = response.data;
    const { current = 1, pageSize = 1000 } = pagination;
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
    console.error('Error fetching paginated players:', error);
    throw error;
  }
};
