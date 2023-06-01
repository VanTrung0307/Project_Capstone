/* eslint-disable prettier/prettier */
export interface OrderFactor {
  value: number;
  name: string;
  description: string;
}

export const orderStatusChartData: OrderFactor[] = [
  {
    value: 50,
    name: 'Processing',
    description: 'Product in users cart are waiting to accept and check',
  },
  {
    value: 20,
    name: 'Accepted',
    description: 'Product have been checked and delevering to users',
  },
  {
    value: 20,
    name: 'Cancel',
    description: 'Product have been cancle by users',
  },
  {
    value: 10,
    name: 'Done',
    description: 'Product have been shipped to user complete',
  },
];
