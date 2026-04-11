import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import theme from '../styles/theme';
import Card from '../components/common/Card';
import Button from '../components/common/Button';


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

const CustomersGrid = styled.div`
  display: grid;
  gap: ${theme.spacing[4]};
`;

const CustomerCard = styled(Card)`
  padding: ${theme.spacing[4]};
`;

const CustomerHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing[4]};
  
  svg {
    font-size: ${theme.typography.fontSize['2xl']};
    color: ${theme.colors.primary[500]};
  }
`;

const CustomerInfo = styled.div`
  flex: 1;
`;

const CustomerName = styled.h3`
  margin-bottom: ${theme.spacing[1]};
  color: ${theme.colors.neutral[900]};
`;

const CustomerDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[4]};
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    color: ${theme.colors.primary[500]};
    margin-right: ${theme.spacing[2]};
  }
  
  span {
    color: ${theme.colors.neutral[700]};
  }
`;

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('PATIENT')
        .select(`
          *,
          UTILISATEUR (*)
        `);

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <Header>
        <Title>Customers</Title>
      </Header>

      <CustomersGrid>
        {customers.map((customer) => (
          <CustomerCard key={customer.ID_UTILISATUER}>
            <CustomerHeader>
              <Avatar>
                <FaUser />
              </Avatar>
              <CustomerInfo>
                <CustomerName>{customer.NOMP} {customer.PRENOMP}</CustomerName>
                <span>NSS: {customer.NSS}</span>
              </CustomerInfo>
            </CustomerHeader>

            <CustomerDetails>
              <DetailItem>
                <FaEnvelope />
                <span>{customer.UTILISATEUR?.EMAIL}</span>
              </DetailItem>
              <DetailItem>
                <FaPhone />
                <span>{customer.UTILISATEUR?.NUMTEL}</span>
              </DetailItem>
              <DetailItem>
                <FaMapMarkerAlt />
                <span>{customer.UTILISATEUR?.ADRESSE}</span>
              </DetailItem>
            </CustomerDetails>

            <Button
              variant="outline"
              fullWidth
              style={{ marginTop: theme.spacing[4] }}
            >
              View Profile
            </Button>
          </CustomerCard>
        ))}
      </CustomersGrid>
    </PageContainer>
  );
};

export default CustomersPage;