/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import * as Auth from '@app/components/layouts/AuthLayout/AuthLayout.styles';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as S from './ForgotPasswordForm.styles';

const initValues = {
  email: 'chris.johnson@altence.com',
};

export const ForgotPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);

  return (
    <Auth.FormWrapper>
      <BaseForm layout="vertical" requiredMark="optional" initialValues={initValues}>
        <Auth.BackWrapper onClick={() => navigate(-1)}>
          <Auth.BackIcon />
          {t('common.back')}
        </Auth.BackWrapper>
        <Auth.FormTitle>{t('common.resetPassword')}</Auth.FormTitle>
        <S.Description>{t('forgotPassword.description')}</S.Description>
        <Auth.FormItem
          name="email"
          label={t('common.email')}
          rules={[{ required: true, message: t('common.emailError') }]}
        >
          <Auth.FormInput placeholder={t('common.email')} />
        </Auth.FormItem>
        <BaseForm.Item noStyle>
          <S.SubmitButton type="primary" htmlType="submit" loading={isLoading}>
            {t('forgotPassword.sendInstructions')}
          </S.SubmitButton>
        </BaseForm.Item>
      </BaseForm>
    </Auth.FormWrapper>
  );
};
