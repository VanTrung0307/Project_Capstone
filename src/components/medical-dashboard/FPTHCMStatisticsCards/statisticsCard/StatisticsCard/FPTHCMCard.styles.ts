/* eslint-disable prettier/prettier */
import styled from 'styled-components';
import { default as AntIcon } from '@ant-design/icons';
import { DashboardCard } from '@app/components/medical-dashboard/DashboardCard/DashboardCard';
import { StatisticColor } from '@app/constants/config/statistics';
import { Text } from '../StatisticsInfo/StatisticsInfo.styles';

interface StatisticsProps {
  $color: StatisticColor;
}

export const IconWrapper = styled.div`
  margin-top: 0.25rem;
`;

export const Icon = styled(AntIcon)`
  font-size: 2.5rem;
  margin-top: 25px;
`;

export const FPTHCMCard = styled(DashboardCard)<StatisticsProps>`
  line-height: 1;
  overflow: hidden;
  background-image: radial-gradient(100% 100% at 100% 0, #ff9000 0, #ff7500 100%);
  box-shadow: rgb(38, 57, 77) 0px 20px 30px -10px;
  
  ${Text} {
    color: ${(props) => `var(--${props.$color}-color)`};
  }
`;
