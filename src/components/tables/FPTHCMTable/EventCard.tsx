/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PlusOutlined } from '@ant-design/icons';
import { Event, addEvent, createEvent, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import * as S from '@app/components/medical-dashboard/NewsCard/NewsCard.styles';
import { Button, Form, Input, Modal, Spin, message } from 'antd';
import { ArticleCard } from 'components/common/ArticleCard/ArticleCard';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Marquee = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Light = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, rgba(249, 105, 14, 1) 0%, rgba(255, 255, 255, 0) 70%);
  z-index: 1;
`;

const Title = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: 36px;
  font-weight: bold;
  color: white;
  text-align: center;
  text-transform: uppercase;
  position: relative;
  z-index: 2;
  margin: 0;
  padding: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

export const EventCard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

    const interval = setInterval(() => {
      fetchEvents();
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const newData: addEvent = {
        name: values.name,
        status: values.status,
      };

      try {
        await createEvent(newData);
        message.success('Tạo sự kiện thành công');

        form.resetFields();
        setIsModalVisible(false);

        fetchEvents();
      } catch (error) {
        message.error('Tạo sự kiện không thành công');
      }
    } catch (error) {
      message.error('Lỗi hệ thống');
    }
  };

  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [visibleEvents, setVisibleEvents] = useState(7);

  const handleSeeMore = () => {
    const newVisibleEvents = visibleEvents + 4;
    setVisibleEvents(newVisibleEvents);
  };

  const showButton = visibleEvents < events.length;
  const limitedEvents = events.slice(0, visibleEvents);

  return (
    <Form form={form} component={false}>
      <Marquee>
        <Light />
        <Title>CÁC SỰ KIỆN</Title>
      </Marquee>

      <S.Wrapper>
        <S.Card>
          <S.CreateEventButton onClick={() => setIsModalVisible(true)}>
            <PlusOutlined />
          </S.CreateEventButton>
          <S.CreateText onClick={() => setIsModalVisible(true)}>Tạo sự kiện</S.CreateText>

          <Modal
            title="Tạo sự kiện"
            visible={isModalVisible}
            onOk={handleModalOk}
            className="custom-modal"
            onCancel={() => setIsModalVisible(false)}
            footer={
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  style={{ background: 'radial-gradient(100% 100% at 100% 0,#3E3939 0,#2C2727 100%)' }}
                  key="back"
                  onClick={() => setIsModalVisible(false)}
                >
                  Huỷ
                </Button>
                <Button key="submit" type="primary" onClick={handleModalOk}>
                  Tạo
                </Button>
              </div>
            }
          >
            <S.FormContent>
              <S.FlexContainer>
                <S.Label>{'Tên sự kiện'}</S.Label>
                <S.InputContainer>
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
                    <Input maxLength={100} style={{ background: '#414345' }} />
                  </BaseForm.Item>
                </S.InputContainer>
              </S.FlexContainer>

              <S.FlexContainer>
                <S.Label>{'Trạng thái'}</S.Label>
                <S.InputContainer>
                  <BaseForm.Item name="status" initialValue={'ACTIVE'}>
                    <Input disabled={true} style={{ background: '#414345' }} />
                  </BaseForm.Item>
                </S.InputContainer>
              </S.FlexContainer>
            </S.FormContent>
          </Modal>
        </S.Card>

        {limitedEvents.map((advice, index) => (
          <ArticleCard
            key={index}
            id={advice.id}
            name={advice.name}
            createdAt={advice.createdAt}
            status={advice.status}
          />
        ))}
      </S.Wrapper>
      {isLoading && <Spin />}
      {!showAll && showButton && (
        <Button style={{ display: 'flex', margin: '0 auto' }} onClick={handleSeeMore}>
          Xem Tiếp
        </Button>
      )}
    </Form>
  );
};
