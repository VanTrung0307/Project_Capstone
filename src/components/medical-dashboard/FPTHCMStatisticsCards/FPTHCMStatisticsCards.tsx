/* eslint-disable prettier/prettier */
import { getFPTHCMStatistics, fpthcmStatistic } from '@app/api/fpthcmStatistics.api';
import { Col } from 'antd';
import { fpthcm_statistics as ConfigFPTHCMStatistic } from '@app/constants/config/statisticsFPTHCM';
import { useResponsive } from 'hooks/useResponsive';
import React, { useEffect, useMemo, useState } from 'react';
import { FPTHCMCard } from './statisticsCard/StatisticsCard/FPTHCMCard';

export const FPTHCMStatisticsCards: React.FC = () => {
  const [statistics, setStatistics] = useState<fpthcmStatistic[]>([]);

  const { isTablet } = useResponsive();

  useEffect(() => {
    getFPTHCMStatistics().then((res) => setStatistics(res));
  }, []);

  const statisticsCards = useMemo(
    () =>
      statistics.map((st, index) => {
        const currentStatistic = ConfigFPTHCMStatistic.find((el) => el.id === st.id);
        console.log('api',currentStatistic);
        

        return currentStatistic ? (
          <Col
            key={st.id}
            id={currentStatistic.name}
            xs={12}
            md={index === statistics.length ? 0 : 8}
            order={(isTablet && index + 1) || 0}
          >
            <FPTHCMCard
              name={currentStatistic.title}
              subname={currentStatistic.subname}
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
