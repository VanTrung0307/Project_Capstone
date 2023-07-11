/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = 'https://localhost:44367/api/Players';

export type Player = {
  userId: string;
  totalPoint: number;
  totalTime: number;
  id: string;
};

export const getPlayers = async () => {
  try {
    const response = await axios.get<Player[]>(API_BASE_URL);
    return response.data;
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

export const deletePlayer = async (playerId: string) => {
  try {
    await axios.delete(`${API_BASE_URL}/${playerId}`);
    // No response data is needed for delete operations
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
};
