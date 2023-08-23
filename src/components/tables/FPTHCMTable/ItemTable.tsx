/* eslint-disable prettier/prettier */
import { DeleteOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons';
import { Item, Pagination, createItem, getPaginatedItems, updateItem } from '@app/api/FPT_3DMAP_API/Item';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Avatar, Col, Form, Input, Modal, Row, Select, Space, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import Upload from 'antd/lib/upload/Upload';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';
import { httpApi } from '@app/api/http.api';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const ItemTable: React.FC = () => {
  const { t } = useTranslation();
  const { TextArea } = Input;

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: Item[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: Item) => record.id === editingKey;

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

        message.warn('Updated null Item:', updatedItem);

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateItem(key.toString(), row);
        message.success('Item data updated successfully');
        fetch(data.pagination);
      } catch (error) {
        message.error('Error updating Item data');
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData }));
        }
        fetch(data.pagination);
      }
    } catch (errInfo) {
      message.error('Validate Failed');
    }
  };

  const cancel = () => {
    setEditingKey('');
    fetch(data.pagination);
  };

  const edit = (record: Partial<Item> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Item) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const [originalData, setOriginalData] = useState<Item[]>([]);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedItems(pagination).then((res) => {
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

      const newData: Item = {
        name: values.name,
        type: values.type,
        price: values.price,
        quantity: values.quantity,
        description: values.description,
        imageUrl: values.imageUrl,
        limitExchange: values.limitExchange,
        status: values.status,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        const createdItem = await createItem(newData);
        setData((prevData) => ({
          ...prevData,
          data: [...prevData.data, createdItem],
          loading: false,
        }));
        form.resetFields();
        setIsBasicModalOpen(false);
        message.success('Item data created successfully');

        getPaginatedItems(data.pagination).then((res) => {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        });
      } catch (error) {
        message.error('Error creating Item data');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Error validating form');
    }
  };

  const uniqueItemTypes = new Set(data.data.map((record) => record.type));
  const itemTypeFilters = Array.from(uniqueItemTypes).map((taskType) => ({
    text: taskType,
    value: taskType,
  }));

  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');

  const handleDeleteImage = (record: Item) => {
    const updatedData = data.data.map((item) => (item.id === record.id ? { ...item, imageUrl: '' } : item));
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const columns: ColumnsType<Item> = [
    {
      title: t('Hình ảnh'),
      dataIndex: 'imageUrl',
      render: (text: string, record: Item) => {
        const editable = isEditing(record);
        const dataIndex: keyof Item = 'imageUrl';

        return editable ? (
          <Form.Item
            key={record.imageUrl}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hình ảnh là cần thiết' }]}
          >
            {text ? (
              <>
                <div style={{ position: 'relative' }}>
                  <Avatar style={{ width: '50px', height: '50px', borderRadius: '10px' }} src={text} alt="Hình ảnh" />
                  <Button
                    style={{ position: 'absolute', top: '0', right: '0', width: '20px', height: '20px' }}
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteImage(record)}
                  />
                </div>
              </>
            ) : (
              <Upload
                customRequest={(options) => {
                  options;
                }}
                showUploadList={false}
              >
                {' '}
                <Button icon={<UploadOutlined />}>{t('uploads.directory')}</Button>
              </Upload>
            )}
          </Form.Item>
        ) : (
          <span>
            <Avatar
              style={{ width: '50px', height: '50px', borderRadius: '10px' }}
              src={record.imageUrl}
              alt="Hình ảnh"
            />
          </span>
        );
      },
    },
    {
      title: t('Tên vật phẩm'),
      dataIndex: 'name',
      render: (text: string, record: Item) => {
        const editable = isEditing(record);
        const dataIndex: keyof Item = 'name';
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên vật phẩm là cần thiết' }]}
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
      title: t('Loại vật phẩm'),
      dataIndex: 'type',
      filters: itemTypeFilters,
      onFilter: (value, record) => record.type === value,
      render: (text: string, record: Item) => {
        const editable = isEditing(record);
        const dataIndex: keyof Item = 'type';
        return editable ? (
          <Form.Item
            key={record.type}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Loại vật phẩm là cần thiết' }]}
          >
            <Input
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.type, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Điểm thưởng'),
      dataIndex: 'price',
      width: '10%',
      render: (text: number, record: Item) => {
        const editable = isEditing(record);
        const dataIndex: keyof Item = 'price';
        return editable ? (
          <Form.Item
            key={record.price}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Điểm thưởng là cần thiết' }]}
          >
            <Input
              type="number"
              min={0}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.price, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text + ' điểm'}</span>
        );
      },
    },
    {
      title: t('Số lượng'),
      dataIndex: 'quantity',
      render: (text: number, record: Item) => {
        const editable = isEditing(record);
        const dataIndex: keyof Item = 'quantity';
        return editable ? (
          <Form.Item
            key={record.quantity}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Số lượng vật phẩm là cần thiết' }]}
          >
            <Input
              type="number"
              min={0}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.quantity, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text === 0 ? 'Bán hết' : text}</span>
        );
      },
    },
    {
      title: t('Giới hạn trao đổi'),
      dataIndex: 'limitExchange',
      render: (text: boolean, record: Item) => {
        const editable = isEditing(record);
        const dataIndex: keyof Item = 'limitExchange';

        const selectOptions = [
          { value: true, label: 'Có giới hạn' },
          { value: false, label: 'Không giới hạn' },
        ];

        return editable ? (
          <Form.Item
            key={record.id}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Giới hạn trao đổi vật phẩm là cần thiết' }]}
          >
            <Select
              value={text}
              onChange={(value) => handleInputChange(value?.toString(), record.limitExchange.toString(), dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {selectOptions.map((option) => (
                <Option key={option.value.toString()} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text === true ? 'Có giới hạn' : 'Không giới hạn'}</span>
        );
      },
    },
    {
      title: t('Mô tả'),
      dataIndex: 'description',
      render: (text: string, record: Item) => {
        const editable = isEditing(record);
        const dataIndex: keyof Item = 'description';
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
                <Form.Item key={record.description} name={dataIndex} initialValue={text} rules={[{ required: false }]}>
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
      render: (text: string, record: Item) => {
        const editable = isEditing(record);
        const dataIndex: keyof Item = 'status';

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
      render: (text: string, record: Item) => {
        const editable = isEditing(record);
        return (
          <Space>
            {editable ? (
              <>
                <Button type="primary" onClick={() => save(record.id)}>
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
        title={'Thêm mới VẬT PHẨM'}
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
        width={800}
      >
        <S.FormContent>
          <Row gutter={16}>
            <Col span={12}>
              <FlexContainer>
                <div>
                  <Label>{'Tên vật phẩm'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="name" rules={[{ required: true, message: t('Tên vật phẩm là cần thiết') }]}>
                      <Input maxLength={100} />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

              <FlexContainer>
                <div>
                  <Label>{'Loại vật phẩm'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="type" rules={[{ required: true, message: t('Loại vật phẩm là cần thiết') }]}>
                      <Input maxLength={100} />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>
            </Col>

            <Col span={12}>
              <FlexContainer>
                <div>
                  <Label>{'Điểm thưởng'}</Label>
                  <InputContainer>
                    <BaseForm.Item
                      name="price"
                      rules={[{ required: true, message: t('Điểm thưởng vật phẩm là cần thiết') }]}
                    >
                      <Input type="number" min={0} />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

              <FlexContainer>
                <div>
                  <Label>{'Số lượng'}</Label>
                  <InputContainer>
                    <BaseForm.Item
                      name="quantity"
                      rules={[{ required: true, message: t('Số lượng vật phẩm là cần thiết') }]}
                    >
                      <Input type="number" min={0} />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <FlexContainer>
                <div>
                  <Label>{'Mô tả'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="description">
                      <TextArea />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

              <FlexContainer>
                <div>
                  <Label>{'imageUrl'}</Label>
                  <InputContainer>
                    <Upload {...uploadProps}>
                      <BaseForm.Item name="imageUrl">
                        <Button icon={<UploadOutlined />}>Hình ảnh vật phẩm</Button>
                      </BaseForm.Item>
                    </Upload>
                  </InputContainer>
                </div>
              </FlexContainer>
            </Col>

            <Col span={12}>
              <FlexContainer>
                <div>
                  <Label>{'Giới hạn trao đổi'}</Label>
                  <InputContainer>
                    <BaseForm.Item
                      name="limitExchange"
                      rules={[{ required: true, message: t('Giới hạn trao đổi vật phẩm là cần thiết') }]}
                    >
                      <Select
                        style={{ maxWidth: '256px' }}
                        placeholder={'---- Chọn giới hạn ----'}
                        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                      >
                        <Option value="true">{'Có giới hạn'}</Option>
                        <Option value="false">{'Không giới hạn'}</Option>
                      </Select>
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

              <FlexContainer>
                <div>
                  <Label>{'Trạng thái'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="status" initialValue={'ACTIVE'}>
                      <Input style={{ width: '100px' }} disabled={true} />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>
            </Col>
          </Row>
        </S.FormContent>
      </Modal>

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
        scroll={{ x: 1500 }}
        bordered
      />
    </Form>
  );
};
