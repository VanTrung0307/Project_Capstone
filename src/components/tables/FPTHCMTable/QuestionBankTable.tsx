/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Upload } from '@app/components/common/Upload/Upload';
import { DownOutlined, DownloadOutlined, MinusOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Answer, getPaginatedAnswers } from '@app/api/FPT_3DMAP_API/Answer';
import { Major, getPaginatedMajors } from '@app/api/FPT_3DMAP_API/Major';
import {
  Pagination,
  Question,
  addQuestion,
  createQuestion,
  getExcelTemplateQnA,
  getPaginatedQuestions,
  updateQuestion,
  updateQuestionData,
} from '@app/api/FPT_3DMAP_API/QuestionBank';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Col, Form, Input, Modal, Row, Select, Space, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';
import styled from 'styled-components';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { httpApi } from '@app/api/http.api';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 5,
};

export const QuestionBankTable: React.FC = () => {
  const { t } = useTranslation();
  const { TextArea } = Input;

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: Question[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [majors, setMajors] = useState<Major[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const isEditing = (record: Question) => record.id === editingKey;

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

        // message.warn('Updated null Question:', updatedItem);

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await updateQuestion(key.toString(), row);
        setData((prevData) => ({ ...prevData, loading: true }));
        message.success('Cập nhật thành công');
        fetch(data.pagination);
      } catch (error) {
        message.error('Cập nhật thất bại');
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData, loading: false }));
        }
      }
    } catch (errInfo) {
      message.error('Lỗi hệ thống');
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const edit = (record: Partial<Question> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Question) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const [originalData, setOriginalData] = useState<Question[]>([]);

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedQuestions(pagination)
        .then((res) => {
          if (isMounted.current) {
            setOriginalData(res.data);
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        })
        .catch((error) => {
          message.error('Error fetching paginated questions:', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });

      try {
        const majorResponse = await getPaginatedMajors({ current: 1, pageSize: 100 });
        setMajors(majorResponse.data);
      } catch (error) {
        // message.error('Error fetching majors');
      }

      try {
        const answerResponse = await getPaginatedAnswers({ current: 1, pageSize: 100 });
        setAnswers(answerResponse.data);
      } catch (error) {
        // message.error('Error fetching questions');
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

      const newAnswers = answerInputs.map((inputId, index) => ({
        id: values[`answers[${inputId}].id`],
        answerName: values[`answers[${inputId}].answerName`],
        isRight: index === 0,
      }));

      const newData: addQuestion = {
        answers: newAnswers,
        majorId: values.majorId,
        name: values.name,
        status: values.status,
      };

      if (!newData.answers.length) {
        newData.answers = [
          {
            id: `${answerInputs.length}`,
            answerName: '',
            isRight: false,
          },
        ];
      }

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        await createQuestion(newData);

        const selectedMajor = majors.find((major) => major.id === newData.majorId);
        if (selectedMajor) {
          newData.majorId = selectedMajor.id;
        }

        form.resetFields();
        setIsBasicModalOpen(false);

        fetch(data.pagination);
        message.success('Tạo câu hỏi thành công');
      } catch (error) {
        fetch(data.pagination);
        message.error('Tạo câu hỏi thất bại');
      }
    } catch (error) {
      message.error('Hãy nhập đầy đủ');
    }
  };

  const uniqueMajorNames = new Set(data.data.map((record) => record.majorName));
  const majorNameFilters = Array.from(uniqueMajorNames).map((majorName) => ({
    text: majorName,
    value: majorName,
  }));

  const [answerModalVisible, setAnswerModalVisible] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<Array<{ id: string; answerName: string; isRight: boolean }>>([]);

  const columns: ColumnsType<Question> = [
    {
      title: t('Tên câu hỏi'),
      dataIndex: 'name',
      render: (text: string, record: Question) => {
        const editable = isEditing(record);
        const dataIndex: keyof updateQuestionData = 'name';
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập tên câu hỏi' }]}
          >
            <TextArea
              autoSize={{ maxRows: 6 }}
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
      title: t('Tên ngành'),
      dataIndex: 'majorName',
      width: '16%',
      filters: majorNameFilters,
      onFilter: (value, record) => record.majorName === value,
      render: (text: string, record: Question) => {
        const editable = isEditing(record);
        const dataIndex: keyof updateQuestionData = 'majorName';
        return editable ? (
          <Form.Item
            key={record.majorName}
            name={dataIndex}
            rules={[{ required: true, message: 'Hãy chọn ngành học' }]}
          >
            <Select
              style={{ maxWidth: '212.03px' }}
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.id, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {majors.map((major) => (
                <Select.Option key={major.id} value={major.id}>
                  {major.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Câu trả lời'),
      dataIndex: 'answers',
      render: (answers: Array<{ id: string; answerName: string; isRight: boolean }>, record: Question) => {
        const editable = isEditing(record);
        const maxTextLength = 50;

        const openAnswerModal = (answersToShow: Array<{ id: string; answerName: string; isRight: boolean }>) => {
          if (!editable) {
            setAnswerModalVisible(true);
            setSelectedAnswer(answersToShow);
          }
        };

        return (
          <>
            {answers.map((answer) => {
              const text = answer.answerName;
              const truncatedText = text?.length > maxTextLength ? `${text.slice(0, maxTextLength)}...` : text;

              const answerIndicator = answer.isRight ? <Tag color="#87d068">Đúng</Tag> : <Tag color="#f50">Sai</Tag>;
              const dataIndex: keyof updateQuestionData['answers'][string] = answer.id as keyof updateQuestionData['answers'][string];

              return (
                <div
                  key={answer.id}
                  onClick={() => {
                    if (text?.length > maxTextLength) {
                      openAnswerModal(answers);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '3px',
                    cursor: !editable && text?.length > maxTextLength ? 'pointer' : 'default',
                  }}
                >
                  {answerIndicator}
                  <span style={{ marginLeft: '8px' }}>{truncatedText}</span>
                  {editable && (
                    <Form.Item
                      name={dataIndex}
                      rules={[{ required: true, message: 'Hãy nhập câu trả lời' }]}
                        initialValue={answer.answerName}
                    >
                      <Input
                        style={{ maxWidth: '212.03px', marginLeft: '8px' }}
                        value={text}
                        onChange={(e) => handleInputChange(e.target.value, answer.id, 'answers')}
                      />
                    </Form.Item>
                  )}
                </div>
              );
            })}
            <Modal
              title={t('Nội dung CÂU TRẢ LỜI')}
              visible={answerModalVisible}
              onCancel={() => setAnswerModalVisible(false)}
              footer={null}
              mask
              maskStyle={{ opacity: 0.2 }}
            >
              {selectedAnswer.map((answer) => (
                <div key={answer.id} style={{ display: 'flex', alignItems: 'center' }}>
                  {answer.isRight ? <Tag color="#87d068">Đúng</Tag> : <Tag color="#f50">Sai</Tag>}
                  <p style={{ marginLeft: '8px' }}>{answer.answerName}</p>
                </div>
              ))}
            </Modal>
          </>
        );
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '11%',
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text: string, record: Question) => {
        const editable = isEditing(record);
        const dataIndex: keyof Question = 'status';

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
      render: (text: string, record: Question) => {
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
    showUploadList: false,
    beforeUpload: async (file: File): Promise<void> => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await httpApi.post(
          `https://anhkiet-001-site1.htempurl.com/api/Questions/upload-excel-question`,
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
          setTimeout(() => message.destroy(), 1000);
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
      const excelTemplate = await getExcelTemplateQnA();

      const blob = new Blob([excelTemplate], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const downloadUrl = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = 'Mau_don_ngan_hang_cau_hoi.xlsx';
      anchor.click();

      URL.revokeObjectURL(downloadUrl);
      anchor.remove();
    } catch (error) {
      message.error('Không thể tải mẫu đơn');
    }
  };

  const [answerInputs, setAnswerInputs] = useState<number[]>([]);
  const maxInputs = 4;

  const addAnswerInput = () => {
    if (answerInputs.length < maxInputs) {
      setAnswerInputs([...answerInputs, Date.now()]);
    }
  };

  const removeLastAnswerInput = () => {
    if (answerInputs.length > 1) {
      setAnswerInputs(answerInputs.slice(0, -1));
    }
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
        title={'Tạo mới CÂU HỎI'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
        width={1000}
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
          <Row>
            <Col span={8}>
              <FlexContainer>
                <Label>{'Tên câu hỏi'}</Label>
                <InputContainer>
                  <BaseForm.Item
                    name="name"
                    rules={[
                      { required: true, message: t('Hãy nhập câu hỏi') },
                      { max: 100, message: t('Tên câu hỏi không được vượt quá 100 ký tự') },
                    ]}
                  >
                    <TextArea style={{ width: '256px' }} />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>

              <FlexContainer>
                <Label>{'Tên ngành'}</Label>
                <InputContainer>
                  <BaseForm.Item name="majorId" rules={[{ required: true, message: t('Hãy chọn ngành học') }]}>
                    <Select
                      style={{ maxWidth: '256px' }}
                      placeholder={'---- Chọn ngành ----'}
                      suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                    >
                      {majors.map((major) => (
                        <Option key={major.id} value={major.id}>
                          {major.name}
                        </Option>
                      ))}
                    </Select>
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>

              <FlexContainer>
                <Label>{'Trạng thái'}</Label>
                <InputContainer>
                  <BaseForm.Item name="status" initialValue={'ACTIVE'}>
                    <Input disabled={true} style={{ width: '80px' }} />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>
            </Col>

            <Col span={19} offset={12}>
              <FlexContainer style={{ marginTop: '-305px' }}>
                <Label>{'Câu trả lời'}</Label>
                <h1 style={{ fontSize: '14px', color: '#FF6961' }}>* Hãy nhập 4 câu trả lời</h1>
                <InputContainer>
                  {/* Always show the first input with the placeholder "Câu trả lời đúng" */}
                  <div>
                    <BaseForm.Item
                      name={`answers[${answerInputs[0]}].answerName`}
                      rules={[
                        { required: true, message: t('Hãy nhập câu trả lời') },
                        () => ({
                          validator: async (_, value) => {
                            if (
                              answerInputs.length === 4 &&
                              answerInputs.every((id) => form.getFieldValue(`answers[${id}].answerName`))
                            ) {
                              return Promise.resolve();
                            }
                            throw new Error('Hãy nhập đủ 4 câu trả lời');
                          },
                        }),
                      ]}
                    >
                      <Input style={{ maxWidth: '256px', marginBottom: '8px' }} placeholder={'Câu trả lời đúng'} />
                    </BaseForm.Item>
                  </div>
                  {/* Render the remaining inputs */}
                  {answerInputs.slice(1).map((inputId) => (
                    <div key={inputId}>
                      <BaseForm.Item
                        name={`answers[${inputId}].answerName`}
                        rules={[
                          { required: true, message: t('Hãy nhập câu trả lời') },
                          () => ({
                            validator: async (_, value) => {
                              if (
                                answerInputs.length === 4 &&
                                answerInputs.every((id) => form.getFieldValue(`answers[${id}].answerName`))
                              ) {
                                return Promise.resolve();
                              }
                              throw new Error('Hãy nhập đủ 4 câu trả lời');
                            },
                          }),
                        ]}
                      >
                        <Input
                          style={{ maxWidth: '256px', marginBottom: '8px' }}
                          placeholder={'Nhập câu trả lời sai'}
                        />
                      </BaseForm.Item>
                    </div>
                  ))}
                  {answerInputs.length > 1 && (
                    <Button
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '8px',
                      }}
                      onClick={removeLastAnswerInput}
                    >
                      <MinusOutlined />
                    </Button>
                  )}
                  {answerInputs.length < maxInputs && (
                    <Button
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '8px',
                      }}
                      onClick={addAnswerInput}
                    >
                      <PlusOutlined />
                    </Button>
                  )}
                </InputContainer>
              </FlexContainer>
            </Col>
          </Row>
        </S.FormContent>
      </Modal>

      <Button
        type="dashed"
        onClick={handleDownloadTemplate}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 285px' }}
        icon={<DownloadOutlined />}
      >
        Mẫu đơn Excel
      </Button>

      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} style={{ position: 'absolute', top: '0', right: '0', margin: '15px 125px' }}>
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
        scroll={{ x: 1200 }}
        bordered
      />
    </Form>
  );
};
