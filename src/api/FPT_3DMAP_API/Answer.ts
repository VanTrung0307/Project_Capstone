/* eslint-disable prettier/prettier */
import axios from 'axios';
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Answers`;

export type Answer = {
  answerName: string;
  isRight: string;
  id: string
};

export type AnswerList = {
  data: Answer[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: Answer[];
  pagination: Pagination;
}

export const getPaginatedAnswers = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<AnswerList>(API_BASE_URL);
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
    console.error('Error fetching paginated answers:', error);
    throw error;
  }
};

export const getAnswerById = async (answerId: string): Promise<Answer> => {
  try {
    const response = await axios.get<Answer>(`${API_BASE_URL}/${answerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching answer:', error);
    throw error;
  }
};

export const createAnswer = async (answerData: Answer): Promise<Answer> => {
  try {
    const response = await axios.post<Answer>(`${API_BASE_URL}/answer`, answerData);
    return response.data;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
};

export const updateAnswer = async (answerId: string, answerData: Answer): Promise<Answer> => {
  try {
    const response = await axios.put<Answer>(`${API_BASE_URL}/${answerId}`, answerData);
    return response.data;
  } catch (error) {
    console.error('Error updating answer:', error);
    throw error;
  }
};
