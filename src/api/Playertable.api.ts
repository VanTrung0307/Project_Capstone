/* eslint-disable prettier/prettier */
import { Priority } from '../constants/enums/priorities';

export interface Tag {
  value: string;
  priority: Priority;
}

export interface PlayerTableRow {
  userId: string;
  totalPoint: number;
  totalTime: number;
  id: string;
}

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface BasicTableData {
  data: PlayerTableRow[];
  pagination: Pagination;
}

export interface TreeTableRow extends PlayerTableRow {
  children?: TreeTableRow[];
}

export interface TreeTableData extends BasicTableData {
  data: TreeTableRow[];
}

export interface EditableTableData extends BasicTableData {
  data: PlayerTableRow[];
}
