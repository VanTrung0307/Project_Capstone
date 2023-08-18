/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Schools`;

export type School = {
  name: string;
  phoneNumber: number;
  email: string;
  address: string;
  status: string;
  id: string;
};

export type SchoolEvent = {
  name: string;
  phoneNumber: number;
  email: string;
  address: string;
  status: string;
  id: string;
};

export type SchoolList = {
  data: School[];
};

export type SchoolEventList = {
  data: SchoolEvent[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: School[];
  pagination: Pagination;
}
export interface PaginationSchoolEventData {
  data: SchoolEvent[];
  pagination: Pagination;
}

export const getPaginatedSchools = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<SchoolList>(API_BASE_URL);
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

export const getSchoolById = async (schoolId: string): Promise<School> => {
  try {
    const response = await httpApi.get<School>(`${API_BASE_URL}/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching school:', error);
    throw error;
  }
};

export const createSchool = async (schoolData: School): Promise<School> => {
  try {
    const response = await httpApi.post<School>(`${API_BASE_URL}/school`, schoolData);
    return response.data;
  } catch (error) {
    console.error('Error creating school:', error);
    throw error;
  }
};

export const updateSchool = async (schoolId: string, schoolData: School): Promise<School> => {
  try {
    const response = await httpApi.put<School>(`${API_BASE_URL}/${schoolId}`, schoolData);
    return response.data;
  } catch (error) {
    console.error('Error updating school:', error);
    throw error;
  }
};