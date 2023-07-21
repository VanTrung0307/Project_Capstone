/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Tasks`;

export type Task = {
  locationName: string;
  majorName: string;
  npcName: string;
  name: string
  durationCheckin: number;
  isRequireitem: string; //boolean
  timeOutAmount: number;
  type: string;
  point: number;
  status: string; 
  id: string;
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

export const getPaginatedTasks = async (pagination: Pagination) => {
  try {
    const response = await axios.get<TaskList>(API_BASE_URL);
    const { data } = response.data;
    const { current = 1, pageSize = 5 } = pagination;
    const total = data.length;

    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Simulate a delay of 1 second using setTimeout
    await new Promise((resolve) => setTimeout(resolve, 1000));

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

export const getTaskById = async (taskId: string) => {
  try {
    const response = await axios.get<Task>(`${API_BASE_URL}/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

export const createTask = async (taskData: Task) => {
  try {
    const response = await axios.post<Task>(API_BASE_URL, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, taskData: Task) => {
  try {
    const response = await axios.put<Task>(`${API_BASE_URL}/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
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