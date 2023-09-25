/* eslint-disable prettier/prettier */
import { Space } from 'antd';
import React from 'react';
import * as S from './StatisticsInfo.styles';

interface FPTHCMStatisticsInfoProps {
  name: string;
  subname: string;
}

export const StatisticsInfo: React.FC<FPTHCMStatisticsInfoProps> = ({ name, subname }) => {
  return (
    <Space direction="vertical">
      <S.Title>{name}</S.Title>
      <S.Text style={{ color: 'white' }}>{subname}</S.Text>

      {/* {prevValue && (
        <S.Text>
          <S.IconWrapper> {value > prevValue ? <CaretUpOutlined /> : <CaretDownOutlined />}</S.IconWrapper>
          {getDifference(value, prevValue)}
        </S.Text>
      )} */}
    </Space>
  );
};
