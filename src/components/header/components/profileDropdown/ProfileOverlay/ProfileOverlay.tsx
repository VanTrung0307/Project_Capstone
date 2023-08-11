/* eslint-disable prettier/prettier */
import React from 'react';
import { Link } from 'react-router-dom';
import * as S from './ProfileOverlay.styles';
import { FaSignOutAlt } from 'react-icons/fa';

export const ProfileOverlay: React.FC = ({ ...props }) => {
  return (
    <div {...props}>
      <S.ItemsDivider />
      <S.Text>
        <Link to="/logout">
          <a style={{ color: '#FF6961' }}>LOG OUT</a>
          <FaSignOutAlt
            style={{
              marginLeft: '8px',
              color: '#FF6961',
              width: '20px',
              height: '20px',
            }}
          />
        </Link>
      </S.Text>
    </div>
  );
};
