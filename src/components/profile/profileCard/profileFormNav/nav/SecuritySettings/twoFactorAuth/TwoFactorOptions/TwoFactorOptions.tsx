/* eslint-disable prettier/prettier */
import { RadioGroup } from '@app/components/common/Radio/Radio';
import { useAppSelector } from '@app/hooks/reduxHooks';
import React, { useEffect } from 'react';
import { TwoFactorAuthOptionState } from '../TwoFactorAuth';

interface TwoFactorOptionsProps {
  selectedOption: TwoFactorAuthOptionState;
  setSelectedOption: (state: TwoFactorAuthOptionState) => void;
}

export const TwoFactorOptions: React.FC<TwoFactorOptionsProps> = ({ selectedOption, setSelectedOption }) => {
  const user = useAppSelector((state) => state.user.user);

  // const { isEmailActive, isPhoneActive } = useMemo(
  //   () => ({
  //     isPhoneActive: selectedOption === 'phone',
  //     isEmailActive: selectedOption === 'email',
  //   }),
  //   [selectedOption],
  // );

  // const onClickInput = useCallback(
  //   (mode: TwoFactorAuthOption) => () => {
  //     setSelectedOption(mode);
  //   },
  //   [setSelectedOption],
  // );

  useEffect(() => {
    if (user?.email && user?.studentId) {
      setSelectedOption(null);
    }
  }, [setSelectedOption, user?.email, user?.studentId]);

  return (
    <>
      <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
        {/* <S.RadioBtn value="phone" $isActive={isPhoneActive} disabled={user?.studentId}>
          <PhoneItem required={isPhoneActive} onClick={onClickInput('phone')} verified={user?.studentId} />
        </S.RadioBtn>
        <S.RadioBtn value="email" $isActive={isEmailActive} disabled={user?.email}>
          <EmailItem required={isEmailActive} onClick={onClickInput('email')} verified={user?.email} />
        </S.RadioBtn> */}
      </RadioGroup>
    </>
  );
};
