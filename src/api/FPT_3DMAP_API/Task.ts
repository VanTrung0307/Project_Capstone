/* eslint-disable prettier/prettier */
import axios from 'axios';

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

export type TaskList = {
  data: Task[];
};

export type TaskEventList = {
  data: TaskEvent[];
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
export interface PaginationTaskEventData {
  data: TaskEvent[];
  pagination: Pagination;
}

export const getPaginatedTasks = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await axios.get<TaskList>(API_BASE_URL);
    const { data } = response.data;
    const { current = 1, pageSize = 5 } = pagination;
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
    const response = await axios.get<Task>(`${API_BASE_URL}/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

export const createTask = async (taskData: addTask): Promise<Task> => {
  try {
    const response = await axios.post<Task>(`${API_BASE_URL}/task`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id: string, taskData: updateTaskData): Promise<Task> => {
  try {
    const response = await axios.put<Task>(`${API_BASE_URL}/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const getTaskbyEventId = async (eventId: string, pagination: Pagination): Promise<PaginationTaskEventData> => {
  try {
    const response = await axios.get<TaskEventList>(`${API_BASE_URL}/GetTaskByEventTaskWithEventId/${eventId}`);
    const { data } = response.data;
    const { current = 1, pageSize = 5 } = pagination;
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
