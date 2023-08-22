/* eslint-disable prettier/prettier */

import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Events`;

export type Event = {
  name: string;
  status: string;
  id: string;
  createdAt: string;
};

export type addEvent = {
  name: string;
  status: string;
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
    const response = await httpApi.get<EventList>(API_BASE_URL);
    const { data } = response.data;
    const { current = 1, pageSize = 10 } = pagination;
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
    console.error('Error fetching paginated events:', error);
    throw error;
  }
};

export const getEventById = async (eventId: string): Promise<Event> => {
  try {
    const response = await httpApi.get<Event>(`${API_BASE_URL}/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

export const createEvent = async (eventData: addEvent): Promise<Event> => {
  try {
    const response = await httpApi.post<Event>(`${API_BASE_URL}/event`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (eventId: string, eventData: Event): Promise<Event> => {
  try {
    const response = await httpApi.put<Event>(`${API_BASE_URL}/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const getExcelTemplateEvent = async (): Promise<Blob> => {
  try {
    const response = await httpApi.get(`${API_BASE_URL}/excel-template-event`, {
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } catch (error) {
    console.error('Error getting template student excel:', error);
    throw error;
  }
};

export const uploadExcelEvent = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await httpApi.post(`${API_BASE_URL}/upload-excel-event`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      console.log('Upload successful:', response.data);
    } else {
      console.error('Upload failed with status:', response.status);
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
};
