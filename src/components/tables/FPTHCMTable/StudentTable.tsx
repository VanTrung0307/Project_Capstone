/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import { createPlayer } from '@app/api/FPT_3DMAP_API/Player';
import { Pagination, School, updateSchool } from '@app/api/FPT_3DMAP_API/School';
import { Student, getExcelTemplateStudent, getStudenbySchoolById } from '@app/api/FPT_3DMAP_API/Student';
import { Upload } from '@app/components/common/Upload/Upload';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { EditableCell } from '../editableTable/EditableCell';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { httpApi } from '@app/api/http.api';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const StudentTable: React.FC<{ selectedSchoolId: string }> = ({ selectedSchoolId }) => {
  const { t } = useTranslation();

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

        Object.keys(updatedItem).forEach((field) => {
          if (updatedItem[field] === '') {
            updatedItem[field] = null;
          }
        });

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
        message.success('Cập nhật thành công');
        fetch(data.pagination);
      } catch (error) {
        message.error('Cập nhật không thành công');
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          fetch(data.pagination);
        }
      }
    } catch (errInfo) {
      message.success('Hãy nhập đầy đủ');
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
  // const { schoolId } = useParams<{ schoolId: string | undefined }>();
  const [originalData, setOriginalData] = useState<Student[]>([]);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: false }));
      if (selectedSchoolId) {
        getStudenbySchoolById(selectedSchoolId, pagination).then((res) => {
          if (isMounted.current) {
            setOriginalData(res.data);
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        });
      }
    },
    [isMounted, selectedSchoolId],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    beforeUpload: async (file: File): Promise<void> => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await httpApi.post(
          `https://anhkiet-001-site1.htempurl.com/api/Students/student-getbyschool?schoolid=${selectedSchoolId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        if (response.status === 200) {
          fetch(data.pagination);
          message.success('Tải lên thành công', response.data);
        } else {
          message.error('Tải lên thất bại', response.status);
        }
      } catch (error) {
        message.error('Tải lên thất bại');
      }
    },
    onChange: (info: any) => {
      const { status } = info.file;

      if (status === 'done') {
      } else if (status === 'error') {
      }
    },
  };

  const [isAddPlayerModalVisible, setIsAddPlayerModalVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectOptions, setSelectOptions] = useState<Event[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);

  const initialFormData = {};

  const fetchSelectOptions = async () => {
    try {
      const pagination = { current: 1, pageSize: 10 };
      const response = await getPaginatedEvents(pagination);
      setSelectOptions(response.data);
    } catch (error) {
      message.error('Error fetching events');
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
          eventId: selectedOption,
          nickname: '',
          passcode: '',
          totalPoint: 0,
          totalTime: 0,
          isplayer: true,
        });

        message.success('Tạo người chơi thành công');
      }
    } catch (error) {
      message.error('Tạo người chơi thất bại');
    }
  };

  const handleCancelPlayer = () => {
    setIsAddPlayerModalVisible(false);
  };

  const uniqueClassnames = new Set(data.data.map((record) => record.classname));
  const classnameFilters = Array.from(uniqueClassnames).map((classname) => ({
    text: classname,
    value: classname,
  }));

  const columns: ColumnsType<Student> = [
    {
      title: t('Họ và tên'),
      dataIndex: 'fullname',
      render: (text: string, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'fullname';
        const nameValidationRules = [
          { required: true, message: 'Hãy nhập họ và tên' },
          {
            pattern: /^[^\d\W].*$/,
            message: 'Không được bắt đầu bằng số hoặc ký tự đặc biệt',
          },
        ];
        return editable ? (
          <Form.Item key={record.fullname} name={dataIndex} initialValue={text} rules={nameValidationRules}>
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
      width: '25%',
      render: (text: string, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'email';
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
      width: '14%',
      render: (text: number, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'phonenumber';
        return editable ? (
          <Form.Item key={record.phonenumber} name={dataIndex} initialValue={text}>
            <Input
              type="tel"
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.phonenumber, dataIndex)}
              style={{ maxWidth: '150px' }}
            />
          </Form.Item>
        ) : (
          <span>0{text !== null ? text : 'Chưa có thông tin'}</span>
        );
      },
    },
    {
      title: t('Lớp'),
      dataIndex: 'classname',
      width: '8%',
      filters: classnameFilters,
      onFilter: (value, record) => record.classname === value,
      render: (text: number, record: Student) => {
        const editable = isEditing(record);
        const dataIndex: keyof Student = 'classname';
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
      width: '11%',
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
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
      width: '10%',
      render: (text: string, record: Student) => {
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
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const handleDownloadTemplate = async () => {
    try {
      const excelTemplate = await getExcelTemplateStudent();

      const blob = new Blob([excelTemplate], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const downloadUrl = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = 'Mau_don_hoc_sinh.xlsx';
      anchor.click();

      URL.revokeObjectURL(downloadUrl);
      anchor.remove();
    } catch (error) {
      message.error('Không thể tải đơn mẫu');
    }
  };

  return (
    <Form form={form} component={false}>
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} style={{ position: 'absolute', top: '0', right: '0', margin: '15px 20px' }}>
          Nhập Excel
        </Button>
      </Upload>

      <Button
        type="dashed"
        onClick={handleDownloadTemplate}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 180px' }}
        icon={<DownloadOutlined />}
      >
        Mẫu đơn học sinh
      </Button>

      <SearchInput
        placeholder="Tìm kiếm..."
        allowClear
        onSearch={(value) => {
          const filteredData = data.data.filter((record) =>
            Object.values(record).some((fieldValue) => String(fieldValue).toLowerCase().includes(value.toLowerCase())),
          );
          setData((prevData) => ({ ...prevData, data: filteredData }));
        }}
        onChange={(e) => {
          if (e.target.value.trim() === '') {
            setData((prevData) => ({ ...prevData, data: originalData }));
          }
        }}
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
        scroll={{ x: 800 }}
        bordered
      />
    </Form>
  );
};
