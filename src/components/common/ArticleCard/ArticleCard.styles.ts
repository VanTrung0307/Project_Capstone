/* eslint-disable prettier/prettier */
import { DeleteOutlined } from '@ant-design/icons';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, media } from '@app/styles/themes/constants';
import { Typography } from 'antd';
import styled, { css } from 'styled-components';

export const Header = styled.div`
  height: 5.5rem;
  margin-left: 1.5625rem;
  display: flex;
  align-items: center;
`;

export const AuthorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 0.625rem;
  white-space: wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 50px;
  width: 230px;
  height: 100px;
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 21.25rem;
  position: relative;
  max-width: 20.5rem;
  max-height: 35.5rem;
  border: 1px solid lightblue;
  box-shadow: var(--box-shadow);
  border-radius: ${BORDER_RADIUS};
  transition: 0.3s;
  cursor: pointer;

  [data-theme='dark'] & {
    background: var(--secondary-background-color);
  }

  &:hover {
    box-shadow: var(--box-shadow-hover);
  }
`;

export const Author = styled.div`
  font-size: ${FONT_SIZE.lg};
  font-weight: ${FONT_WEIGHT.bold};
  color: var(--text-main-color);
  line-height: 1.5625rem;
`;

export const InfoWrapper = styled.div`
  padding: 1.25rem;

  @media only screen and ${media.xl} {
    padding: 1rem;
  }

  @media only screen and ${media.xxl} {
    padding: 1.85rem;
  }
`;

export const InfoHeader = styled.div`
  display: flex;
  margin-bottom: 1rem;

  @media only screen and ${media.md} {
    margin-bottom: 0.625rem;
  }

  @media only screen and ${media.xxl} {
    margin-bottom: 1.25rem;
  }
`;

export const Title = styled.div`
  font-size: ${FONT_SIZE.xl};
  font-weight: ${FONT_WEIGHT.semibold};
  width: 80%;
  line-height: 1.375rem;

  color: var(--text-main-color);

  @media only screen and ${media.md} {
    font-size: ${FONT_SIZE.xxl};
  }
`;

export const DateTime = styled(Typography.Text)`
  font-size: ${FONT_SIZE.xs};
  color: var(--text-main-color);
  line-height: 1.25rem;
`;

export const Description = styled.div`
  font-size: ${FONT_SIZE.xs};
  color: var(--text-main-color);

  @media only screen and ${media.xxl} {
    font-size: 1rem;
  }
`;

export const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  padding: 0 1.25rem 1.25rem;
  margin-top: 50px;
`;

interface ButtonActionProps {
  isOpen: boolean;
}

export const ButtonAction = styled.div<ButtonActionProps>`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: visibility 0.3s ease, opacity 0.3s ease;

  ${({ isOpen }) =>
    isOpen
      ? css`
          visibility: visible;
          opacity: 1;
        `
      : css`
          visibility: hidden;
          opacity: 0;
        `}
`;

export const DotsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  bottom: 0;
  right: 0;
  padding-bottom: 20px;
  position: absolute;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 30px;
`;

export const DetailButton = styled.span`
  font-size: 30px;
  cursor: pointer;
`;

export const EditButton = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  bottom: 0;
  right: 0;
  padding-bottom: 30px;
  padding-right: 20px;
  position: absolute;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 30px;
  font-size: 30px;
  cursor: pointer;
`;

export const DeleteButton = styled(DeleteOutlined)`
  font-size: 30px;
  color: red;
`;

export const FormContent = styled.div`
  margin: 1.25rem 0.5rem;
`;

export const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

export const Label = styled.label`
  flex: 0 0 200px;
  ::before {
    content: '* ';
    color: red;
  }
`;

export const InputContainer = styled.div`
  flex: 1;
`;
