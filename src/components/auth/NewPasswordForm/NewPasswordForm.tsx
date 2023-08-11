/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import * as Auth from '@app/components/layouts/AuthLayout/AuthLayout.styles';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as S from './NewPasswordForm.styles';

interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
}

const initStates = {
  password: 'new-password',
  confirmPassword: 'new-password',
};

export const NewPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);

  return (
    <Auth.FormWrapper>
      <BaseForm layout="vertical" requiredMark="optional" initialValues={initStates}>
        <Auth.BackWrapper onClick={() => navigate(-1)}>
          <Auth.BackIcon />
          {t('common.back')}
        </Auth.BackWrapper>
        <Auth.FormTitle>{t('newPassword.title')}</Auth.FormTitle>
        <S.Description>{t('newPassword.description')}</S.Description>
        <Auth.FormItem
          name="password"
          label={t('common.password')}
          rules={[{ required: true, message: t('common.requiredField') }]}
        >
          <Auth.FormInputPassword placeholder={t('common.password')} />
        </Auth.FormItem>
        <Auth.FormItem
          name="confirmPassword"
          label={t('common.confirmPassword')}
          dependencies={['password']}
          rules={[
            { required: true, message: t('common.requiredField') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('common.confirmPasswordError')));
              },
            }),
          ]}
          hasFeedback
        >
          <Auth.FormInputPassword placeholder={t('common.confirmPassword')} />
        </Auth.FormItem>
        <BaseForm.Item noStyle>
          <S.SubmitButton type="primary" htmlType="submit" loading={isLoading}>
            {t('common.resetPassword')}
          </S.SubmitButton>
        </BaseForm.Item>
      </BaseForm>
    </Auth.FormWrapper>
  );
};
