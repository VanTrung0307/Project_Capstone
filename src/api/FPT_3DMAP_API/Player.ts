/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Players/players/listPlayer-username`;

export type Player = {
  eventId: string;
  eventName: string;
  fullname: string;
  totalPoint: number;
  totalTime: number;
  nickname: string;
  createdAt: number;
  passcode: string;
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

    const paginatedData = data.slice(startIndex, endIndex);

    let objectCount = 0;

    paginatedData.forEach((item) => {
      objectCount++;
      console.log("Object", objectCount, ":", item);
    });

    console.log("Total objects:", objectCount);

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