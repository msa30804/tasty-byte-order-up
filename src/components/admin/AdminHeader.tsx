
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AdminHeader: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <header className="bg-restaurant-burgundy text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="text-xl font-bold">Tasty Byte Admin</Link>
        </div>
        <div className="flex items-center space-x-4">
          <span>
            {user?.name} ({user?.role})
          </span>
          <Link to="/">
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-restaurant-burgundy">
              POS Mode
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
