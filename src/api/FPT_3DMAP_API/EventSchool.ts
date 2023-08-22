/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/SchoolEvents`;

export type EventSchool = {
  eventId: string;
  schoolId: string;
  eventName: string;
  schoolName: string;
  invitationLetter: string;
  status: string;
  id: string;
};
export type SchoolByEvent = {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  status: string;
  startTime: string;
  endTime: string;
  id: string;
};

export type addEventSchool = {
  eventId: string;
  schoolId: string;
  approvalstatus: string;
  status: string;
  startTime: string;
  endTime: string;
};

export type EventSchoolList = {
  data: EventSchool[];
};

export interface PaginationData {
  data: EventSchool[];
  pagination: Pagination;
}

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationSchoolEventData {
  data: EventSchool[];
  pagination: Pagination;
}

export const getPaginatedEventSchools = async (eventId: string, pagination: Pagination): Promise<PaginationData> => {
  try {
    const response = await httpApi.get<EventSchoolList>(API_BASE_URL);
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
    console.error('Error fetching paginated events:', error);
    throw error;
  }
};

export const createEventSchool = async (taskData: addEventSchool): Promise<EventSchool> => {
  try {
    const response = await httpApi.post<EventSchool>(`${API_BASE_URL}/schoolevent`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const getSchoolbyEventId = async (
  eventId: string,
  pagination: Pagination,
): Promise<PaginationSchoolEventData> => {
  try {
    const response = await httpApi.get<EventSchoolList>(`${API_BASE_URL}/GetSchoolByEventId/${eventId}`);
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
    console.error('Error fetching paginated schools:', error);
    throw error;
  }
};
