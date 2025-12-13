import { createShip, deleteShip, getShips, updateShip } from '@/actions/shipActions';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Edit2, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// Type definitions
type ShipFormData = {
  ship_name: string;
  ship_category?: string;
  ship_class?: string;
  command?: string;
};

type Ship = ShipFormData & { 
  ship_id: string; 
  created_date: string;
  modified_date: string;
};

export default function ShipEntryForm({ setShowShipForm }: { setShowShipForm: (show: boolean) => void }) {
  const [ships, setShips] = useState<Ship[]>([]);
  const [editingShip, setEditingShip] = useState<Ship | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ShipFormData>({
    ship_name: '',
    ship_category: '',
    ship_class: '',
    command: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ShipFormData, string>>>({});

  // Load ships on mount
  useEffect(() => {
    loadShips();
  }, []);

  const loadShips = async () => {
    setLoading(true);
    const result = await getShips();
    if (result.success) {
      setShips(result.data);
      setError(null);
    } else {
      setError(result.error || 'Failed to load ships');
    }
    setLoading(false);
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ShipFormData, string>> = {};
    
    if (!formData.ship_name || formData.ship_name.trim().length === 0) {
      errors.ship_name = 'Ship name is required';
    } else if (formData.ship_name.length > 255) {
      errors.ship_name = 'Ship name too long';
    }

    if (formData.ship_category && formData.ship_category.length > 255) {
      errors.ship_category = 'Category too long';
    }

    if (formData.ship_class && formData.ship_class.length > 255) {
      errors.ship_class = 'Class too long';
    }

    if (formData.command && formData.command.length > 255) {
      errors.command = 'Command too long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    if (editingShip) {
      // Update existing ship
      const result = await updateShip(editingShip.ship_id, formData);
      if (result.success) {
        await loadShips();
        resetForm();
        setTimeout(() => setShowShipForm(false), 2000);
      } else {
        setError(result.error || 'Failed to update ship');
      }
    } else {
      // Create new ship
      const result = await createShip(formData);
      if (result.success) {
        await loadShips();
        resetForm();
        setTimeout(() => setShowShipForm(false), 2000);
      } else {
        setError(result.error || 'Failed to create ship');
      }
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ship?')) return;

    setLoading(true);
    const result = await deleteShip(id);
    
    if (result.success) {
      await loadShips();
      if (editingShip?.ship_id === id) {
        resetForm();
      }
    } else {
      setError(result.error || 'Failed to delete ship');
    }
    
    setLoading(false);
  };

  const startEdit = (ship: Ship) => {
    setEditingShip(ship);
    setFormData({
      ship_name: ship.ship_name,
      ship_category: ship.ship_category || '',
      ship_class: ship.ship_class || '',
      command: ship.command || '',
    });
    setFormErrors({});
  };

  const resetForm = () => {
    setEditingShip(null);
    setFormData({
      ship_name: '',
      ship_category: '',
      ship_class: '',
      command: '',
    });
    setFormErrors({});
    setError(null);
  };

  const handleInputChange = (field: keyof ShipFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ship Management</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Ship Entry Form */}
      <Card className="relative">
        <CardHeader>
          <CardTitle>{editingShip ? 'Edit Ship' : 'Add New Ship'}</CardTitle>
        </CardHeader>

        {/* X Close Button */}
        <button
          type="button"
          onClick={() => setShowShipForm(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>

        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="ship-name">
                  Ship Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ship-name"
                  value={formData.ship_name}
                  onChange={(e) => handleInputChange('ship_name', e.target.value)}
                  placeholder="Enter ship name"
                  disabled={loading}
                />
                {formErrors.ship_name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.ship_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ship-category">Ship Category</Label>
                <Input
                  id="ship-category"
                  value={formData.ship_category}
                  onChange={(e) => handleInputChange('ship_category', e.target.value)}
                  placeholder="e.g., Destroyer, Frigate, Submarine"
                  disabled={loading}
                />
                {formErrors.ship_category && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.ship_category}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ship-class">Ship Class</Label>
                <Input
                  id="ship-class"
                  value={formData.ship_class}
                  onChange={(e) => handleInputChange('ship_class', e.target.value)}
                  placeholder="e.g., Arleigh Burke, Kolkata"
                  disabled={loading}
                />
                {formErrors.ship_class && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.ship_class}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="command">Command</Label>
                <Input
                  id="command"
                  value={formData.command}
                  onChange={(e) => handleInputChange('command', e.target.value)}
                  placeholder="e.g., Eastern Naval Command, Western Fleet"
                  disabled={loading}
                />
                {formErrors.command && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.command}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button"
                onClick={handleSubmit}
                className="flex-1"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingShip ? 'Update Ship' : 'Add Ship'}
              </Button>
              {editingShip && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ships Table */}
      {ships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ships ({ships.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Ship Name</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">Class</th>
                    <th className="text-left p-3 font-medium">Command</th>
                    <th className="text-left p-3 font-medium">Created</th>
                    <th className="text-left p-3 font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ships.map((ship) => (
                    <tr 
                      key={ship.ship_id} 
                      className={`border-b border-border hover:bg-accent/50 transition-colors ${
                        editingShip?.ship_id === ship.ship_id ? 'bg-accent' : ''
                      }`}
                    >
                      <td className="p-3 font-semibold">{ship.ship_name}</td>
                      <td className="p-3 text-muted-foreground">{ship.ship_category || '-'}</td>
                      <td className="p-3 text-muted-foreground">{ship.ship_class || '-'}</td>
                      <td className="p-3 text-muted-foreground">{ship.command || '-'}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(ship.created_date).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(ship)}
                            disabled={loading}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(ship.ship_id)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {ships.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No ships added yet. Use the form above to add your first ship.
          </CardContent>
        </Card>
      )}

      {loading && ships.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}