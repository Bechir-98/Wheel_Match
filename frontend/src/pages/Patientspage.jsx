import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUser, FaWeight, FaRulerVertical, FaWheelchair, FaUserNurse } from 'react-icons/fa';
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

const PatientsGrid = styled.div`
  display: grid;
  gap: ${theme.spacing[4]};
`;

const PatientCard = styled(Card)`
  padding: ${theme.spacing[4]};
`;

const PatientHeader = styled.div`
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

const PatientInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.h3`
  margin-bottom: ${theme.spacing[1]};
  color: ${theme.colors.neutral[900]};
`;

const PatientDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[4]};
`;

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('PATIENT')
        .select(`
          *,
          UTILISATEUR (*),
          CONSULTATION (
            NUM_CONSULTATION,
            DATE_CONSULTATION,
            CLINICIEN (
              NOMC,
              PRENOMC,
              SPECIALITE
            )
          )
        `);

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
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
        <Title>Patients</Title>
      </Header>

      <PatientsGrid>
        {patients.map((patient) => (
          <PatientCard key={patient.ID_UTILISATUER}>
            <PatientHeader>
              <Avatar>
                <FaUser />
              </Avatar>
              <PatientInfo>
                <PatientName>{patient.NOMP} {patient.PRENOMP}</PatientName>
                <span>NSS: {patient.NSS}</span>
              </PatientInfo>
            </PatientHeader>

            <PatientDetails>
              <DetailItem>
                <FaWeight />
                <span>{patient.POIDS} kg</span>
              </DetailItem>
              <DetailItem>
                <FaRulerVertical />
                <span>{patient.TAILLE} cm</span>
              </DetailItem>
              <DetailItem>
                <FaWheelchair />
                <span>{patient.UTILISATION_PRPL}</span>
              </DetailItem>
              <DetailItem>
                <FaUserNurse />
                <span>Caregiver: {patient.AIDANT ? 'Yes' : 'No'}</span>
              </DetailItem>
            </PatientDetails>

            <ButtonGroup>
              <Button
                variant="primary"
                icon={<FaUserNurse />}
              >
                View Medical History
              </Button>
              <Button
                variant="outline"
                icon={<FaWheelchair />}
              >
                View Prescriptions
              </Button>
            </ButtonGroup>
          </PatientCard>
        ))}
      </PatientsGrid>
    </PageContainer>
  );
};

export default PatientsPage;