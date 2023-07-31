/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Schools`;

export type School = {
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

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: School[];
  pagination: Pagination;
}

export const getPaginatedSchools = async (pagination: Pagination) => {
  try {
    const response = await axios.get<SchoolList>(API_BASE_URL);
    const { data } = response.data;
    const { current = 1, pageSize = 5 } = pagination;
    const total = data.length;

    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedData = data.slice(startIndex, endIndex);

    let objectCount = 0;

    paginatedData.forEach((item) => {
      objectCount++;
      console.log('Object', objectCount, ':', item);
    });

    console.log('Total objects:', objectCount);

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

export const getSchoolById = async (schoolId: string) => {
  try {
    const response = await axios.get<School>(`${API_BASE_URL}/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching school:', error);
    throw error;
  }
};

export const createSchool = async (schoolData: School) => {
  try {
    const response = await axios.post<School>(`${API_BASE_URL}/school`, schoolData);
    return response.data;
  } catch (error) {
    console.error('Error creating school:', error);
    throw error;
  }
};

export const updateSchool = async (schoolId: string, schoolData: School) => {
  try {
    const response = await axios.put<School>(`${API_BASE_URL}/${schoolId}`, schoolData);
    return response.data;
  } catch (error) {
    console.error('Error updating school:', error);
    throw error;
  }
};
