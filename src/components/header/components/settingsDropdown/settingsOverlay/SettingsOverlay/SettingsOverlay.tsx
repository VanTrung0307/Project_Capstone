/* eslint-disable prettier/prettier */
import { DropdownCollapse } from '@app/components/header/Header.styles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThemePicker } from '../ThemePicker/ThemePicker';
import * as S from './SettingsOverlay.styles';

export const SettingsOverlay: React.FC = ({ ...props }) => {
  const { t } = useTranslation();

  return (
    <S.SettingsOverlayMenu {...props}>
      <DropdownCollapse bordered={false} expandIconPosition="end" ghost defaultActiveKey="themePicker">
        <DropdownCollapse.Panel header={t('header.changeTheme')} key="themePicker">
          <ThemePicker />
        </DropdownCollapse.Panel>
      </DropdownCollapse>
    </S.SettingsOverlayMenu>
  );
};
