/* eslint-disable prettier/prettier */
import axios, { AxiosError, AxiosResponse } from 'axios';

export type Register = {
  email: string;
  password: string;
  phoneNumber: number;
  gender: boolean;
  status: string;
  fullname: string;
};

export type Login = {
  email: string;
  password: string;
};

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

const API_BASE_URL = 'https://localhost:44367/api/Accounts/';

const handleSuccess = (response: AxiosResponse) => {
  return {
    status: response.status,
    data: response.data,
  };
};

const handleBadRequest = (error: AxiosError<BadRequest>) => {
  return {
    status: error.response?.status,
    error: error.response?.data,
  };
};

const handleServerError = (error: AxiosError) => {
  return {
    status: error.response?.status,
    error: 'Server Error',
  };
};

// GET /signin-google
export const signInWithGoogle = () => {
  return axios.get(`${API_BASE_URL}signin-google`);
};

// GET /callback
export const callback = () => {
  return axios.get(`${API_BASE_URL}callback`);
};

// POST /register
export const register = (userData: Register) => {
  return axios.post(`${API_BASE_URL}register`, userData).then(handleSuccess).catch(handleBadRequest);
};

// POST /login
export const login = (credentials: Login) => {
  return axios.post(`${API_BASE_URL}login`, credentials).then(handleSuccess).catch(handleBadRequest);
};

// POST /refreshtoken
export const refreshToken = (refreshToken: string) => {
  return axios
    .post(`${API_BASE_URL}refreshtoken`, { refreshToken })
    .then(handleSuccess)
    .catch(handleServerError);
};
