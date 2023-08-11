/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import VerifyEmailImage from '@app/assets/images/verify-email.webp';
import { VerificationCodeInput } from '@app/components/common/VerificationCodeInput/VerificationCodeInput';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import * as Auth from '@app/components/layouts/AuthLayout/AuthLayout.styles';
import { Image, Spin } from 'antd';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import * as S from './SecurityCodeForm.styles';

interface SecurityCodeFormProps {
  onBack?: () => void;
  onFinish?: () => void;
}

export const SecurityCodeForm: React.FC<SecurityCodeFormProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navigateBack = useCallback(() => navigate(-1), [navigate]);

  const [isLoading, setLoading] = useState(false);

  return (
    <Auth.FormWrapper>
      <BaseForm layout="vertical" requiredMark="optional">
        <Auth.BackWrapper onClick={onBack || navigateBack}>
          <Auth.BackIcon />
          {t('common.back')}
        </Auth.BackWrapper>
        <S.ContentWrapper>
          <S.ImageWrapper>
            <Image src={VerifyEmailImage} alt="Not found" preview={false} />
          </S.ImageWrapper>
          <Auth.FormTitle>{t('securityCodeForm.title')}</Auth.FormTitle>
          <S.VerifyEmailDescription>{t('common.verifCodeSent')}</S.VerifyEmailDescription>
          {isLoading ? <Spin /> : <VerificationCodeInput autoFocus />}
          <Link to="/" target="_blank">
            <S.NoCodeText>{t('securityCodeForm.noCode')}</S.NoCodeText>
          </Link>
        </S.ContentWrapper>
      </BaseForm>
    </Auth.FormWrapper>
  );
};
