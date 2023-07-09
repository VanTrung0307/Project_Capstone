/* eslint-disable prettier/prettier */
import { SearchOutlined } from '@ant-design/icons';
import { Status } from '@app/components/profile/profileCard/profileFormNav/nav/payments/paymentHistory/Status/Status';
import { useMounted } from '@app/hooks/useMounted';
import { defineColorByPriority } from '@app/utils/utils';
import { Col, Form, Input, Popconfirm, Row, Space, TablePaginationConfig } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { BasicTableRow, Pagination, Tag, getBasicTableData } from 'api/table.api';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import { DefaultRecordType, Key } from 'rc-table/lib/interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 5,
};

export const FPTHCMTable: React.FC = () => {
  const [tableData, setTableData] = useState<{ data: BasicTableRow[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const { t } = useTranslation();
  const { isMounted } = useMounted();

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      getBasicTableData(pagination).then((res) => {
        if (isMounted.current) {
          setTableData({ data: res.data, pagination: res.pagination, loading: false });
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
  };

  const handleDeleteRow = (rowId: number) => {
    setTableData({
      ...tableData,
      data: tableData.data.filter((item) => item.key !== rowId),
      pagination: {
        ...tableData.pagination,
        total: tableData.pagination.total ? tableData.pagination.total - 1 : tableData.pagination.total,
      },
    });
  };

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
    width: '10px',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: '20px',
    fontSize: '16px',
    fontWeight: '400',
    color: '#fff',
    border: 'none',
    padding: '4px 50px 0px 10px',
    borderRadius: '6px',
    backgroundColor: '#4070f4',
    cursor: 'pointer',
    marginLeft: '50px',
  };

  const [searchValue, setSearchValue] = useState('');

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<BasicTableRow[]>([]);
  const isEditing = (record: BasicTableRow) => record.key === editingKey;

  const [form] = Form.useForm();

  const save = async (key: React.Key) => {
    try {
      await form.validateFields([key]);
      const row = form.getFieldsValue([key]);
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const edit = (record: Partial<BasicTableRow> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof BasicTableRow) => {
    const updatedData = data.map((record) => {
      if (record.key === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData(updatedData);
  };

  const columns: ColumnsType<BasicTableRow> = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      render: (text: string, record: BasicTableRow) => {
        const editable = isEditing(record);
        const dataIndex: keyof BasicTableRow = 'name'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.key}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.key, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      onFilter: (value: string | number | boolean, record: BasicTableRow) =>
        record.name.toLowerCase().includes(value.toString().toLowerCase()),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
        const handleSearch = () => {
          confirm();
          setSearchValue(selectedKeys[0].toString());
        };

        return (
          <div style={filterDropdownStyles} className="input-box">
            <input
              type="text"
              placeholder="Search here..."
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value.toString()] : [])}
              style={inputStyles}
            />
            <button onClick={handleSearch} className="button" style={buttonStyles}>
              Filter
            </button>
          </div>
        );
      },
      filterIcon: () => <SearchOutlined />,
      filtered: searchValue !== '', // Apply filtering if searchValue is not empty
    },
    {
      title: t('Email'),
      dataIndex: 'email',
      render: (text: string, record: BasicTableRow) => {
        const editable = isEditing(record);
        const dataIndex: keyof BasicTableRow = 'email'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.key}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a email' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.key, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      // sorter: (a: BasicTableRow, b: BasicTableRow) => a.email - b.email,
      showSorterTooltip: false,
    },
    {
      title: t('Phone'),
      dataIndex: 'phone',
      render: (text: string, record: BasicTableRow) => {
        const editable = isEditing(record);
        const dataIndex: keyof BasicTableRow = 'phone'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.key}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a phone' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.key, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Gender'),
      dataIndex: 'gender',
      render: (text: string, record: BasicTableRow) => {
        const editable = isEditing(record);
        const dataIndex: keyof BasicTableRow = 'gender'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.key}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a gender' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.key, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Status'),
      key: 'tags',
      dataIndex: 'status',
      render: (statuses: Tag[]) => (
        <Row gutter={[10, 10]}>
          {statuses.map((status: Tag) => {
            return (
              <Col key={status.value}>
                <Status color={defineColorByPriority(status.priority)} text={status.value.toUpperCase()} />
              </Col>
            );
          })}
        </Row>
      ),
      filterMode: 'tree',
      filters: [
        {
          text: t('Status'),
          value: 'status',
          children: [
            {
              text: 'Đang hoạt động',
              value: 'Đang hoạt động',
            },
            {
              text: 'Không hoạt động',
              value: 'Không hoạt động',
            },
          ],
        },
      ],
      onFilter: (value: string | number | boolean, record: BasicTableRow) => {
        if (record.status) {
          const statusValues = record.status.map((status) => status.value);
          return statusValues.includes(value.toString());
        }
        return false;
      },
    },
    {
      title: t('tables.actions'),
      dataIndex: 'actions',
      width: '15%',
      render: (text: string, record: BasicTableRow) => {
        const editable = isEditing(record);
        return (
          <Space>
            {editable ? (
              <>
                <Button type="primary" onClick={() => save(record.key)}>
                  {t('common.save')}
                </Button>
                <Button type="ghost" onClick={cancel}>
                  {t('common.cancel')}
                </Button>
              </>
            ) : (
              <>
                <Button type="ghost" disabled={editingKey !== ''} onClick={() => edit(record)}>
                  {t('common.edit')}
                </Button>
                <Button type="default" danger onClick={() => handleDeleteRow(record.key)}>
                  {t('tables.delete')}
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Form form={form} component={false}>
      <Table
        columns={columns}
        dataSource={tableData.data}
        pagination={tableData.pagination}
        rowSelection={{ ...rowSelection }}
        loading={tableData.loading}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
        bordered
      />
    </Form>
  );
};
