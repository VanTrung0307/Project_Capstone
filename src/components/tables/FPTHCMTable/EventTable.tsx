/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Event,
  Pagination,
  addEvent,
  createEvent,
  getExcelTemplateEvent,
  getPaginatedEvents,
  updateEvent,
} from '@app/api/FPT_3DMAP_API/Event';
import { getSchoolbyEventId } from '@app/api/FPT_3DMAP_API/EventSchool';
import { getTaskbyEventId } from '@app/api/FPT_3DMAP_API/EventTask';
import { httpApi } from '@app/api/http.api';
import { Upload } from '@app/components/common/Upload/Upload';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const EventTable: React.FC = () => {
  const { t } = useTranslation();

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: Event[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const formatDateTime = (isoDateTime: number) => {
    const dateTime = new Date(isoDateTime);
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const seconds = String(dateTime.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
  };

  const isEditing = (record: Event) => record.id === editingKey;

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
        await updateEvent(key.toString(), row);
        message.success('Cập nhật sự kiện thành công');
      } catch (error) {
        message.error('Cập nhật sự kiện thất bại');
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData }));
        }
      }
    } catch (errInfo) {
      message.error('Hãy nhập đày đủ');
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const edit = (record: Partial<Event> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const navigate = useNavigate();

  const handleSchoolClick = async (eventId: string) => {
    try {
      const pagination = { current: 1, pageSize: 10 };
      await getSchoolbyEventId(eventId, pagination);
      navigate(`/schools/${eventId}`);
    } catch (error) {
      message.error('Error fetching paginated schools:');
    }
  };

  const handleTaskClick = async (eventId: string) => {
    try {
      const pagination = { current: 1, pageSize: 10 };
      await getTaskbyEventId(eventId, pagination);
      navigate(`/tasks/${eventId}`);
    } catch (error) {
      message.error('Error fetching paginated task');
    }
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Event) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const [originalData, setOriginalData] = useState<Event[]>([]);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedEvents(pagination).then((res) => {
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
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const newData: addEvent = {
        name: values.name,
        status: values.status,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        await createEvent(newData);
        message.success('Tạo sự kiện thành công');
        fetch(data.pagination);
        form.resetFields();
        setIsBasicModalOpen(false);
      } catch (error) {
        message.error('Tạo sự kiện không thành công');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Hãy nhập đầy đủ');
    }
  };

  const columns: ColumnsType<Event> = [
    {
      title: t('Tên sự kiện'),
      dataIndex: 'name',
      width: '45%',
      render: (text: string, record: Event) => {
        const editable = isEditing(record);
        const dataIndex: keyof Event = 'name';
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập tên sự kiện' }]}
          >
            <Input
              maxLength={100}
              style={{ width: '300px'}}
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
      title: t('Năm'),
      dataIndex: 'createdAt',
      width: '8%',
      render: (text: string, record: Event) => {
        const editable = isEditing(record);
        const dataIndex: keyof Event = 'createdAt';
        const year = moment(text).format('YYYY');
        return editable ? (
          <Form.Item
            key={record.createdAt}
            name={dataIndex}
            initialValue={moment(text).year().toString()}
            rules={[{ required: true, message: 'Hãy nhập năm xảy ra sự kiện' }]}
          >
            <Input
              type="number"
              min={1000}
              max={9999}
              step={1}
              value={year}
              onChange={(e) => handleInputChange(e.target.value, record.createdAt, dataIndex)}
              style={{ width: '100px' }}
            />
          </Form.Item>
        ) : (
          <span>{year}</span>
        );
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '12%',
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text: string, record: Event) => {
        const editable = isEditing(record);
        const dataIndex: keyof Event = 'status';

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Trạng thái sự kiện là cần thiết' }]}
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
      width: '1%',
      render: (text: string, record: Event) => {
        const editable = isEditing(record);
        return (
          <Space>
            {editable ? (
              <>
                <Button type="primary" onClick={() => save(record.id)}>
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
                <Button type="ghost" onClick={() => handleSchoolClick(record.id)}>
                  Danh sách trường
                </Button>
                <Button type="ghost" onClick={() => handleTaskClick(record.id)}>
                  Danh sách nhiệm vụ
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

  const uploadProps = {
    name: 'file',
    multiple: true,
    beforeUpload: async (file: File): Promise<void> => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await httpApi.post(
          `https://anhkiet-001-site1.htempurl.com/api/Events/upload-excel-event`,
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
      const excelTemplate = await getExcelTemplateEvent();

      const blob = new Blob([excelTemplate], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const downloadUrl = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = 'Mau_don_su_kien.xlsx';
      anchor.click();

      URL.revokeObjectURL(downloadUrl);
      anchor.remove();
    } catch (error) {
      message.error('Không thể tải đơn mẫu');
    }
  };

  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);

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
        title={'Thêm mới Sự kiện'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
        mask={true}
        maskStyle={{ opacity: 1 }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button key="back" onClick={() => setIsBasicModalOpen(false)}>
              Huỷ
            </Button>
            <Button key="submit" type="primary" onClick={handleModalOk}>
              Tạo
            </Button>
          </div>
        }
      >
        <S.FormContent>
          <FlexContainer>
            <Label>{'Tên sự kiện'}</Label>
            <InputContainer>
              <BaseForm.Item
                name="name"
                rules={[
                  { required: true, message: t('Tên sự kiện là cần thiết') },
                  {
                    pattern: /^[^\s].*/,
                    message: 'Không được bắt đầu bằng khoảng trắng',
                  },
                  {
                    pattern: /^[^\d\W].*$/,
                    message: 'Không được bắt đầu bằng số hoặc ký tự đặc biệt',
                  },
                ]}
              >
                <Input maxLength={100} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Trạng thái'}</Label>
            <InputContainer>
              <BaseForm.Item name="status" initialValue={'ACTIVE'}>
                <Input disabled={true} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
        </S.FormContent>
      </Modal>

      <Button
        type="dashed"
        onClick={handleDownloadTemplate}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 280px' }}
        icon={<DownloadOutlined />}
      >
        Mẫu đơn sự kiện
      </Button>

      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} style={{ position: 'absolute', top: '0', right: '0', margin: '15px 123px' }}>
          Nhập Excel
        </Button>
      </Upload>

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
        style={{ width: '320px', right: '0', height: '70px' }}
      />

      <div>
        <Select
          placeholder="Chọn năm"
          onChange={(value) => setSelectedYear(value)}
          value={selectedYear}
          style={{ width: 150, marginRight: 10, marginBottom: '10px' }}
          suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
        >
          {Array.from(new Set(data.data.map((record) => moment(record.createdAt).format('YYYY')))).map((year) => (
            <Select.Option key={year} value={year}>
              {year}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        columns={columns}
        dataSource={
          selectedYear
            ? data.data.filter((record) => moment(record.createdAt).format('YYYY') === selectedYear)
            : data.data
        }
        pagination={{
          ...data.pagination,
          onChange: cancel,
        }}
        onChange={handleTableChange}
        loading={data.loading}
        scroll={{ x: 1000 }}
        bordered
      />
    </Form>
  );
};
