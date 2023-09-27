/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined } from '@ant-design/icons';
import {
  Pagination,
  School,
  createSchool,
  deleteSchool,
  getPaginatedSchools,
  updateSchool,
} from '@app/api/FPT_3DMAP_API/School';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const SchoolTable: React.FC = () => {
  const { t } = useTranslation();
  const { TextArea } = Input;

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: School[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: School) => record.id === editingKey;

  const [form] = Form.useForm();

  const save = async (key: React.Key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data.data];
      const index = newData.findIndex((item) => key === item.id);

      let item;

      if (index > -1) {
        item = newData[index];
        const updatedItem = {
          ...item,
          ...row,
        };

        Object.keys(updatedItem).forEach((field) => {
          if (updatedItem[field] === '') {
            updatedItem[field] = null;
          }
        });
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateSchool(key.toString(), row);
        message.success('Cập nhật thành công');
        setData({ ...data, data: newData, loading: false });
        fetch(data.pagination);
      } catch (error) {
        message.error('Cập nhật không thành công');
        fetch(data.pagination);
        if (index > -1 && item) {
          newData.splice(index, 1, item);
        }
      }
    } catch (errInfo) {
      message.error('Lỗi hệ thống');
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const edit = (record: Partial<School> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof School) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const [originalData, setOriginalData] = useState<School[]>([]);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedSchools(pagination).then((res) => {
        if (isMounted.current) {
          setOriginalData(res.data);
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

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      Object.keys(values).forEach((key) => {
        if (typeof values[key] === 'string') {
          values[key] = values[key].trim();
        }
      });

      const hasEmptyValues = Object.values(values).some((value) => value === '');
      if (hasEmptyValues) {
        message.error('Phải nhập đầy đủ thông tin');
        return;
      }

      const newData: School = {
        name: values.name,
        phoneNumber: values.phoneNumber,
        email: values.email,
        address: values.address,
        status: values.status,
        id: values.id,
      };

      const isDuplicate = data.data.some((school) => {
        return Object.keys(values).every((key) => {
          return (school as any)[key] === values[key];
        });
      });

      if (isDuplicate) {
        message.error('Dữ liệu đã tồn tại');
      } else {
        try {
          const createdSchool = await createSchool(newData);

          setData((prevData) => ({
            ...prevData,
            data: [createdSchool, ...prevData.data],
            loading: false,
          }));
          form.resetFields();
          setIsBasicModalOpen(false);
          fetch(data.pagination);
          message.success('Tạo trường thành công');
        } catch (error) {
          message.error('Tạo trường không thành công');
          setData((prevData) => ({ ...prevData, loading: false }));
        }
      }
    } catch (error) {
      message.error('Phải nhập đầy đủ thông tin');
    }
  };

  const navigate = useNavigate();

  const handleDeleteSchool = async (schoolId: string) => {
    try {
      await deleteSchool(schoolId);

      setData((prevTableData) => ({
        ...prevTableData,
        data: prevTableData.data.filter((item) => item.id !== schoolId),
        pagination: {
          ...prevTableData.pagination,
          total: prevTableData.pagination.total ? prevTableData.pagination.total - 1 : prevTableData.pagination.total,
        },
      }));
      message.success(`Xoá trường thành công`);
    } catch (error) {
      message.error('Xoá trường thất bại');
    }
  };

  const columns: ColumnsType<School> = [
    {
      title: t('Tên trường'),
      dataIndex: 'name',
      width: '16,67%',
      render: (text: string, record: School) => {
        const editable = isEditing(record);
        const dataIndex: keyof School = 'name';
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[
              { required: true, message: 'Hãy nhập tên trường' },
              {
                pattern: /^[^\W_].*$/,
                message: 'Không được bắt đầu ký tự đặc biệt',
              },
            ]}
          >
            <Input
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.name, dataIndex)}
              style={{ background: '#414345' }}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Email'),
      dataIndex: 'email',
      width: '16,67%',
      render: (text: string, record: School) => {
        const editable = isEditing(record);
        const dataIndex: keyof School = 'email';
        const emailValidationRules = [
          { required: true, message: 'Hãy nhập email của trường' },
          {
            pattern: /^[a-zA-Z0-9][a-zA-Z0-9._-]*@.*$/,
            message: 'Email phải có định dạng name@gmail.com và không có ký tự đặc biệt ở đầu',
          },
          {
            max: 100,
            message: 'Email không được vượt quá 100 ký tự',
          },
        ];
        return editable ? (
          <Form.Item key={record.email} name={dataIndex} initialValue={text} rules={emailValidationRules}>
            <Input
              type="email"
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.email, dataIndex)}
              style={{ maxWidth: '350px', background: '#414345' }}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : 'Chưa có thông tin'}</span>
        );
      },
    },
    {
      title: t('Địa chỉ'),
      dataIndex: 'address',
      width: '16,67%',
      render: (text: string, record: School) => {
        const editable = isEditing(record);
        const dataIndex: keyof School = 'address';
        const addressValidationRules = [{ required: true, message: 'Hãy nhập địa chỉ của trường' }];
        const maxTextLength = 255;
        const truncatedText = text?.length > maxTextLength ? `${text.slice(0, maxTextLength)}...` : text;
        return editable ? (
          <Form.Item key={record.address} name={dataIndex} initialValue={text} rules={addressValidationRules}>
            <TextArea
              autoSize={{ maxRows: 3 }}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.address, dataIndex)}
              style={{ background: '#414345' }}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : 'Chưa có thông tin'}</span>
        );
      },
    },
    {
      title: t('Điện thoại'),
      dataIndex: 'phoneNumber',
      render: (text: number, record: School) => {
        const editable = isEditing(record);
        const dataIndex: keyof School = 'phoneNumber';
        return editable ? (
          <Form.Item
            key={record.phoneNumber}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập số điện thoại của trường' }]}
          >
            <Input
              type="tel"
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.phoneNumber, dataIndex)}
              style={{ maxWidth: '120px', background: '#414345' }}
            />
          </Form.Item>
        ) : (
          <span>0{text}</span>
        );
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '8.5%',
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text: string, record: School) => {
        const editable = isEditing(record);
        const dataIndex: keyof School = 'status';

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập trạng thái' }]}
          >
            <Select
              value={text}
              onChange={(value) => handleInputChange(value, record.status, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#FF7C00' }} />}
              dropdownStyle={{ background: '#414345' }}
            >
              {statusOptions.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text !== 'INACTIVE' ? <Tag color="#339CFD">ACTIVE</Tag> : <Tag color="#FF5252">INACTIVE</Tag>}</span>
        );
      },
    },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      render: (text: string, record: School) => {
        const editable = isEditing(record);
        return (
          <Space>
            {editable ? (
              <>
                <Button type="primary" onClick={() => save(record.id.toString())}>
                  Lưu
                </Button>
                <Button type="ghost" onClick={cancel}>
                  Huỷ
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="ghost"
                  disabled={editingKey === record.id}
                  onClick={() => edit({ ...record, key: record.id })}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  danger
                  onClick={() => handleDeleteSchool(record.id)}
                  style={{ background: '#FF5252', color: 'white' }}
                >
                  Xoá
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const FlexContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  `;

  const Label = styled.label`
    flex: 0 0 200px;
    ::before {
      content: '* ';
      color: red;
    }
  `;

  const InputContainer = styled.div`
    flex: 1;
  `;

  const [filteredData, setFilteredData] = useState(data.data);

  const handleSearch = (value: string) => {
    const updatedFilteredData = data.data.filter((record) =>
      Object.values(record).some((fieldValue) => String(fieldValue).toLowerCase().includes(value.toLowerCase())),
    );
    setFilteredData(updatedFilteredData);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();

    if (inputValue === '') {
      setFilteredData(data.data);
    } else {
      handleSearch(inputValue);
    }
  };

  return (
    <Form form={form} component={false}>
      <Button
        type="primary"
        onClick={() => setIsBasicModalOpen(true)}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 20px' }}
      >
        Tạo mới
      </Button>
      <Modal
        title={'Thêm TRƯỜNG'}
        className="custom-modal"
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button key="back" onClick={() => setIsBasicModalOpen(false)} style={{ background: '#414345' }}>
              Huỷ
            </Button>
            <Button key="submit" type="primary" onClick={handleModalOk}>
              Tạo
            </Button>
          </div>
        }
        style={{ marginTop: '-50px' }}
      >
        <S.FormContent>
          <FlexContainer>
            <Label>{'Tên trường'}</Label>
            <InputContainer>
              <BaseForm.Item
                name="name"
                rules={[
                  { required: true, message: t('Hãy nhập tên trường') },
                  {
                    pattern: /^[^\d\W].*$/,
                    message: 'Không được bắt đầu bằng số hoặc ký tự đặc biệt',
                  },
                  {
                    max: 100,
                    message: 'Tên trường không được vượt quá 100 ký tự',
                  },
                ]}
              >
                <Input style={{ background: '#414345' }} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Email'}</Label>
            <InputContainer>
              <BaseForm.Item
                name="email"
                rules={[
                  { required: true, message: t('Hãy nhập email trường') },
                  {
                    pattern: /^[a-zA-Z0-9][a-zA-Z0-9._-]*@.*$/,
                    message: 'Email phải có định dạng name@gmail.com và không có ký tự đặc biệt ở đầu',
                  },
                  {
                    max: 100,
                    message: 'Email không được vượt quá 100 ký tự',
                  },
                ]}
              >
                <Input placeholder="Ví dụ: name@gmail.com" style={{ background: '#414345' }} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Số điện thoại'}</Label>
            <InputContainer>
              <BaseForm.Item
                name="phoneNumber"
                rules={[
                  { required: true, message: t('Hãy nhập số điện thoại của trường') },
                  {
                    pattern: /^[0][0-9]{9,11}$/,
                    message: 'Số điện thoại không hợp lệ',
                  },
                ]}
              >
                <Input type="tel" placeholder="10 hoặc 11 số" style={{ background: '#414345' }} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Địa chỉ'}</Label>
            <InputContainer>
              <BaseForm.Item
                name="address"
                rules={[
                  { required: true, message: t('Hãy nhập địa chỉ của trường') },
                  {
                    max: 1000,
                    message: 'Tên trường không được vượt quá 1000 ký tự',
                  },
                ]}
              >
                <TextArea style={{ background: '#414345' }} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Trạng thái'}</Label>
            <InputContainer>
              <BaseForm.Item name="status" initialValue={'ACTIVE'}>
                <Input disabled={true} style={{ background: '#1D1C1A' }} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
        </S.FormContent>
      </Modal>

      <SearchInput
        placeholder="Tìm kiếm..."
        allowClear
        onSearch={handleSearch}
        onChange={handleSearchChange}
        style={{ marginBottom: '16px', width: '400px', right: '0' }}
      />

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
        scroll={{ x: 1500 }}
        bordered
      />
    </Form>
  );
};
