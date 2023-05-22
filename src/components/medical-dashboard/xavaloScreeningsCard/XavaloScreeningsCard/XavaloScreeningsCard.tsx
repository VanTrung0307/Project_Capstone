/* eslint-disable prettier/prettier */
import { Doctor, getDoctorsData } from '@app/api/doctors.api';
import { Screening, getScreenings } from '@app/api/screenings.api';
import { Statistic, getStatistics } from '@app/api/statistics.api';
import { Dates } from '@app/constants/Dates';
import { getSmoothRandom } from '@app/utils/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { XavaloScreeningsChart } from '../XavaloScreeningsChart/XavaloScreeningsChart';
import { XavaloScreeningsHeader } from '../XavaloScreeningsHeader/XavaloScreeningsHeader';
import * as S from './XavaloScreeningsCard.styles';

export interface CurrentStatisticsState {
  firstUser: number;
  secondUser: number;
  month: number;
  statistic: number;
}

export type ScreeningWithDoctors = Screening & { name: string; imgUrl: string };

export const XavaloScreeningsCard: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [currentStatistics, setCurrentStatistics] = useState<CurrentStatisticsState>({
    firstUser: 1,
    secondUser: 3,
    month: Dates.getToday().get('month'),
    statistic: 2,
  });
  // const [isFirstClick, setFirstClick] = useState(true);

  useEffect(() => {
    getScreenings().then((res) => setScreenings(res));
  }, []);

  useEffect(() => {
    getStatistics().then((res) => setStatistics(res));
  }, []);

  useEffect(() => {
    getDoctorsData().then((res) => setDoctors(res));
  }, []);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  const screeningsWithDoctors = useMemo((): ScreeningWithDoctors[] => {
    return screenings.map((screening) => {
      const currentDoctor = doctors.find((doctor) => doctor.id === screening.id);

      return {
        ...screening,
        name: currentDoctor?.name || '',
        imgUrl: currentDoctor?.imgUrl || '',
      };
    });
  }, [doctors, screenings]);

  const generateScreeningValue = () => {
    const randomValue = getSmoothRandom(3, 0.7) * 100;
    return (randomValue * Math.abs(Math.sin(randomValue))).toFixed();
  };

  const values = useMemo(
    () =>
      months.map((month) => ({
        monthId: month,
        data: statistics.map((statistic) => ({
          statisticId: statistic.id,
          data: screenings.map((screening) => ({
            id: screening.id,
            data: Array.from({ length: 16 }, (_, index) => ({
              day: index * 2,
              value: generateScreeningValue(),
            })),
          })),
        })),
      })),
    [months, screenings, statistics],
  );

  const currentValues = useMemo(
    () =>
      values
        .find((month) => month.monthId === currentStatistics.month)
        ?.data.find((statistic) => statistic.statisticId === currentStatistics.statistic)?.data,
    [currentStatistics.month, currentStatistics.statistic, values],
  );

  const getUserStatistic = useCallback(
    (isFirstUser: boolean) => {
      const user = isFirstUser ? 'firstUser' : 'secondUser';

      return (
        currentValues && {
          name: screeningsWithDoctors[currentStatistics[user]].name,
          data: currentValues[currentStatistics[user]].data,
        }
      );
    },
    [currentStatistics, currentValues, screeningsWithDoctors],
  );

  return (
    <S.XavaloScreeningsCard
      title={<XavaloScreeningsHeader currentStatistics={currentStatistics} setCurrentStatistics={setCurrentStatistics} />}
      padding={0}
    >
      {/* <ScreeningsFriends
        screenings={screeningsWithDoctors}
        currentStatistics={currentStatistics}
        setCurrentStatistics={setCurrentStatistics}
        isFirstClick={isFirstClick}
        setFirstClick={setFirstClick}
      /> */}
      <XavaloScreeningsChart firstUser={getUserStatistic(true)} secondUser={getUserStatistic(false)} />
    </S.XavaloScreeningsCard>
  );
};
