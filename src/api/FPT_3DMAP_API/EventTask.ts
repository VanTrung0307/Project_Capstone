/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/EventTasks`;

export type EventTask = {
  id: string;
  taskName: string;
  eventName: string;
  point: number;
  priority: number;
  startTime: number;
  endTime: number;
};

export type TaskByEvent = {
  eventId: string;
  eventName: string;
  taskId: string;
  eventtaskId: string;
  locationName: string;
  majorName: string;
  majorId: string;
  npcName: string;
  itemName: string;
  name: string;
  point: 0;
  type: string;
  status: string;
  priority: 0;
  starttime: string;
  endtime: string;
  eventStartTime: number;
  eventEndTime: number;
};

export type addEventTask = {
  taskId: [];
  eventId: string;
  startTime: string;
  endTime: string;
  // priority: number;
  point: number;
  status: string;
};

export type updateEventTaskData = {
  taskId: string;
  startTime: number;
  endTime: number;
  priority: number;
  point: number;
};

export type TaskEventList = {
  data: EventTask[];
};

export type TaskgetbyEventList = {
  data: TaskByEvent[];
};

export interface PaginationTaskEventData {
  data: EventTask[];
  pagination: Pagination;
}
export interface PaginationTaskgetbyEventData {
  data: TaskByEvent[];
  pagination: Pagination;
}

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

export const createListEventTask = async (taskData: addEventTask): Promise<EventTask> => {
  try {
    const response = await httpApi.post<EventTask>(`${API_BASE_URL}/createlisteventtask`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const getTaskbyEventId = async (
  eventId: string,
  pagination: Pagination,
): Promise<PaginationTaskgetbyEventData> => {
  try {
    const response = await httpApi.get<TaskgetbyEventList>(`${API_BASE_URL}/GetTaskByEventTaskWithEventId/${eventId}`);
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
    console.error('Error fetching paginated schools:', error);
    throw error;
  }
};

export const updateEventTask = async (id: string, taskeventData: updateEventTaskData): Promise<EventTask> => {
  try {
    const response = await httpApi.put<EventTask>(`${API_BASE_URL}/${id}`, taskeventData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};
