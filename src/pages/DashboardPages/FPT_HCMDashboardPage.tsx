/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { References } from '@app/components/common/References/References';
import { FPTHCMStatisticsCards } from '@app/components/medical-dashboard/FPTHCMStatisticsCards/FPTHCMStatisticsCards';
import { HealthCard } from '@app/components/medical-dashboard/HealthCard/HealthCard';
import { TaskCard } from '@app/components/medical-dashboard/TaskCard/TaskCard';
import { ActivityCard } from '@app/components/medical-dashboard/activityCard/ActivityCard';
import { PlayerCard } from '@app/components/medical-dashboard/playerCard/PlayerCard';
import { useResponsive } from '@app/hooks/useResponsive';
import { Col, Row } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import RankPage from '../RankPage';
import * as S from './DashboardPage.styles';

const FPT_HCMDashboardPage: React.FC = () => {
  const { isTablet, isDesktop } = useResponsive();

  const { t } = useTranslation();

  const desktopLayout = (
    <Row>
      <S.LeftSideCol>
        <Row gutter={[30, 30]}>
          <Col span={24}>
            <Row gutter={[30, 30]}>
              <FPTHCMStatisticsCards />
            </Row>
          </Col>

          <Col id="latest-screenings" span={24}>
            <RankPage />
          </Col>

          <Col id="activity" xl={12}>
            <PlayerCard />
          </Col>

          <Col id="health" xl={12}>
            <TaskCard />
          </Col>
        </Row>
        <References />
      </S.LeftSideCol>

      {/* <S.RightSideCol xl={8} xxl={7}>
        <div id="blood-screening">
          <BloodScreeningCard />
        </div>
        <S.Space />
        <S.ScrollWrapper id="patient-timeline">
          <PatientResultsCard />
        </S.ScrollWrapper>
      </S.RightSideCol> */}
    </Row>
  );

  const mobileAndTabletLayout = (
    <Row gutter={[20, 20]}>
      <FPTHCMStatisticsCards />

      <Col id="activity" xs={24} md={12} order={(isTablet && 8) || 0}>
        <ActivityCard />
      </Col>

      <Col id="health" xs={24} md={12} order={(isTablet && 9) || 0}>
        <HealthCard />
      </Col>
    </Row>
  );

  return (
    <>
      <PageTitle>{t('Dashboard')}</PageTitle>
      {isDesktop ? desktopLayout : mobileAndTabletLayout}
    </>
  );
};

export default FPT_HCMDashboardPage;
