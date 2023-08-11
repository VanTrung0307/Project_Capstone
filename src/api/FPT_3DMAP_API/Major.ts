/* eslint-disable prettier/prettier */
import axios from 'axios';

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
    const response = await axios.get<MajorList>(API_BASE_URL);
    const { data } = response.data;
    const { current = 1, pageSize = 5 } = pagination;
    const total = data.length;

    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedData = data.slice(startIndex, endIndex);

    let objectCount = 0;

    paginatedData.forEach((item) => {
      objectCount++;
      console.log("Object", objectCount, ":", item);
    });

    console.log("Total objects:", objectCount);

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
    const response = await axios.get<Major>(`${API_BASE_URL}/${majorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching major:', error);
    throw error;
  }
};

export const createMajor = async (majorData: Major): Promise<Major> => {
  try {
    const response = await axios.post<Major>(`${API_BASE_URL}/major`, majorData);
    return response.data;
  } catch (error) {
    console.error('Error creating major:', error);
    throw error;
  }
};

export const updateMajor = async (majorId: string, majorData: Major): Promise<Major> => {
  try {
    const response = await axios.put<Major>(`${API_BASE_URL}/${majorId}`, majorData);
    return response.data;
  } catch (error) {
    console.error('Error updating major:', error);
    throw error;
  }
};
