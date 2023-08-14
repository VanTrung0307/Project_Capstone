/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Students`;

export type Student = {
  id: string;
  schoolId: string;
  schoolname: string;
  fullname: string;
  email: string;
  phonenumber: number;
  graduateYear: string;
  classname: string;
  status: string;
};

export type updateStudentData = {
  schoolId: string;
  fullname: string;
  email: string;
  phonenumber: number;
  graduateYear: string;
  classname: string;
  status: string;
  id: string;
};

export type StudentList = {
  data: Student[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: Student[];
  pagination: Pagination;
}

export const getPaginatedStudent = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await axios.get<StudentList>(API_BASE_URL);
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

export const getStudenbySchoolById = async (schoolId: string, pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await axios.get<StudentList>(`${API_BASE_URL}/GetStudentBySchoolId/${schoolId}`);
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

export const uploadExcelStudent = async (schoolId: string, file: File): Promise<void> => {
  if (!schoolId) {
    console.error('schoolId is undefined.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/student-getbyschool/${schoolId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload response:', response.data);
  } catch (error) {
    console.error('Upload error:', error);
  }
};

export const createStudent = async (studentData: Student): Promise<Student> => {
  try {
    const response = await axios.post<Student>(`${API_BASE_URL}/student`, studentData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateStudent = async (id: string, studentData: updateStudentData): Promise<Student> => {
  try {
    const response = await axios.put<Student>(`${API_BASE_URL}/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
};
