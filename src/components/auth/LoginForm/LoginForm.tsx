/* eslint-disable prettier/prettier */
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import * as Auth from '@app/components/layouts/AuthLayout/AuthLayout.styles';
import { notificationController } from '@app/controllers/notificationController';
import { useAppDispatch } from '@app/hooks/reduxHooks';
import { doLogin } from '@app/store/slices/authSlice';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as S from './LoginForm.styles';
import { LoginRequest, loginAdmin } from '@app/api/FPT_3DMAP_API/Account';
import { persistToken } from '@app/services/localStorage.service';
import { setUser } from '@app/store/slices/userSlice';

interface LoginFormData {
  username: string;
  password: string;
}

export const initValues: LoginFormData = {
  username: 'admin',
  password: 'admin@@',
};

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true);

    const loginPayload: LoginRequest = {
      username: values.username,
      password: values.password,
    };

    try {
      const response = await loginAdmin(loginPayload);

      if ('studentId' in response && 'token' in response) {
        const { studentId, token } = response;

        dispatch(doLogin(loginPayload));

        dispatch(setUser(studentId));

        persistToken(token);

        navigate('/');
      } else {
        notificationController.error({ message: 'Login failed.' });
      }
    } catch (err) {
      console.error('Error Logging In:', err);
      notificationController.error({ message: 'An error occurred while logging in.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Auth.FormWrapper>
      <BaseForm layout="vertical" onFinish={handleSubmit} requiredMark="optional" initialValues={initValues}>
        <Auth.FormTitle>{t('common.login')}</Auth.FormTitle>
        <S.LoginDescription>{t('login.loginInfo')}</S.LoginDescription>
        <Auth.FormItem
          name="username"
          label={'Username'}
          rules={[{ required: true, message: t('common.requiredField') }]}
        >
          <Auth.FormInput placeholder={t('common.username')} />
        </Auth.FormItem>
        <Auth.FormItem
          label={t('common.password')}
          name="password"
          rules={[{ required: true, message: t('common.requiredField') }]}
        >
          <Auth.FormInputPassword placeholder={t('common.password')} />
        </Auth.FormItem>
        <BaseForm.Item noStyle>
          <Auth.SubmitButton type="primary" htmlType="submit" loading={isLoading}>
            {t('common.login')}
          </Auth.SubmitButton>
        </BaseForm.Item>
      </BaseForm>
    </Auth.FormWrapper>
  );
};
