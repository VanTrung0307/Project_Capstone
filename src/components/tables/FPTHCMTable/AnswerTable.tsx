/* eslint-disable prettier/prettier */
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { Form, Input, Modal, Select, Space, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Answer, getPaginatedAnswers, updateAnswer, Pagination, createAnswer } from '@app/api/FPT_3DMAP_API/Answer';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import { DefaultRecordType, Key } from 'rc-table/lib/interface';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { CSSProperties } from 'styled-components';
import { useMounted } from '@app/hooks/useMounted';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const AnswerTable: React.FC = () => {

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
  const [data, setData] = useState<{ data: Answer[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: Answer) => record.id === editingKey;

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

        console.log("Updated null Answer:", updatedItem); // Kiểm tra giá trị trước khi gọi API

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateAnswer(key.toString(), row);
        console.log('Answer data updated successfully');
      } catch (error) {
        console.error('Error updating Answer data:', error);
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

  const edit = (record: Partial<Answer> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Answer) => {
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
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedAnswers(pagination).then((res) => {
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

      const newData: Answer = {
        answerName: values.answerName,
        isRight: values.isRight,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true })); // Show loading state

    try {
      const createdAnswer = await createAnswer(newData);
      setData((prevData) => ({
        ...prevData,
        data: [...prevData.data, createdAnswer],
        loading: false, // Hide loading state after successful update
      }));
      form.resetFields();
      setIsBasicModalOpen(false);
      console.log('Answer data created successfully');

      // Fetch the updated data after successful creation
      getPaginatedAnswers(data.pagination).then((res) => {
        setData({ data: res.data, pagination: res.pagination, loading: false });
      });
    } catch (error) {
      console.error('Error creating Npc data:', error);
      setData((prevData) => ({ ...prevData, loading: false })); // Hide loading state on error
    }
  } catch (error) {
    console.error('Error validating form:', error);
  }
  };

  const columns: ColumnsType<Answer> = [
    {
      title: t('Tên câu trả lời'),
      dataIndex: 'answerName',
      render: (text: string, record: Answer) => {
        const editable = isEditing(record);
        const dataIndex: keyof Answer = 'answerName'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.answerName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên câu trả lời là cần thiết' }]}
          >
            <TextArea
              autoSize={{maxRows: 6}}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.answerName, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      
    },
    {
        title: t('Dạng câu trả lời'),
        dataIndex: 'isRight',
        render: (text: boolean, record: Answer) => {
          const editable = isEditing(record);
          const dataIndex: keyof Answer = 'isRight'; // Define dataIndex here

          const selectOptions = [
            { value: true, label: 'Câu trả lời đúng' },
            { value: false, label: 'Câu trả lời sai' },
          ];

          return editable ? (
            <Form.Item
              key={record.id}
              name={dataIndex}
              initialValue={text.toString()}
              rules={[{ required: true, message: 'Chọn dạng câu trả lời là cần thiết"' }]}
            >
              <Select
              value={text}
              onChange={(value) => handleInputChange(value.toString(), record.isRight.toString(), dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
              {selectOptions.map((option) => (
                <Option key={option.value.toString()} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            </Form.Item>
          ) : (
            <span>{text === true ? <Tag color="#339CFD">Câu trả lời đúng</Tag> : <Tag color="#FF5252">Câu trả lời sai</Tag> }</span>
          );
        },
        },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      width: '8%',
      render: (text: string, record: Answer) => {
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
        title={'Thêm mới CÂU TRẢ LỜI'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>

          <BaseForm.Item name="answerName" label={'Tên câu trả lời'} rules={[{ required: true, message: t('Tên câu trả lời là cần thiết') }]}>
            <TextArea autoSize={{maxRows: 6}} />
          </BaseForm.Item>

          <BaseForm.Item
            name="isRight"
            label={'Dạng câu trả lời'}
            rules={[{ required: true, message: t('Dạng câu trả lời là cần thiết') }]}
          >
            <Select 
              placeholder="---- Select QuestionType ----" 
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>}
            >
              <Option value="true">{'Câu trả lời đúng'}</Option>
              <Option value="false">{'Câu trả lời sai'}</Option>
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
