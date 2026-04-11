import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaWheelchair, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
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

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing[6]};
`;

const ProductCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
`;

const ProductContent = styled.div`
  padding: ${theme.spacing[4]};
`;

const ProductName = styled.h3`
  margin-bottom: ${theme.spacing[2]};
  color: ${theme.colors.neutral[900]};
`;

const ProductPrice = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary[500]};
  margin-bottom: ${theme.spacing[3]};
`;

const ProductStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
`;

const StatItem = styled.div`
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

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-top: auto;
`;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
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
            COMPOSANT (*)
          ),
          AVOIR__OPTION (
            OPTION (*)
          )
        `)
        .eq('ID_UTILISATUER', user.id);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    // Implement add product functionality
  };

  const handleEditProduct = (productId) => {
    // Implement edit product functionality
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from('FAUTEUIL')
        .delete()
        .eq('ID_FAUTEUIL', productId);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <Header>
        <Title>Products</Title>
        <Button
          variant="primary"
          icon={<FaPlus />}
          onClick={handleAddProduct}
        >
          Add Product
        </Button>
      </Header>

      <ProductsGrid>
        {products.map((product) => (
          <ProductCard key={product.ID_FAUTEUIL}>
            <ProductImage
              src="https://images.unsplash.com/photo-1618498082410-b4aa22193b38?auto=format&fit=crop&w=800&q=80"
              alt={product.TYPE_FAUTEUIL?.NOM_TYPE}
            />
            <ProductContent>
              <ProductName>{product.TYPE_FAUTEUIL?.NOM_TYPE}</ProductName>
              <ProductPrice>${product.PRIX}</ProductPrice>

              <ProductStats>
                <StatItem>
                  <span>Stock</span>
                  <span>{product.QT_STOCK}</span>
                </StatItem>
                <StatItem>
                  <span>Type</span>
                  <span>{product.PROPULTION ? 'Electric' : 'Manual'}</span>
                </StatItem>
              </ProductStats>

              <ButtonGroup>
                <Button
                  variant="outline"
                  icon={<FaEdit />}
                  onClick={() => handleEditProduct(product.ID_FAUTEUIL)}
                >
                  Edit
                </Button>
                <Button
                  variant="error"
                  icon={<FaTrash />}
                  onClick={() => handleDeleteProduct(product.ID_FAUTEUIL)}
                >
                  Delete
                </Button>
              </ButtonGroup>
            </ProductContent>
          </ProductCard>
        ))}
      </ProductsGrid>
    </PageContainer>
  );
};

export default ProductsPage;