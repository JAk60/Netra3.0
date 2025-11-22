import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { ChevronDown, Download, Edit, Trash2, Upload } from 'lucide-react';

export default function Bulk_operations() {
  return (
      <div className="max-w-3xl">
          <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                          <Upload className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle>Import Data</CardTitle>
                      <CardDescription>Upload CSV files for bulk import</CardDescription>
                  </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-2">
                          <Download className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle>Export Data</CardTitle>
                      <CardDescription>Download as CSV or Excel</CardDescription>
                  </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-2">
                          <Edit className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle>Bulk Update</CardTitle>
                      <CardDescription>Update multiple records at once</CardDescription>
                  </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-2">
                          <Trash2 className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle>Bulk Delete</CardTitle>
                      <CardDescription>Remove multiple records</CardDescription>
                  </CardHeader>
              </Card>
          </div>

          <Card>
              <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-between">
                      <span>Download CSV Templates</span>
                      <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                      <span>View Import History</span>
                      <ChevronDown className="w-4 h-4" />
                  </Button>
              </CardContent>
          </Card>
      </div>
  )
}
