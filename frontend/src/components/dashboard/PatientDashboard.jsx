import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaFileAlt, 
  FaComment, 
  FaLightbulb, 
  FaSignOutAlt, 
  FaUserCircle,
  FaWheelchair,
  FaUserMd,
  FaClock,
  FaHeartbeat,
  FaClipboard,
  FaCog,
  FaChartLine
} from 'react-icons/fa';
import theme from '../../styles/theme';
import Card from '../common/Card';
import Button from '../common/Button';

// Dashboard container
const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  min-height: calc(100vh - 76px); /* Account for navbar */
  
  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 250px 1fr;
  }
`;

// Sidebar
const Sidebar = styled(motion.aside)`
  background-color: ${theme.colors.white};
  border-right: 1px solid ${theme.colors.neutral[200]};
  padding: ${theme.spacing[4]};
  display: none;
  
  @media (min-width: ${theme.breakpoints.lg}) {
    display: block;
  }
`;

// Sidebar user section
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

// Main content
const MainContent = styled.main`
  padding: ${theme.spacing[4]};
  background-color: ${theme.colors.neutral[50]};
  
  @media (min-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[6]};
  }
`;

// Mobile header (visible on small screens)
const MobileHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[4]};
  background-color: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.neutral[200]};
  margin-bottom: ${theme.spacing[4]};
  
  @media (min-width: ${theme.breakpoints.lg}) {
    display: none;
  }
`;

// Mobile user info
const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
`;

// Mobile avatar
const MobileAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing[3]};
  
  svg {
    font-size: ${theme.typography.fontSize['2xl']};
    color: ${theme.colors.primary[500]};
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: ${theme.borderRadius.full};
  }
`;

// Content wrapper
const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing[6]};
  
  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: 2fr 1fr;
  }
`;

// Left column
const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

// Right column
const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

// Section title
const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing[4]};
  color: ${theme.colors.neutral[900]};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${theme.spacing[2]};
    color: ${theme.colors.primary[500]};
  }
`;

// Appointment card
const AppointmentCard = styled(Card)`
  margin-bottom: ${theme.spacing[4]};
`;

// Appointment details
const AppointmentDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[3]};
`;

// Appointment info
const AppointmentInfo = styled.div`
  flex: 1;
`;

// Appointment title
const AppointmentTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing[1]};
  color: ${theme.colors.neutral[900]};
`;

// Appointment date
const AppointmentDate = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.neutral[700]};
`;

// Appointment time
const AppointmentTime = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.neutral[600]};
`;

// Record list
const RecordList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${theme.spacing[3]} 0;
`;

// Record item
const RecordItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.neutral[800]};
  
  &:before {
    content: '✓';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: ${theme.colors.success.light};
    color: ${theme.colors.success.main};
    border-radius: ${theme.borderRadius.full};
    margin-right: ${theme.spacing[2]};
    font-size: ${theme.typography.fontSize.sm};
  }
`;

// Message preview
const MessagePreview = styled.div`
  background-color: ${theme.colors.neutral[100]};
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  margin: ${theme.spacing[3]} 0;
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.neutral[800]};
  border-left: 4px solid ${theme.colors.primary[500]};
`;

// Health tip
const HealthTip = styled.div`
  background-color: ${theme.colors.primary[50]};
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  margin: ${theme.spacing[3]} 0;
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.neutral[800]};
  border-left: 4px solid ${theme.colors.primary[500]};
  display: flex;
  align-items: flex-start;
  
  svg {
    font-size: ${theme.typography.fontSize.xl};
    color: ${theme.colors.primary[500]};
    margin-right: ${theme.spacing[2]};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const ConsultationCard = styled(Card)`
  margin-bottom: ${theme.spacing[4]};
`;

const ConsultationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
`;

const ConsultationInfo = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[3]};
`;

const ConsultationDetail = styled.div`
  display: flex;
  flex-direction: column;
  
  span:first-child {
    font-weight: ${theme.typography.fontWeight.medium};
    color: ${theme.colors.neutral[700]};
  }
  
  span:last-child {
    color: ${theme.colors.neutral[500]};
  }
`;

const WheelchairSection = styled.div`
  margin-top: ${theme.spacing[6]};
`;

const WheelchairCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
  padding: ${theme.spacing[4]};
`;

const WheelchairInfo = styled.div`
  flex: 1;
`;

const WheelchairSpecs = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[3]};
`;

const SpecItem = styled.div`
  background-color: ${theme.colors.neutral[50]};
  padding: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  
  span:first-child {
    font-size: ${theme.typography.fontSize.sm};
    color: ${theme.colors.neutral[500]};
    display: block;
  }
  
  span:last-child {
    font-weight: ${theme.typography.fontWeight.medium};
    color: ${theme.colors.neutral[900]};
  }
`;

const PatientDashboard = () => {
  // Mock data based on MCD relationships
  const consultations = [
    {
      id: 1,
      date: "2025-04-20",
      time: "10:00 AM",
      clinician: {
        id: 1,
        name: "Dr. Smith",
        specialite: "Wheelchair Specialist"
      },
      type: "Initial Assessment",
      notes: "Complete mobility assessment and wheelchair fitting"
    },
    {
      id: 2,
      date: "2025-04-28",
      time: "2:30 PM",
      clinician: {
        id: 2,
        name: "Dr. Johnson",
        specialite: "Physical Therapist"
      },
      type: "Follow-up",
      notes: "Progress evaluation and adjustment recommendations"
    }
  ];

  const currentWheelchair = {
    id: 1,
    nom: "Ultra Lightweight Pro",
    type: "Manual",
    taille: "18 inches",
    poids: "14.5 lbs",
    utilisation_type: "Daily Use",
    date_acquisition: "2025-01-15"
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  const avatarVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };
  
  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2 + (i * 0.1),
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    hover: {
      x: 5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + (i * 0.1),
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <DashboardContainer>
      <Sidebar
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <UserSection>
          <UserAvatar
            variants={avatarVariants}
            whileHover="hover"
          >
            <FaUserCircle />
          </UserAvatar>
          <UserName>Sarah Johnson</UserName>
          <UserRole>Patient</UserRole>
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
              { icon: <FaChartLine />, label: 'Dashboard', active: true, to: '/dashboard' },
              { icon: <FaCalendarAlt />, label: 'Consultations', active: false, to: '/consultations' },
              { icon: <FaWheelchair />, label: 'My Wheelchair', active: false, to: '/wheelchair' },
              { icon: <FaHeartbeat />, label: 'Health Records', active: false, to: '/health-records' },
              { icon: <FaClipboard />, label: 'Assessments', active: false, to: '/assessments' },
              { icon: <FaComment />, label: 'Messages', active: false, to: '/messages' },
              { icon: <FaCog />, label: 'Settings', active: false, to: '/settings' }
            ].map((item, index) => (
              <NavItem
                key={index}
                custom={index}
                variants={navItemVariants}
                whileHover="hover"
              >
                <NavLink as={Link} to={item.to} active={item.active}>
                  {item.icon}
                  {item.label}
                </NavLink>
              </NavItem>
            ))}
          </NavList>
        </Navigation>
      </Sidebar>

      <MainContent>
        <ContentWrapper>
          <LeftColumn>
            <SectionTitle>
              <FaCalendarAlt />
              Upcoming Consultations
            </SectionTitle>
            
            {consultations.map((consultation) => (
              <ConsultationCard key={consultation.id}>
                <ConsultationHeader>
                  <h3>{consultation.type}</h3>
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
                </ConsultationHeader>
                
                <ConsultationInfo>
                  <ConsultationDetail>
                    <span>Date</span>
                    <span>{consultation.date}</span>
                  </ConsultationDetail>
                  
                  <ConsultationDetail>
                    <span>Time</span>
                    <span>{consultation.time}</span>
                  </ConsultationDetail>
                  
                  <ConsultationDetail>
                    <span>Clinician</span>
                    <span>{consultation.clinician.name}</span>
                  </ConsultationDetail>
                  
                  <ConsultationDetail>
                    <span>Specialty</span>
                    <span>{consultation.clinician.specialite}</span>
                  </ConsultationDetail>
                </ConsultationInfo>
                
                <p>{consultation.notes}</p>
              </ConsultationCard>
            ))}

            <WheelchairSection>
              <SectionTitle>
                <FaWheelchair />
                Current Wheelchair
              </SectionTitle>
              
              <WheelchairCard>
                <WheelchairInfo>
                  <h3>{currentWheelchair.nom}</h3>
                  <p>Acquired on: {currentWheelchair.date_acquisition}</p>
                  
                  <WheelchairSpecs>
                    <SpecItem>
                      <span>Type</span>
                      <span>{currentWheelchair.type}</span>
                    </SpecItem>
                    
                    <SpecItem>
                      <span>Size</span>
                      <span>{currentWheelchair.taille}</span>
                    </SpecItem>
                    
                    <SpecItem>
                      <span>Weight</span>
                      <span>{currentWheelchair.poids}</span>
                    </SpecItem>
                    
                    <SpecItem>
                      <span>Usage</span>
                      <span>{currentWheelchair.utilisation_type}</span>
                    </SpecItem>
                  </WheelchairSpecs>
                </WheelchairInfo>
                
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FaFileAlt />}
                >
                  View Details
                </Button>
              </WheelchairCard>
            </WheelchairSection>
          </LeftColumn>

          <RightColumn>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <SectionTitle>
                <FaComment />
                Messages
              </SectionTitle>
              
              <motion.div custom={3} variants={cardVariants}>
                <Card>
                  <p style={{ marginBottom: theme.spacing[3] }}>
                    New message from Dr. Amina
                  </p>
                  
                  <MessagePreview>
                    "Please remember to fast before your blood test appointment. No food or drinks (except water) for 8 hours prior to the test."
                  </MessagePreview>
                  
                  <Button
                    variant="primary"
                    size="md"
                  >
                    Go to Messages
                  </Button>
                </Card>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <SectionTitle>
                <FaLightbulb />
                Daily Health Tip
              </SectionTitle>
              
              <motion.div custom={4} variants={cardVariants}>
                <Card>
                  <HealthTip>
                    <FaLightbulb />
                    <p>
                      Drink at least 2 liters of water daily and aim for 30 minutes of physical activity. It's important to maintain proper hydration and exercise, even when using a wheelchair.
                    </p>
                  </HealthTip>
                  
                  <HealthTip>
                    <FaLightbulb />
                    <p>
                      Remember to inspect your wheelchair regularly for any signs of wear. Regular maintenance can prevent accidents and extend the life of your mobility device.
                    </p>
                  </HealthTip>
                </Card>
              </motion.div>
            </motion.div>
          </RightColumn>
        </ContentWrapper>
      </MainContent>
    </DashboardContainer>
  );
};

export default PatientDashboard;