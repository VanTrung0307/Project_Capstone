/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Npcs`;

export type Npc = {
  npcName: string;
  introduce: string;
  questionName: string;
  status: string;
  id: string;
};

export type NpcList = {
  data: Npc[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: NpcList;
  pagination: Pagination;
}

export const getNpcs = async () => {
  try {
    const response = await axios.get<NpcList>(API_BASE_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching npcs:', error);
    throw error;
  }
};

export const getNpcById = async (npcId: string) => {
  try {
    const response = await axios.get<Npc>(`${API_BASE_URL}/${npcId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching npc:', error);
    throw error;
  }
};

export const createNpc = async (npcData: Npc) => {
  try {
    const response = await axios.post<Npc>(API_BASE_URL, npcData);
    return response.data;
  } catch (error) {
    console.error('Error creating npc:', error);
    throw error;
  }
};

export const updateNpc = async (npcId: string, npcData: Npc) => {
  try {
    const response = await axios.put<Npc>(`${API_BASE_URL}/${npcId}`, npcData);
    return response.data;
  } catch (error) {
    console.error('Error updating npc:', error);
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
