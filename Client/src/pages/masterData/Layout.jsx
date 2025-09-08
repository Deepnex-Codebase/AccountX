import { Outlet } from 'react-router-dom';

const MasterDataLayout = () => {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Data</h1>
          <p className="text-muted mt-1">Manage your core business data and configurations</p>
        </div>
      </div>
      
      {/* Module Content */}
      <Outlet />
    </div>
  );
};

export default MasterDataLayout;