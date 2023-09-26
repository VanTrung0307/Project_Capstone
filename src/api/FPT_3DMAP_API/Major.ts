/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Major`;

export type Major = {
  name: string;
  description: string;
  status: string;
  id: string;
};

export type MajorList = {
  data: Major[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: Major[];
  pagination: Pagination;
}

export const getPaginatedMajors = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<MajorList>(API_BASE_URL);
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
    console.error('Error fetching paginated majors:', error);
    throw error;
  }
};

export const getMajorById = async (majorId: string): Promise<Major> => {
  try {
    const response = await httpApi.get<Major>(`${API_BASE_URL}/${majorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching major:', error);
    throw error;
  }
};

export const createMajor = async (majorData: Major): Promise<Major> => {
  try {
    const response = await httpApi.post<Major>(`${API_BASE_URL}/major`, majorData);
    return response.data;
  } catch (error) {
    console.error('Error creating major:', error);
    throw error;
  }
};

export const updateMajor = async (majorId: string, majorData: Major): Promise<Major> => {
  try {
    const response = await httpApi.put<Major>(`${API_BASE_URL}/${majorId}`, majorData);
    return response.data;
  } catch (error) {
    console.error('Error updating major:', error);
    throw error;
  }
};


export const getExcelTemplateMajor = async (): Promise<Blob> => {
  try {
    const response = await httpApi.get(`${API_BASE_URL}/excel-template-major`, {
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } catch (error) {
    console.error('Error getting template student excel:', error);
    throw error;
  }
};