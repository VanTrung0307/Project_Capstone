/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Questions`;

export type Question = {
  questionName: string;
  majorName: string;
  isRight: string;
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
  data: QuestionList;
  pagination: Pagination;
}

export const getQuestions = async () => {
  try {
    const response = await axios.get<QuestionList>(API_BASE_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
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
