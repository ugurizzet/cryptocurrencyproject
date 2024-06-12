import React, { useState, useEffect } from 'react';
import { Card, Table, Layout, Avatar, Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import 'antd/dist/antd.css';

const { Content, Footer } = Layout;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'Username');
  const [email, setEmail] = useState(() => localStorage.getItem('email') || 'user@example.com');
  const [profilePicture, setProfilePicture] = useState(() => localStorage.getItem('profilePicture') || 'https://www.example.com/profile.jpg');
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    form.setFieldsValue({ username, email });
  }, [username, email, form]);

  const handleSave = () => {
    const values = form.getFieldsValue();
    setUsername(values.username);
    setEmail(values.email);
    localStorage.setItem('username', values.username);
    localStorage.setItem('email', values.email);
    message.success('Profile updated successfully');
    setIsEditing(false);
  };

  const handleProfilePictureChange = (info) => {
    const file = info.file.originFileObj;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setProfilePicture(base64);
      localStorage.setItem('profilePicture', base64);
      message.success('Profile picture updated successfully');
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const ownedCoins = transactions.filter(transaction => transaction.type === 'buy')
    .reduce((acc, transaction) => {
      const coin = acc.find(c => c.name === transaction.coin);
      if (coin) {
        coin.quantity += transaction.quantity;
      } else {
        acc.push({ name: transaction.coin, quantity: transaction.quantity, price: transaction.price });
      }
      return acc;
    }, [])
    .map(coin => {
      const soldQuantity = transactions.filter(transaction => transaction.type === 'sell' && transaction.coin === coin.name)
        .reduce((acc, transaction) => acc + transaction.quantity, 0);
      return { ...coin, quantity: coin.quantity - soldQuantity };
    })
    .filter(coin => coin.quantity > 0);

  const ownedColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: price => `$${parseFloat(price).toFixed(2)}`,
    },
  ];

  return (
    <Layout className="layout">
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Card title="Profile" bordered={false} style={{ marginBottom: 20 }}>
            {isEditing ? (
              <Form form={form} layout="vertical" onFinish={handleSave}>
                <Form.Item name="username" label="Username">
                  <Input />
                </Form.Item>
                <Form.Item name="email" label="E-mail">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleProfilePictureChange}
                  >
                    <Button icon={<UploadOutlined />}>Change Profile Picture</Button>
                  </Upload>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Save</Button>
                  <Button type="default" onClick={() => setIsEditing(false)} style={{ marginLeft: 8 }}>Cancel</Button>
                </Form.Item>
              </Form>
            ) : (
              <div>
                <Avatar size={100} src={profilePicture} />
                <p>Username: {username}</p>
                <p>E-mail: {email}</p>
                <Button type="primary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            )}
          </Card>
          <Card title="Owned Coins" bordered={false}>
            <Table dataSource={ownedCoins} columns={ownedColumns} rowKey={record => uuidv4()} />
          </Card>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Crypto Wallet ©2024 Created by You</Footer>
    </Layout>
  );
};

export default ProfilePage;
