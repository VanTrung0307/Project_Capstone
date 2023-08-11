/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse } from 'axios';

export type Register = {
  email: string;
  password: string;
  phoneNumber: number;
  gender: boolean;
  status: string;
  fullname: string;
};

export type Login = {
  username: string;
  password: string;
};

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  studentId: string;
  schoolId: string;
  email: string;
  token: string;
  refreshToken: string;
}

export type Refreshtoken = {
  accessToken: string;
  refreshToken: string;
};

export type BadRequest = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
};

const API_BASE_URL = 'http://anhkiet-001-site1.htempurl.com/api/Accounts/';

// GET /callback
export const callback = (): Promise<AxiosResponse<any>> => {
  return axios.get(`${API_BASE_URL}callback`);
};

// POST /login
export const loginAdmin = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}loginadmin`, credentials);

    const adaptedResponse: LoginResponse = {
      studentId: response.data.data.studentId,
      schoolId: response.data.data.schoolId,
      email: response.data.data.email,
      token: response.data.data.token,
      refreshToken: response.data.data.refreshToken,
    };

    return adaptedResponse;
  } catch (error) {
    throw error;
  }
};
