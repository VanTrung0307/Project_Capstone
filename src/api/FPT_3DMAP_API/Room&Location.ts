/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

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
  data: RoomLocation[];
  pagination: Pagination;
}

export const getPaginatedRoomLocations = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<RoomLocationList>(API_BASE_URL);
    const { data } = response.data;
    const { current = 1, pageSize = 1203 } = pagination;
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
    console.error('Error fetching paginated schools:', error);
    throw error;
  }
};

export const getPaginatedRoomLocationsWithNPC = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<RoomLocationList>(`${API_BASE_URL}/GetLocationListWithNPC`);
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
    console.error('Error fetching paginated schools:', error);
    throw error;
  }
};

export const getRoomLocations = async (): Promise<RoomLocation[]> => {
  try {
    const response = await httpApi.get<RoomLocationList>(API_BASE_URL);
    const { data } = response.data;
    return data;
  } catch (error) {
    console.error('Error fetching room locations:', error);
    throw error;
  }
};


export const getRoomLocationById = async (roomlocationId: string): Promise<RoomLocation> => {
  try {
    const response = await httpApi.get<RoomLocation>(`${API_BASE_URL}/${roomlocationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching roomlocation:', error);
    throw error;
  }
};

export const createRoomLocation = async (roomlocationData: RoomLocation): Promise<RoomLocation> => {
  try {
    const response = await httpApi.post<RoomLocation>(`${API_BASE_URL}/location`, roomlocationData);
    return response.data;
  } catch (error) {
    console.error('Error creating roomlocation:', error);
    throw error;
  }
};

export const updateRoomLocation = async (roomlocationId: string, roomlocationData: RoomLocation): Promise<RoomLocation> => {
  try {
    const response = await httpApi.put<RoomLocation>(`${API_BASE_URL}/${roomlocationId}`, roomlocationData);
    return response.data;
  } catch (error) {
    console.error('Error updating roomlocation:', error);
    throw error;
  }
};
