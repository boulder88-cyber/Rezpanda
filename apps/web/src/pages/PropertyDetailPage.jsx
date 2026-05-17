import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx';
import { ArrowLeft, Bed, Bath, Maximize, DollarSign } from 'lucide-react';
import PropertyDocuments from '@/components/PropertyDocuments.jsx';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPropertyDetails();
  }, [id]);

  const loadPropertyDetails = async () => {
    try {
      const [propertyData, tenantsData] = await Promise.all([
        pb.collection('properties').getOne(id, { $autoCancel: false }),
        pb.collection('tenants').getFullList({ filter: `propertyId = "${id}"`, $autoCancel: false }),
      ]);
      setProperty(propertyData);
      setTenants(tenantsData);
    } catch (error) {
      console.error('Failed to load property details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <p className="text-center text-slate-600">Property not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${property.address} - PropManager`}</title>
        <meta name="description" content={`Property details for ${property.address}`} />
      </Helmet>

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <Link to="/properties">
              <Button variant="outline" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Properties
              </Button>
            </Link>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-0">
                      {property.photo ? (
                        <div
                          className="h-96 bg-cover bg-center rounded-t-lg"
                          style={{
                            backgroundImage: `url(${pb.files.getUrl(property, property.photo)})`,
                          }}
                        ></div>
                      ) : (
                        <div className="h-96 bg-slate-200 rounded-t-lg flex items-center justify-center">
                          <p className="text-slate-500">No photo available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{property.address}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-600">Property Type</p>
                          <p className="text-lg font-medium text-slate-900 capitalize">{property.propertyType}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          {property.bedrooms > 0 && (
                            <div>
                              <p className="text-sm text-slate-600 flex items-center gap-1">
                                <Bed className="w-4 h-4" />
                                Bedrooms
                              </p>
                              <p className="text-lg font-medium text-slate-900">{property.bedrooms}</p>
                            </div>
                          )}
                          {property.bathrooms > 0 && (
                            <div>
                              <p className="text-sm text-slate-600 flex items-center gap-1">
                                <Bath className="w-4 h-4" />
                                Bathrooms
                              </p>
                              <p className="text-lg font-medium text-slate-900">{property.bathrooms}</p>
                            </div>
                          )}
                          {property.squareFootage > 0 && (
                            <div>
                              <p className="text-sm text-slate-600 flex items-center gap-1">
                                <Maximize className="w-4 h-4" />
                                Sq Ft
                              </p>
                              <p className="text-lg font-medium text-slate-900">{property.squareFootage}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Monthly Rent
                          </p>
                          <p className="text-2xl font-bold text-slate-900">${property.rentPrice.toLocaleString()}</p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-600">Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                              property.status === 'occupied'
                                ? 'bg-green-100 text-green-700'
                                : property.status === 'vacant'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {property.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Current Tenants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {tenants.length === 0 ? (
                          <p className="text-slate-500">No tenants assigned</p>
                        ) : (
                          <div className="space-y-3">
                            {tenants.map((tenant) => (
                              <div key={tenant.id} className="p-3 bg-slate-50 rounded">
                                <p className="font-medium text-slate-900">{tenant.name}</p>
                                <p className="text-sm text-slate-600">{tenant.email}</p>
                                <p className="text-sm text-slate-600">
                                  Lease: {new Date(tenant.leaseStartDate).toLocaleDateString()} -{' '}
                                  {new Date(tenant.leaseEndDate).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <PropertyDocuments propertyId={id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyDetailPage;