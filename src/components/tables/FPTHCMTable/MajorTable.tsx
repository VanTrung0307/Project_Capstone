/* eslint-disable prettier/prettier */
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { Form, Input, Modal, Select, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Major, getMajors, updateMajor, Pagination } from '@app/api/FPT_3DMAP_API/Major';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import { DefaultRecordType, Key } from 'rc-table/lib/interface';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';
import { SearchOutlined } from '@ant-design/icons';
import { CSSProperties } from 'styled-components';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 5,
};

export const MajorTable: React.FC = () => {
  const [tableData, setTableData] = useState<{ data: Major[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const { t } = useTranslation();

  // const handleDeleteRow = (rowId: number) => {
  //   setTableData({
  //     ...tableData,
  //     data: tableData.data.filter((item) => item.key !== rowId),
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
  const [data, setData] = useState<Major[]>([]);
  const isEditing = (record: Major) => record.id === editingKey;

  const [form] = Form.useForm();

  const save = async (key: React.Key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.id);

      let item;

      if (index > -1) {
        item = newData[index];
        const updatedItem = {
          ...item,
          ...row,
        };
        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData(newData);
      setEditingKey(0);

      try {
        await updateMajor(key.toString(), row);
        console.log('Major data updated successfully');
      } catch (error) {
        console.error('Error updating Major data:', error);
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData(newData);
        }
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const edit = (record: Partial<Major> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Major) => {
    const updatedData = data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData(updatedData);
  };

  useEffect(() => {
    const fetchMajorData = async () => {
      try {
        const majors = await getMajors();
        setData(majors);
      } catch (error) {
        console.error('Error fetching majors:', error);
      }
    };
    fetchMajorData();
  }, []);

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      // Create a new data object from the form values
      const newData = {
        name: values.name,
        description: values.description,
        status: values.status,
        id: values.id,
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

  const columns: ColumnsType<Major> = [
    {
      title: t('Tên ngành'),
      dataIndex: 'name',
      render: (text: string, record: Major) => {
        const editable = isEditing(record);
        const dataIndex: keyof Major = 'name'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.name, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      onFilter: (value: string | number | boolean, record: Major) =>
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
      title: t('Mô tả'),
      dataIndex: 'description',
      render: (text: string, record: Major) => {
        const editable = isEditing(record);
        const dataIndex: keyof Major = 'description'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.description}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.description, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : "Chưa có thông tin"}</span>
        );
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '8%',
      render: (text: string, record: Major) => {
        const editable = isEditing(record);
        const dataIndex: keyof Major = 'status'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a status' }]}
          >
            <Input
              value={record[dataIndex].toString()}
              onChange={(e) => handleInputChange(e.target.value, record.status, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      width: '15%',
      render: (text: string, record: Major) => {
        const editable = isEditing(record);
        return (
          <Space>
            {editable ? (
              <>
                <Button type="primary" onClick={() => save(record.id)}>
                  {t('common.save')}
                </Button>
                <Button type="ghost" onClick={cancel}>
                  {t('common.cancel')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="ghost"
                  disabled={editingKey === record.id}
                  onClick={() => edit({ ...record, key: record.id })}
                >
                  {t('common.edit')}
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
