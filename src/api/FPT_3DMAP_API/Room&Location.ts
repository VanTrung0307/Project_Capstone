/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Locations`;

export type RoomLocation = {
  x: number;
  y: number;
  z: number;
  locationName: string;
  status: string;
  id: string;
};

export type RoomLocationList = {
  data: RoomLocation[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: RoomLocationList;
  pagination: Pagination;
}

export const getRoomLocations = async () => {
  try {
    const response = await axios.get<RoomLocationList>(API_BASE_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching roomlocations:', error);
    throw error;
  }
};

export const getRoomLocationById = async (roomlocationId: string) => {
  try {
    const response = await axios.get<RoomLocation>(`${API_BASE_URL}/${roomlocationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching roomlocation:', error);
    throw error;
  }
};

export const createRoomLocation = async (roomlocationData: RoomLocation) => {
  try {
    const response = await axios.post<RoomLocation>(API_BASE_URL, roomlocationData);
    return response.data;
  } catch (error) {
    console.error('Error creating roomlocation:', error);
    throw error;
  }
};

export const updateRoomLocation = async (roomlocationId: string, roomlocationData: RoomLocation) => {
  try {
    const response = await axios.put<RoomLocation>(`${API_BASE_URL}/${roomlocationId}`, roomlocationData);
    return response.data;
  } catch (error) {
    console.error('Error updating roomlocation:', error);
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
