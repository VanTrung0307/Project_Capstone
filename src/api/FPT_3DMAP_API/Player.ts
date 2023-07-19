/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Players/players/listPlayer-username`;

export type Player = {
  name: string;
  totalPoint: number;
  totalTime: number;
  nickName: string;
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
  data: PlayerList;
  pagination: Pagination;
}

export const getPlayers = async () => {
  try {
    const response = await axios.get<PlayerList>(API_BASE_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching players:', error);
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

export const createPlayer = async (playerData: Player) => {
  try {
    const response = await axios.post<Player>(API_BASE_URL, playerData);
    return response.data;
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
};

export const updatePlayer = async (playerId: string, playerData: Player) => {
  try {
    const response = await axios.put<Player>(`${API_BASE_URL}/${playerId}`, playerData);
    return response.data;
  } catch (error) {
    console.error('Error updating player:', error);
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
