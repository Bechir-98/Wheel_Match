import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import theme from '../styles/theme';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  padding: ${theme.spacing[6]};
  background-color: ${theme.colors.background.light};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[6]};
`;

const Title = styled.h1`
  color: ${theme.colors.neutral[900]};
`;

const OrdersGrid = styled.div`
  display: grid;
  gap: ${theme.spacing[4]};
`;

const OrderCard = styled(Card)`
  padding: ${theme.spacing[4]};
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
`;

const OrderInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[4]};
`;

const InfoItem = styled.div`
  span:first-child {
    display: block;
    font-size: ${theme.typography.fontSize.sm};
    color: ${theme.colors.neutral[500]};
    margin-bottom: ${theme.spacing[1]};
  }
  
  span:last-child {
    font-weight: ${theme.typography.fontWeight.medium};
    color: ${theme.colors.neutral[900]};
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing[1]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  
  ${props => {
    switch (props.status) {
      case 'completed':
        return `
          background-color: ${theme.colors.success.light};
          color: ${theme.colors.success.main};
        `;
      case 'cancelled':
        return `
          background-color: ${theme.colors.error.light};
          color: ${theme.colors.error.main};
        `;
      default:
        return `
          background-color: ${theme.colors.warning.light};
          color: ${theme.colors.warning.main};
        `;
    }
  }}
  
  svg {
    margin-right: ${theme.spacing[1]};
  }
`;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('COMMANDER')
        .select(`
          *,
          FAUTEUIL (*),
          PATIENT (
            NOMP,
            PRENOMP
          )
        `)
        .order('DATE_COMMANDE', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheck />;
      case 'cancelled':
        return <FaTimes />;
      default:
        return <FaClock />;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <Header>
        <Title>Orders</Title>
        <Button
          variant="primary"
          onClick={() => navigate('/vendordashboard')}
        >
          Back to Vendor Dashboard
        </Button>
      </Header>

      <OrdersGrid>
        {orders.map((order) => (
          <OrderCard key={`${order.ID_UTILISATUER}-${order.ID_FAUTEUIL}`}>
            <OrderHeader>
              <h3>Order #{`${order.ID_UTILISATUER}${order.ID_FAUTEUIL}`}</h3>
              <StatusBadge status={order.status || 'pending'}>
                {getStatusIcon(order.status)}
                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
              </StatusBadge>
            </OrderHeader>

            <OrderInfo>
              <InfoItem>
                <span>Customer</span>
                <span>{order.PATIENT?.NOMP} {order.PATIENT?.PRENOMP}</span>
              </InfoItem>
              <InfoItem>
                <span>Order Date</span>
                <span>{new Date(order.DATE_COMMANDE).toLocaleDateString()}</span>
              </InfoItem>
              <InfoItem>
                <span>Product</span>
                <span>{order.FAUTEUIL?.TYPE_FAUTEUIL?.NOM_TYPE}</span>
              </InfoItem>
              <InfoItem>
                <span>Price</span>
                <span>${order.FAUTEUIL?.PRIX}</span>
              </InfoItem>
            </OrderInfo>

            <Button
              variant="outline"
              fullWidth
              icon={<FaShoppingCart />}
            >
              View Details
            </Button>
          </OrderCard>
        ))}
      </OrdersGrid>
    </PageContainer>
  );
};

export default OrdersPage;