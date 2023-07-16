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
