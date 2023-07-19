/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Schools`;

export type School = {
  schoolName: string;
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
  data: SchoolList;
  pagination: Pagination;
}

export const getSchools = async () => {
  try {
    const response = await axios.get<SchoolList>(API_BASE_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching schools:', error);
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
    const response = await axios.post<School>(API_BASE_URL, schoolData);
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

// export const deletePlayer = async (playerId: string) => {
//   try {
//     await axios.delete(`${API_BASE_URL}/${playerId}`);
//     // No response data is needed for delete operations
//   } catch (error) {
//     console.error('Error deleting player:', error);
//     throw error;
//   }
// };
