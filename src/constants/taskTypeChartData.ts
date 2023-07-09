/* eslint-disable prettier/prettier */
export interface TaskFactor {
  value: number;
  name: string;
  description: string;
}

export const taskTypeChartData: TaskFactor[] = [
  {
    value: 20,
    name: 'Công nghệ thông tin IT',
    description: 'Những nhiệm vụ do bên Công nghệ thông tin đề ra',
  },
  {
    value: 5,
    name: 'Kinh doanh quốc tế',
    description: 'Những nhiệm vụ do bên Kinh doanh quốc tế đề ra',
  },
  {
    value: 5,
    name: 'Marketing',
    description: 'Những nhiệm vụ do bên Marketing đề ra',
  },
  {
    value: 5,
    name: 'Truyền thông đa phương tiện',
    description: 'Những nhiệm vụ do bên Truyền thông đa phương tiện đề ra',
  },
];
