/* eslint-disable prettier/prettier */
import { SearchOutlined } from '@ant-design/icons';
import { Player, getPaginatedPlayers, Pagination } from '@app/api/FPT_3DMAP_API/Player';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const RankTable: React.FC = () => {
  const { t } = useTranslation();

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
    width: '60px',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: '20px',
    fontSize: '16px',
    fontWeight: '400',
    color: '#fff',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: '#4070f4',
    cursor: 'pointer',
  };

  const [searchValue, setSearchValue] = useState('');

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: Player[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: Player) => record.id === editingKey;

  const [form] = Form.useForm();

  const cancel = () => {
    setEditingKey('');
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Player) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedPlayers(pagination).then((res) => {
        if (isMounted.current) {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        }
      });
    },
    [isMounted],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  const columns: ColumnsType<Player> = [
    {
      title: t('Username'),
      dataIndex: 'nickname',
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'nickname';
        return editable ? (
          <Form.Item
            key={record.nickname}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.nickname, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      onFilter: (value: string | number | boolean, record: Player) =>
        record.eventName.toLowerCase().includes(value.toString().toLowerCase()),
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
      filtered: searchValue !== '',
    },
    {
      title: t('Tên người chơi'),
      dataIndex: 'studentName',
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'studentName';
        return editable ? (
          <Form.Item
            key={record.studentName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a playerId' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.studentName, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      onFilter: (value: string | number | boolean, record: Player) =>
        record.studentName.toLowerCase().includes(value.toString().toLowerCase()),
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
      filtered: searchValue !== '',
    },
    {
      title: t('Tổng thời gian'),
      dataIndex: 'totalPoint',
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'totalPoint';
        return editable ? (
          <Form.Item
            key={record.totalPoint}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a eventId' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.totalPoint, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Tổng điểm'),
      dataIndex: 'totalPoint',
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'totalPoint';
        return editable ? (
          <Form.Item
            key={record.totalPoint}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a place' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.totalPoint, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
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
        dataSource={data.data}
        pagination={{
          ...data.pagination,
          onChange: cancel,
        }}
        onChange={handleTableChange}
        loading={data.loading}
        scroll={{ x: 1000 }}
        bordered
      />
    </Form>
  );
};
