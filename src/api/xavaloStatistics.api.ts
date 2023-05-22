/* eslint-disable prettier/prettier */
export interface xavaloStatistic {
  id: number;
  value: number;
  unit: string;
}

export const getXavaloStatistics = (): Promise<xavaloStatistic[]> => {
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
          unit: 'đơn'
        }
      ]);
    }, 0);
  });
};
