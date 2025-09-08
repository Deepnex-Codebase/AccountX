import { Outlet } from 'react-router-dom';

const AdministrationLayout = () => {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted mt-1">Manage system settings and user access</p>
        </div>
      </div>
      
      {/* Module Content */}
      <Outlet />
    </div>
  );
};

export default AdministrationLayout;