/* eslint-disable prettier/prettier */
import { Priority } from '../constants/enums/priorities';

export interface Tag {
  value: string;
  priority: Priority;
}

export interface UserTableRow {
  schoolId: string;
  roleId: string;
  email: string;
  password: string;
  phoneNumber: number;
  gender: boolean;
  status: string;
  id: string;
}

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface BasicTableData {
  data: UserTableRow[];
  pagination: Pagination;
}

export interface TreeTableRow extends UserTableRow {
  children?: TreeTableRow[];
}

export interface TreeTableData extends BasicTableData {
  data: TreeTableRow[];
}

export interface EditableTableData extends BasicTableData {
  data: UserTableRow[];
}

export const getBasicTableData = (pagination: Pagination): Promise<BasicTableData> => {
  return new Promise((res) => {
    // setTimeout(() => {
    //   res({
    //     data: [
    //       {
    //         key: 1,
    //         name: 'John Brown',
    //         email: 'test@gmail.com',
    //         phone: '0123456789',
    //         gender: 'male',
    //         status: [
    //           { value: 'Đang hoạt động', priority: Priority.LOW },
    //         ],
    //       },
    //       {
    //         key: 2,
    //         name: 'Jim Green',
    //         email: 'test1@gmail.com',
    //         phone: '013647982465',
    //         gender: 'female',
    //         status: [{ value: 'Không hoạt động', priority: Priority.HIGH }],
    //       },
    //       {
    //         key: 3,
    //         name: 'Joe Black',
    //         email: 'test2@gmail.com',
    //         phone: '0147852369',
    //         gender: 'male',
    //         status: [
    //           { value: 'Đang hoạt động', priority: Priority.LOW },
    //         ],
    //       },
    //       {
    //         key: 4,
    //         name: 'Pavel Green',
    //         email: 'test3@gmail.com',
    //         phone: '0123456789',
    //         gender: 'female',
    //         status: [
    //           { value: 'Không hoạt động', priority: Priority.HIGH },
    //         ],
    //       },
    //       {
    //         key: 5,
    //         name: 'Alex Brown',
    //         email: 'test4@gmail.com',
    //         phone: '0147896325',
    //         gender: 'male',
    //         status: [{ value: 'Đang hoạt động', priority: Priority.LOW }],
    //       },
    //       {
    //         key: 6,
    //         name: 'Josh Black',
    //         email: 'test5@gmail.com',
    //         phone: '0123456789',
    //         gender: 'female',
    //         status: [
    //           { value: 'Không hoạt động', priority: Priority.HIGH },
    //         ],
    //       },
    //       {
    //         key: 7,
    //         name: 'Cris Green',
    //         email: 'test6@gmail.com',
    //         phone: '0147852369',
    //         gender: 'male',
    //         status: [{ value: 'Đang hoạt động', priority: Priority.LOW }],
    //       },
    //       {
    //         key: 8,
    //         name: 'Jaime Black',
    //         email: 'test7@gmail.com',
    //         phone: '0123456789',
    //         gender: 'male',
    //         status: [{ value: 'Không hoạt động', priority: Priority.HIGH }],
    //       },
    //       {
    //         key: 9,
    //         name: 'Alina Brown',
    //         email: 'test8@gmail.com',
    //         phone: '0147896325',
    //         gender: 'female',
    //         status: [
    //           { value: 'Đang hoạt động', priority: Priority.LOW },
    //         ],
    //       },
    //       {
    //         key: 10,
    //         name: 'Cris Brown',
    //         email: 'test9@gmail.com',
    //         phone: '06464646064',
    //         gender: 'male',
    //         status: [
    //           { value: 'Không hoạt động', priority: Priority.HIGH },
    //         ],
    //       },
    //       {
    //         key: 11,
    //         name: 'Alina Fens',
    //         email: 'test10@gmail.com',
    //         phone: '0147896325',
    //         gender: 'female',
    //         status: [
    //           { value: 'Đang hoạt động', priority: Priority.LOW },
    //         ],
    //       },
    //       {
    //         key: 12,
    //         name: 'Alex Snak',
    //         email: 'test11@gmail.com',
    //         phone: '1065151231',
    //         gender: 'male',
    //         status: [
    //           { value: 'Không hoạt động', priority: Priority.HIGH },
    //         ],
    //       },
    //       {
    //         key: 13,
    //         name: 'Pavel Dubrouski',
    //         email: 'test12@gmail.com',
    //         phone: '0147896325',
    //         gender: 'female',
    //         status: [
    //           { value: 'Đang hoạt động', priority: Priority.LOW },
    //         ],
    //       },
    //       {
    //         key: 14,
    //         name: 'Jack Donald',
    //         email: 'test13@gmail.com',
    //         phone: '534164114',
    //         gender: 'male',
    //         status: [{ value: 'Không hoạt động', priority: Priority.HIGH }],
    //       },
    //       {
    //         key: 15,
    //         name: 'Nik Nest',
    //         email: 'test14@gmail.com',
    //         phone: '64184465',
    //         gender: 'female',
    //         status: [
    //           { value: 'Đang hoạt động', priority: Priority.LOW },
    //         ],
    //       },
    //       {
    //         key: 16,
    //         name: 'Zak Nikls',
    //         email: 'test15@gmail.com',
    //         phone: '0147896325',
    //         gender: 'male',
    //         status: [
    //           { value: 'Không hoạt động', priority: Priority.HIGH },
    //         ],
    //       },
    //       {
    //         key: 17,
    //         name: 'Petr Dan',
    //         email: 'test16@gmail.com',
    //         phone: '4045615',
    //         gender: 'female',
    //         status: [
    //           { value: 'Đang hoạt động', priority: Priority.LOW },
    //         ],
    //       },
    //       {
    //         key: 18,
    //         name: 'Alexa Pirs',
    //         email: 'test17@gmail.com',
    //         phone: '1650556',
    //         gender: 'male',
    //         status: [
    //           { value: 'Không hoạt động', priority: Priority.HIGH },
    //         ],
    //       },
    //       {
    //         key: 19,
    //         name: 'Mark Brown',
    //         email: 'test18@gmail.com',
    //         phone: '64184465',
    //         gender: 'female',
    //         status: [
    //           { value: 'Đang hoạt động', priority: Priority.LOW },
    //         ],
    //       },
    //       {
    //         key: 20,
    //         name: 'Alex Brons',
    //         email: 'test19@gmail.com',
    //         phone: '4565635056',
    //         gender: 'male',
    //         status: [{ value: 'Không hoạt động', priority: Priority.HIGH }],
    //       },
    //     ],
    //     pagination: { ...pagination, total: 20 },
    //   });
    // }, 1000);
  }
  );
};

export const getTreeTableData = (pagination: Pagination): Promise<TreeTableData> => {
  return new Promise((res) => {
    // setTimeout(() => {
    //   res({
    //     data: [
    //       {
    //         key: 1,
    //         name: 'John Brown sr.',
    //         email: 'test@gmail.com',
    //         phone: '0123456789',
    //         gender: 'female',
    //         children: [
    //           {
    //             key: 11,
    //             name: 'John Brown',
    //             email: 'test@gmail.com',
    //             phone: '534164114',
    //             gender: 'female',
    //           },
    //           {
    //             key: 12,
    //             name: 'John Brown jr.',
    //             email: 'test@gmail.com',
    //             phone: '534164114',
    //             gender: 'male',
    //             children: [
    //               {
    //                 key: 121,
    //                 name: 'Jimmy Brown',
    //                 email: 'test@gmail.com',
    //                 phone: '534164114',
    //                 gender: 'male',
    //               },
    //             ],
    //           },
    //           {
    //             key: 13,
    //             name: 'Jim Green sr.',
    //             email: 'test@gmail.com',
    //             phone: '013647982465',
    //             gender: 'female',
    //             children: [
    //               {
    //                 key: 131,
    //                 name: 'Jim Green',
    //                 email: 'test@gmail.com',
    //                 phone: '64184465',
    //                 gender: 'female',
    //                 schoolname: 'Tran Phu',
    //                 children: [
    //                   {
    //                     key: 1311,
    //                     name: 'Jim Green jr.',
    //                     email: 'test@gmail.com',
    //                     phone: '64184465',
    //                     gender: 'female',
    //                   },
    //                   {
    //                     key: 1312,
    //                     name: 'Jimmy Green sr.',
    //                     email: 'test@gmail.com',
    //                     phone: '64184465',
    //                     gender: 'female',
    //                   },
    //                 ],
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //       {
    //         key: 200,
    //         name: 'Joe Black',
    //         email: 'test@gmail.com',
    //         phone: '0147852369',
    //         gender: 'male',
    //         children: [
    //           {
    //             key: 201,
    //             name: 'Joe Green',
    //             email: 'test@gmail.com',
    //             phone: '64184465',
    //             gender: 'male',
    //             children: [
    //               {
    //                 key: 202,
    //                 name: 'Joe Green jr.',
    //                 email: 'test@gmail.com',
    //                 phone: '64184465',
    //                 gender: 'male',
    //               },
    //               {
    //                 key: 203,
    //                 name: 'Joe Green sr.',
    //                 email: 'test@gmail.com',
    //                 phone: '64184465',
    //                 gender: 'male',
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //       {
    //         key: 300,
    //         name: 'Jaime Black',
    //         email: 'test@gmail.com',
    //         phone: '0147852369',
    //         gender: 'female',
    //         children: [
    //           {
    //             key: 301,
    //             name: 'Jaime Green',
    //             email: 'test@gmail.com',
    //             phone: '64184465',
    //             gender: 'female',
    //             children: [
    //               {
    //                 key: 302,
    //                 name: 'Jaime Green jr.',
    //                 email: 'test@gmail.com',
    //                 phone: '64184465',
    //                 gender: 'female',
    //               },
    //               {
    //                 key: 303,
    //                 name: 'Jaime Green sr.',
    //                 email: 'test@gmail.com',
    //                 phone: '64184465',
    //                 gender: 'female',
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //       {
    //         key: 400,
    //         name: 'Pavel Brown',
    //         email: 'test@gmail.com',
    //         phone: '64184465',
    //         gender: 'male',
    //         children: [
    //           {
    //             key: 401,
    //             name: 'Pavel Brown',
    //             email: 'test@gmail.com',
    //             phone: '64184465',
    //             gender: 'male',
    //             children: [
    //               {
    //                 key: 402,
    //                 name: 'Pavel Brown jr.',
    //                 email: 'test@gmail.com',
    //                 phone: '013647982465',
    //                 gender: 'male',
    //               },
    //               {
    //                 key: 403,
    //                 name: 'Pavel Brown sr.',
    //                 email: 'test@gmail.com',
    //                 phone: '64184465',
    //                 gender: 'male',
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //       {
    //         key: 500,
    //         name: 'Alex Nickls',
    //         email: 'test@gmail.com',
    //         phone: '64184465',
    //         gender: 'female',
    //         children: [
    //           {
    //             key: 501,
    //             name: 'Marta Nickls',
    //             email: 'test@gmail.com',
    //             phone: '64184465',
    //             gender: 'female',
    //             children: [
    //               {
    //                 key: 502,
    //                 name: 'Pavel Nickls jr.',
    //                 email: 'test@gmail.com',
    //                 phone: '013647982465',
    //                 gender: 'female',
    //               },
    //               {
    //                 key: 503,
    //                 name: 'Alina Nickls sr.',
    //                 email: 'test@gmail.com',
    //                 phone: '64184465',
    //                 gender: 'female',
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //       {
    //         key: 600,
    //         name: 'Nick Donald',
    //         email: 'test@gmail.com',
    //         phone: '64184465',
    //         gender: 'male',
    //         children: [
    //           {
    //             key: 601,
    //             name: 'Alexsa Donald',
    //             email: 'test@gmail.com',
    //             phone: '64184465',
    //             gender: 'male',
    //             children: [
    //               {
    //                 key: 602,
    //                 name: 'Marta Donald jr.',
    //                 email: 'test@gmail.com',
    //                 phone: '013647982465',
    //                 gender: 'male',
    //               },
    //               {
    //                 key: 603,
    //                 name: 'Alex Donald sr.',
    //                 email: 'test@gmail.com',
    //                 phone: '64184465',
    //                 gender: 'male',
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //       {
    //         key: 700,
    //         name: 'Jo Snider',
    //         email: 'test@gmail.com',
    //         phone: '64184465',
    //         gender: 'female',
    //         children: [
    //           {
    //             key: 701,
    //             name: 'Jo Snider',
    //             email: 'test@gmail.com',
    //             phone: '64184465',
    //             gender: 'female',
    //             children: [
    //               {
    //                 key: 702,
    //                 name: 'Jaems Snider jr.',
    //                 email: 'test@gmail.com',
    //                 phone: '013647982465',
    //                 gender: 'female',
    //               },
    //               {
    //                 key: 703,
    //                 name: 'Jin Snider sr.',
    //                 email: 'test@gmail.com',
    //                 phone: '64184465',
    //                 gender: 'female',
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //       {
    //         key: 800,
    //         name: 'Jon Brown',
    //         email: 'test@gmail.com',
    //         phone: '64184465',
    //         gender: 'male',
    //         children: [
    //           {
    //             key: 801,
    //             name: 'Kitana Brown',
    //             email: 'test@gmail.com',
    //             phone: '64184465',
    //             gender: 'male',
    //             children: [
    //               {
    //                 key: 802,
    //                 name: 'Cris Brown jr.',
    //                 email: 'test@gmail.com',
    //                 phone: '013647982465',
    //                 gender: 'male',
    //               },
    //               {
    //                 key: 803,
    //                 name: 'Jon Brown sr.',
    //                 email: 'test@gmail.com',
    //                 phone: '64184465',
    //                 gender: 'male',
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     ],
    //     pagination: { ...pagination, total: 8 },
    //   });
    // }, 1000);
  });
};

export const getEditableTableData = (pagination: Pagination): Promise<EditableTableData> => {
  return new Promise((res) => {
    // setTimeout(() => {
    //   res({
    //     data: [
    //       {
    //         key: 1,
    //         name: `Edward`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `male`,
    //       },
    //       {
    //         key: 2,
    //         name: `Alex`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `female`,
    //       },
    //       {
    //         key: 3,
    //         name: `Niko`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `male`,
    //       },
    //       {
    //         key: 4,
    //         name: `Josh`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `female`,
    //       },
    //       {
    //         key: 5,
    //         name: `Jo`,
    //         email: 'test@gmail.com',
    //         phone: `0147896325`,
    //         gender: `male`,
    //       },
    //       {
    //         key: 6,
    //         name: `Jaimi`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `female`,
    //       },
    //       {
    //         key: 7,
    //         name: `Alexa`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `male`,
    //       },
    //       {
    //         key: 8,
    //         name: `Donald`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `female`,
    //       },
    //       {
    //         key: 9,
    //         name: `Pavel`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `male`,
    //       },
    //       {
    //         key: 10,
    //         name: `Nick`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `female`,
    //       },
    //       {
    //         key: 11,
    //         name: `Dasha`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `male`,
    //       },
    //       {
    //         key: 12,
    //         name: `Alex`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `female`,
    //       },
    //       {
    //         key: 13,
    //         name: `Vic`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `male`,
    //       },
    //       {
    //         key: 14,
    //         name: `Natalia`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `female`,
    //       },
    //       {
    //         key: 15,
    //         name: `Zack`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `male`,
    //       },
    //       {
    //         key: 16,
    //         name: `Jack`,
    //         email: 'test@gmail.com',
    //         phone: `64184465`,
    //         gender: `female`,
    //       },
    //     ],
    //     pagination: { ...pagination, total: 16 },
    //   });
    // }, 1000);
  });
};
