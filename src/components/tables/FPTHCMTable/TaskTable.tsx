/* eslint-disable prettier/prettier */
import { SearchOutlined } from '@ant-design/icons';
import { Status } from '@app/components/profile/profileCard/profileFormNav/nav/payments/paymentHistory/Status/Status';
import { useMounted } from '@app/hooks/useMounted';
import { defineColorByPriority } from '@app/utils/utils';
import { Col, Form, Input, Modal, Row, Select, Space, TablePaginationConfig } from 'antd';
import { Option } from '@app/components/common/selects/Select/Select';
import { ColumnsType } from 'antd/es/table';
import { BasicTableRow, Pagination, Tag, getBasicTableData } from 'api/Tasktable.api';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import { DefaultRecordType, Key } from 'rc-table/lib/interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import * as S from 'components/forms/StepForm/StepForm.styles';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 5,
};

export const TaskTable: React.FC = () => {
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
        locationname: values.locationname,
        npcname: values.npcname,
        majorname: values.majorname,
        type: values.type,
        point: values.point,
        endtime: values.endtime,
        timeoutamount: values.timeoutamount,
        isrequireitem: values.isrequireitem,
        status: values.status,
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

  const columns: ColumnsType<BasicTableRow> = [
    {
      title: t('Tên nhiệm vụ'),
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
      title: t('Tên địa điểm'),
      dataIndex: 'locationname',
      render: (text: string, record: BasicTableRow) => {
        const editable = isEditing(record);
        const dataIndex: keyof BasicTableRow = 'locationname'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.key}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a locationname' }]}
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
      title: t('Tên NPC có sứ mệnh'),
      dataIndex: 'npcname',
      render: (text: string, record: BasicTableRow) => {
        const editable = isEditing(record);
        const dataIndex: keyof BasicTableRow = 'npcname'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.key}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a npcname' }]}
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
      title: t('Tên Ngành đã giao nhiệm vụ'),
      dataIndex: 'majorname',
      render: (text: string, record: BasicTableRow) => {
        const editable = isEditing(record);
        const dataIndex: keyof BasicTableRow = 'majorname'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.key}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a majorname' }]}
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
      title: t('Loại nhiệm vụ'),
      dataIndex: 'type',
      render: (text: string, record: BasicTableRow) => {
        const editable = isEditing(record);
        const dataIndex: keyof BasicTableRow = 'type'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.key}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a type' }]}
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
        title: t('Điểm thưởng tương ứng'),
        dataIndex: 'point',
        render: (text: number, record: BasicTableRow) => {
          const editable = isEditing(record);
          const dataIndex: keyof BasicTableRow = 'point'; // Define dataIndex here
          return editable ? (
            <Form.Item
              key={record.key}
              name={dataIndex}
              initialValue={text}
              rules={[{ required: true, message: 'Please enter a point' }]}
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
        title: t('Có thời gian kết thúc?'),
        dataIndex: 'endtime',
        render: (text: number, record: BasicTableRow) => {
          const editable = isEditing(record);
          const dataIndex: keyof BasicTableRow = 'endtime'; // Define dataIndex here
          return editable ? (
            <Form.Item
              key={record.key}
              name={dataIndex}
              initialValue={text}
              rules={[{ required: true, message: 'Please enter a End Time' }]}
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
        title: t('Thời gian đợi để làm lại nhiệm vụ'),
        dataIndex: 'timeoutamount',
        render: (text: number, record: BasicTableRow) => {
          const editable = isEditing(record);
          const dataIndex: keyof BasicTableRow = 'timeoutamount'; // Define dataIndex here
          return editable ? (
            <Form.Item
              key={record.key}
              name={dataIndex}
              initialValue={text}
              rules={[{ required: true, message: 'Please enter a timeoutamount' }]}
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
        title: t('Có yêu cầu vật phẩm?'),
        dataIndex: 'isrequireitem',
        render: (text: number, record: BasicTableRow) => {
          const editable = isEditing(record);
          const dataIndex: keyof BasicTableRow = 'isrequireitem'; // Define dataIndex here
          return editable ? (
            <Form.Item
              key={record.key}
              name={dataIndex}
              initialValue={text}
              rules={[{ required: true, message: 'Please enter a isrequireitem' }]}
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
      title: t('Trạng thái'),
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
      title: t('Chức năng'),
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
