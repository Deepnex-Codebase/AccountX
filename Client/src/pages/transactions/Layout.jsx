import { Outlet } from 'react-router-dom';

const TransactionsLayout = () => {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted mt-1">Record and manage your financial transactions</p>
        </div>
      </div>
      
      {/* Module Content */}
      <Outlet />
    </div>
  );
};

export default TransactionsLayout;