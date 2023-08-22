/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/Questions`;

export type Question = {
  id: string;
  majorName: string;
  name: string;
  status: string;
  answers: Array<{ id: string; answerName: string; isRight: boolean }>;
};

export type addQuestion = {
  answers: Array<{ answerName: string; isRight: boolean }>;
  majorId: string;
  name: string;
  status: string;
};

export type updateQuestionData = {
  answerId: string;
  majorId: string;
  name: string;
  status: string;
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

export const getPaginatedQuestions = async (pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<QuestionList>(`${API_BASE_URL}/GetQuestionListAndAnswer`);
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
    console.error('Error fetching paginated questions:', error);
    throw error;
  }
};

export const getQuestionById = async (questionId: string): Promise<Question> => {
  try {
    const response = await httpApi.get<Question>(`${API_BASE_URL}/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
};

export const createQuestion = async (questionData: addQuestion): Promise<Question> => {
  try {
    const response = await httpApi.post<Question>(`${API_BASE_URL}/question/answer`, questionData);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

export const updateQuestion = async (id: string, questionData: updateQuestionData): Promise<Question> => {
  try {
    const response = await httpApi.put<Question>(`${API_BASE_URL}/${id}`, questionData);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};
