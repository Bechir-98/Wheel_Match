import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaWheelchair, FaCog, FaHistory } from 'react-icons/fa';
import theme from '../styles/theme';
import Card from '../components/common/Card';
import Button from '../components/common/Button';


const PageContainer = styled.div`
  padding: ${theme.spacing[6]};
  background-color: ${theme.colors.background.light};
`;

const Title = styled.h1`
  margin-bottom: ${theme.spacing[6]};
  color: ${theme.colors.neutral[900]};
`;

const WheelchairsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing[6]};
`;

const WheelchairCard = styled(Card)`
  padding: ${theme.spacing[4]};
`;

const WheelchairHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
`;

const WheelchairInfo = styled.div`
  margin-bottom: ${theme.spacing[4]};
`;

const WheelchairType = styled.div`
  color: ${theme.colors.primary[500]};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing[2]};
`;

const WheelchairDetails = styled.div`
  color: ${theme.colors.neutral[600]};
`;

const SpecsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[4]};
`;

const SpecItem = styled.div`
  background-color: ${theme.colors.neutral[100]};
  padding: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  
  span:first-child {
    display: block;
    font-size: ${theme.typography.fontSize.sm};
    color: ${theme.colors.neutral[500]};
  }
  
  span:last-child {
    font-weight: ${theme.typography.fontWeight.medium};
    color: ${theme.colors.neutral[900]};
  }
`;

const MyWheelchairsPage = () => {
  const [wheelchairs, setWheelchairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWheelchairs();
  }, []);

  const fetchWheelchairs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('FAUTEUIL')
        .select(`
          *,
          TYPE_FAUTEUIL (
            NOM_TYPE
          ),
          COMPOSER_DE (
            COMPOSANT (
              NOM_COMP,
              TAILLE_COMP
            )
          ),
          AVOIR__OPTION (
            OPTION (
              NOM_OPTION,
              TAILLE_OPTION
            )
          )
        `)
        .eq('ID_UTILISATUER', user.id);

      if (error) throw error;
      setWheelchairs(data || []);
    } catch (error) {
      console.error('Error fetching wheelchairs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <Title>My Wheelchairs</Title>
      
      <WheelchairsGrid>
        {wheelchairs.map((wheelchair) => (
          <WheelchairCard key={wheelchair.ID_FAUTEUIL}>
            <WheelchairHeader>
              <FaWheelchair size={24} color={theme.colors.primary[500]} />
              <Button variant="outline" size="sm">Maintenance History</Button>
            </WheelchairHeader>
            
            <WheelchairInfo>
              <WheelchairType>
                {wheelchair.TYPE_FAUTEUIL.NOM_TYPE}
              </WheelchairType>
              
              <WheelchairDetails>
                <p>
                  <strong>Propulsion:</strong> {wheelchair.PROPULTION ? 'Electric' : 'Manual'}
                </p>
                <p>
                  <strong>Price:</strong> ${wheelchair.PRIX}
                </p>
              </WheelchairDetails>
            </WheelchairInfo>
            
            <SpecsList>
              {wheelchair.COMPOSER_DE?.map((component, index) => (
                <SpecItem key={index}>
                  <span>{component.COMPOSANT.NOM_COMP}</span>
                  <span>{component.COMPOSANT.TAILLE_COMP} cm</span>
                </SpecItem>
              ))}
            </SpecsList>
            
            <Button
              variant="primary"
              fullWidth
              icon={<FaCog />}
              style={{ marginTop: theme.spacing[4] }}
            >
              Manage Wheelchair
            </Button>
          </WheelchairCard>
        ))}
      </WheelchairsGrid>
    </PageContainer>
  );
};

export default MyWheelchairsPage;