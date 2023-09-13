/* eslint-disable prettier/prettier */
import styled, { keyframes } from 'styled-components';
import { Card as CommonCard } from 'components/common/Card/Card';

interface EventStatusProps {
  status: string;
}

export const FPTHCMTablesWrapper = styled.div`
  margin-top: 1.875rem;
`;

export const CardWrapper = styled.div`
  display: flex;
  gap: 20px;
  overflow: auto;
  border-bottom: 1px solid #ccc;
`;

export const Card = styled(CommonCard)`
  margin-bottom: 2rem;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const InfoCard = styled(CommonCard)`
  margin-bottom: 2rem;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 20px;
  overflow: auto;
`;

export const EventName = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
`;

export const EventDate = styled.div`
  background-color: white;
  max-width: 120px;
  width: 120px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Month = styled.div`
  background-color: #3b82f6;
  max-width: 120px;
  border-radius: 4px 4px 0px 0px;
  color: white;
  padding: 4px;
  font-size: 16px;
  font-weight: bold;
`;

export const DateNumber = styled.span`
  font-size: 48px;
  font-weight: bold;
  line-height: 1;
  color: #000000;
`;

export const DayOfWeek = styled.span`
  font-size: 14px;
  color: #000000;
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

export const EventStatus = styled.div<EventStatusProps>`
  display: inline-block;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 4px;
  animation: ${({ status }) => (status === 'ACTIVE' ? fadeIn : fadeOut)} 1s infinite alternate;

  ${({ status }) =>
    status === 'ACTIVE'
      ? `
    background-color: #28a745;
    color: #ffffff;
  `
      : `
    background-color: #dc3545;
    color: #ffffff;
  `}
`;

export const Breadcrumbs = styled.div`
  /* Define your breadcrumb styles here */
  margin: 10px 0; /* Example styling, adjust as needed */
  font-size: 14px;
`;

export const StickyCard = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: -53px;
`;

export const TabWrapper = styled.div`
  display: flex;
  gap: 10px;
  background-color: #25284b;
  padding: 10px;
  border-radius: 0px 0px 4px 4px;
  border-top: 3px solid #ccc;
  border-bottom: 0.5px solid rgb(60, 180, 250);
  border-left: 0.5px solid rgb(60, 180, 250);
  border-right: 0.5px solid rgb(60, 180, 250);
`;

export const TabLink = styled.a`
  font-size: 16px;
  font-weight: bold;
  color: white;
  text-decoration: none;
  padding: 10px;
  border-radius: 6px;
  position: relative;
  display: table-cell;
  transition: all ease 0.3s;
  padding: 1em 1.6em;
  transform: translate3d(0, 0, 0);
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: rgb(60, 180, 250);
  }

  &:after {
    transition: all 0.3s cubic-bezier(1, 0, 0, 1);
    will-change: transform, box-shadow, opacity;
    position: absolute;
    content: '';
    height: 3px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    border-radius: 3px 3px 0px 0px;
    background: lighten(rgb(60, 180, 250), 20%);
    box-shadow: 0px 4px 10px 3px rgba(60, 180, 250, 1);
    opacity: 1;
    transform: scale(0, 1);
  }

  &.active {
    color: rgb(60, 180, 250);

    &:after {
      opacity: 1;
      transform: scale(1, 1);
    }
  }
`;

export const ToggleSwitchWrapper = styled.div`
  display: inline-block;
  position: relative;
  width: 60px;
  height: 34px;
`;

export const ToggleSwitchCheckbox = styled.input`
  display: none;
`;

export const ToggleSwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
`;

export const ToggleSwitchSliderBefore = styled.span`
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
`;

export const ToggleSwitchLabel = styled.label`
  position: absolute;
  top: 10px;
  color: #333;
  font-size: 14px;
  font-weight: bold;
  transition: 0.4s;
  pointer-events: none;
`;

export const FirstToggleSwitchLabel = styled(ToggleSwitchLabel)`
  left: 10px;
  opacity: 1;
`;

export const LastToggleSwitchLabel = styled(ToggleSwitchLabel)`
  right: 10px;
  opacity: 0.5;
`;
