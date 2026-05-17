import React from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';

const DocumentViewer = () => {
  return (
    <>
      <Helmet>
        <title>Document Viewer - PropManager</title>
        <meta name="description" content="View document details" />
      </Helmet>

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500">Document viewer will be implemented in a future update.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentViewer;