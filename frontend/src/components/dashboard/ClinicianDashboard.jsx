import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaUserMd, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaChartLine, 
  FaBell, 
  FaCog, 
  FaSignOutAlt,
  FaWheelchair,
  FaUser,
  FaClock,
  FaUserCircle,
  FaStethoscope,
  FaUsers,
  FaClipboard
} from 'react-icons/fa';
import theme from '../../styles/theme';
import Card from '../common/Card';
import Button from '../common/Button';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  min-height: calc(100vh - 76px);
  
  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 250px 1fr;
  }
`;

const Sidebar = styled(motion.aside)`
  background-color: ${theme.colors.white};
  border-right: 1px solid ${theme.colors.neutral[200]};
  padding: ${theme.spacing[4]};
  display: none;
  
  @media (min-width: ${theme.breakpoints.lg}) {
    display: block;
  }
`;

const MainContent = styled.main`
  padding: ${theme.spacing[6]};
  background-color: ${theme.colors.neutral[50]};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing[6]};
`;

const AppointmentCard = styled(Card)`
  padding: ${theme.spacing[4]};
`;

const PatientList = styled.div`
  margin-top: ${theme.spacing[6]};
`;

const PatientItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing[4]};
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing[3]};
  box-shadow: ${theme.shadows.sm};
`;

const PatientAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing[4]};
  
  svg {
    color: ${theme.colors.primary[500]};
    font-size: ${theme.typography.fontSize.xl};
  }
`;

const PatientInfo = styled.div`
  flex: 1;
  margin-left: ${theme.spacing[3]};
`;

const PatientName = styled.h4`
  font-size: ${theme.typography.fontSize.lg};
  margin-bottom: ${theme.spacing[1]};
`;

const PatientDetails = styled.div`
  color: ${theme.colors.neutral[600]};
  font-size: ${theme.typography.fontSize.sm};
`;

const ConsultationCard = styled(Card)`
  margin-bottom: ${theme.spacing[4]};
`;

const ConsultationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing[4]};
`;

const PatientConsultation = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.neutral[200]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing[2]};
`;

const ConsultationTime = styled.div`
  color: ${theme.colors.primary[500]};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing[4]};
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary[500]};
  margin-bottom: ${theme.spacing[2]};
`;

const StatLabel = styled.div`
  color: ${theme.colors.neutral[600]};
  font-size: ${theme.typography.fontSize.sm};
`;

const UserSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing[4]} 0;
  border-bottom: 1px solid ${theme.colors.neutral[200]};
  margin-bottom: ${theme.spacing[4]};
`;

const UserAvatar = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing[3]};
  
  svg {
    font-size: ${theme.typography.fontSize['3xl']};
    color: ${theme.colors.primary[500]};
  }
`;

const UserName = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing[1]};
`;

const UserRole = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.neutral[600]};
  margin-bottom: ${theme.spacing[3]};
`;

const Navigation = styled.nav`
  margin-bottom: ${theme.spacing[6]};
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled(motion.li)`
  margin-bottom: ${theme.spacing[1]};
`;

const NavLink = styled.a`
  display: flex;
  align-items: center;
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  color: ${props => props.active ? theme.colors.primary[500] : theme.colors.neutral[700]};
  font-weight: ${props => props.active ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal};
  background-color: ${props => props.active ? theme.colors.primary[50] : 'transparent'};
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.default};
  text-decoration: none;
  
  &:hover {
    background-color: ${props => props.active ? theme.colors.primary[50] : theme.colors.neutral[100]};
    color: ${props => props.active ? theme.colors.primary[500] : theme.colors.neutral[900]};
  }
  
  svg {
    margin-right: ${theme.spacing[3]};
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const ClinicianDashboard = () => {
  const todayConsultations = [
    {
      id: 1,
      patient: {
        id: 1,
        nom: "Sarah Johnson",
        prenom: "Sarah",
        age: 35
      },
      time: "10:00 AM",
      type: "Initial Assessment",
      status: "Confirmed"
    },
    {
      id: 2,
      patient: {
        id: 2,
        nom: "Michael Brown",
        prenom: "Michael",
        age: 42
      },
      time: "11:30 AM",
      type: "Follow-up",
      status: "Confirmed"
    }
  ];

  const stats = {
    totalPatients: 128,
    consultationsThisMonth: 45,
    averageRating: 4.8,
    pendingAssessments: 12
  };

  return (
    <DashboardContainer>
      <Sidebar
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <UserSection>
          <UserAvatar>
            <FaUserCircle />
          </UserAvatar>
          <UserName>Dr. Smith</UserName>
          <UserRole>Wheelchair Specialist</UserRole>
          <Button
            variant="outline"
            size="sm"
            icon={<FaSignOutAlt />}
            iconPosition="left"
          >
            Logout
          </Button>
        </UserSection>
        
        <Navigation>
          <NavList>
            {[
              { icon: <FaChartLine />, label: 'Dashboard', active: true },
              { icon: <FaCalendarAlt />, label: 'Consultations', active: false },
              { icon: <FaUsers />, label: 'Patients', active: false },
              { icon: <FaClipboard />, label: 'Assessments', active: false },
              { icon: <FaStethoscope />, label: 'Prescriptions', active: false },
              { icon: <FaCog />, label: 'Settings', active: false }
            ].map((item, index) => (
              <NavItem key={index}>
                <NavLink href="#" active={item.active}>
                  {item.icon}
                  {item.label}
                </NavLink>
              </NavItem>
            ))}
          </NavList>
        </Navigation>
      </Sidebar>

      <MainContent>
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalPatients}</StatValue>
            <StatLabel>Total Patients</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{stats.consultationsThisMonth}</StatValue>
            <StatLabel>Consultations This Month</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{stats.averageRating}</StatValue>
            <StatLabel>Average Rating</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{stats.pendingAssessments}</StatValue>
            <StatLabel>Pending Assessments</StatLabel>
          </StatCard>
        </StatsGrid>

        <ConsultationGrid>
          <Card>
            <h3>Today's Consultations</h3>
            {todayConsultations.map((consultation) => (
              <PatientConsultation key={consultation.id}>
                <FaUser size={24} color={theme.colors.primary[500]} />
                <PatientInfo>
                  <h4>{`${consultation.patient.prenom} ${consultation.patient.nom}`}</h4>
                  <p>{consultation.type}</p>
                </PatientInfo>
                <ConsultationTime>
                  {consultation.time}
                </ConsultationTime>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ marginLeft: theme.spacing[3] }}
                >
                  View Details
                </Button>
              </PatientConsultation>
            ))}
          </Card>

          <Card>
            <h3>Recent Assessments</h3>
            {/* Add assessment list based on MCD */}
          </Card>
        </ConsultationGrid>

        <Card style={{ marginTop: theme.spacing[6] }}>
          <h3>Patient Statistics</h3>
          {/* Add patient statistics visualization */}
        </Card>
      </MainContent>
    </DashboardContainer>
  );
};

export default ClinicianDashboard;