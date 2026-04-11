import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaBox, 
  FaChartLine, 
  FaClipboardList, 
  FaUsers, 
  FaBell, 
  FaCog, 
  FaSignOutAlt,
  FaWheelchair,
  FaShoppingCart,
  FaExchangeAlt,
  FaEdit,
  FaUserCircle
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

const StatsCard = styled(Card)`
  padding: ${theme.spacing[4]};
`;

const StatValue = styled.h3`
  font-size: ${theme.typography.fontSize['3xl']};
  color: ${theme.colors.primary[500]};
  margin-bottom: ${theme.spacing[2]};
`;

const StatLabel = styled.p`
  color: ${theme.colors.neutral[600]};
  font-size: ${theme.typography.fontSize.sm};
`;

const ProductList = styled.div`
  margin-top: ${theme.spacing[6]};
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing[4]};
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing[3]};
  box-shadow: ${theme.shadows.sm};
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.md};
  object-fit: cover;
  margin-right: ${theme.spacing[4]};
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.h4`
  font-size: ${theme.typography.fontSize.lg};
  margin-bottom: ${theme.spacing[1]};
`;

const ProductStats = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  color: ${theme.colors.neutral[600]};
  font-size: ${theme.typography.fontSize.sm};
`;

const ProductCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const ProductContent = styled.div`
  padding: ${theme.spacing[4]};
`;

const StatItem = styled.div`
  text-align: center;
  
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

const OrdersSection = styled.div`
  margin-top: ${theme.spacing[6]};
`;

const OrderCard = styled(Card)`
  display: flex;
  align-items: center;
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[3]};
`;

const OrderInfo = styled.div`
  flex: 1;
  margin-left: ${theme.spacing[4]};
`;

const OrderStatus = styled.span`
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  background-color: ${props => 
    props.status === 'completed' ? theme.colors.success.light :
    props.status === 'pending' ? theme.colors.warning.light :
    theme.colors.neutral[100]};
  color: ${props => 
    props.status === 'completed' ? theme.colors.success.main :
    props.status === 'pending' ? theme.colors.warning.main :
    theme.colors.neutral[700]};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing[6]};
  margin-top: ${theme.spacing[4]};
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

const VendorDashboard = () => {
  const products = [
    {
      id: 1,
      nom: "Ultra Lightweight Pro",
      type: "Manual",
      prix: 1299.99,
      stock: 24,
      orders: 12,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1618498082410-b4aa22193b38?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      nom: "Power Elite X500",
      type: "Electric",
      prix: 2999.99,
      stock: 15,
      orders: 8,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1618498082410-b4aa22193b38?auto=format&fit=crop&w=800&q=80"
    }
  ];

  const recentOrders = [
    {
      id: 1,
      product: "Ultra Lightweight Pro",
      customer: "Sarah Johnson",
      date: "2025-04-15",
      status: "completed",
      amount: 1299.99
    },
    {
      id: 2,
      product: "Power Elite X500",
      customer: "Michael Brown",
      date: "2025-04-14",
      status: "pending",
      amount: 2999.99
    }
  ];

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
          <UserName>Vendor Name</UserName>
          <UserRole>Medical Equipment Vendor</UserRole>
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
              { icon: <FaWheelchair />, label: 'Products', active: false },
              { icon: <FaShoppingCart />, label: 'Orders', active: false },
              { icon: <FaUsers />, label: 'Customers', active: false },
              { icon: <FaChartLine />, label: 'Analytics', active: false },
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
        <ContentGrid>
          <StatsCard>
            <StatValue>152</StatValue>
            <StatLabel>Active Products</StatLabel>
          </StatsCard>
          
          <StatsCard>
            <StatValue>$24,500</StatValue>
            <StatLabel>Monthly Revenue</StatLabel>
          </StatsCard>
          
          <StatsCard>
            <StatValue>48</StatValue>
            <StatLabel>Pending Orders</StatLabel>
          </StatsCard>
          
          <StatsCard>
            <StatValue>4.8</StatValue>
            <StatLabel>Average Rating</StatLabel>
          </StatsCard>
        </ContentGrid>

        <h2>Product Catalog</h2>
        <Grid>
          {products.map(product => (
            <ProductCard key={product.id}>
              <ProductImage src={product.image} alt={product.nom} />
              <ProductContent>
                <h3>{product.nom}</h3>
                <p>{product.type}</p>
                <div style={{ color: theme.colors.primary[500], fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold }}>
                  ${product.prix}
                </div>
                
                <ProductStats>
                  <StatItem>
                    <span>Stock</span>
                    <span>{product.stock}</span>
                  </StatItem>
                  <StatItem>
                    <span>Orders</span>
                    <span>{product.orders}</span>
                  </StatItem>
                  <StatItem>
                    <span>Rating</span>
                    <span>{product.rating}</span>
                  </StatItem>
                </ProductStats>
                
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  icon={<FaEdit />}
                >
                  Edit Product
                </Button>
              </ProductContent>
            </ProductCard>
          ))}
        </Grid>

        <OrdersSection>
          <h2>Recent Orders</h2>
          {recentOrders.map(order => (
            <OrderCard key={order.id}>
              <FaShoppingCart size={24} color={theme.colors.primary[500]} />
              <OrderInfo>
                <h4>{order.product}</h4>
                <p>Customer: {order.customer}</p>
                <p>Date: {order.date}</p>
              </OrderInfo>
              <OrderStatus status={order.status}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </OrderStatus>
              <div style={{ marginLeft: theme.spacing[4] }}>
                ${order.amount}
              </div>
              <Button
                variant="outline"
                size="sm"
                style={{ marginLeft: theme.spacing[4] }}
              >
                View Details
              </Button>
            </OrderCard>
          ))}
        </OrdersSection>
      </MainContent>
    </DashboardContainer>
  );
};

export default VendorDashboard;