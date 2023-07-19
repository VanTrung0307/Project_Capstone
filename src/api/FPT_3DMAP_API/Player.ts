/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Players/players/listPlayer-username`;

export type Player = {
  fullname: string;
  totalPoint: number;
  totalTime: number;
  nickname: string;
  createdAt: number;
  id: string;
};

export type PlayerList = {
  data: Player[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: Player[];
  pagination: Pagination;
}

export const getPaginatedPlayers = async (pagination: Pagination) => {
  try {
    const response = await axios.get<PlayerList>(API_BASE_URL);
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
    console.error('Error fetching paginated players:', error);
    throw error;
  }
};

export const getPlayerById = async (playerId: string) => {
  try {
    const response = await axios.get<Player>(`${API_BASE_URL}/${playerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching player:', error);
    throw error;
  }
};