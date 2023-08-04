/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';
import { School, getPaginatedSchools } from '@app/api/FPT_3DMAP_API/School';
import { Pagination, Student, createStudent, getPaginatedStudent, updateStudent } from '@app/api/FPT_3DMAP_API/Student';
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

const initialPagination: Pagination = {
  current: 1,
  pageSize: 5,
};

export const UserTable: React.FC = () => {
  const { t } = useTranslation();

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: Student[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [schools, setSchools] = useState<School[]>([]);

  const isEditing = (record: Student) => record.id === editingKey;

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
        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateStudent(key.toString(), row);
        console.log('Student data updated successfully');
      } catch (error) {
        console.error('Error updating Student data:', error);
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

  const edit = (record: Partial<Student> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Student) => {
    const selectedSchool = schools.find((school) => school.name === value);

    if (selectedSchool) {
      const updatedData = data.data.map((record) => {
        if (record.id === key) {
          return { ...record, [dataIndex]: selectedSchool.id };
        }
        return record;
      });
      setData((prevData) => ({ ...prevData, data: updatedData }));
    } else {
      console.error('Selected school not found.');
    }
  };

  const { isMounted } = useMounted();

  // const [selectedData, setSelectedData] = useState<Student[]>([]);

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedStudent(pagination)
        .then((res) => {
          if (isMounted.current) {
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        })
        .catch((error) => {
          console.error('Error fetching paginated users:', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });
      try {
        const schoolResponse = await getPaginatedSchools({ current: 1, pageSize: 1000 });
        setSchools(schoolResponse.data);
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
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

      const newData: Student = {
        schoolId: values.schoolId,
        schoolname: values.schoolname,
        email: values.email,
        graduateYear: values.graduateYear,
        phonenumber: values.phoneNumber,
        // gender: values.gender,
        fullname: values.fullname,
        classname: values.classname,
        status: values.status,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        const createdStudent = await createStudent(newData);
        const selectedschool = schools.find((school) => school.id === newData.schoolId);

        if (selectedschool) {
          newData.schoolId = selectedschool.id;
        }

        newData.id = createdStudent.id;

        setData((prevData) => ({
          ...prevData,
          data: [...prevData.data, createdStudent],
          loading: false,
        }));

        form.resetFields();
        setIsBasicModalOpen(false);
        console.log('Student data created successfully');

        // Fetch the updated data after successful creation
        getPaginatedStudent(data.pagination).then((res) => {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        });
      } catch (error) {
        console.error('Error creating Student data:', error);
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      console.error('Error validating form:', error);
    }
  };

  const columns: ColumnsType<Student> = [
    {
      title: t('Họ và Tên'),
      dataIndex: 'fullname',
      width: '15%',
      render: (text: string, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'fullname';
        return editable ? (
          <Form.Item
            key={record.fullname}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên đầy đủ là bắt buộc' }]}
          >
            <Input
              value={text}
              onChange={(e) => handleInputChange(e.target.value, record.fullname, dataIndex)}
              maxLength={100}
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
      render: (text: number, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'email';
        return editable ? (
          <Form.Item
            key={record.email}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter an email' }]}
          >
            <Input
              maxLength={100}
              type="email"
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.email, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Tên lớp'),
      dataIndex: 'classname',
      render: (text: string, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'classname';
        return editable ? (
          <Form.Item
            key={record.classname}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên lớp là cần thiết' }]}
          >
            <Input
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.classname, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Tên trường'),
      dataIndex: 'schoolname',
      width: '15%',
      render: (text: string, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'schoolId';
        return editable ? (
          <Form.Item
            key={record.schoolId}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a schoolname' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.id, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {schools.map((school) => (
                <Select.Option key={school.id} value={school.id}>
                  {school.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Năm học'),
      dataIndex: 'graduateYear',
      render: (text: string, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'graduateYear';
        return editable ? (
          <Form.Item
            key={record.graduateYear}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Năm học là cần thiết' }]}
          >
            <Input
              value={record[dataIndex].toString()}
              onChange={(e) => handleInputChange(e.target.value, record.graduateYear, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Điện thoại'),
      dataIndex: 'phonenumber',
      width: '8%',
      render: (text: number, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'phonenumber';
        return editable ? (
          <Form.Item
            key={record.phonenumber}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a phoneNumber' }]}
          >
            <Input
              type="number"
              min={10}
              max={11}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.phonenumber, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '8%',
      render: (text: string, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'status';

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Trạng thái Student là cần thiết' }]}
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
      render: (text: string, record: Student) => {
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
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Form form={form}>
      <Button
        type="default"
        onClick={() => setIsBasicModalOpen(true)}
        style={{ position: 'absolute', top: '0', right: '150px', margin: '15px 20px' }}
      >
        Import Excel
      </Button>
      <Button
        type="primary"
        onClick={() => setIsBasicModalOpen(true)}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 20px' }}
      >
        Thêm mới
      </Button>
      <Modal
        title={'Thêm mới HỌC SINH'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <BaseForm.Item
            name="fullname"
            label={'Tên học sinh'}
            rules={[{ required: true, message: t('Tên học sinh là cần thiết') }]}
          >
            <Input maxLength={100} />
          </BaseForm.Item>

          <BaseForm.Item name="email" label={'Email'} rules={[{ required: true, message: t('Email là cần thiết') }]}>
            <Input type="email" />
          </BaseForm.Item>

          <BaseForm.Item
            name="classname"
            label={'Tên lớp'}
            rules={[{ required: true, message: t('Tên lớp là cần thiết') }]}
          >
            <Input maxLength={100} />
          </BaseForm.Item>

          <BaseForm.Item name="schoolId" label={'Tên trường'}>
            <Select placeholder={'---- Select School ----'} suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}>
              {schools.map((school) => (
                <Option key={school.id} value={school.id}>
                  {school.name}
                </Option>
              ))}
            </Select>
          </BaseForm.Item>

          <BaseForm.Item
            name="graduateYear"
            label={'Năm học'}
            rules={[{ required: true, message: t('Năm học là cần thiết') }]}
          >
            <Input maxLength={100} />
          </BaseForm.Item>

          {/* <BaseForm.Item
            name="status"
            label={'Status'}
            rules={[{ required: true, message: t('Trạng thái câu hỏi là cần thiết') }]}
          >
            <Select placeholder={'---- Select Gender ----'} suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}>
              <Option value="Nam">{'Nam'}</Option>
              <Option value="Nữ">{'Nữ'}</Option>
            </Select>
          </BaseForm.Item> */}

          <BaseForm.Item
            name="phoneNumber"
            label={'Điện thoại'}
            rules={[{ required: true, message: t('Điện thoại là cần thiết') }]}
          >
            <Input type="number" min={10} max={11} />
          </BaseForm.Item>

          <BaseForm.Item
            name="status"
            label={'Status'}
            rules={[{ required: true, message: t('Trạng thái câu hỏi là cần thiết') }]}
          >
            <Select
              placeholder={'---- Select Phone Number ----'}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
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
