/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Ranks`;

export type Rank = {
  name: string;
  playerName: string;
  eventName: string;
  place: string;
  status: string;
  id: string;
};

export type RankList = {
  data: Rank[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: RankList;
  pagination: Pagination;
}

export const getRanks = async () => {
  try {
    const response = await axios.get<RankList>(API_BASE_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching ranks:', error);
    throw error;
  }
};

export const getRankById = async (rankId: string) => {
  try {
    const response = await axios.get<Rank>(`${API_BASE_URL}/${rankId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rank:', error);
    throw error;
  }
};

export const createRank = async (rankData: Rank) => {
  try {
    const response = await axios.post<Rank>(API_BASE_URL, rankData);
    return response.data;
  } catch (error) {
    console.error('Error creating rank:', error);
    throw error;
  }
};

export const updateRank = async (rankId: string, rankData: Rank) => {
  try {
    const response = await axios.put<Rank>(`${API_BASE_URL}/${rankId}`, rankData);
    return response.data;
  } catch (error) {
    console.error('Error updating rank:', error);
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
