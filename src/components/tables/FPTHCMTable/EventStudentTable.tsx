/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined, DownloadOutlined, UploadOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { EventSchool, getPaginatedEventSchools } from '@app/api/FPT_3DMAP_API/EventSchool';
import { createPlayer } from '@app/api/FPT_3DMAP_API/Player';
import { Pagination } from '@app/api/FPT_3DMAP_API/School';
import {
  EventStudent,
  exportStudentExcel,
  getExcelTemplateStudent,
  getStudenbySchoolById
} from '@app/api/FPT_3DMAP_API/Student';
import { httpApi } from '@app/api/http.api';
import { Upload } from '@app/components/common/Upload/Upload';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Select, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 100,
};

type EventsProps = {
  eventId?: string;
};

export const EventStudentTable: React.FC<EventsProps & { selectedSchoolId: string }> = ({
  eventId,
  selectedSchoolId,
}) => {
  const { t } = useTranslation();

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: EventStudent[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: EventStudent) => record.id === editingKey;

  const [form] = Form.useForm();

  const cancel = () => {
    setEditingKey('');
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof EventStudent) => {
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
  const [originalData, setOriginalData] = useState<EventStudent[]>([]);

  const fetchData = async (pagination: Pagination) => {
    setData((tableData) => ({ ...tableData, loading: false }));
    if (selectedSchoolId) {
      try {
        const res = await getStudenbySchoolById(selectedSchoolId, pagination);
        if (isMounted.current) {
          setOriginalData(res.data);
          setData({ data: res.data, pagination: res.pagination, loading: false });
        }
      } catch (error) {
        // message.error('Không lấy được dữ liệu');
      }
    }
  };

  const [school, setSchool] = useState<EventSchool | undefined>(undefined);

  useEffect(() => {
    if (selectedSchoolId) {
      const pagination: Pagination = { current: 1, pageSize: 10 };

      getPaginatedEventSchools(pagination)
        .then((response) => {
          const schoolData = response.data.find((school) => school.id === selectedSchoolId);
          setSchool(schoolData);
        })
        .catch((error) => {
          console.error('Error fetching paginated event schools:', error);
        });
    }
  }, [selectedSchoolId]);

  const fetch = useCallback(fetchData, [isMounted, selectedSchoolId]);

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  const handleSavePlayer = async (studentId: string, fullname: string) => {
    try {
      // setData((tableData) => ({ ...tableData, loading: true }));
      if (studentId && eventId && selectedSchoolId) {
        await createPlayer({
          studentId: studentId,
          eventId: eventId,
          nickname: '',
          passcode: '',
          totalPoint: 0,
          totalTime: 0,
          isplayer: true,
        });
        form.resetFields();

        setTimeout(() => {
          fetchData(data.pagination);
        }, 7000);
        // message.success(`${fullname} được tạo thành công`);
      }
    } catch (error) {
      // message.error('Tạo thất bại');
    }
  };

  const handleGeneratePasscode = async () => {
    setData((tableData) => ({ ...tableData, loading: true }));

    try {
      if (!data) {
        message.error('Data is null');
        return;
      }

      if (selectedSchoolId) {
        for (const record of data.data) {
          await handleSavePlayer(record.id, record.fullname);
        }
        form.resetFields();
        setTimeout(() => {
          setData((tableData) => ({ ...tableData, loading: false }));
        }, 7000);
        message.success('Mã tham gia đã tạo thành công');
      }
    } catch (error) {
      message.error('Tạo mã tham gia thất bại');
    }
  };

  const uniqueClassnames = new Set(data.data.map((record) => record.classname));
  const classnameFilters = Array.from(uniqueClassnames).map((classname) => ({
    text: classname,
    value: classname,
  }));

  const columns: ColumnsType<EventStudent> = [
    {
      title: t('Họ và tên'),
      dataIndex: 'fullname',
      render: (text: string, record: EventStudent) => {
        const editable = isEditing(record);
        const dataIndex: keyof EventStudent = 'fullname';
        return editable ? (
          <Form.Item key={record.fullname} name={dataIndex} initialValue={text} rules={[{ required: false }]}>
            <Input
              type="fullname"
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.fullname, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : 'Chưa có thông tin'}</span>
        );
      },
    },
    {
      title: t('Email'),
      dataIndex: 'email',
      render: (text: string, record: EventStudent) => {
        const editable = isEditing(record);
        const dataIndex: keyof EventStudent = 'email';
        return editable ? (
          <Form.Item
            key={record.email}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false, message: 'Hãy nhập email học sinh' }]}
          >
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
      render: (text: number, record: EventStudent) => {
        const editable = isEditing(record);
        const dataIndex: keyof EventStudent = 'phonenumber';
        return editable ? (
          <Form.Item
            key={record.phonenumber}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false, message: 'Hãy nhập số điện thoại học sinh' }]}
          >
            <Input
              type="tel"
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.phonenumber, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>0{text !== null ? text : 'Chưa có thông tin'}</span>
        );
      },
    },
    {
      title: t('Niên khoá'),
      dataIndex: 'graduateYear',
      render: (text: number, record: EventStudent) => {
        const editable = isEditing(record);
        const dataIndex: keyof EventStudent = 'graduateYear';
        return editable ? (
          <Form.Item
            key={record.graduateYear}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false, message: 'Hãy nhập niên khoá học sinh' }]}
          >
            <Input
              type="tel"
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.graduateYear, dataIndex)}
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
      filters: classnameFilters,
      onFilter: (value, record) => record.classname === value,
      render: (text: number, record: EventStudent) => {
        const editable = isEditing(record);
        const dataIndex: keyof EventStudent = 'classname';
        return editable ? (
          <Form.Item
            key={record.classname}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false, message: 'Hãy nhập lớp của học sinh' }]}
          >
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
      title: t('Mã tham gia'),
      dataIndex: 'passcode',
      render: (text: string | null, record: EventStudent) => {
        const editable = isEditing(record);
        const dataIndex: keyof EventStudent = 'passcode';
        return editable ? (
          <Form.Item
            key={record.passcode}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false, message: 'Hãy nhập mã tham gia học sinh' }]}
          >
            <Input
              type="text"
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.passcode, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : 'Chưa có mã'}</span>
        );
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text: string, record: EventStudent) => {
        const editable = isEditing(record);
        const dataIndex: keyof EventStudent = 'status';

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy chọn trạng thái' }]}
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
  ];

  const uploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    beforeUpload: async (file: File): Promise<void> => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await httpApi.post(
          `https://anhkiet-001-site1.htempurl.com/api/Students/uploadfileexcelstudent?schooleventId=${selectedSchoolId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        if (response.status === 200) {
          fetch(data.pagination);
          message.success('Tải lên thành công');
          setTimeout(() => message.destroy(), 3000);
        } else {
          message.error('Tải lên thất bại');
        }
      } catch (error) {
        message.error('Tải lên thất bại');
      }
    },
    onChange: (info: any) => {
      const { status } = info.file;

      if (status === 'done') {
        // Handle successful upload if needed
      } else if (status === 'error') {
        // Handle upload error if needed
      }
    },
  };

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
        type="dashed"
        onClick={handleDownloadTemplate}
        style={{ position: 'absolute', right: '0', top: '0', margin: '15px 200px' }}
        icon={<VerticalAlignBottomOutlined />}
      >
        Mẫu đơn học sinh
      </Button>

      <div style={{ position: 'relative' }}>
        <Button
          type="default"
          onClick={() => {
            if (selectedSchoolId) {
              exportStudentExcel(selectedSchoolId);
            } else {
              console.error('schoolId is undefined');
            }
          }}
          style={{ position: 'absolute', right: '0', margin: '60px 1px' }}
          icon={<DownloadOutlined />}
        >
          Xuất file Excel
        </Button>

        <Upload {...uploadProps}>
          <Button
            type="default"
            icon={<UploadOutlined />}
            style={{ position: 'absolute', right: '0', top: '0', margin: '60px 190px' }}
          >
            Nhập file Excel
          </Button>
        </Upload>
      </div>

      {selectedSchoolId && (
        <Button
          type="primary"
          onClick={handleGeneratePasscode}
          style={{ position: 'absolute', right: '0', top: '0', margin: '15px 20px' }}
        >
          Tạo mã tham gia
        </Button>
      )}

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
        pagination={false}
        onChange={handleTableChange}
        loading={data.loading}
        scroll={{ x: 1200 }}
        bordered
      />
    </Form>
  );
};
