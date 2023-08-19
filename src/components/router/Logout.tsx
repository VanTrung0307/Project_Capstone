/* eslint-disable prettier/prettier */
import { useAppDispatch } from '@app/hooks/reduxHooks';
import { doLogout } from '@app/store/slices/authSlice';
import React, { useEffect } from 'react';

const Logout: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const logout = async () => {
      await dispatch(doLogout());
      window.location.href = '/auth/login';
    };

    logout();
  }, [dispatch]);

  return null;
};

export default Logout;
