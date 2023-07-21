/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Answers`;

export type Answer = {
  answerName: string;
  isRight: boolean;
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

export const getPaginatedAnswers = async (pagination: Pagination) => {
  try {
    const response = await axios.get<AnswerList>(API_BASE_URL);
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
    console.error('Error fetching paginated answers:', error);
    throw error;
  }
};

export const getAnswerById = async (answerId: string) => {
  try {
    const response = await axios.get<Answer>(`${API_BASE_URL}/${answerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching answer:', error);
    throw error;
  }
};

export const createAnswer = async (answerData: Answer) => {
  try {
    const response = await axios.post<Answer>(API_BASE_URL, answerData);
    return response.data;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
};

export const updateAnswer = async (eventId: string, eventData: Answer) => {
  try {
    const response = await axios.put<Answer>(`${API_BASE_URL}/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};
