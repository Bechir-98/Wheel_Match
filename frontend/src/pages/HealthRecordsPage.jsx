import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaFileMedical, FaNotesMedical } from 'react-icons/fa';
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

const RecordsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing[6]};
`;

const RecordCard = styled(Card)`
  padding: ${theme.spacing[4]};
`;

const RecordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
`;

const RecordInfo = styled.div`
  margin-bottom: ${theme.spacing[4]};
`;

const PatientInfo = styled.div`
  background-color: ${theme.colors.primary[50]};
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing[4]};
`;

const InfoItem = styled.div`
  margin-bottom: ${theme.spacing[2]};
  
  strong {
    color: ${theme.colors.primary[700]};
  }
`;

const HealthRecordsPage = () => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('PATIENT')
        .select(`
          *,
          CONSULTATION (
            NUM_CONSULTATION,
            DATE_CONSULTATION,
            PATHOLOGIE (
              NOM_PAT,
              DESCRIPTION
            )
          )
        `)
        .eq('ID_UTILISATUER', user.id)
        .single();

      if (error) throw error;
      setPatientData(data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!patientData) {
    return <div>No patient data found</div>;
  }

  return (
    <PageContainer>
      <Title>Health Records</Title>
      
      <PatientInfo>
        <InfoItem>
          <strong>Name:</strong> {patientData.NOMP} {patientData.PRENOMP}
        </InfoItem>
        <InfoItem>
          <strong>Social Security Number:</strong> {patientData.NSS}
        </InfoItem>
        <InfoItem>
          <strong>Weight:</strong> {patientData.POIDS} kg
        </InfoItem>
        <InfoItem>
          <strong>Height:</strong> {patientData.TAILLE} cm
        </InfoItem>
        <InfoItem>
          <strong>Usage Type:</strong> {patientData.UTILISATION_PRPL}
        </InfoItem>
      </PatientInfo>
      
      <RecordsGrid>
        {patientData.CONSULTATION?.map((consultation) => (
          <RecordCard key={consultation.NUM_CONSULTATION}>
            <RecordHeader>
              <FaFileMedical size={24} color={theme.colors.primary[500]} />
              <Button variant="outline" size="sm">View Details</Button>
            </RecordHeader>
            
            <RecordInfo>
              <h3>Consultation Record</h3>
              <p>Date: {new Date(consultation.DATE_CONSULTATION).toLocaleDateString()}</p>
              <p>Pathology: {consultation.PATHOLOGIE.NOM_PAT}</p>
              <p>Description: {consultation.PATHOLOGIE.DESCRIPTION}</p>
            </RecordInfo>
          </RecordCard>
        ))}
      </RecordsGrid>
    </PageContainer>
  );
};

export default HealthRecordsPage;