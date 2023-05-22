/* eslint-disable prettier/prettier */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'antd';
import { CurrentStatisticsState } from '../XavaloScreeningsCard/XavaloScreeningsCard';
import { MonthSelect } from 'components/common/selects/MonthSelect/MonthSelect';
import { StatisticsSelect } from 'components/common/selects/StatisticsSelect/StatisticsSelect';

interface ScreeningsHeaderProps {
  currentStatistics: CurrentStatisticsState;
  setCurrentStatistics: (func: (state: CurrentStatisticsState) => CurrentStatisticsState) => void;
}

export const XavaloScreeningsHeader: React.FC<ScreeningsHeaderProps> = ({ currentStatistics, setCurrentStatistics }) => {
  const { t } = useTranslation();

  return (
    <Row gutter={[0, { xs: 15, sm: 15, md: 20 }]} align="middle">
      <Col xs={24} xl={12}>
        {t('Người chơi đã tham gia')}
      </Col>

      <Col xs={24} xl={12}>
        <Row
          gutter={[
            { xs: 15, sm: 15, md: 20 },
            { xs: 15, sm: 15, md: 20 },
          ]}
        >
          <Col xs={12}>
            <label>
              <MonthSelect
                value={currentStatistics.month}
                width="100%"
                bordered={false}
                shadow
                placeholder={t('medical-dashboard.latestScreenings.month')}
                onChange={(month) => setCurrentStatistics((prev) => ({ ...prev, month } as CurrentStatisticsState))}
              />
            </label>
          </Col>

          <Col xs={12}>
            <label>
              <StatisticsSelect
                value={currentStatistics.statistic}
                width="100%"
                bordered={false}
                shadow
                placeholder={t('medical-dashboard.latestScreenings.statistics')}
                onChange={(statistic) =>
                  setCurrentStatistics((prev) => ({ ...prev, statistic } as CurrentStatisticsState))
                }
              />
            </label>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
