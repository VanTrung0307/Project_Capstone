/* eslint-disable prettier/prettier */
import React from 'react';
import * as S from './References.styles';

export const References: React.FC = () => {
  return (
    <S.ReferencesWrapper>
      <S.Text>
        Made by{' '}
        <a href="https://github.com/VanTrung0307/Project_Capstone" target="_blank" rel="noreferrer">
          FPT_HCM Adventure Team{' '}
        </a>
        in 2023 &copy;.
      </S.Text>
    </S.ReferencesWrapper>
  );
};
