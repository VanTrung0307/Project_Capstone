/* eslint-disable prettier/prettier */
import { LoginResponse } from '@app/api/FPT_3DMAP_API/Account';
import { Avatar } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './ProfileInfo.styles';

interface ProfileInfoProps {
  profileData: LoginResponse | null;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ profileData }) => {
  const [fullness] = useState(90);

  const { t } = useTranslation();

  return profileData ? (
    <S.Wrapper>
      <S.ImgWrapper>
        <Avatar shape="circle" src={`${process.env.PUBLIC_URL}/admin.png`} alt="Profile" />
      </S.ImgWrapper>
      <S.Title>ADMIN</S.Title>
      <S.Subtitle>ADMIN</S.Subtitle>
      <S.FullnessWrapper>
        <S.FullnessLine width={fullness}>{fullness}%</S.FullnessLine>
      </S.FullnessWrapper>
      <S.Text>{t('profile.fullness')}</S.Text>
    </S.Wrapper>
  ) : null;
};
