/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Event, getEventById, getPaginatedEvents, updateEvent } from '@app/api/FPT_3DMAP_API/Event';
import logoCard from '@app/assets/logo.png';
import { Dates } from '@app/constants/Dates';
import { Button, Form, Input, Modal, Select, Tooltip, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from '../Tag/Tag';
import * as S from './ArticleCard.styles';
import { Option } from 'antd/lib/mentions';
import '@app/components/tables/FPTHCMTable/Select.css';
import { DownOutlined } from '@ant-design/icons';
interface ArticleCardProps {
  id: string;
  name?: string;
  createdAt: string;
  status?: string;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  name,
  createdAt,
  status,
  id,
  className = 'article-card',
}) => {
  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = async () => {
    try {
      const pagination = { current: 1, pageSize: 100 };
      const { data } = await getPaginatedEvents(pagination);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getTagColor = (status: string) => {
    return status === 'ACTIVE' ? 'success' : 'error';
  };

  const navigate = useNavigate();

  const handleDetailClick = async () => {
    try {
      await getEventById(id);
      navigate(`/event/${id}`);
    } catch (error) {
      message.error('Chưa có dữ liệu');
    }
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleEditClick = () => {
    setIsModalVisible(true);
    const event = events.find((event) => event.id === id);
    form.setFieldsValue({
      name: event?.name,
      status: event?.status,
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const eventData = {
        name: values.name,
        status: values.status,
      };
      await updateEvent(id, eventData);
      message.success('Cập nhật thành công');

      form.resetFields();
      setIsModalVisible(false);

      setTimeout(() => {
        fetchEvents();
      }, 100);
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleDotsClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <S.Wrapper className={className}>
      <S.Header onClick={handleDetailClick}>
        {!!logoCard && <img src={logoCard} alt="author" style={{ width: '43px', height: '43px' }} />}
        <S.AuthorWrapper>
          {name && <S.Author>{name}</S.Author>}
          <S.DateTime>📆 {Dates.format(createdAt, 'DD/MM/YYYY')}</S.DateTime>
        </S.AuthorWrapper>
      </S.Header>

      {status && (
        <S.TagsWrapper onClick={handleDetailClick}>
          <Tag title={status} bgColor={getTagColor(status)} />
        </S.TagsWrapper>
      )}

      <Tooltip title="Chỉnh sửa">
        <S.EditButton onClick={handleEditClick}>📝</S.EditButton>
      </Tooltip>

      <Modal
        title="Chỉnh sửa sự kiện"
        className="custom-modal"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button key="back" onClick={() => setIsModalVisible(false)} style={{ background: '#414345' }}>
              Huỷ
            </Button>
            <Button key="submit" type="primary" onClick={handleModalOk}>
              Lưu
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên sự kiện" rules={[{ required: true }]}>
            <Input style={{ background: '#414345' }} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select
              suffixIcon={<DownOutlined style={{ color: '#FF7C00' }} />}
              dropdownStyle={{ background: '#414345' }}
            >
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="INACTIVE">INACTIVE</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </S.Wrapper>
  );
};
