/* eslint-disable prettier/prettier */
import { Col, Row } from 'antd';
import React from 'react';
import * as S from '../Header.styles';
import { HeaderFullscreen } from '../components/HeaderFullscreen/HeaderFullscreen';
import { ProfileDropdown } from '../components/profileDropdown/ProfileDropdown/ProfileDropdown';
import { SettingsDropdown } from '../components/settingsDropdown/SettingsDropdown';
import Button from 'antd/es/button';
import { useAppSelector } from '@app/hooks/reduxHooks';

interface DesktopHeaderProps {
  isTwoColumnsLayout: boolean;
  isLoggedIn: boolean;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({ isTwoColumnsLayout, isLoggedIn }) => {
  const user = useAppSelector((state) => state.user.user);
  const leftSide = isTwoColumnsLayout ? (
    <S.SearchColumn xl={16} xxl={17}>
      <Row justify="space-between">
        <Col xl={15} xxl={12}></Col>
        <Col></Col>
      </Row>
    </S.SearchColumn>
  ) : (
    <>
      <Col lg={10} xxl={8}></Col>
      <Col></Col>
    </>
  );

  return (
    <Row justify="space-between" align="middle">
      {leftSide}

      <S.ProfileColumn xl={8} xxl={7} $isTwoColumnsLayout={isTwoColumnsLayout}>
        <Row align="middle" justify="end" gutter={[10, 10]}>
          <Col>
            <Row gutter={[{ xxl: 10 }, { xxl: 10 }]}>
              <Col>
                <HeaderFullscreen />
              </Col>

              <Col>{/* <NotificationsDropdown /> */}</Col>

              <Col>
                <SettingsDropdown />
              </Col>
            </Row>
          </Col>

          <Col>
            {user ? (
              <ProfileDropdown isLoggedIn={isLoggedIn} />
            ) : (
              <Button type="primary" href="/auth/login">
                Log In
              </Button>
            )}
          </Col>
        </Row>
      </S.ProfileColumn>
    </Row>
  );
};
