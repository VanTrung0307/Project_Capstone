/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/SchoolEvents`;

export type EventSchool = {
  eventId: string;
  schoolId: string;
  invitationLetter: string;
  status: string;
  id: string;
};

export type addEventSchool = {
  eventId: string;
  schoolId: string;
  invitationLetter: string;
  status: string;
};

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export const createEventSchool = async (taskData: addEventSchool): Promise<EventSchool> => {
  try {
    const response = await axios.post<EventSchool>(`${API_BASE_URL}/schoolevent`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};
