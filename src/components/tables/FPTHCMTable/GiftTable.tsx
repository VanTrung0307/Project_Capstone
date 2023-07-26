/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';
import { Gift, Pagination, createGift, getPaginatedGifts, updateGift } from '@app/api/FPT_3DMAP_API/Gift';
import { Rank, getPaginatedRanks } from '@app/api/FPT_3DMAP_API/Rank';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 5,
};

export const GiftTable: React.FC = () => {
 
  const { t } = useTranslation();
  const { TextArea } = Input;

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
  const [data, setData] = useState<{ data: Gift[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [ranks, setRanks] = useState<Rank[]>([]);

  const isEditing = (record: Gift) => record.id === editingKey;

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
          if (updatedItem[field] === "") {
            updatedItem[field] = null;
          }
        });

        console.log("Updated null Gift:", updatedItem); // Kiểm tra giá trị trước khi gọi API

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateGift(key.toString(), row);
        console.log('Gift data updated successfully');
      } catch (error) {
        console.error('Error updating Gift data:', error);
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

  const edit = (record: Partial<Gift> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Gift) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData}));
  };

  const { isMounted } = useMounted();

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedGifts(pagination)
        .then((res) => {
          if (isMounted.current) {
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        })
        .catch((error) => {
          console.error('Error fetching paginated gifts:', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });

      // Fetch the list of ranks and store it in the "ranks" state
      try {
        const majorResponse = await getPaginatedRanks({ current: 1, pageSize: 1000 }); // Adjust the pagination as needed
        setRanks(majorResponse.data);
      } catch (error) {
        console.error('Error fetching ranks:', error);
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

      const newData: Gift = {
        name: values.name,
        decription: values.decription,
        rankId: values.rankId,
        rankName: values.rankName,
        price: values.price,
        place: values.place,
        status: values.status,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true })); // Show loading state

      try {
        const createdGift = await createGift(newData);

        // Fetch the major data using the selected "rankName" from the form
        const selectedrank = ranks.find((rank) => rank.name === newData.rankName);

        // If the selected major is found, set its ID to the newData
        if (selectedrank) {
          newData.rankId = selectedrank.id;
        }

        // Assign the ID received from the API response to the newData
        newData.id = createdGift.id;


      setData((prevData) => ({
        ...prevData,
        data: [...prevData.data, createdGift],
        loading: false, // Hide loading state after successful update
      }));

      form.resetFields();
      setIsBasicModalOpen(false);
      console.log('Gift data created successfully');

      // Fetch the updated data after successful creation
      getPaginatedGifts(data.pagination).then((res) => {
        setData({ data: res.data, pagination: res.pagination, loading: false });
      });
    } catch (error) {
      console.error('Error creating Gift data:', error);
      setData((prevData) => ({ ...prevData, loading: false })); // Hide loading state on error
    }
  } catch (error) {
    console.error('Error validating form:', error);
  }
  };

  const columns: ColumnsType<Gift> = [
    {
      title: t('Tên quà tặng'),
      dataIndex: 'name',
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'name'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên quà tặng là cần thiết' }]}
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
      title: t('Thứ hạng được nhận'),
      dataIndex: 'place',
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'place'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.place}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false}]}
          >
            <Input
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.id, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : "Chưa có thông tin"}</span>
        );
      },
    },
    {
      title: t('Tên bảng xếp hạng'),
      dataIndex: 'rankName',
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'rankName'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.rankName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.id, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
              {ranks.map((rank) => (
                <Select.Option key={rank.id} value={rank.name}>
                  {rank.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text !== null ? text : "Chưa có thông tin"}</span>
        );
      },
    },
    {
      title: t('Điểm thưởng tương ứng'),
      dataIndex: 'price',
      render: (text: number, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'price'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.price}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false }]}
          >
            <Input
              type='number'
              min={0}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.price, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : "Chưa có thông tin"}</span>
        );
      },
    },
    {
      title: t('Mô tả'),
      dataIndex: 'decription',
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'decription'; // Define dataIndex here
        const maxTextLength = 255;
        const truncatedText = text?.length > maxTextLength ? `${text.slice(0, maxTextLength)}...` : text;
        return editable ? (
          <Form.Item
            key={record.decription}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false }]}
          >
            <TextArea
              autoSize={{maxRows: 6}}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.decription, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{truncatedText !== null ? truncatedText : "Chưa có thông tin"}</span>
        );
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '8%',
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'status'; // Define dataIndex here

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Trạng thái phần qùa là cần thiết' }]}
          >
            <Select
              value={text}
              onChange={(value) => handleInputChange(value, record.status, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
              {statusOptions.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text !== "INACTIVE" ? <Tag color="#339CFD">ACTIVE</Tag> : <Tag color="#FF5252">INACTIVE</Tag>}</span>
        );
      },
    },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      width: '8%',
      render: (text: string, record: Gift) => {
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
        title={'Thêm mới PHẦN QUÀ'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <BaseForm.Item name="name" label={'Tên phần quà'} rules={[{ required: true, message: t('Tên phần quà là cần thiết') }]}>
            <Input maxLength={100} />
          </BaseForm.Item>

          <BaseForm.Item name="place" label={'Thứ hạng được nhận'} >
            <Input maxLength={100}/>
          </BaseForm.Item>

          <BaseForm.Item name="description" label={'Mô tả'} >
            <TextArea autoSize={{maxRows: 6}}/>
          </BaseForm.Item>

          <BaseForm.Item name="price" label={'Điểm thưởng tương ứng'} >
            <Input type='number' min={0}/>
          </BaseForm.Item>

          <BaseForm.Item
            name="rankName"
            label={'Tên bảng xếp hạng'}
            rules={[{ required: true, message: t('Giới hạn trao đổi vật phẩm là cần thiết') }]}
          >
            <Select 
              placeholder={'---- Select Rank ----'}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>}
            >
                {ranks.map((rank) => (
                  <Option key={rank.id} value={rank.name}>
                    {rank.name}
                  </Option>
                ))}
            </Select>
          </BaseForm.Item>

          <BaseForm.Item
            name="status"
            label={'Trạng thái'}
            rules={[{ required: true, message: t('Trạng thái là cần thiết') }]}
          >
            <Select 
              placeholder={'---- Select Status ----'}
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
