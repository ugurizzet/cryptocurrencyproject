import React, { useEffect, useState } from 'react';
import { Table, Layout, Breadcrumb, Card, InputNumber, Button, Modal, Form, message } from 'antd';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import 'antd/dist/antd.css';

const { Content, Footer } = Layout;

const WalletPage = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem('balance');
    return savedBalance ? parseFloat(savedBalance) : 10000; // Initial virtual balance
  });
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSellMode, setIsSellMode] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get('https://api.coinranking.com/v2/coins', {
          headers: {
            'x-access-token': process.env.REACT_APP_RAPIDAPI_KEY
          }
        });
        setCoins(response.data.data.coins);
      } catch (error) {
        console.error('Error fetching the coin data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  useEffect(() => {
    localStorage.setItem('balance', balance);
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleTransaction = (values) => {
    const { quantity } = values;
    const cost = selectedCoin.price * quantity;

    if (isSellMode) {
      // Selling coins
      const ownedQuantity = transactions.filter(transaction => transaction.coin === selectedCoin.name && transaction.type === 'buy')
                                         .reduce((acc, transaction) => acc + transaction.quantity, 0);
      const soldQuantity = transactions.filter(transaction => transaction.coin === selectedCoin.name && transaction.type === 'sell')
                                       .reduce((acc, transaction) => acc + transaction.quantity, 0);
      const netOwned = ownedQuantity - soldQuantity;

      if (quantity > netOwned) {
        message.error('Insufficient coin quantity to sell');
        return;
      }

      setBalance(balance + cost);
      setTransactions([...transactions, {
        id: uuidv4(),
        type: 'sell',
        coin: selectedCoin.name,
        quantity,
        price: selectedCoin.price,
        date: moment().format('YYYY-MM-DD HH:mm:ss')
      }]);
    } else {
      // Buying coins
      if (cost > balance) {
        message.error('Insufficient balance');
        return;
      }

      setBalance(balance - cost);
      setTransactions([...transactions, {
        id: uuidv4(),
        type: 'buy',
        coin: selectedCoin.name,
        quantity,
        price: selectedCoin.price,
        date: moment().format('YYYY-MM-DD HH:mm:ss')
      }]);
    }

    setIsModalVisible(false);
    form.resetFields();
    message.success('Transaction successful');
  };

  const showModal = (coin, mode) => {
    setSelectedCoin(coin);
    setIsSellMode(mode === 'sell');
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: price => `$${parseFloat(price).toFixed(2)}`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => showModal(record, 'buy')}>Buy</Button>
      ),
    },
  ];

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
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="danger" onClick={() => showModal(record, 'sell')}>Sell</Button>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: type => (type === 'buy' ? 'Buy' : 'Sell'),
    },
    {
      title: 'Coin',
      dataIndex: 'coin',
      key: 'coin',
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
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  return (
    <Layout className="layout">
      <Content style={{ padding: '0 50px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Wallet</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-content">
          <Card title="Crypto Wallet" bordered={false} style={{ marginBottom: 20 }}>
            <p>Balance: ${balance.toFixed(2)}</p>
            <Table dataSource={coins} columns={columns} rowKey={record => uuidv4()} loading={loading} />
          </Card>
          <Card title="Owned Coins" bordered={false} style={{ marginBottom: 20 }}>
            <Table dataSource={ownedCoins} columns={ownedColumns} rowKey={record => uuidv4()} />
          </Card>
          <Card title="Transaction History" bordered={false} style={{ marginTop: 20 }}>
            <Table dataSource={transactions} columns={transactionColumns} rowKey={record => record.id} />
          </Card>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Crypto Wallet ©2024 Created by You</Footer>

      <Modal title={isSellMode ? "Sell Coin" : "Buy Coin"} visible={isModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} onFinish={handleTransaction}>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true, message: 'Please input the quantity!' }]}>
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">{isSellMode ? 'Sell' : 'Buy'}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default WalletPage;
