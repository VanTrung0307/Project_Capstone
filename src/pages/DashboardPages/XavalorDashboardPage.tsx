/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { References } from '@app/components/common/References/References';
import { HealthCard } from '@app/components/medical-dashboard/HealthCard/HealthCard';
import { XavalorStatisticsCards } from '@app/components/medical-dashboard/XavalorStatisticsCards/XavalorStatisticsCards';
import { ActivityCard } from '@app/components/medical-dashboard/activityCard/ActivityCard';
import { useResponsive } from '@app/hooks/useResponsive';
import { Col, Row } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './DashboardPage.styles';
import { XavaloScreeningsCard } from '@app/components/medical-dashboard/xavaloScreeningsCard/XavaloScreeningsCard/XavaloScreeningsCard';
import { EventCard } from '@app/components/medical-dashboard/eventCard/EventCard';
import { OrderCard } from '@app/components/medical-dashboard/OrderCard/OrderCard';

const XavalorDashboardPage: React.FC = () => {
  const { isTablet, isDesktop } = useResponsive();

  const { t } = useTranslation();

  const desktopLayout = (
    <Row>
      <S.LeftSideCol>
        <Row gutter={[30, 30]}>
          <Col span={24}>
            <Row gutter={[30, 30]}>
              <XavalorStatisticsCards />
            </Row>
          </Col>

          <Col id="latest-screenings" span={24}>
            <XavaloScreeningsCard />
          </Col>

          <Col id="activity" xl={12} xxl={6}>
            <EventCard />
          </Col>

          <Col id="health" xl={12} xxl={6}>
            <OrderCard />
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
      <XavalorStatisticsCards />

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

export default XavalorDashboardPage;
