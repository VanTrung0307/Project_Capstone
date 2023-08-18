/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';
import { Answer, Pagination, createAnswer, getPaginatedAnswers, updateAnswer } from '@app/api/FPT_3DMAP_API/Answer';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
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
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const AnswerTable: React.FC = () => {
  const { t } = useTranslation();
  const { TextArea } = Input;

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

        Object.keys(updatedItem).forEach((field) => {
          if (updatedItem[field] === '') {
            updatedItem[field] = null;
          }
        });

        message.warn('Updated null Answer:', updatedItem);

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
        message.success('Answer data updated successfully');
      } catch (error) {
        message.error('Error updating Answer data');
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
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const [originalData, setOriginalData] = useState<Answer[]>([]);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedAnswers(pagination).then((res) => {
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

      const newData: Answer = {
        answerName: values.answerName,
        isRight: values.isRight,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        const createdAnswer = await createAnswer(newData);
        setData((prevData) => ({
          ...prevData,
          data: [...prevData.data, createdAnswer],
          loading: false,
        }));
        form.resetFields();
        setIsBasicModalOpen(false);
        message.success('Answer data created successfully');

        getPaginatedAnswers(data.pagination).then((res) => {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        });
      } catch (error) {
        message.error('Error creating Npc data');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Error validating form');
    }
  };

  const columns: ColumnsType<Answer> = [
    {
      title: t('Tên câu trả lời'),
      dataIndex: 'answerName',
      render: (text: string, record: Answer) => {
        const editable = isEditing(record);
        const dataIndex: keyof Answer = 'answerName';
        return editable ? (
          <Form.Item
            key={record.answerName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên câu trả lời là cần thiết' }]}
          >
            <TextArea
              autoSize={{ maxRows: 6 }}
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
      filters: [
        { text: 'Câu trả lời đúng', value: 'true' },
        { text: 'Câu trả lời sai', value: 'false' },
      ],
      onFilter: (value, record) => record.isRight.toString() === value,
      render: (text: boolean, record: Answer) => {
        const editable = isEditing(record);
        const dataIndex: keyof Answer = 'isRight';

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
              style={{maxWidth: '212.03px'}}
              value={text}
              onChange={(value) => handleInputChange(value.toString(), record.isRight.toString(), dataIndex)}
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
          <span>
            {text === true ? <Tag color="#339CFD">Câu trả lời đúng</Tag> : <Tag color="#FF5252">Câu trả lời sai</Tag>}
          </span>
        );
      },
    },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
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

  const FlexContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 5px;
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
        title={'Thêm mới CÂU TRẢ LỜI'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <FlexContainer>
            <Label>{'Tên câu trả lời'}</Label>
            <InputContainer>
              <BaseForm.Item name="answerName" rules={[{ required: true, message: t('Tên câu trả lời là cần thiết') }]}>
                <TextArea autoSize={{ maxRows: 6 }} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
          <FlexContainer>
            <Label>{'Dạng câu trả lời'}</Label>
            <InputContainer>
              <BaseForm.Item name="isRight" rules={[{ required: true, message: t('Dạng câu trả lời là cần thiết') }]}>
                <Select
                  placeholder="---- Chọn loại câu hỏi ----"
                  suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                >
                  <Option value="true">{'Câu trả lời đúng'}</Option>
                  <Option value="false">{'Câu trả lời sai'}</Option>
                </Select>
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
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
        scroll={{ x: 800 }}
        bordered
      />
    </Form>
  );
};
