/* eslint-disable prettier/prettier */
import React from 'react';
import * as S from './References.styles';

export const References: React.FC = () => {
  return (
    <S.ReferencesWrapper>
      <S.Text>
        Made by{' '}
        <a href="https://altence.com" target="_blank" rel="noreferrer">
          Altence{' '}
        </a>
        in 2022 &copy;. Based on{' '}
        <a href="https://ant.design/" target="_blank" rel="noreferrer">
          Ant-design.
          </a>
      </S.Text>
    </S.ReferencesWrapper>
  );
};
