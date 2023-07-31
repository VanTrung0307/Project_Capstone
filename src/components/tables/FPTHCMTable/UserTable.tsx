/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { User, getPaginatedUsers, updateUser, Pagination, createUser } from '@app/api/FPT_3DMAP_API/User';
import { Form, Input, Modal, Select, Space } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';
import { useMounted } from '@app/hooks/useMounted';
import { School, getPaginatedSchools } from '@app/api/FPT_3DMAP_API/School';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { Key } from 'antd/lib/table/interface';
import { Link } from 'react-router-dom';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const UserTable: React.FC = () => {

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
  const [data, setData] = useState<{ data: User[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [schools, setSchools] = useState<School[]>([]);

  const isEditing = (record: User) => record.id === editingKey;

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
        await updateUser(key.toString(), row);
        console.log('User data updated successfully');
      } catch (error) {
        console.error('Error updating User data:', error);
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData}));
        }
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const edit = (record: Partial<User> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof User) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData}));
  };

  const { isMounted } = useMounted();

  const [selectedData, setSelectedData] = useState<User[]>([]);

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedUsers(pagination)
        .then((res) => {
          if (isMounted.current) {
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        })
        .catch((error) => {
          console.error('Error fetching paginated users:', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });
  
      // Fetch the list of schools and store it in the "schools" state
      try {
        const schoolResponse = await getPaginatedSchools({ current: 1, pageSize: 1000 }); // Adjust the pagination as needed
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

      const newData: User = {
        schoolId: values.schoolId,
        schoolname: values.schoolname,
        email: values.email,
        graduateYear: values.graduateYear,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        fullname: values.fullname,
        classname: values.classname,
        status: values.status,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true })); // Show loading state

      try {
        const createdUser = await createUser(newData);

        // Fetch the school data using the selected "schoolName" from the form
        const selectedschool = schools.find((school) => school.name === newData.schoolname);

        // If the selected location is found, set its ID to the newData
        if (selectedschool) {
          newData.schoolId = selectedschool.id;
        }

        // Assign the ID received from the API response to the newData
        newData.id = createdUser.id;


      setData((prevData) => ({
        ...prevData,
        data: [...prevData.data, createdUser],
        loading: false, // Hide loading state after successful update
      }));

      form.resetFields();
      setIsBasicModalOpen(false);
      console.log('User data created successfully');

      // Fetch the updated data after successful creation
      getPaginatedUsers(data.pagination).then((res) => {
        setData({ data: res.data, pagination: res.pagination, loading: false });
      });
    } catch (error) {
      console.error('Error creating User data:', error);
      setData((prevData) => ({ ...prevData, loading: false })); // Hide loading state on error
    }
  } catch (error) {
    console.error('Error validating form:', error);
  }
  };

  const columns: ColumnsType<User> = [
    {
      title: t('Họ và Tên'),
      dataIndex: 'fullname',
      width: '15%',
      render: (text: string, record: User) => {
        const editable = isEditing(record);
        const dataIndex: keyof User = 'fullname'; // Define dataIndex here
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
      render: (text: number, record: User) => {
        const editable = isEditing(record);
        const dataIndex: keyof User = 'email'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.email}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter an email' }]}
          >
            <Input
              maxLength={100}
              type='email'
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
      render: (text: string, record: User) => {
        const editable = isEditing(record);
        const dataIndex: keyof User = 'classname'; // Define dataIndex here
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
      render: (text: string, record: User) => {
        const editable = isEditing(record);
        const dataIndex: keyof User = 'schoolname'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.schoolname}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a schoolname' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.id, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
              {schools.map((school) => (
                <Select.Option key={school.id} value={school.name}>
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
      render: (text: string, record: User) => {
        const editable = isEditing(record);
        const dataIndex: keyof User = 'graduateYear'; // Define dataIndex here
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
      title: t('Giới tính'),
      dataIndex: 'gender',
      width: '8%',
      render: (text: string, record: User) => {
        const editable = isEditing(record);
        const dataIndex: keyof User = 'gender'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.gender.toString()}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a gender' }]}
          >
            <Input
              value={record[dataIndex].toString()}
              onChange={(e) => handleInputChange(e.target.value, record.gender.toString(), dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Điện thoại'),
      dataIndex: 'phoneNumber',
      width: '8%',
      render: (text: number, record: User) => {
        const editable = isEditing(record);
        const dataIndex: keyof User = 'phoneNumber'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.phoneNumber}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a phoneNumber' }]}
          >
            <Input
              type='number'
              min={10}
              max={11}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.phoneNumber, dataIndex)}
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
      render: (text: string, record: User) => {
        const editable = isEditing(record);
        const dataIndex: keyof User = 'status'; // Define dataIndex here
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
      width: '8%',
      render: (text: string, record: User) => {
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

          <BaseForm.Item name="fullname" label={'Tên học sinh'} rules={[{ required: true, message: t('Tên học sinh là cần thiết') }]}>
            <Input maxLength={100}/>
          </BaseForm.Item>

          <BaseForm.Item name="email" label={'Tên học sinh'} rules={[{ required: true, message: t('Email là cần thiết') }]}>
            <Input type='email'/>
          </BaseForm.Item>

          <BaseForm.Item name="classname" label={'Tên lớp'} rules={[{ required: true, message: t('Tên lớp là cần thiết') }]}>
            <Input maxLength={100}/>
          </BaseForm.Item>

          <BaseForm.Item name="schoolname" label={'Tên vật phẩm (nếu có)'} >
            <Select 
              placeholder={'---- Select School ----'}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
                {schools.map((school) => (
                  <Option key={school.id} value={school.name}>
                    {school.name}
                  </Option>
                ))}
            </Select>
          </BaseForm.Item>

          <BaseForm.Item name="graduateYear" label={'Năm học'} rules={[{ required: true, message: t('Năm học là cần thiết') }]}>
            <Input maxLength={100}/>
          </BaseForm.Item>

          <BaseForm.Item
            name="status"
            label={'Status'}
            rules={[{ required: true, message: t('Trạng thái câu hỏi là cần thiết') }]}
          >
            <Select 
              placeholder={'---- Select Gender ----'}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
              <Option value="Nam">{'Nam'}</Option>
              <Option value="Nữ">{'Nữ'}</Option>
            </Select>
          </BaseForm.Item>

          <BaseForm.Item name="phoneNumber" label={'Điện thoại'} rules={[{ required: true, message: t('Điện thoại là cần thiết') }]}>
            <Input type='number' min={10} max={11}/>
          </BaseForm.Item>

          <BaseForm.Item
            name="status"
            label={'Status'}
            rules={[{ required: true, message: t('Trạng thái câu hỏi là cần thiết') }]}
          >
            <Select 
              placeholder={'---- Select Phone Number ----'}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
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
