const { useState, useEffect } = React;
const { Trash2, DollarSign } = lucide;

function CreditTracker() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'class',
    amount: '',
    note: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await window.storage.get('student-data', true);
      if (result) {
        const data = JSON.parse(result.value);
        setBalance(data.balance);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.log('No existing data');
    }
  };

  const saveData = async (newBalance, newTransactions) => {
    try {
      await window.storage.set('student-data', JSON.stringify({
        balance: newBalance,
        transactions: newTransactions
      }), true);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const addTransaction = () => {
    if (!newTransaction.amount) return;
    
    const amount = parseFloat(newTransaction.amount);
    const transaction = {
      id: Date.now(),
      type: newTransaction.type,
      amount: amount,
      note: newTransaction.note,
      date: new Date().toISOString()
    };

    const balanceChange = newTransaction.type === 'class' ? -amount : amount;
    const newBalance = balance + balanceChange;
    const newTransactions = [transaction, ...transactions];
    
    setBalance(newBalance);
    setTransactions(newTransactions);
    saveData(newBalance, newTransactions);
    setNewTransaction({ type: 'class', amount: '', note: '' });
  };

  const deleteTransaction = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    const balanceChange = transaction.type === 'class' ? transaction.amount : -transaction.amount;
    const newBalance = balance + balanceChange;
    const newTransactions = transactions.filter(t => t.id !== transactionId);

    setBalance(newBalance);
    setTransactions(newTransactions);
    saveData(newBalance, newTransactions);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Credit Balance</h1>
        
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white mb-6">
          <div className="flex items-center gap-3">
            <DollarSign size={48} />
            <div>
              <p className="text-lg opacity-90">Current Balance</p>
              <p className="text-5xl font-bold">${balance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Add Transaction</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => setNewTransaction({...newTransaction, type: 'class'})}
              className={`py-3 rounded-lg font-medium transition ${
                newTransaction.type === 'class'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Class (Subtract)
            </button>
            <button
              onClick={() => setNewTransaction({...newTransaction, type: 'payment'})}
              className={`py-3 rounded-lg font-medium transition ${
                newTransaction.type === 'payment'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Payment (Add)
            </button>
          </div>

          <input
            type="number"
            placeholder="Amount"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
            onKeyPress={(e) => e.key === 'Enter' && addTransaction()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />

          <input
            type="text"
            placeholder="Note (optional)"
            value={newTransaction.note}
            onChange={(e) => setNewTransaction({...newTransaction, note: e.target.value})}
            onKeyPress={(e) => e.key === 'Enter' && addTransaction()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={addTransaction}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition text-lg"
          >
            Add Transaction
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Transaction History</h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            ) : (
              transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-lg ${
                        transaction.type === 'class' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'class' ? '-' : '+'}${transaction.amount.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 uppercase">
                        {transaction.type}
                      </span>
                    </div>
                    {transaction.note && (
                      <p className="text-sm text-gray-600 mt-1">{transaction.note}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(transaction.date)}</p>
                  </div>
                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<CreditTracker />, document.getElementById('root'));