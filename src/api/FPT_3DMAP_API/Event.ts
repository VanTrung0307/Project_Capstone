/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Events`;

export type Event = {
  name: string;
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
  data: Event[];
  pagination: Pagination;
}

export const getPaginatedEvents = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await axios.get<EventList>(API_BASE_URL);
    const { data } = response.data;
    const { current = 1, pageSize = 10 } = pagination;
    const total = data.length;

    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedData = data.slice(startIndex, endIndex);
    console.log(paginatedData);
    

    return {
      data: paginatedData,
      pagination: {
        current,
        pageSize,
        total,
      },
    };
  } catch (error) {
    console.error('Error fetching paginated events:', error);
    throw error;
  }
};

export const getEventById = async (eventId: string): Promise<Event> => {
  try {
    const response = await axios.get<Event>(`${API_BASE_URL}/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

export const createEvent = async (eventData: Event): Promise<Event> => {
  try {
    const response = await axios.post<Event>(`${API_BASE_URL}/event`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (eventId: string, eventData: Event): Promise<Event> => {
  try {
    const response = await axios.put<Event>(`${API_BASE_URL}/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};
