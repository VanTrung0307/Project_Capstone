/* eslint-disable prettier/prettier */
import styled, { css } from 'styled-components';
import { Button as AntButton } from 'antd';
import { Severity } from '@app/interfaces/interfaces';
import { defineColorBySeverity } from '@app/utils/utils';

interface BtnProps {
  $severity?: Severity;
  $noStyle?: boolean;
}

export const Button = styled(AntButton)<BtnProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;

  ${(props) =>
    props.$noStyle &&
    css`
      width: unset;
      padding: 0;
      height: unset;
    `}

  &[disabled],
  &[disabled]:active,
  &[disabled]:focus,
  &[disabled]:hover {
    color: var(--disabled-color);
  }
  ${(props) =>
    !props.danger &&
    css`
      ${props.$severity &&
      css`
        box-shadow: none;
        text-shadow: none;
        background: linear-gradient(315deg, #f5d020 0%, #f53803 74%);

        border-color: ${defineColorBySeverity(props.$severity)};

        color: ${defineColorBySeverity(props.$severity)};

        &:hover {
          background: linear-gradient(315deg, #f5d020 0%, #f53803 74%);

          border-color: rgba(${defineColorBySeverity(props.$severity, true)}, 0.9);

          color: rgba(${defineColorBySeverity(props.$severity, true)}, 0.9);
        }

        &:focus {
          background: linear-gradient(315deg, #f5d020 0%, #f53803 74%);

          border-color: rgba(${defineColorBySeverity(props.$severity, true)}, 0.9);

          color: rgba(${defineColorBySeverity(props.$severity, true)}, 0.9);
        }
      `}

      ${props.type === 'text' &&
      css`
        &:hover {
          background: transparent;
          color: var(--secondary-color);
        }
      `}

      ${props.type === 'ghost' &&
      css`
        color: white;
        border-color: white;

        &:hover {
          background: #ff7c00;
          color: white;
        }
      `}

      ${props.type === 'default' &&
      css`
        color: white;
        border-color: white;
        background: #414345;

        &:hover {
          background: #ff7c00;
          color: white;
        }
      `}

      ${props.type === 'dashed' &&
      css`
        color: white;
        border-color: white;
        background: #414345;

        &:hover {
          color: #ff7c00;
          border-color: #ff7c00;
          background: #414345;
        }
      `}

      ${props.type === 'primary' &&
      css`
        background: #ff7c00;

        &:hover {
          background: rgba(241, 102, 36, 1);

          border-color: #ff7c00;
        }
      `}

      ${props.type === 'link' &&
      css`
        & span,
        a {
          text-decoration: underline;
        }
      `};
    `}
`;
