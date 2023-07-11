/* eslint-disable prettier/prettier */
import { SearchOutlined } from '@ant-design/icons';
import { Player, getPlayers } from '@app/api/FPT_3DMAP_API/Player';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, TablePaginationConfig } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { BasicTableRow, Pagination, getBasicTableData } from 'api/table.api';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import { DefaultRecordType, Key } from 'rc-table/lib/interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

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

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      // Create a new data object from the form values
      const newData = {
        key: Date.now(), // Generate a unique key for the new data (e.g., using timestamp)
        name: values.name,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        country: values.country,
      };

      // Update the tableData state with the new data
      setTableData((prevData) => ({
        ...prevData,
        data: [...prevData.data, newData],
      }));

      form.resetFields(); // Reset the form fields
      setIsBasicModalOpen(false); // Close the modal
    });
  };

  const [players, setPlayers] = useState<Player[]>([]);
  interface PlayerTableRow extends Player, BasicTableRow {}

  useEffect(() => {
    const fetchData = async () => {
      try {
        const players = await getPlayers(); // Call the getPlayers function from the Player API component
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchData();
  }, []);

  const playerColumns: ColumnsType<PlayerTableRow> = [
    {
      title: t('common.name'),
      dataIndex: 'userId',
      render: (text: string, record: PlayerTableRow) => {
        const editable = isEditing(record);
        const dataIndex: keyof PlayerTableRow = 'userId'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.userId}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input
              value={text}
              onChange={(e) => handleInputChange(e.target.value, record.userId, dataIndex as keyof BasicTableRow)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      onFilter: (value: string | number | boolean, record: PlayerTableRow) =>
        record.userId.toLowerCase().includes(value.toString().toLowerCase()),
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
      title: t('Email'),
      dataIndex: 'totalPoint',
      render: (text: number, record: PlayerTableRow) => {
        const editable = isEditing(record);
        const dataIndex: keyof PlayerTableRow = 'totalPoint'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.totalPoint}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter an email' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.userId, dataIndex as keyof BasicTableRow)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      showSorterTooltip: false,
    },
    {
      title: t('Phone'),
      dataIndex: 'totalTime',
      render: (text: number, record: PlayerTableRow) => {
        const editable = isEditing(record);
        const dataIndex: keyof PlayerTableRow = 'totalTime'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.totalTime}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a phone' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.userId, dataIndex as keyof BasicTableRow)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Gender'),
      dataIndex: 'id',
      render: (text: string, record: PlayerTableRow) => {
        const editable = isEditing(record);
        const dataIndex: keyof PlayerTableRow = 'id'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.id}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a gender' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.userId, dataIndex as keyof BasicTableRow)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    // {
    //   title: t('Status'),
    //   key: 'tags',
    //   dataIndex: 'status',
    //   render: (statuses: Tag[]) => (
    //     <Row gutter={[10, 10]}>
    //       {statuses.map((status: Tag) => {
    //         return (
    //           <Col key={status.value}>
    //             <Status color={defineColorByPriority(status.priority)} text={status.value.toUpperCase()} />
    //           </Col>
    //         );
    //       })}
    //     </Row>
    //   ),
    //   filterMode: 'tree',
    //   filters: [
    //     {
    //       text: t('Status'),
    //       value: 'status',
    //       children: [
    //         {
    //           text: 'Đang hoạt động',
    //           value: 'Đang hoạt động',
    //         },
    //         {
    //           text: 'Không hoạt động',
    //           value: 'Không hoạt động',
    //         },
    //       ],
    //     },
    //   ],
    //   onFilter: (value: string | number | boolean, record: Player) => {
    //     if (record.status) {
    //       const statusValues = record.status.map((status) => status.value);
    //       return statusValues.includes(value.toString());
    //     }
    //     return false;
    //   },
    // },
    {
      title: t('tables.actions'),
      dataIndex: 'actions',
      width: '15%',
      render: (text: string, record: PlayerTableRow) => {
        const editable = isEditing(record);
        return (
          <Space>
            {editable ? (
              <>
                <Button type="primary" onClick={() => save(record.userId)}>
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
                <Button type="default" danger onClick={() => handleDeleteRow(parseInt(record.userId))}>
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
      <Button
        type="primary"
        onClick={() => setIsBasicModalOpen(true)}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 20px' }}
      >
        Add Data
      </Button>
      <Modal
        title={'Add Player'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <BaseForm.Item name="name" label={'Name'} rules={[{ required: true, message: t('Hãy điền tên người chơi') }]}>
            <Input />
          </BaseForm.Item>
          <BaseForm.Item
            name="email"
            label={'Email'}
            rules={[{ required: true, message: t('Hãy điền email người chơi') }]}
          >
            <Input />
          </BaseForm.Item>
          <BaseForm.Item name="phone" label={'Phone'} rules={[{ required: true, message: t('Nhập số điện thoại') }]}>
            <Input />
          </BaseForm.Item>
          <BaseForm.Item name="gender" label={'Gender'} rules={[{ required: true, message: t('Nhập giới tính') }]}>
            <Input />
          </BaseForm.Item>
          <BaseForm.Item
            name="country"
            label={'Status'}
            rules={[{ required: true, message: t('Trạng thái người chơi là cần thiết') }]}
          >
            <Select placeholder={'Status'}>
              <Option value="active">{'Đang hoạt động'}</Option>
              <Option value="inactive">{'Không hoạt động'}</Option>
            </Select>
          </BaseForm.Item>
        </S.FormContent>
      </Modal>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        columns={playerColumns}
        dataSource={players}
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
