/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { References } from '@app/components/common/References/References';
import { FPTHCMStatisticsCards } from '@app/components/medical-dashboard/FPTHCMStatisticsCards/FPTHCMStatisticsCards';
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
        </Row>
        <References />
      </S.LeftSideCol>
    </Row>
  );

  const mobileAndTabletLayout = (
    <Row gutter={[20, 20]}>
      <FPTHCMStatisticsCards />

      <Col id="latest-screenings" xs={24} order={(isTablet && 8) || 0}>
        <RankPage />
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
