/* eslint-disable prettier/prettier */
import { Popover } from '@app/components/common/Popover/Popover';
import { useAppSelector } from '@app/hooks/reduxHooks';
import { Avatar, Col, Row } from 'antd';
import React from 'react';
import { ProfileOverlay } from '../ProfileOverlay/ProfileOverlay';
import * as S from './ProfileDropdown.styles';
import { useResponsive } from '@app/hooks/useResponsive';
import { H6 } from '@app/components/common/typography/H6/H6';

interface ProfileDropdownProps {
  isLoggedIn: boolean;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = () => {
  const { isTablet } = useResponsive();

  const user = useAppSelector((state) => state.user.user);

  return user ? (
    <Popover content={<ProfileOverlay />} trigger="click">
      <S.ProfileDropdownHeader as={Row} gutter={[10, 10]} align="middle">
        <Col>
          <Avatar src={`${process.env.PUBLIC_URL}/admin.png`} alt="User" shape="circle" size={40} />
        </Col>
        {isTablet && (
          <Col>
            <H6>ADMIN</H6>
          </Col>
        )}
      </S.ProfileDropdownHeader>
    </Popover>
  ) : null;
};
