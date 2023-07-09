/* eslint-disable prettier/prettier */
export interface fpthcmStatistic {
  id: number;
  value: number;
  unit: string;
}

export const getFPTHCMStatistics = (): Promise<fpthcmStatistic[]> => {
  return new Promise((res) => {
    setTimeout(() => {
      res([
        {
          id: 1,
          value: 45,
          unit: 'người',
        },
        {
          id: 2,
          value: 12,
          unit: 'sự kiện',
        },
        {
          id: 3,
          value: 45,
          unit: 'phần'
        }
      ]);
    }, 0);
  });
};
