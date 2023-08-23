/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined, DownloadOutlined, UploadOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import { createPlayer } from '@app/api/FPT_3DMAP_API/Player';
import { Pagination, School, updateSchool } from '@app/api/FPT_3DMAP_API/School';
import {
  EventStudent,
  Student,
  exportStudentExcel,
  getExcelTemplateStudent,
  getStudenbySchoolById,
  getStudenbySchoolandEventId,
} from '@app/api/FPT_3DMAP_API/Student';
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

export const EventStudentTable: React.FC = () => {
  const { t } = useTranslation();

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: EventStudent[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: EventStudent) => record.id === editingKey;

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

        // message.warning('Updated null Major:', updatedItem);

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
        message.success('School updated successfully');
      } catch (error) {
        message.error('Error updating school data');
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData }));
        }
      }
    } catch (errInfo) {
      message.error('Validate Failed');
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const edit = (record: Partial<School> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
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
  const { schoolId } = useParams<{ schoolId: string | undefined }>();
  const { eventId } = useParams<{ eventId: string | undefined }>();
  const [originalData, setOriginalData] = useState<EventStudent[]>([]);

  const fetchData = async (pagination: Pagination) => {
    if (schoolId && eventId) {
      try {
        const res = await getStudenbySchoolandEventId(schoolId, eventId, pagination);
        if (isMounted.current) {
          setOriginalData(res.data);
          setData({ data: res.data, pagination: res.pagination, loading: false });
        }
      } catch (error) {
        message.error('Không lấy được dữ liệu');
      }
    }
  };

  const fetch = useCallback(fetchData, [isMounted, schoolId, eventId]);

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
  //   action: `http://anhkiet-001-site1.htempurl.com/api/Students/student-getbyschool?schoolid=${schoolId}`,
  //   onChange: (info: any) => {
  //     const { status } = info.file;
  //     if (status !== 'uploading') {
  //       message.warn(`${name} ${status}`);
  //     }
  //     if (status === 'done') {
  //       message.success(t('uploads.successUpload', { name: info.file.name }));
  //       fetch(data.pagination);
  //     } else if (status === 'error') {
  //       message.error(t('uploads.failedUpload', { name: info.file.name }));
  //     }
  //   },
  // };

  const handleSavePlayer = async (studentId: string, eventId: string, fullname: string) => {
    try {
      if (studentId && eventId) {
        await createPlayer({
          studentId: studentId,
          eventId: eventId,
          nickname: '',
          passcode: '',
          totalPoint: 0,
          totalTime: 0,
          isplayer: true,
        });
        fetch(data.pagination);
        // message.success(`${fullname} được tạo thành công`);
      }
    } catch (error) {
      message.error('Tạo thất bại');
    }
  };

  const handleGeneratePasscode = async () => {
    try {
      if (!data) {
        message.error('Data is null');
        return;
      }

      if (eventId) {
        for (const record of data.data) {
          await handleSavePlayer(record.id, eventId, record.fullname);
        }
        fetchData(data.pagination);
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
      render: (text: number, record: EventStudent) => {
        const editable = isEditing(record);
        const dataIndex: keyof EventStudent = 'phonenumber';
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
      title: t('Niên khoá'),
      dataIndex: 'graduateYear',
      render: (text: number, record: EventStudent) => {
        const editable = isEditing(record);
        const dataIndex: keyof EventStudent = 'graduateYear';
        return editable ? (
          <Form.Item key={record.graduateYear} name={dataIndex} initialValue={text}>
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
      title: t('Mã tham gia'),
      dataIndex: 'passcode',
      render: (text: string | null, record: EventStudent) => {
        const editable = isEditing(record);
        const dataIndex: keyof EventStudent = 'passcode';
        return editable ? (
          <Form.Item key={record.passcode} name={dataIndex} initialValue={text}>
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
    // {
    //   title: t('Chức năng'),
    //   dataIndex: 'actions',
    //   render: (text: string, record: EventStudent) => {
    //     const editable = isEditing(record);
    //     return (
    //       <Space>
    //         {editable ? (
    //           <>
    //             <Button type="primary" onClick={() => save(record.id.toString())}>
    //               {t('common.save')}
    //             </Button>
    //             <Button type="ghost" onClick={cancel}>
    //               {t('common.cancel')}
    //             </Button>
    //           </>
    //         ) : (
    //           <>
    //             <Button
    //               type="ghost"
    //               disabled={editingKey === record.id}
    //               onClick={() => edit({ ...record, key: record.id })}
    //             >
    //               {t('common.edit')}
    //             </Button>
    //           </>
    //         )}
    //       </Space>
    //     );
    //   },
    // },
  ];

  const uploadProps = {
    name: 'file',
    multiple: true,
    beforeUpload: async (file: File): Promise<void> => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await httpApi.post(
          `https://anhkiet-001-site1.htempurl.com/api/Students/student-getbyschool?schoolid=${schoolId}`,
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
      <Button
        type="dashed"
        onClick={handleDownloadTemplate}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 200px' }}
        icon={<VerticalAlignBottomOutlined />}
      >
        Mẫu đơn học sinh
      </Button>

      <Upload {...uploadProps}>
        <Button
          icon={<UploadOutlined />}
          style={{ position: 'absolute', bottom: '0', right: '0', margin: '15px 200px 230px' }}
        >
          Nhập file Excel
        </Button>
      </Upload>

      {eventId && (
        <Button
          type="primary"
          onClick={handleGeneratePasscode}
          style={{ position: 'absolute', top: '0', right: '0', margin: '15px 20px' }}
        >
          Tạo mã tham gia
        </Button>
      )}

      <SearchInput
        placeholder="Search..."
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

      <Button
        type="default"
        onClick={() => {
          if (schoolId) {
            exportStudentExcel(schoolId);
          } else {
            console.error('schoolId is undefined');
          }
        }}
        style={{ position: 'absolute', bottom: '0', right: '0', margin: '15px 20px 230px' }}
        icon={<DownloadOutlined />}
      >
        Xuất file Excel
      </Button>

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
        scroll={{ x: 1200 }}
        bordered
      />
    </Form>
  );
};
