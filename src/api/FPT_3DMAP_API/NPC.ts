/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Npcs`;

export type Npc = {
  name: string;
  introduce: string;
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
  data: Npc[];
  pagination: Pagination;
}

export const getPaginatedNpcs = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<NpcList>(API_BASE_URL);
    const { data } = response.data;
    const { current = 1, pageSize = 100 } = pagination;
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
    console.error('Error fetching paginated npcs:', error);
    throw error;
  }
};

export const createNpc = async (npcData: Npc): Promise<Npc> => {
  try {
    const response = await httpApi.post<Npc>(`${API_BASE_URL}/npc`, npcData);
    return response.data;
  } catch (error) {
    console.error('Error creating npc:', error);
    throw error;
  }
};

export const getNpcById = async (npcId: string): Promise<Npc> => {
  try {
    const response = await httpApi.get<Npc>(`${API_BASE_URL}/${npcId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching npc:', error);
    throw error;
  }
};

export const updateNpc = async (npcId: string, npcData: Npc): Promise<Npc> => {
  try {
    const response = await httpApi.put<Npc>(`${API_BASE_URL}/${npcId}`, npcData);
    return response.data;
  } catch (error) {
    console.error('Error updating npc:', error);
    throw error;
  }
};
