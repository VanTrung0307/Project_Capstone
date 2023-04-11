/* eslint-disable prettier/prettier */
import { Popover } from '@app/components/common/Popover/Popover';
import { useAppSelector } from '@app/hooks/reduxHooks';
import { useResponsive } from '@app/hooks/useResponsive';
import { Avatar, Col, Row } from 'antd';
import React from 'react';
import { ProfileOverlay } from '../ProfileOverlay/ProfileOverlay';
import * as S from './ProfileDropdown.styles';

export const ProfileDropdown: React.FC = () => {
  const { isTablet } = useResponsive();

  const user = useAppSelector((state) => state.user.user);

  return user ? (
    <Popover content={<ProfileOverlay />} trigger="click">
      <S.ProfileDropdownHeader as={Row} gutter={[10, 10]} align="middle">
        <Col>
          <Avatar src={user.imgUrl} alt="User" shape="circle" size={40} />
        </Col>
        {/* {isTablet && (
          <Col>
            <H6>{`${user.firstName} ${user.lastName[0]}`}</H6>
          </Col>
        )} */}
      </S.ProfileDropdownHeader>
    </Popover>
  ) : null;
};
