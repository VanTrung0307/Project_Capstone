/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Questions`;

export type Question = {
  name: string;
  majorName: string;
  answerName: string;
  status: string;
  id: string;
};

export type QuestionList = {
  data: Question[];
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationData {
  data: Question[];
  pagination: Pagination;
}

export const getPaginatedQuestions = async (pagination: Pagination) => {
  try {
    const response = await axios.get<QuestionList>(API_BASE_URL);
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
    console.error('Error fetching paginated questions:', error);
    throw error;
  }
};

export const getQuestionById = async (questionId: string) => {
  try {
    const response = await axios.get<Question>(`${API_BASE_URL}/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
};

export const createQuestion = async (questionData: Question) => {
  try {
    const response = await axios.post<Question>(API_BASE_URL, questionData);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

export const updateQuestion = async (questionId: string, questionData: Question) => {
  try {
    const response = await axios.put<Question>(`${API_BASE_URL}/${questionId}`, questionData);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
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
