/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card } from '@app/components/common/Card/Card';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { PaymentCardsWidget } from '@app/components/profile/profileCard/profileFormNav/nav/payments/paymentMethod/PaymentCardsWidget';
import { useResponsive } from '@app/hooks/useResponsive';
import { PaymentCard } from '@app/interfaces/interfaces';
import { Col, Row } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const PaymentMethod: React.FC = () => {
  const { t } = useTranslation();

  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [loading, setLoading] = useState(false);

  // const id = useAppSelector((state) => state.user?.user?.id);

  // useEffect(() => {
  //   if (id) {
  //     setLoading(true);
  //     getPaymentCards(id)
  //       .then((res) => setCards(res))
  //       .finally(() => setLoading(false));
  //   }
  // }, [id]);

  const { isTablet } = useResponsive();

  const handleCardRemove = (cardNumber: string) => setCards(cards.filter((card) => card.number !== cardNumber));

  const handleCardAdd = (card: PaymentCard) => {
    setCards([...cards, card]);
  };

  const content = (
    <Row gutter={[32, 32]}>
      <Col span={24}>
        <BaseForm.Title>{t('profile.nav.payments.paymentMethod')}</BaseForm.Title>
      </Col>
      <Col span={24}>
        <Spinner spinning={loading}>
          <PaymentCardsWidget cards={cards} onCardRemove={handleCardRemove} onCardAdd={handleCardAdd} />
        </Spinner>
      </Col>
    </Row>
  );

  return isTablet ? content : <Card>{content}</Card>;
};
