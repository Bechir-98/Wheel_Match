import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  InputNumber, 
  message, 
  Card, 
  Statistic,
  Space,
  Popconfirm,
  Select,
  Switch,
  Tooltip,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  DollarOutlined
} from '@ant-design/icons';

const mockProducts = [
  {
    ID_FAUTEUIL: 1,
    NOM_TYPE: 'Manual',
    PRIX: 1200,
    QT_STOCK: 10,
    PROPULTION: true,
    ID_TYPE: 1,
    ID_UTILISATEUR: 1,
  },
  {
    ID_FAUTEUIL: 2,
    NOM_TYPE: 'Electric',
    PRIX: 3500,
    QT_STOCK: 5,
    PROPULTION: false,
    ID_TYPE: 2,
    ID_UTILISATEUR: 2,
  },
];

const mockWheelchairTypes = [
  { ID_TYPE: 1, NOM_TYPE: 'Manual' },
  { ID_TYPE: 2, NOM_TYPE: 'Electric' },
];

const mockUsers = [
  { ID_UTILISATEUR: 1, EMAIL: 'user1@example.com' },
  { ID_UTILISATEUR: 2, EMAIL: 'user2@example.com' },
];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [revenue, setRevenue] = useState(0);
  const [wheelchairTypes, setWheelchairTypes] = useState([]);
  const [users, setUsers] = useState([]);

  const columns = [
    {
      title: 'Wheelchair Type',
      dataIndex: 'NOM_TYPE',
      key: 'NOM_TYPE',
    },
    {
      title: 'Price',
      dataIndex: 'PRIX',
      key: 'PRIX',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'QT_STOCK',
      key: 'QT_STOCK',
    },
    {
      title: 'Propulsion',
      dataIndex: 'PROPULTION',
      key: 'PROPULTION',
      render: (propulsion) => propulsion ? 'Yes' : 'No',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this wheelchair?"
            onConfirm={() => handleDelete(record.ID_FAUTEUIL)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchProducts();
    fetchRevenue();
    fetchWheelchairTypes();
    fetchUsers();
  }, []);

  const fetchProducts = () => {
    setProducts(mockProducts);
  };

  const fetchWheelchairTypes = () => {
    setWheelchairTypes(mockWheelchairTypes);
  };

  const fetchUsers = () => {
    setUsers(mockUsers);
  };

  const fetchRevenue = () => {
    const total = mockProducts.reduce((sum, item) => sum + (parseFloat(item.PRIX) || 0), 0);
    setRevenue(total);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalVisible(true);
    form.setFieldsValue({
      ID_TYPE: product.ID_TYPE,
      ID_UTILISATEUR: product.ID_UTILISATEUR,
      PROPULTION: product.PROPULTION,
      PRIX: product.PRIX,
      QT_STOCK: product.QT_STOCK
    });
  };

  const handleDelete = (id) => {
    const updatedProducts = products.filter(p => p.ID_FAUTEUIL !== id);
    setProducts(updatedProducts);
    const total = updatedProducts.reduce((sum, item) => sum + (parseFloat(item.PRIX) || 0), 0);
    setRevenue(total);
    message.success('Wheelchair deleted successfully');
  };

  const handleSubmit = (values) => {
    if (editingProduct) {
      const updatedProducts = products.map(p =>
        p.ID_FAUTEUIL === editingProduct.ID_FAUTEUIL
          ? { ...p, ...values, NOM_TYPE: mockWheelchairTypes.find(t => t.ID_TYPE === values.ID_TYPE)?.NOM_TYPE }
          : p
      );
      setProducts(updatedProducts);
      message.success('Wheelchair updated successfully');
    } else {
      const newProduct = {
        ...values,
        ID_FAUTEUIL: products.length ? Math.max(...products.map(p => p.ID_FAUTEUIL)) + 1 : 1,
        NOM_TYPE: mockWheelchairTypes.find(t => t.ID_TYPE === values.ID_TYPE)?.NOM_TYPE,
      };
      setProducts([...products, newProduct]);
      message.success('Wheelchair added successfully');
    }
    setIsModalVisible(false);
    const total = (editingProduct ? products : [...products, values]).reduce(
      (sum, item) => sum + (parseFloat(item.PRIX) || 0),
      0
    );
    setRevenue(total);
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card
        style={{ marginBottom: '24px', maxWidth: 400 }}
        bordered
        title={<span><DollarOutlined style={{ color: '#3f8600', marginRight: 8 }} />Total Revenue</span>}
      >
        <Statistic
          value={revenue}
          prefix={<DollarOutlined />}
          valueStyle={{ color: '#3f8600' }}
          precision={2}
          suffix="USD"
        />
      </Card>

      <Divider orientation="left" style={{ fontWeight: 'bold' }}>Wheelchairs Inventory</Divider>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
          size="large"
        >
          Add Wheelchair
        </Button>
      </div>

      <Table 
        columns={columns.map(col => {
          if (col.key === 'actions') {
            return {
              ...col,
              render: (_, record) => (
                <Space>
                  <Tooltip title="Edit">
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />} 
                      onClick={() => handleEdit(record)}
                      size="small"
                    />
                  </Tooltip>
                  <Popconfirm
                    title="Are you sure you want to delete this wheelchair?"
                    onConfirm={() => handleDelete(record.ID_FAUTEUIL)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Tooltip title="Delete">
                      <Button danger icon={<DeleteOutlined />} size="small" />
                    </Tooltip>
                  </Popconfirm>
                </Space>
              ),
            };
          }
          return col;
        })}
        dataSource={products} 
        loading={loading}
        rowKey="ID_FAUTEUIL"
        bordered
        pagination={{ pageSize: 5 }}
        size="middle"
        style={{ background: '#fff' }}
      />

      <Modal
        title={
          <span>
            {editingProduct ? <EditOutlined /> : <PlusOutlined />}
            {editingProduct ? ' Edit Wheelchair' : ' Add Wheelchair'}
          </span>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="ID_TYPE"
            label="Wheelchair Type"
            rules={[{ required: true, message: 'Please select wheelchair type!' }]}
          >
            <Select placeholder="Select a type">
              {(Array.isArray(wheelchairTypes) ? wheelchairTypes : []).map(type => (
                <Select.Option key={type.ID_TYPE} value={type.ID_TYPE}>
                  {type.NOM_TYPE}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="ID_UTILISATEUR"
            label="User"
            rules={[{ required: true, message: 'Please select user!' }]}
          >
            <Select placeholder="Select a user">
              {(Array.isArray(users) ? users : []).map(user => (
                <Select.Option key={user.ID_UTILISATEUR} value={user.ID_UTILISATEUR}>
                  {user.EMAIL}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="PROPULTION"
            label="Propulsion"
            valuePropName="checked"
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>

          <Form.Item
            name="PRIX"
            label="Price"
            rules={[{ required: true, message: 'Please input price!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Enter price"
            />
          </Form.Item>

          <Form.Item
            name="QT_STOCK"
            label="Stock Quantity"
            rules={[{ required: true, message: 'Please input stock quantity!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Enter stock quantity" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingProduct ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
