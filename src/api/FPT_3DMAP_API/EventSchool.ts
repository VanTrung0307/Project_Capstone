/* eslint-disable prettier/prettier */
import { httpApi } from '../http.api';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/SchoolEvents`;

export type EventSchool = {
  id: string;
  eventId: string;
  schoolId: string;
  eventName: string;
  schoolName: string;
  startTime: string;
  endTime: string;
  approvalStatus: string;
  status: string;
  email: string;
  phoneNumber: string;
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
  schoolIds: [];
  approvalstatus: string;
  status: string;
  startTime: string;
  endTime: string;
};

export type updateEventSchool = {
  schoolId: string;
  startTime: string;
  endTime: string;
  status: string;
  approvalStatus: string;
  id: string;
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

export const getPaginatedEventSchools = async (pagination: Pagination): Promise<PaginationData> => {
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
    const response = await httpApi.post<EventSchool>(`${API_BASE_URL}/createlistschoolevent`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const getSchoolbyEventId = async (
  schoolId: string,
  pagination: Pagination,
): Promise<PaginationSchoolEventData> => {
  try {
    const response = await httpApi.get<EventSchoolList>(`${API_BASE_URL}/GetSchoolByEventId/${schoolId}`);
    const { data } = response.data;
    const { current = 1, pageSize = 100 } = pagination;
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

export const updateSchoolEvent = async (id: string, update: updateEventSchool): Promise<EventSchool> => {
  try {
    const response = await httpApi.put<EventSchool>(`${API_BASE_URL}/Schooleventupdate/${id}`, update);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteSchoolEvent = async (id: string): Promise<EventSchool> => {
  try {
    const response = await httpApi.delete<EventSchool>(`${API_BASE_URL}/deleteschoolevent?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error updating school:', error);
    throw error;
  }
};
