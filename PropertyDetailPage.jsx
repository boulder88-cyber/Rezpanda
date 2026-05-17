import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

const MaintenanceHistory = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    propertyId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [maintenanceData, propertiesData] = await Promise.all([
        pb.collection('maintenance').getFullList({ sort: '-dateLogged', $autoCancel: false }),
        pb.collection('properties').getFullList({ $autoCancel: false }),
      ]);
      setMaintenance(maintenanceData);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaintenance = maintenance.filter((item) => {
    if (filters.propertyId && item.propertyId !== filters.propertyId) return false;
    if (filters.startDate && item.dateLogged < filters.startDate) return false;
    if (filters.endDate && item.dateLogged > filters.endDate) return false;
    return true;
  });

  const getPropertyAddress = (propertyId) => {
    const property = properties.find((p) => p.id === propertyId);
    return property ? property.address : 'Unknown';
  };

  return (
    <>
      <Helmet>
        <title>Maintenance History - PropManager</title>
        <meta name="description" content="View historical maintenance records" />
      </Helmet>

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Maintenance History</h1>
              <p className="text-slate-600 mt-1">View and filter historical maintenance records</p>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="propertyFilter">Filter by Property</Label>
                    <select
                      id="propertyFilter"
                      value={filters.propertyId}
                      onChange={(e) => setFilters({ ...filters, propertyId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white"
                    >
                      <option value="">All Properties</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.address}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="text-slate-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="text-slate-900"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredMaintenance.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-slate-500">No maintenance records found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredMaintenance.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-2">{getPropertyAddress(item.propertyId)}</h3>
                          <p className="text-slate-600 mb-3">{item.description}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>Logged: {new Date(item.dateLogged).toLocaleDateString()}</span>
                            {item.completionDate && (
                              <span>Completed: {new Date(item.completionDate).toLocaleDateString()}</span>
                            )}
                            {item.cost > 0 && <span>Cost: ${item.cost.toLocaleString()}</span>}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            item.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MaintenanceHistory;