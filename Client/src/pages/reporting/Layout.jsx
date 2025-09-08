import { Outlet } from 'react-router-dom';

const ReportingLayout = () => {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reporting</h1>
          <p className="text-muted mt-1">Generate and analyze financial reports</p>
        </div>
      </div>
      
      {/* Module Content */}
      <Outlet />
    </div>
  );
};

export default ReportingLayout;