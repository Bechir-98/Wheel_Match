import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUserMd, FaClipboardList } from 'react-icons/fa';
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

const ConsultationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing[6]};
`;

const ConsultationCard = styled(Card)`
  padding: ${theme.spacing[4]};
`;

const ConsultationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
`;

const ConsultationInfo = styled.div`
  margin-bottom: ${theme.spacing[4]};
`;

const ConsultationDate = styled.div`
  color: ${theme.colors.primary[500]};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing[2]};
`;

const ConsultationDetails = styled.div`
  color: ${theme.colors.neutral[600]};
`;

const ConsultationsPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('CONSULTATION')
        .select(`
          *,
          CLINICIEN (
            NOMC,
            PRENOMC,
            SPECIALITE
          ),
          PATHOLOGIE (
            NOM_PAT,
            DESCRIPTION
          ),
          MORPHOLOGIE (
            NOM_MORPH
          )
        `)
        .eq('PAT_ID_UTILISATUER', user.id)
        .order('DATE_CONSULTATION', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <Title>My Consultations</Title>
      
      <ConsultationsGrid>
        {consultations.map((consultation) => (
          <ConsultationCard key={consultation.NUM_CONSULTATION}>
            <ConsultationHeader>
              <FaCalendarAlt size={24} color={theme.colors.primary[500]} />
              <Button variant="outline" size="sm">View Details</Button>
            </ConsultationHeader>
            
            <ConsultationInfo>
              <ConsultationDate>
                {new Date(consultation.DATE_CONSULTATION).toLocaleDateString()}
              </ConsultationDate>
              
              <ConsultationDetails>
                <p>
                  <strong>Clinician:</strong> {consultation.CLINICIEN.PRENOMC} {consultation.CLINICIEN.NOMC}
                </p>
                <p>
                  <strong>Speciality:</strong> {consultation.CLINICIEN.SPECIALITE}
                </p>
                <p>
                  <strong>Pathology:</strong> {consultation.PATHOLOGIE.NOM_PAT}
                </p>
                <p>
                  <strong>Morphology:</strong> {consultation.MORPHOLOGIE.NOM_MORPH}
                </p>
              </ConsultationDetails>
            </ConsultationInfo>
          </ConsultationCard>
        ))}
      </ConsultationsGrid>
    </PageContainer>
  );
};

export default ConsultationsPage;