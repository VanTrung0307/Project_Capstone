/* eslint-disable prettier/prettier */
import axios, { AxiosRequestHeaders } from 'axios';
import { AxiosError } from 'axios';
import { ApiError } from '@app/api/ApiError';
import { readToken } from '@app/services/localStorage.service';
import { message } from 'antd';

export const httpApi = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

httpApi.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${readToken()}`,
  } as AxiosRequestHeaders;
  return config;
});

httpApi.interceptors.response.use(undefined, (error: AxiosError) => {
  const responseData = error.response?.data;
  if (error.response?.status === 401) {
    message.error('Bạn phải đăng nhập trước');
    window.location.href = '/auth/login';
  }
  if (typeof responseData === 'object' && responseData !== null) {
    const message = (responseData as ApiErrorData).message || error.message;
    if (error.response && error.response.status === 404) {
      throw new ApiError<ApiErrorData>('Resource Not Found: ' + message, responseData as ApiErrorData);
    } else {
      throw new ApiError<ApiErrorData>(message, responseData as ApiErrorData);
    }
  }
  if (typeof responseData === 'object' && responseData !== null) {
    const message = (responseData as ApiErrorData).message || error.message;
    throw new ApiError<ApiErrorData>(message, responseData as ApiErrorData);
  } else {
    throw new ApiError<ApiErrorData>(error.message, undefined);
  }
});

export interface ApiErrorData {
  message: string;
}
