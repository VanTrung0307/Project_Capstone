/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Tasks`;

export type Task = {
  locationId: string;
  locationName: string;
  majorId: string;
  majorName: string;
  npcId: string;
  npcName: string;
  name: string;
  itemId: string;
  itemName: string;
  type: string;
  point: number;
  status: string;
  id: string;
};

export type TaskEvent = {
  id: string;
  locationName: string;
  majorName: string;
  npcName: string;
  itemName: string;
  name: string;
  type: string;
  status: string;
};

export type addTask = {
  locationId: string;
  majorId: string;
  npcId: string;
  itemId: string;
  name: string;
  point: number;
  type: string;
  status: string;
  id: string;
};

export type updateTaskData = {
  locationName: string;
  majorName: string;
  npcName: string;
  itemName: string;
  name: string;
  type: string;
  status: string;
};

export type TaskList = {
  data: Task[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: Task[];
  pagination: Pagination;
}

export const getPaginatedTasks = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<TaskList>(API_BASE_URL);
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
    console.error('Error fetching paginated tasks:', error);
    throw error;
  }
};

export const getTaskById = async (taskId: string): Promise<Task> => {
  try {
    const response = await httpApi.get<Task>(`${API_BASE_URL}/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

export const createTask = async (taskData: addTask): Promise<Task> => {
  try {
    const response = await httpApi.post<Task>(`${API_BASE_URL}/task`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id: string, taskData: updateTaskData): Promise<Task> => {
  try {
    const response = await httpApi.put<Task>(`${API_BASE_URL}/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id: string): Promise<Task> => {
  try {
    const response = await httpApi.delete<Task>(`${API_BASE_URL}/deletetask?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error updating school:', error);
    throw error;
  }
};
