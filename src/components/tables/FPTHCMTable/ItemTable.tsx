/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';
import { Item, Pagination, createItem, getPaginatedItems, updateItem } from '@app/api/FPT_3DMAP_API/Item';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Avatar, Form, Input, Modal, Select, Space, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { CSSProperties } from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const ItemTable: React.FC = () => {
  const { t } = useTranslation();
  const { TextArea } = Input;

  const imageWithNameStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

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

        console.log('Updated null Item:', updatedItem);

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
        console.log('Item data updated successfully');
      } catch (error) {
        console.error('Error updating Item data:', error);
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

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedItems(pagination).then((res) => {
        if (isMounted.current) {
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
        console.log('Item data created successfully');

        getPaginatedItems(data.pagination).then((res) => {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        });
      } catch (error) {
        console.error('Error creating Item data:', error);
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      console.error('Error validating form:', error);
    }
  };

  const columns: ColumnsType<Item> = [
    {
      title: t('Tên vật phẩm'),
      dataIndex: 'name',
      width: '20%',
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
          <span style={imageWithNameStyles}>
            <Avatar src={record.imageUrl} alt="Hình ảnh" />
            {text}
          </span>
        );
      },
    },
    {
      title: t('Loại vật phẩm'),
      dataIndex: 'type',
      width: '15%',
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
      title: t('Mô tả'),
      dataIndex: 'description',
      width: '15%',
      render: (text: string, record: Item) => {
        const editable = isEditing(record);
        const dataIndex: keyof Item = 'description';
        const maxTextLength = 255;
        const truncatedText = text?.length > maxTextLength ? `${text.slice(0, maxTextLength)}...` : text;
        return editable ? (
          <Form.Item key={record.description} name={dataIndex} initialValue={text} rules={[{ required: false }]}>
            <TextArea
              autoSize={{ maxRows: 6 }}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.description, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{truncatedText !== null ? truncatedText : 'Chưa có thông tin'}</span>
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
      width: '10%',
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
      width: '15%',
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
            initialValue={text.toString()}
            rules={[{ required: true, message: 'Giới hạn trao đổi vật phẩm là cần thiết' }]}
          >
            <Select
              value={text}
              onChange={(value) => handleInputChange(value.toString(), record.limitExchange.toString(), dataIndex)}
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
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '8%',
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
        title={'Thêm mới VẬT PHẨM'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <FlexContainer>
            <Label>{'Tên vật phẩm'}</Label>
            <InputContainer>
              <BaseForm.Item name="name" rules={[{ required: true, message: t('Tên vật phẩm là cần thiết') }]}>
                <Input maxLength={100} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Loại vật phẩm'}</Label>
            <InputContainer>
              <BaseForm.Item name="type" rules={[{ required: true, message: t('Loại vật phẩm là cần thiết') }]}>
                <Input maxLength={100} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Điểm thưởng'}</Label>
            <InputContainer>
              <BaseForm.Item name="price" rules={[{ required: true, message: t('Điểm thưởng vật phẩm là cần thiết') }]}>
                <Input type="number" min={0} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Số lượng'}</Label>
            <InputContainer>
              <BaseForm.Item name="quantity" rules={[{ required: true, message: t('Số lượng vật phẩm là cần thiết') }]}>
                <Input type="number" min={0} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Mô tả'}</Label>
            <InputContainer>
              <BaseForm.Item name="description">
                <TextArea autoSize={{ maxRows: 6 }} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'imageUrl'}</Label>
            <InputContainer>
              <BaseForm.Item name="imageUrl" rules={[{ required: true, message: t('Hình ảnh là cần thiết') }]}>
                <Input />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Giới hạn trao đổi'}</Label>
            <InputContainer>
              <BaseForm.Item
                name="limitExchange"
                rules={[{ required: true, message: t('Giới hạn trao đổi vật phẩm là cần thiết') }]}
              >
                <Select
                  placeholder={'---- Select LimitExchange ----'}
                  suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                >
                  <Option value="true">{'Có giới hạn'}</Option>
                  <Option value="false">{'Không giới hạn'}</Option>
                </Select>
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Trạng thái'}</Label>
            <InputContainer>
              <BaseForm.Item name="status" rules={[{ required: true, message: t('Trạng thái là cần thiết') }]}>
                <Select
                  placeholder={'---- Select Status ----'}
                  suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                >
                  <Option value="ACTIVE">{'ACTIVE'}</Option>
                  <Option value="INACTIVE">{'INACTIVE'}</Option>
                </Select>
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
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
