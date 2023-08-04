/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';
import { Pagination, School, createSchool, getPaginatedSchools, getSchoolbyEventId, updateSchool } from '@app/api/FPT_3DMAP_API/School';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';
import { useNavigate, useParams } from 'react-router-dom';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 2,
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

        // Kiểm tra và chuyển các trường rỗng thành giá trị null
        Object.keys(updatedItem).forEach((field) => {
          if (updatedItem[field] === '') {
            updatedItem[field] = null;
          }
        });

        console.log('Updated null Major:', updatedItem); // Kiểm tra giá trị trước khi gọi API

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateSchool(key.toString(), row);
        console.log('School data updated successfully');
      } catch (error) {
        console.error('Error updating school data:', error);
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData }));
        }
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
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
  const { eventId } = useParams<{ eventId: string | undefined }>();

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedSchools(pagination).then((res) => {
        if (isMounted.current) {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        }
      });
      if (eventId) {
        getSchoolbyEventId(eventId, pagination).then((res) => {
          if (isMounted.current) {
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        });
      }
    },
    [isMounted, eventId],
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

      const newData: School = {
        name: values.name,
        phoneNumber: values.phoneNumber,
        email: values.email,
        address: values.address,
        status: values.status,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true })); // Show loading state

      try {
        const createdSchool = await createSchool(newData);
        setData((prevData) => ({
          ...prevData,
          data: [...prevData.data, createdSchool],
          loading: false, // Hide loading state after successful update
        }));
        form.resetFields();
        setIsBasicModalOpen(false);
        console.log('School data created successfully');

        // Fetch the updated data after successful creation
        getPaginatedSchools(data.pagination).then((res) => {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        });
      } catch (error) {
        console.error('Error creating School data:', error);
        setData((prevData) => ({ ...prevData, loading: false })); // Hide loading state on error
      }
    } catch (error) {
      console.error('Error validating form:', error);
    }
  };

  const navigate = useNavigate();

  const handleDetailClick = (schoolId: string) => {
    navigate(`/students/${schoolId}`);
  };

  const columns: ColumnsType<School> = [
    {
      title: t('Tên trường'),
      dataIndex: 'name',
      render: (text: string, record: School) => {
        const editable = isEditing(record);
        const dataIndex: keyof School = 'name'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên trường là cần thiết' }]}
          >
            <Input
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.name, dataIndex)}
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
      render: (text: string, record: School) => {
        const editable = isEditing(record);
        const dataIndex: keyof School = 'email'; // Define dataIndex here
        return editable ? (
          <Form.Item key={record.email} name={dataIndex} initialValue={text} rules={[{ required: false }]}>
            <Input
              type="email"
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.email, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : 'Chưa có thông tin'}</span>
        );
      },
    },
    {
      title: t('Địa chỉ nhà trường'),
      dataIndex: 'address',
      render: (text: string, record: School) => {
        const editable = isEditing(record);
        const dataIndex: keyof School = 'address'; // Define dataIndex here
        const maxTextLength = 255;
        const truncatedText = text?.length > maxTextLength ? `${text.slice(0, maxTextLength)}...` : text;
        return editable ? (
          <Form.Item key={record.address} name={dataIndex} initialValue={text}>
            <TextArea
              autoSize={{ maxRows: 3 }}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.address, dataIndex)}
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
      width: '8%',
      render: (text: number, record: School) => {
        const editable = isEditing(record);
        const dataIndex: keyof School = 'phoneNumber'; // Define dataIndex here
        return editable ? (
          <Form.Item key={record.phoneNumber} name={dataIndex} initialValue={text}>
            <Input
              type="tel"
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.phoneNumber, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : 'Chưa có thông tin'}</span>
        );
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '8%',
      render: (text: string, record: School) => {
        const editable = isEditing(record);
        const dataIndex: keyof School = 'status';

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Trạng thái vật phẩm là cần thiết' }]}
          >
            <Select
              value={text}
              onChange={(value) => handleInputChange(value, record.status, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
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
      width: '8%',
      render: (text: string, record: School) => {
        const editable = isEditing(record);
        return (
          <Space>
            {editable ? (
              <>
                <Button type="primary" onClick={() => save(record.id.toString())}>
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
                <Button type="ghost" onClick={() => handleDetailClick(record.id)}>
                  {t('Detail')}
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
        Thêm mới
      </Button>
      <Modal
        title={'Thêm TRƯỜNG'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <BaseForm.Item
            name="name"
            label={'Tên trường'}
            rules={[{ required: true, message: t('Tên trường là cần thiết') }]}
          >
            <Input />
          </BaseForm.Item>

          <BaseForm.Item name="email" label={'Email'}>
            <Input />
          </BaseForm.Item>

          <BaseForm.Item name="phoneNumber" label={'Số điện thoại'}>
            <Input type="tel" />
          </BaseForm.Item>

          <BaseForm.Item name="address" label={'Địa chỉ'}>
            <TextArea autoSize={{ maxRows: 3 }} />
          </BaseForm.Item>

          <BaseForm.Item
            name="status"
            label={'Trạng thái'}
            rules={[{ required: true, message: t('Trạng thái là cần thiết') }]}
          >
            <Select placeholder={'---- Select Status ----'} suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}>
              <Option value="ACTIVE">{'ACTIVE'}</Option>
              <Option value="INACTIVE">{'INACTIVE'}</Option>
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
        dataSource={data.data}
        pagination={{
          ...data.pagination,
          onChange: cancel,
        }}
        onChange={handleTableChange}
        loading={data.loading}
        scroll={{ x: 800 }}
        bordered
      />
    </Form>
  );
};
