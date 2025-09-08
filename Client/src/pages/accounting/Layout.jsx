import { Outlet } from 'react-router-dom';

const AccountingLayout = () => {
  return (
    <div className="w-full">
      
      {/* Module Content */}
      <Outlet />
    </div>
  );
};

export default AccountingLayout;