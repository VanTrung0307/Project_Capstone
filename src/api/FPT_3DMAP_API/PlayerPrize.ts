/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';
// import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/PlayerPrizes`;

export type PlayerPrize = {
  id: string;
  studentId: string;
  eventId: string;
  studentName: string;
  schoolName: string;
  studentEmail: string;
  eventName: string;
  nickname: string;
  passcode: string;
  totalPoint: number;
  totalTime: number;
  isplayer: boolean;
  prizedName: string;
  prizedId: string;
};

export type PlayerPrizeSend = {
  prizeId: string;
  dateReceived: string;
  status: string;
};

export type PlayerList = {
  data: PlayerPrize[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: PlayerPrize[];
  pagination: Pagination;
}

export const getRankedPlayerPrizes = async (schoolId: string, pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<PlayerList>(`${API_BASE_URL}/GetRankedPlayer/${schoolId}`);
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
    console.error('Error fetching ranked players:', error);
    throw error;
  }
};

export const createPlayerPrize = async (send: PlayerPrizeSend, playerId: string): Promise<PlayerPrizeSend> => {
  try {
    const response = await httpApi.post<PlayerPrizeSend>(`${API_BASE_URL}/CreatePlayerPrize/${playerId}`, send);
    return response.data;
  } catch (error) {
    console.error('Error creating gift:', error);
    throw error;
  }
};
