/* eslint-disable prettier/prettier */
import { httpApi } from '@app/api/http.api';
import './mocks/auth.api.mock';
import { UserModel } from '@app/domain/UserModel';
import { AxiosResponse } from 'axios';

export interface AuthData {
  email: string;
  password: string;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface SecurityCodePayload {
  code: string;
}

export interface NewPasswordData {
  newPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserModel;
}

export const login = (loginPayload: LoginRequest): Promise<LoginResponse> =>
  httpApi
    .post<LoginResponse>('login', { ...loginPayload })
    .then((response: AxiosResponse<LoginResponse>) => response.data);

export const signUp = (signUpData: SignUpRequest): Promise<LoginResponse> =>
  httpApi
    .post<LoginResponse>('signUp', { ...signUpData })
    .then((response: AxiosResponse<LoginResponse>) => response.data);

export const resetPassword = (resetPasswordPayload: ResetPasswordRequest): Promise<LoginResponse> =>
  httpApi
    .post<LoginResponse>('forgotPassword', { ...resetPasswordPayload })
    .then((response: AxiosResponse<LoginResponse>) => response.data);

export const verifySecurityCode = (securityCodePayload: SecurityCodePayload): Promise<LoginResponse> =>
  httpApi
    .post<LoginResponse>('verifySecurityCode', { ...securityCodePayload })
    .then((response: AxiosResponse<LoginResponse>) => response.data);

export const setNewPassword = (newPasswordData: NewPasswordData): Promise<LoginResponse> =>
  httpApi
    .post<LoginResponse>('setNewPassword', { ...newPasswordData })
    .then((response: AxiosResponse<LoginResponse>) => response.data);
