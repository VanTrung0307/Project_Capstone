/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Item,
  Pagination,
  addItem,
  createItem,
  getPaginatedItems,
  updateItem,
  updateItemData,
} from '@app/api/FPT_3DMAP_API/Item';
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

      if (index > -1) {
        const item = newData[index];

        const updatedData = {
          ...row,
          id: key.toString(),
        };

        const formData = new FormData();

        // Append fields to FormData
        Object.keys(updatedData).forEach((field) => {
          formData.append(field, updatedData[field]);
        });

        // Handle image separately
        if (row.image instanceof File) {
          formData.append('image', row.image);
        }

        newData.splice(index, 1, { ...item, ...row });

        setData((prevData) => ({ ...prevData, loading: true }));
        setEditingKey('');

        try {
          await updateItem(key.toString(), formData);
          setData({ ...data, data: newData, loading: false });
          message.success('Cập nhật vật phẩm thành công');
          fetch(data.pagination);
        } catch (error) {
          message.error('Cập nhật vật phẩm thất bại');
          if (item) {
            newData.splice(index, 1, item);
            setData((prevData) => ({ ...prevData, data: newData }));
          }
          fetch(data.pagination);
        }
      }
    } catch (errInfo) {
      message.error('Lỗi hệ thống');
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

      const formData = new FormData();

      // Convert base64 image data to a Blob
      const imageBlob = dataURItoBlob(uploadedImage?.data);

      formData.append('image', imageBlob);
      formData.append('name', values.name);
      formData.append('type', values.type);
      formData.append('price', values.price);
      formData.append('description', values.description);
      formData.append('imageUrl', values.imageUrl);
      formData.append('limitExchange', values.limitExchange);
      formData.append('status', values.status);
      formData.append('id', values.id);

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        await createItem(formData);

        form.resetFields();
        setIsBasicModalOpen(false);
        message.success('Tạo vật phẩm thành công');

        getPaginatedItems(data.pagination).then((res) => {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        });
      } catch (error) {
        message.error('Tạo vật phẩm thất bại');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Lỗi hệ thống');
    }
  };

  // Function to convert base64 data to Blob
  function dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

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
      render: (text: string, record: Item) => (
        <span>
          <Avatar
            style={{ width: '50px', height: '50px', borderRadius: '10px' }}
            src={record.imageUrl}
            alt="Hình ảnh"
          />
        </span>
      ),
    },

    // {
    //   title: t('Hình ảnh'),
    //   dataIndex: 'imageUrl',
    //   render: (text: string, record: Item) => {
    //     const editable = isEditing(record);
    //     const dataIndex: keyof updateItemData = 'imageUrl';

    //     return editable ? (
    //       <Form.Item
    //         key={record.imageUrl}
    //         name={dataIndex}
    //         initialValue={text}
    //         rules={[{ required: true, message: 'Hãy tải lên hoặc nhập đường dẫn hình ảnh' }]}
    //       >
    //         {text ? (
    //           <>
    //             <div style={{ position: 'relative' }}>
    //               <Avatar style={{ width: '50px', height: '50px', borderRadius: '10px' }} src={text} alt="Hình ảnh" />
    //               <Button
    //                 style={{ position: 'absolute', top: '0', right: '0', width: '20px', height: '20px' }}
    //                 icon={<DeleteOutlined />}
    //                 onClick={() => handleDeleteImage(record)}
    //               />
    //             </div>
    //           </>
    //         ) : (
    //           <div>
    //             <Upload {...uploadProps(record)} style={{ display: 'flex', alignItems: 'center' }}>
    //               <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
    //             </Upload>
    //             {/* <span style={{ margin: '0 10px' }}>hoặc</span> */}
    //             {/* <Input
    //               placeholder="Nhập URL hình ảnh"
    //               defaultValue={text}
    //               onChange={(e) => handleInputChange(e.target.value, record.id, dataIndex)}
    //             /> */}
    //           </div>
    //         )}
    //       </Form.Item>
    //     ) : (
    //       <span>
    //         <Avatar
    //           style={{ width: '50px', height: '50px', borderRadius: '10px' }}
    //           src={record.imageUrl}
    //           alt="Hình ảnh"
    //         />
    //       </span>
    //     );
    //   },
    // },
    {
      title: t('Tên vật phẩm'),
      dataIndex: 'name',
      render: (text: string, record: Item) => {
        const editable = isEditing(record);
        const dataIndex: keyof updateItemData = 'name';
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập tên vật phẩm' }]}
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
        const dataIndex: keyof updateItemData = 'type';
        return editable ? (
          <Form.Item
            key={record.type}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập loại vật phẩm' }]}
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
        const dataIndex: keyof updateItemData = 'price';
        return editable ? (
          <Form.Item
            key={record.price}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập điểm thưởng' }]}
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
      title: t('Giới hạn trao đổi'),
      dataIndex: 'limitExchange',
      render: (text: boolean, record: Item) => {
        const editable = isEditing(record);
        const dataIndex: keyof updateItemData = 'limitExchange';

        const selectOptions = [
          { value: true, label: 'Có giới hạn' },
          { value: false, label: 'Không giới hạn' },
        ];

        return editable ? (
          <Form.Item
            key={record.id}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy chọn giới hạn trao đổi' }]}
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
        const dataIndex: keyof updateItemData = 'description';
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
                  rules={[{ required: false, message: 'Hãy nhập mô tả vật phẩm' }]}
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
              title={t('Mô tả chi tiết')}
              visible={descriptionModalVisible}
              onCancel={() => setDescriptionModalVisible(false)}
              footer={null}
              mask={true}
              maskStyle={{ opacity: 0.2 }}
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
        const dataIndex: keyof updateItemData = 'status';

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

  const uploadProps = (record: Item) => ({
    name: 'file',
    multiple: false,
    beforeUpload: (file: File): boolean => {
      handleImageUpload(file, record);
      return false;
    },
    showUploadList: false,
  });

  const handleImageUpload = (file: File, record: Item) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const imageUrl = e.target.result;

      setData((prevState) => {
        const updatedData = prevState.data.map((item: Item) => (item.id === record.id ? { ...item, imageUrl } : item));
        return { ...prevState, data: updatedData };
      });
    };

    reader.readAsDataURL(file);
  };

  const uploadAddProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file: File): boolean => {
      if (isValidFileType(file)) {
        handleAddImageUpload(file);
      } else {
        message.error('Chỉ cho phép tải lên các tệp PNG và JPEG.');
      }
      return false;
    },
    showUploadList: false,
  };

  const validFileTypes = ['image/png', 'image/jpeg'];

  const isValidFileType = (file: File): boolean => {
    return validFileTypes.includes(file.type);
  };

  const [uploadedImage, setUploadedImage] = useState<{ name: string; data: any } | undefined>(undefined);

  const handleAddImageUpload = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const image = e.target.result;
      setUploadedImage({ name: file.name, data: image });
    };

    reader.readAsDataURL(file);
  };

  enum ItemType {
    food = 'Thức ăn',
    drink = 'Nước uống',
    item = 'Vật dụng',
  }

  const [selectedItemType, setSelectedItemType] = useState<string | null>(null);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const handleItemTypeChange = (value: string) => {
    setSelectedItemType(value);
    setShowItemDropdown(false);
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
        title={'Tạo mới Vật phẩm'}
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
                    <BaseForm.Item
                      name="name"
                      rules={[
                        { required: true, message: t('Hãy nhập tên vật phẩm') },
                        {
                          pattern: /^[^\d\W].*$/,
                          message: 'Không được bắt đầu bằng số hoặc ký tự đặc biệt',
                        },
                      ]}
                    >
                      <Input maxLength={100} style={{ width: '300px' }} />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

              <FlexContainer>
                <div>
                  <Label>{'Loại vật phẩm'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="type" rules={[{ required: true, message: t('Hãy chọn loại vật phẩm') }]}>
                      <Select
                        style={{ width: '300px' }}
                        placeholder={'---- Chọn loại vật phẩm ----'}
                        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                        onChange={handleItemTypeChange}
                      >
                        {Object.values(ItemType).map((type) => (
                          <Option key={type} value={type}>
                            {type}
                          </Option>
                        ))}
                      </Select>
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
                      rules={[
                        { required: true, message: t('Hãy nhập điểm thưởng') },
                        {
                          validator: (_, value) => {
                            if (value >= 100) {
                              return Promise.resolve();
                            }
                            return Promise.reject('Điểm thưởng phải bắt đàu từ 100 điểm');
                          },
                        },
                      ]}
                    >
                      <Input type="number" min={100} style={{ width: '100px' }} />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

              <FlexContainer>
                <div>
                  <Label>{'Giới hạn trao đổi'}</Label>
                  <InputContainer>
                    <BaseForm.Item
                      name="limitExchange"
                      rules={[{ required: true, message: t('Hãy chọn giới hạn trao đổi') }]}
                    >
                      <Select
                        style={{ width: '300px', maxWidth: '300px' }}
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
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <FlexContainer>
                <div>
                  <Label>{'Mô tả'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="description" rules={[{ required: true, message: t('Hãy nhập mô tả') }]}>
                      <TextArea style={{ width: '300px' }} />
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

            <Col span={12}>
              <FlexContainer>
                <div>
                  <Label>{'Hình ảnh'}</Label>
                  <InputContainer>
                    <Upload {...uploadAddProps}>
                      <Button style={{ width: '300px' }} icon={<UploadOutlined />}>
                        Hình ảnh vật phẩm
                      </Button>
                    </Upload>
                    {uploadedImage && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img
                          src={uploadedImage.data}
                          alt="Uploaded"
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            marginTop: '10px',
                          }}
                        />
                        <Button
                          type="link"
                          onClick={() => setUploadedImage(undefined)}
                          style={{ marginLeft: '10px', color: 'red' }}
                          icon={<DeleteOutlined />}
                        ></Button>
                      </div>
                    )}
                  </InputContainer>
                  {/* <span style={{ margin: '0px 10px' }}>hoặc</span>
                  <InputContainer>
                    <BaseForm.Item name="imageUrl">
                      <Input style={{ width: '300px' }} placeholder="Nhập URL hình ảnh" />
                    </BaseForm.Item>
                  </InputContainer> */}
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
