/* eslint-disable prettier/prettier */
import React from 'react';
import * as S from './References.styles';
import { FacebookOutlined, GithubOutlined, LinkedinOutlined, TwitterOutlined } from '@ant-design/icons';

export const References: React.FC = () => {
  return (
    <S.ReferencesWrapper>
      <S.Text>
        Made by{' '}
        <a href="https://github.com/VanTrung0307/Project_Capstone" target="_blank" rel="noreferrer">
          FPT_HCM Adventure Team{' '}
        </a>
        in 2023 &copy;. 
        {/* Based on{' '}
        <a href="https://ant.design/" target="_blank" rel="noreferrer">
          Ant-design.
        </a> */}
      </S.Text>
      <S.Icons>
        <a href="https://github.com/altence/lightence-admin" target="_blank" rel="noreferrer">
          <GithubOutlined />
        </a>
        <a href="https://twitter.com/altence_team" target="_blank" rel="noreferrer">
          <TwitterOutlined />
        </a>
        <a href="https://www.facebook.com/groups/altence" target="_blank" rel="noreferrer">
          <FacebookOutlined />
        </a>
        <a href="https://linkedin.com/company/altence" target="_blank" rel="noreferrer">
          <LinkedinOutlined />
        </a>
      </S.Icons>
    </S.ReferencesWrapper>
  );
};
