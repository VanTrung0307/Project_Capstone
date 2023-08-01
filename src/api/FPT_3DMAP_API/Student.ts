/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Students`;

export type Student = {
  id: string;
  schoolId: string;
  fullname: string;
  email: string;
  phonenumber: number;
  graduateYear: string;
  classname: string;
  status: string;
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

export const getPaginatedSchools = async (pagination: Pagination) => {
  try {
    const response = await axios.get<StudentList>(API_BASE_URL);
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

export const getStudenbySchoolById = async (schoolId: string, pagination: Pagination) => {
  try {
    const response = await axios.get<StudentList>(`${API_BASE_URL}/GetStudentBySchoolId/${schoolId}`);
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

export const uploadExcelStudent = async (schoolId: string, file: File) => {
  if (!schoolId) {
    console.error('schoolId is undefined.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/student/${schoolId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload response:', response.data);
  } catch (error) {
    console.error('Upload error:', error);
  }
};
