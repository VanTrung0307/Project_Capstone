/* eslint-disable prettier/prettier */
import { getXavaloStatistics, xavaloStatistic } from '@app/api/xavaloStatistics.api';
import { Col } from 'antd';
import { xavalo_statistics as ConfigXavaloStatistic } from 'constants/config/statisticsXavalo';
import { useResponsive } from 'hooks/useResponsive';
import React, { useEffect, useMemo, useState } from 'react';
import { XavaloCard } from './statisticsCard/StatisticsCard/XavaloCard';

export const XavalorStatisticsCards: React.FC = () => {
  const [statistics, setStatistics] = useState<xavaloStatistic[]>([]);

  const { isTablet } = useResponsive();

  useEffect(() => {
    getXavaloStatistics().then((res) => setStatistics(res));
  }, []);

  const statisticsCards = useMemo(
    () =>
      statistics.map((st, index) => {
        const currentStatistic = ConfigXavaloStatistic.find((el) => el.id === st.id);
        console.log('api',currentStatistic);
        

        return currentStatistic ? (
          <Col
            key={st.id}
            id={currentStatistic.name}
            xs={12}
            md={index === statistics.length ? 0 : 8}
            order={(isTablet && index + 1) || 0}
          >
            <XavaloCard
              name={currentStatistic.title}
              value={st.value}
              color={currentStatistic.color}
              unit={st.unit}
              Icon={currentStatistic.Icon}
            />
          </Col>
        ) : null;
      }),
    [statistics, isTablet],
  );

  return <>{statisticsCards}</>;
};
