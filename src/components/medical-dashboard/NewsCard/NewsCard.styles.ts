/* eslint-disable prettier/prettier */
import styled from 'styled-components';
import { BORDER_RADIUS } from '@app/styles/themes/constants';

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 1.16rem;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 1 21.25rem;
  position: relative;
  max-width: 20.5rem;
  max-height: 35.5rem;
  height: 196.6px;
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

export const CreateEventButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid lightblue;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #000000;
  cursor: pointer;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const CreateText = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  position: absolute;
  top: calc(50% + 30px);
  left: 50%;
  transform: translateX(-50%);
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
