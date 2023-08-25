/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Major,
  Pagination,
  createMajor,
  getExcelTemplateMajor,
  getPaginatedMajors,
  updateMajor,
} from '@app/api/FPT_3DMAP_API/Major';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';
import { httpApi } from '@app/api/http.api';
import Upload from 'antd/lib/upload/Upload';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const MajorTable: React.FC = () => {
  const { t } = useTranslation();
  const { TextArea } = Input;

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: Major[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: Major) => record.id === editingKey;

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

        // message.warn('Updated null Major:', updatedItem);

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateMajor(key.toString(), row);
        message.success('Cập nhật ngành học thành công');
      } catch (error) {
        message.error('Cập nhật ngành học thất bại');
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData }));
        }
      }
    } catch (errInfo) {
      message.error('Lỗi hệ thống');
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
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const [originalData, setOriginalData] = useState<Major[]>([]);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedMajors(pagination).then((res) => {
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

      const newData: Major = {
        name: values.name,
        description: values.description,
        status: values.status,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        const createdMajor = await createMajor(newData);
        setData((prevData) => ({
          ...prevData,
          data: [...prevData.data, createdMajor],
          loading: false,
        }));
        form.resetFields();
        setIsBasicModalOpen(false);
        message.success('Tạo ngành học thành công');
        fetch(data.pagination);
      } catch (error) {
        message.error('Tạo ngành học thất bại');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Lỗi hệ thống');
    }
  };

  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');

  const columns: ColumnsType<Major> = [
    {
      title: t('Tên ngành học'),
      dataIndex: 'name',
      width: '15%',
      render: (text: string, record: Major) => {
        const editable = isEditing(record);
        const dataIndex: keyof Major = 'name';
        const maxTextLength = 255;
        const truncatedText = text?.length > maxTextLength ? `${text.slice(0, maxTextLength)}...` : text;
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập tên ngành học' }]}
          >
            <Input
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.name, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{truncatedText}</span>
        );
      },
    },
    {
      title: t('Mô tả (Nhấn vào để xem cho tiết)'),
      dataIndex: 'description',
      render: (text: string, record: Major) => {
        const editable = isEditing(record);
        const dataIndex: keyof Major = 'description';
        const maxTextLength = 50;
        const truncatedText = text?.length > maxTextLength ? `${text.slice(0, maxTextLength)}...` : text;

        const openDescriptionModal = () => {
          if (!editable && text?.length > maxTextLength) {
            setDescriptionModalVisible(true);
            if (!editable) {
              setSelectedDescription(text);
            }
          }
        };

        return (
          <>
            <div
              onClick={() => {
                if (text?.length > maxTextLength) {
                  openDescriptionModal();
                }
              }}
              style={{
                cursor: !editable && text?.length > maxTextLength ? 'pointer' : 'default',
              }}
            >
              {editable ? (
                <Form.Item
                  key={record.description}
                  name={dataIndex}
                  initialValue={text}
                  rules={[{ required: true, message: 'Hãy nhập mô tả ngành học' }]}
                >
                  <TextArea
                    autoSize={{ maxRows: 6 }}
                    value={record[dataIndex]}
                    onChange={(e) => handleInputChange(e.target.value, record.description, dataIndex)}
                  />
                </Form.Item>
              ) : (
                <>
                  <span>{truncatedText !== null ? truncatedText : 'Chưa có thông tin'}</span>
                </>
              )}
            </div>
            <Modal
              title={t('Mô tả')}
              visible={descriptionModalVisible}
              onCancel={() => setDescriptionModalVisible(false)}
              footer={null}
            >
              <p>{selectedDescription}</p>
            </Modal>
          </>
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
      render: (text: string, record: Major) => {
        const editable = isEditing(record);
        const dataIndex: keyof Major = 'status';

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy chọn ngành học' }]}
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
      render: (text: string, record: Major) => {
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
  `;

  const InputContainer = styled.div`
    flex: 1;
  `;

  const handleDownloadTemplate = async () => {
    try {
      const excelTemplate = await getExcelTemplateMajor();

      const blob = new Blob([excelTemplate], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const downloadUrl = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = 'Mau_don_nganh_hoc.xlsx';
      anchor.click();

      URL.revokeObjectURL(downloadUrl);
      anchor.remove();
    } catch (error) {
      message.error('Không thể tải mẫu đơn');
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    beforeUpload: async (file: File): Promise<void> => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await httpApi.post(
          `https://anhkiet-001-site1.htempurl.com/api/Major/upload-excel-major`,
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
          setTimeout(() => message.destroy(), 3000);
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
        title={'Tạo mới Ngành học'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
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
            <Label>{'Tên ngành học'}</Label>
            <InputContainer>
              <BaseForm.Item name="name" rules={[{ required: true, message: t('Hãy nhập tên ngành học') }]}>
                <Input maxLength={100} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Mô tả'}</Label>
            <InputContainer>
              <BaseForm.Item name="description" rules={[{ required: true, message: t('Hãy nhập mô tả ngành học') }]}>
                <TextArea autoSize={{ maxRows: 6 }} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Trạng thái'}</Label>
            <InputContainer>
              <BaseForm.Item name="status" initialValue={'ACTIVE'}>
                <Input style={{ width: '100px' }} disabled={true} />
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
        Mẫu đơn ngành học
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
