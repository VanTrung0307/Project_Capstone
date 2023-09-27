/* eslint-disable prettier/prettier */
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import * as Auth from '@app/components/layouts/AuthLayout/AuthLayout.styles';
import { notificationController } from '@app/controllers/notificationController';
import { useAppDispatch } from '@app/hooks/reduxHooks';
import { doLogin, doLogout } from '@app/store/slices/authSlice';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as S from './LoginForm.styles';
import { LoginRequest, loginAdmin } from '@app/api/FPT_3DMAP_API/Account';
import { persistToken } from '@app/services/localStorage.service';
import { setUser } from '@app/store/slices/userSlice';
import { useEffect } from 'react';

interface LoginFormData {
  username: string;
  password: string;
}

export const initValues: LoginFormData = {
  username: '',
  password: '',
};

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(doLogout());
      notificationController.info({ message: 'Đã tự động đăng xuất sau một giờ không hoạt động.' });
    }, 60 * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [dispatch]);

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
        notificationController.success({ message: 'Đăng nhập thành công' });
        navigate('/');
      } else {
        notificationController.error({ message: 'Tài khoản hoặc mật khẩu sai' });
      }
    } catch (err) {
      notificationController.error({ message: 'Tài khoản hoặc mật khẩu sai' });
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
          label={t('common.username')}
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
