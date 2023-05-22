/* eslint-disable prettier/prettier */
import { Space } from 'antd';
import React from 'react';
import * as S from './StatisticsInfo.styles';

interface XavaloStatisticsInfoProps {
  name: string;
  value: number;
}

export const StatisticsInfo: React.FC<XavaloStatisticsInfoProps> = ({ name, value }) => {
  return (
    <Space direction="vertical" size={6}>
      <S.Title>{name}</S.Title>

      {/* {prevValue && (
        <S.Text>
          <S.IconWrapper> {value > prevValue ? <CaretUpOutlined /> : <CaretDownOutlined />}</S.IconWrapper>
          {getDifference(value, prevValue)}
        </S.Text>
      )} */}
    </Space>
  );
};
