/* eslint-disable prettier/prettier */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'antd';
import { StatisticsInfo } from '../StatisticsInfo/StatisticsInfo';
import { StatisticsProgress } from '../StatisticsProgress/StatisticsProgress';
import { useResponsive } from '@app/hooks/useResponsive';
import { StatisticColor } from '@app/constants/config/statistics';
import * as S from './XavaloCard.styles';
import { themeObject } from '@app/styles/themes/themeVariables';
import { useAppSelector } from '@app/hooks/reduxHooks';

interface XavaloStatisticsCardProps {
  name: string;
  value: number;
  color: StatisticColor;
  unit: string;
  Icon: React.FC;
}

export const XavaloCard: React.FC<XavaloStatisticsCardProps> = ({ name, value, color, unit, Icon }) => {
  const theme = useAppSelector((state) => state.theme.theme);
  const { isTablet: isTabletOrHigher } = useResponsive();

  const { t } = useTranslation();

  return (
    <S.XavaloCard padding="0.5rem" $color={color}>
      <Row wrap={false} gutter={[isTabletOrHigher ? 10 : 5, 0]}>
        <Col>
          <S.IconWrapper>
            <S.Icon component={Icon} />
          </S.IconWrapper>
        </Col>

        <Col flex={1}>
          <Row justify="space-between" align="middle" wrap={false}>
            <Col>
              <StatisticsInfo name={t(name)} value={value} />
            </Col>

            <Col>
              <StatisticsProgress color={themeObject[theme][color]} unit={unit} value={value} />
            </Col>
          </Row>
        </Col>
      </Row>
    </S.XavaloCard>
  );
};
