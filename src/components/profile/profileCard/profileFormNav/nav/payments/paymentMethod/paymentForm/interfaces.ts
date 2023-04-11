/* eslint-disable prettier/prettier */
import React from 'react';

export interface CardInputProps {
  disabled?: boolean;
  handleInputFocus: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
