/* eslint-disable prettier/prettier */
import React from 'react';
import { Progress } from 'antd';
import * as S from './StatisticsProgress.styles';

interface FPTHCMStatisticsProgressProps {
  color: string;
  unit: string;
  value: number;
}

export const StatisticsProgress: React.FC<FPTHCMStatisticsProgressProps> = ({ value, unit }) => {
  const color = '#2BFF88';

  return (
    <Progress
      type="circle"
      width={100}
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
