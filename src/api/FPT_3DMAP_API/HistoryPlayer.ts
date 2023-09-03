/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/PlayerHistorys`;

export type HistoryPlayer = {
  eventtaskId: string;
  playerId: string;
  taskName: string;
  playerNickName: string;
  completedTime: number;
  taskPoint: number;
  status: string;
  createdAt: string;
};

export type HistoryPlayerList = {
  data: HistoryPlayer[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: HistoryPlayer[];
  pagination: Pagination;
}

export const getHistoryPaginatedPlayers = async (playerId: string, pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<HistoryPlayerList>(`${API_BASE_URL}/player/${playerId}`);
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
