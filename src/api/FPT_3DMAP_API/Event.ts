/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Events`;

export type Event = {
  eventName: string;
  rankName: string;
  startTime: number;
  endTime: number
  status: string; 
  id: string;
};

export type EventList = {
  data: Event[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: EventList;
  pagination: Pagination;
}

export const getEvents = async () => {
  try {
    const response = await axios.get<EventList>(API_BASE_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

export const getEventById = async (eventId: string) => {
  try {
    const response = await axios.get<Event>(`${API_BASE_URL}/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

export const createEvent = async (roomlocationData: Event) => {
  try {
    const response = await axios.post<Event>(API_BASE_URL, roomlocationData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (eventId: string, eventData: Event) => {
  try {
    const response = await axios.put<Event>(`${API_BASE_URL}/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
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
