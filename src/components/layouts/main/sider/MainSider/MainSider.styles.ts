/* eslint-disable prettier/prettier */
import styled, { css } from 'styled-components';
import { Button, Layout } from 'antd';
import { Link } from 'react-router-dom';
import { media } from '@app/styles/themes/constants';
import { LAYOUT } from '@app/styles/themes/constants';

export const Sider = styled(Layout.Sider)`
  position: fixed;
  overflow: visible;
  right: 0;
  z-index: 5;
  min-height: 100vh;
  max-height: 100vh;

  color: var(--text-secondary-color);

  @media only screen and ${media.md} {
    right: unset;
    left: 0;
  }

  @media only screen and ${media.xl} {
    position: unset;
  }
`;

export const CollapseButton = styled(Button)<{ $isCollapsed: boolean }>`
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  position: absolute;
  left: 240px;
  background: #ff7c00;

  ${(props) =>
    props.$isCollapsed &&
    css`
      left: 65px;
    `}

  color: var(--text-secondary-color);

  &:focus {
    color: var(--text-secondary-color);
    background: #ff7c00;
    border: 1px solid var(--border-color);
  }
`;

export const SiderContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - ${LAYOUT.mobile.headerHeight});

  @media only screen and ${media.md} {
    max-height: calc(100vh - ${LAYOUT.desktop.headerHeight});
  }
`;

export const SiderLogoLink = styled(Link)`
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

export const SiderLogoDiv = styled.div`
  height: ${LAYOUT.mobile.headerHeight};
  padding: ${LAYOUT.mobile.headerPadding};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media only screen and ${media.md} {
    height: ${LAYOUT.desktop.headerHeight};
    padding-top: ${LAYOUT.desktop.paddingVertical};
    padding-bottom: ${LAYOUT.desktop.paddingVertical};
  }
`;

export const BrandSpan = styled.span`
  margin: 0 1rem;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--white);
`;
