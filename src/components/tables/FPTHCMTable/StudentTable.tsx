/* eslint-disable prettier/prettier */
import { DownOutlined, UploadOutlined } from '@ant-design/icons';
import { Pagination, School, updateSchool } from '@app/api/FPT_3DMAP_API/School';
import { Student, getStudenbySchoolById, uploadExcelStudent } from '@app/api/FPT_3DMAP_API/Student';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';
import { useParams } from 'react-router-dom';
import { Upload } from '@app/components/common/Upload/Upload';
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import { createPlayer } from '@app/api/FPT_3DMAP_API/Player';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 2,
};

export const StudentTable: React.FC = () => {
  const { t } = useTranslation();
  const { TextArea } = Input;

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: Student[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

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

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Student) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const { schoolId } = useParams<{ schoolId: string | undefined }>();

  const fetch = useCallback(
    (pagination: Pagination) => {
      if (schoolId === undefined) {
        console.error('School ID is missing in the URL.');
        return;
      }

      setData((tableData) => ({ ...tableData, loading: true }));
      getStudenbySchoolById(schoolId, pagination).then((res) => {
        if (isMounted.current) {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        }
      });
    },
    [isMounted, schoolId],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  // const uploadProps = {
  //   name: 'file',
  //   multiple: true,
  //   action: `http://anhkiet-001-site1.htempurl.com/api/Students/student/${schoolId}`,
  //   onChange: async (info: any) => {
  //     const { status } = info.file;
  //     if (status !== 'uploading') {
  //       console.log(info.file, info.fileList);
  //     }
  //     if (status === 'done') {
  //       try {
  //         if (schoolId) {
  //           await uploadExcelStudent(schoolId, info.file.originFileObj);
  //           message.success(t('uploads.successUpload', { name: info.file.name }));
  //           setData((prevData) => ({ ...prevData, loading: true }));
  //         }
  //       } catch (error) {
  //         message.error(t('uploads.failedUpload', { name: info.file.name }));
  //         setData((prevData) => ({ ...prevData, loading: false }));
  //       }
  //     } else if (status === 'error') {
  //       message.error(t('uploads.failedUpload', { name: info.file.name }));
  //       setData((prevData) => ({ ...prevData, loading: false }));
  //     }
  //   },
  // };

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: `http://anhkiet-001-site1.htempurl.com/api/Students/student/${schoolId}`,
    onChange: (info: any) => {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(t('uploads.successUpload', { name: info.file.name }));
      } else if (status === 'error') {
        message.error(t('uploads.failedUpload', { name: info.file.name }));
      }
    },
  };

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isAddPlayerModalVisible, setIsAddPlayerModalVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectOptions, setSelectOptions] = useState<Event[]>([]); // Replace this with your actual options
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);

  const initialFormData = {
    // Example: name: '',
    // Example: age: 0,
    // ...
  };

  const fetchSelectOptions = async () => {
    try {
      const pagination = { current: 1, pageSize: 10 };
      const response = await getPaginatedEvents(pagination);
      setSelectOptions(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAddPlayer = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsAddPlayerModalVisible(true);
    fetchSelectOptions();
    setFormData(initialFormData);
  };

  const handleSavePlayer = async () => {
    setIsAddPlayerModalVisible(false);

    try {
      if (selectedStudentId && selectedOption) {
        await createPlayer({
          studentId: selectedStudentId,
          studentName: '',
          eventId: selectedOption,
          nickname: '',
          passcode: '',
          createdAt: new Date().toISOString(),
          totalPoint: 0,
          totalTime: 0,
          isplayer: true,
          id: '',
        });

        message.success('Player added successfully');
      }
    } catch (error) {
      console.error('Error adding player:', error);
      message.error('Failed to add player');
    }
  };

  const handleCancelPlayer = () => {
    setIsAddPlayerModalVisible(false);
  };

  const columns: ColumnsType<Student> = [
    {
      title: t('Họ và tên'),
      dataIndex: 'fullname',
      render: (text: string, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'fullname'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.fullname}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên trường là cần thiết' }]}
          >
            <Input
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.fullname, dataIndex)}
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
      render: (text: string, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'email'; // Define dataIndex here
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
      title: t('Điện thoại'),
      dataIndex: 'phonenumber',
      width: '8%',
      render: (text: number, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'phonenumber'; // Define dataIndex here
        return editable ? (
          <Form.Item key={record.phonenumber} name={dataIndex} initialValue={text}>
            <Input
              type="tel"
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.phonenumber, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : 'Chưa có thông tin'}</span>
        );
      },
    },
    {
      title: t('Lớp'),
      dataIndex: 'classname',
      width: '8%',
      render: (text: number, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'classname'; // Define dataIndex here
        return editable ? (
          <Form.Item key={record.classname} name={dataIndex} initialValue={text}>
            <Input
              type="tel"
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.classname, dataIndex)}
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
      render: (text: string, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'status';

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
                <Button type="ghost" onClick={() => handleAddPlayer(record.id)}>
                  Become Player
                </Button>
                <Modal
                  title="Add Player"
                  visible={isAddPlayerModalVisible}
                  onOk={handleSavePlayer}
                  onCancel={handleCancelPlayer}
                >
                  <Form>
                    <Form.Item label="Select Event">
                      <Select
                        value={selectedOption}
                        onChange={(value) => setSelectedOption(value)}
                        placeholder="Select an event"
                      >
                        {selectOptions.map((event) => (
                          <Select.Option key={event.id} value={event.id}>
                            {event.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Form>
                </Modal>
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
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} style={{ position: 'absolute', top: '0', right: '0', margin: '15px 150px' }}>
          {t('uploads.clickToUpload')}
        </Button>
      </Upload>
      <Modal
        title={'Thêm TRƯỜNG'}
        open={isBasicModalOpen}
        // onOk={handleModalOk}
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