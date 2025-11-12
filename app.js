// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDw_9zFn5DuIBWhgCIpHMapNSxcukTA08",
  authDomain: "sergeichuks-tracker.firebaseapp.com",
  databaseURL: "https://sergeichuks-tracker-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sergeichuks-tracker",
  storageBucket: "sergeichuks-tracker.firebasestorage.app",
  messagingSenderId: "869140856186",
  appId: "1:869140856186:web:1b4840c1b6d08f60ccaac3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const { useState, useEffect } = React;

function CreditTracker() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTransaction, setNewTransaction] = useState({
    type: 'class',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    student: 'Dima',
    note: ''
  });

  const STUDENT_PASSWORD = 'sergeichuks2024';
  const ADMIN_PASSWORD = 'admin2024grigo'; // Change this to your preferred admin password

  useEffect(() => {
    const auth = sessionStorage.getItem('authenticated');
    const role = sessionStorage.getItem('userRole');
    if (auth === 'true' && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    let role = null;
    
    if (passwordInput === ADMIN_PASSWORD) {
      role = 'admin';
    } else if (passwordInput === STUDENT_PASSWORD) {
      role = 'student';
    }
    
    if (role) {
      setIsAuthenticated(true);
      setUserRole(role);
      sessionStorage.setItem('authenticated', 'true');
      sessionStorage.setItem('userRole', role);
      setPasswordInput('');
    } else {
      alert('Incorrect password');
      setPasswordInput('');
    }
  };

  const loadData = () => {
    const dataRef = database.ref('trackerData');
    
    dataRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBalance(data.balance || 0);
        setTransactions(data.transactions || []);
      }
      setLoading(false);
    });
  };

  const saveData = (newBalance, newTransactions) => {
    database.ref('trackerData').set({
      balance: newBalance,
      transactions: newTransactions
    });
  };

  const addTransaction = () => {
    if (!newTransaction.amount) return;
    
    const amount = parseFloat(newTransaction.amount);
    const transaction = {
      id: Date.now(),
      type: newTransaction.type,
      amount: amount,
      date: newTransaction.date,
      student: newTransaction.student,
      note: newTransaction.note,
      timestamp: new Date().toISOString()
    };

    const balanceChange = newTransaction.type === 'class' ? -amount : amount;
    const newBalance = balance + balanceChange;
    const newTransactions = [transaction, ...transactions];
    
    setBalance(newBalance);
    setTransactions(newTransactions);
    saveData(newBalance, newTransactions);
    setNewTransaction({ 
      type: 'class', 
      amount: '', 
      date: new Date().toISOString().split('T')[0],
      student: 'Dima',
      note: '' 
    });
  };

  const deleteTransaction = (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    const transaction = transactions.find(t => t.id === transactionId);
    const balanceChange = transaction.type === 'class' ? transaction.amount : -transaction.amount;
    const newBalance = balance + balanceChange;
    const newTransactions = transactions.filter(t => t.id !== transactionId);

    setBalance(newBalance);
    setTransactions(newTransactions);
    saveData(newBalance, newTransactions);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return React.createElement(
      'div',
      { className: 'min-h-screen bg-gradient-to-br from-yellow-50 to-gray-900 flex items-center justify-center' },
      React.createElement('p', { className: 'text-2xl text-gray-800' }, 'Loading...')
    );
  }

  if (!isAuthenticated) {
    return React.createElement(
      'div',
      { className: 'min-h-screen bg-gradient-to-br from-yellow-50 to-gray-900 flex items-center justify-center p-6' },
      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow-2xl p-8 max-w-md w-full border-4 border-yellow-400' },
        React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 mb-6 text-center' }, 'Sergeichuks'),
        React.createElement(
          'div',
          null,
          React.createElement('label', { className: 'block text-gray-700 font-semibold mb-2' }, 'Enter Password'),
          React.createElement('input', {
            type: 'password',
            value: passwordInput,
            onChange: (e) => setPasswordInput(e.target.value),
            onKeyPress: (e) => e.key === 'Enter' && handleLogin(),
            className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500',
            placeholder: 'Password',
            autoFocus: true
          }),
          React.createElement(
            'button',
            {
              onClick: handleLogin,
              className: 'w-full bg-yellow-400 text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition'
            },
            'Login'
          )
        )
      )
    );
  }

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gradient-to-br from-yellow-50 to-gray-900 p-6' },
    React.createElement(
      'div',
      { className: 'max-w-2xl mx-auto' },
      React.createElement(
        'div',
        { className: 'flex justify-between items-center mb-6' },
        React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, 'Sergeichuks'),
        userRole === 'student' && React.createElement(
          'span',
          { className: 'bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-semibold' },
          'Student View'
        ),
        userRole === 'admin' && React.createElement(
          'span',
          { className: 'bg-gray-800 text-yellow-400 px-4 py-2 rounded-lg font-semibold' },
          'Admin'
        )
      ),
      
      React.createElement(
        'div',
        { className: 'bg-gradient-to-r from-yellow-400 to-gray-800 rounded-lg shadow-lg p-8 text-gray-900 mb-6' },
        React.createElement(
          'div',
          { className: 'flex items-center gap-3' },
          React.createElement('div', { className: 'text-5xl font-bold' }, '€'),
          React.createElement(
            'div',
            null,
            React.createElement('p', { className: 'text-lg opacity-90' }, 'Current Balance'),
            React.createElement('p', { className: 'text-5xl font-bold' }, '€' + balance.toFixed(2))
          )
        )
      ),

      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-yellow-400' },
        React.createElement('h3', { className: 'text-xl font-semibold mb-4 text-gray-800' }, 'Add Transaction'),
        
        userRole === 'student' ? React.createElement(
          'div',
          { className: 'bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center' },
          React.createElement('p', { className: 'text-gray-700 text-lg' }, 'You have view-only access. Contact your teacher to add transactions.')
        ) : React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { className: 'grid grid-cols-2 gap-4 mb-4' },
            React.createElement(
              'button',
              {
                onClick: () => setNewTransaction({...newTransaction, type: 'class'}),
                className: `py-3 rounded-lg font-medium transition ${
                  newTransaction.type === 'class'
                    ? 'bg-gray-800 text-yellow-400'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`
              },
              'Class (Subtract)'
            ),
            React.createElement(
              'button',
              {
                onClick: () => setNewTransaction({...newTransaction, type: 'payment'}),
                className: `py-3 rounded-lg font-medium transition ${
                  newTransaction.type === 'payment'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`
              },
              'Payment (Add)'
            )
          ),

          React.createElement('input', {
            type: 'number',
            placeholder: 'Amount',
            value: newTransaction.amount,
            onChange: (e) => setNewTransaction({...newTransaction, amount: e.target.value}),
            onKeyPress: (e) => e.key === 'Enter' && addTransaction(),
            className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg'
          }),

          React.createElement('input', {
            type: 'date',
            value: newTransaction.date,
            onChange: (e) => setNewTransaction({...newTransaction, date: e.target.value}),
            className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg'
          }),

          React.createElement('select', {
            value: newTransaction.student,
            onChange: (e) => setNewTransaction({...newTransaction, student: e.target.value}),
            className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg'
          },
            React.createElement('option', { value: 'Dima' }, 'Dima'),
            React.createElement('option', { value: 'Lena' }, 'Lena')
          ),

          React.createElement('input', {
            type: 'text',
            placeholder: 'Note (optional)',
            value: newTransaction.note,
            onChange: (e) => setNewTransaction({...newTransaction, note: e.target.value}),
            onKeyPress: (e) => e.key === 'Enter' && addTransaction(),
            className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500'
          }),

          React.createElement(
            'button',
            {
              onClick: addTransaction,
              className: 'w-full bg-yellow-400 text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition text-lg'
            },
            'Add Transaction'
          )
        )
      ),

      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow-lg p-6 border-2 border-yellow-400' },
        React.createElement('h3', { className: 'text-xl font-semibold mb-4 text-gray-800' }, 'Transaction History'),
        
        React.createElement(
          'div',
          { className: 'space-y-2 max-h-96 overflow-y-auto' },
          transactions.length === 0
            ? React.createElement('p', { className: 'text-gray-500 text-center py-8' }, 'No transactions yet')
            : transactions.map(transaction =>
                React.createElement(
                  'div',
                  {
                    key: transaction.id,
                    className: 'flex justify-between items-center p-4 border-2 border-gray-200 rounded-lg hover:bg-yellow-50'
                  },
                  React.createElement(
                    'div',
                    { className: 'flex-1' },
                    React.createElement(
                      'div',
                      { className: 'flex items-center gap-2' },
                      React.createElement(
                        'span',
                        {
                          className: `font-semibold text-lg ${
                            transaction.type === 'class' ? 'text-gray-800' : 'text-yellow-600'
                          }`
                        },
                        (transaction.type === 'class' ? '-' : '+') + '€' + transaction.amount.toFixed(2)
                      ),
                      React.createElement(
                        'span',
                        { className: 'text-sm text-gray-500 uppercase' },
                        transaction.type
                      ),
                      React.createElement(
                        'span',
                        { className: 'text-sm font-semibold text-gray-700 bg-yellow-200 px-2 py-1 rounded' },
                        transaction.student || 'N/A'
                      )
                    ),
                    React.createElement('p', { className: 'text-sm text-gray-600 mt-1' }, formatDate(transaction.date)),
                    transaction.note && React.createElement('p', { className: 'text-sm text-gray-600' }, transaction.note)
                  ),
                  userRole === 'admin' && React.createElement(
                    'button',
                    {
                      onClick: () => deleteTransaction(transaction.id),
                      className: 'text-gray-800 hover:text-red-700 ml-4 text-2xl font-bold'
                    },
                    '×'
                  )
                )
              )
        )
      )
    )
  );
}

ReactDOM.render(React.createElement(CreditTracker), document.getElementById('root'));