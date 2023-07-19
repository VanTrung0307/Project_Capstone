/* eslint-disable prettier/prettier */
import { SearchOutlined } from '@ant-design/icons';
import { Player, getPlayers } from '@app/api/FPT_3DMAP_API/Player';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { Form, Input, Modal, Select, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Pagination } from 'api/Playertable.api';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import { DefaultRecordType, Key } from 'rc-table/lib/interface';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 5,
};

export const PlayerTable: React.FC = () => {
  const [tableData, setTableData] = useState<{ data: Player[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const { t } = useTranslation();

  // const handleDeleteRow = (rowId: number) => {
  //   setTableData({
  //     ...tableData,
  //     data: tableData.data.filter((item) => Number(item.id) !== rowId),
  //     pagination: {
  //       ...tableData.pagination,
  //       total: tableData.pagination.total ? tableData.pagination.total - 1 : tableData.pagination.total,
  //     },
  //   });
  // };

  const rowSelection = {
    onChange: (selectedRowKeys: Key[], selectedRows: DefaultRecordType[]) => {
      console.log(selectedRowKeys, selectedRows);
    },
    onSelect: (record: DefaultRecordType, selected: boolean, selectedRows: DefaultRecordType[]) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected: boolean, selectedRows: DefaultRecordType[]) => {
      console.log(selected, selectedRows);
    },
  };

  const filterDropdownStyles: CSSProperties = {
    height: '50px',
    maxWidth: '300px',
    width: '100%',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)',
    border: '2px solid white',
    right: '10px',
  };

  const inputStyles = {
    height: '100%',
    width: '100%',
    outline: 'none',
    fontSize: '18px',
    fontWeight: '400',
    border: 'none',
    borderRadius: '8px',
    padding: '0 155px 0 25px',
    backgroundColor: '#25284B',
    color: 'white',
  };

  const buttonStyles: CSSProperties = {
    height: '30px',
    width: '60px', // Adjust the width to accommodate the text
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: '20px',
    fontSize: '16px',
    fontWeight: '400',
    color: '#fff',
    border: 'none',
    padding: '4px 10px', // Adjust the padding to position the text
    borderRadius: '6px',
    backgroundColor: '#4070f4',
    cursor: 'pointer',
  };

  const [searchValue, setSearchValue] = useState('');

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<Player[]>([]);
  const isEditing = (record: Player) => record.id === editingKey;

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const players = await getPlayers();
        setData(players);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchUserData();
  }, []);

  const columns: ColumnsType<Player> = [
    {
      title: t('Tên học sinh đã tham gia'),
      dataIndex: 'name',
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'name'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            {/* <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.userId, dataIndex)}
            /> */}
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      onFilter: (value: string | number | boolean, record: Player) =>
        record.name.toLowerCase().includes(value.toString().toLowerCase()),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
        const handleSearch = () => {
          confirm();
          setSearchValue(selectedKeys[0].toString());
        };

        return (
          <div style={filterDropdownStyles} className="input-box">
            <Input
              type="text"
              placeholder="Search here..."
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value.toString()] : [])}
              style={inputStyles}
            />
            <Button onClick={handleSearch} className="button" style={buttonStyles}>
              Filter
            </Button>
          </div>
        );
      },
      filterIcon: () => <SearchOutlined />,
      filtered: searchValue !== '', // Apply filtering if searchValue is not empty
    },
    {
      title: t('Biệt danh'),
      dataIndex: 'nickName',
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'nickName'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.nickName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a nickname' }]}
          >
            {/* <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.userId, dataIndex)}
            /> */}
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Tổng điểm thưởng'),
      dataIndex: 'totalpoint',
      width: '8%',
      render: (text: number) => {
        <span>{text}</span>;
      },
    },
    {
      title: t('Tổng thời gian hoàn thành'),
      dataIndex: 'totaltime',
      width: '8%',
      render: (text: number) => {
        <span>{text}</span>;
      },
    },
  ];

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        columns={columns}
        dataSource={data}
        pagination={tableData.pagination}
        rowSelection={{ ...rowSelection }}
        loading={tableData.loading}
        scroll={{ x: 800 }}
        bordered
      />
    </Form>
  );
};
