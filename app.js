import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';

export default function CreditTracker() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudentName, setNewStudentName] = useState('');
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
      const result = await window.storage.get('students-data');
      if (result) {
        setStudents(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No existing data');
    }
  };

  const saveData = async (data) => {
    try {
      await window.storage.set('students-data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const addStudent = () => {
    if (!newStudentName.trim()) return;
    const newStudent = {
      id: Date.now(),
      name: newStudentName,
      balance: 0,
      transactions: []
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    saveData(updated);
    setNewStudentName('');
  };

  const deleteStudent = (id) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    saveData(updated);
    if (selectedStudent?.id === id) setSelectedStudent(null);
  };

  const addTransaction = () => {
    if (!selectedStudent || !newTransaction.amount) return;
    
    const amount = parseFloat(newTransaction.amount);
    const transaction = {
      id: Date.now(),
      type: newTransaction.type,
      amount: amount,
      note: newTransaction.note,
      date: new Date().toISOString()
    };

    const balanceChange = newTransaction.type === 'class' ? -amount : amount;
    
    const updated = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          balance: s.balance + balanceChange,
          transactions: [transaction, ...s.transactions]
        };
      }
      return s;
    });

    setStudents(updated);
    saveData(updated);
    setSelectedStudent(updated.find(s => s.id === selectedStudent.id));
    setNewTransaction({ type: 'class', amount: '', note: '' });
  };

  const deleteTransaction = (transactionId) => {
    const student = students.find(s => s.id === selectedStudent.id);
    const transaction = student.transactions.find(t => t.id === transactionId);
    const balanceChange = transaction.type === 'class' ? transaction.amount : -transaction.amount;

    const updated = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          balance: s.balance + balanceChange,
          transactions: s.transactions.filter(t => t.id !== transactionId)
        };
      }
      return s;
    });

    setStudents(updated);
    saveData(updated);
    setSelectedStudent(updated.find(s => s.id === selectedStudent.id));
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Credit Balance Tracker</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Students</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Student name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addStudent()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addStudent}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {students.map(student => (
                <div
                  key={student.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                    selectedStudent?.id === student.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{student.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStudent(student.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className={`text-lg font-semibold ${student.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${student.balance.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Entry & Balance Display */}
          <div className="md:col-span-2 space-y-6">
            {selectedStudent ? (
              <>
                {/* Balance Overview */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
                  <h2 className="text-2xl font-semibold mb-2">{selectedStudent.name}</h2>
                  <div className="flex items-center gap-2">
                    <DollarSign size={32} />
                    <div>
                      <p className="text-sm opacity-90">Current Balance</p>
                      <p className="text-4xl font-bold">${selectedStudent.balance.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Add Transaction */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Add Transaction</h3>
                  
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={newTransaction.note}
                    onChange={(e) => setNewTransaction({...newTransaction, note: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={addTransaction}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition"
                  >
                    Add Transaction
                  </button>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Transaction History</h3>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedStudent.transactions.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No transactions yet</p>
                    ) : (
                      selectedStudent.transactions.map(transaction => (
                        <div
                          key={transaction.id}
                          className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${
                                transaction.type === 'class' ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {transaction.type === 'class' ? '-' : '+'}${transaction.amount.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {transaction.type === 'class' ? 'Class' : 'Payment'}
                              </span>
                            </div>
                            {transaction.note && (
                              <p className="text-sm text-gray-600">{transaction.note}</p>
                            )}
                            <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                          </div>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-500 text-lg">Select a student to view their balance and transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}