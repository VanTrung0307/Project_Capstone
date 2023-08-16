/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/EventTasks`;

export type EventTask = {
  id: string;
  taskName: string;
  eventName: string;
  point: number;
  priority: number;
  startTime: Date;
  endTime: Date;
};

export type addEventTask = {
  taskId: string;
  eventId: string;
  startTime: Date;
  endTime: Date;
  priority: number;
  point: number;
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export const createEventTask = async (taskData: addEventTask): Promise<EventTask> => {
  try {
    const response = await httpApi.post<EventTask>(`${API_BASE_URL}/eventtask`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};
