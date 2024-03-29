/* eslint-disable prettier/prettier */
import axios from 'axios';
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Players`;

export type Player = {
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

export type PlayerFilter = {
  id: string;
  studentEmail: string;
  schoolName: string;
  studentId: string;
  studentName: string;
  eventName: string;
  nickname: string;
  passcode: string;
  totalPoint: number;
  totalTime: number;
  createdAt: string;
};

interface PlayerData {
  studentId: string;
  eventId: string;
  nickname: string;
  passcode: string;
  totalPoint: number;
  totalTime: number;
  isplayer: boolean;
}

export type PlayerList = {
  data: Player[];
};

export type PlayerFilterList = {
  data: PlayerFilter[];
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

export interface PaginationPlayerData {
  data: PlayerFilter[];
  pagination: Pagination;
}

export const getPaginatedPlayers = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await axios.get<PlayerList>(API_BASE_URL);
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

export const getPaginatedPlayersWithEventandSchool = async (
  schoolId: string,
  eventId: string,
  pagination: Pagination,
): Promise<PaginationPlayerData> => {
  try {
    const response = await httpApi.get<PlayerFilterList>(
      `${API_BASE_URL}/filterdatawithschoolandevent?schoolId=${schoolId}&eventId=${eventId}`,
    );
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

export const getPaginatedPlayersWithEvent = async (
  eventId: string,
  pagination: Pagination,
): Promise<PaginationPlayerData> => {
  try {
    const response = await httpApi.get<PlayerFilterList>(
      `${API_BASE_URL}/filterdatawithschoolandevent?eventId=${eventId}`,
    );
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

export const getRankedPlayers = async (
  eventId: string,
  schoolId: string,
  pagination: Pagination,
): Promise<PaginationData> => {
  try {
    const response = await axios.get<PlayerList>(`${API_BASE_URL}/GetRankedPlayer/${eventId}/${schoolId}`);
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

export const getPlayerById = async (playerId: string): Promise<Player> => {
  try {
    const response = await httpApi.get<Player>(`${API_BASE_URL}/${playerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching player:', error);
    throw error;
  }
};

export const createPlayer = async ({
  studentId,
  eventId,
  nickname,
  passcode,
  totalPoint,
  totalTime,
  isplayer,
}: PlayerData): Promise<Player> => {
  try {
    const playerData: PlayerData = {
      studentId,
      eventId,
      nickname,
      passcode,
      totalPoint,
      totalTime,
      isplayer,
    };

    const response = await httpApi.post(`${API_BASE_URL}/player`, playerData);
    return response.data;
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
};
