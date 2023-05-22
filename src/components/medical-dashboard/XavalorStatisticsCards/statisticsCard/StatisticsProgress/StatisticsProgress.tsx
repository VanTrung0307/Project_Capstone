/* eslint-disable prettier/prettier */
import React from 'react';
import { Progress } from 'antd';
import * as S from './StatisticsProgress.styles';

interface XavaloStatisticsProgressProps {
  color: string;
  unit: string;
  value: number;
}

export const StatisticsProgress: React.FC<XavaloStatisticsProgressProps> = ({ color, value, unit }) => {
  return (
    <Progress
      type="circle"
      width={70}
      strokeColor={color}
      trailColor="transparent"
      percent={value}
      format={(percent) => (
        <>
          <S.ValueText>{percent}</S.ValueText>
          <br />
          <S.UnitText>{unit}</S.UnitText>
        </>
      )}
    />
  );
};
