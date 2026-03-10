import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/registry/new-york-v4/ui/dialog';
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { Copy, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { createAlphaBeta, getAlphaBetaByComponent } from '@/actions/alpahbeta';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';

interface AlphaBetaData {
  id: string;
  alpha: number;
  beta: number;
  component_id: string;
}

interface ParameterDisplay {
  equipmentName: string;
  data: AlphaBetaData | null;
}

export default function AlphaBetaParamInheritance() {
  // Target selection state (main page)
  const [selectedShip, setSelectedShip] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [isLoadingParams, setIsLoadingParams] = useState(false);
  const [parameterData, setParameterData] = useState<ParameterDisplay | null>(null);

  // Source selection state (dialog)
  const [isInheritDialogOpen, setIsInheritDialogOpen] = useState(false);
  const [sourceShip, setSourceShip] = useState('');
  const [sourceEquipment, setSourceEquipment] = useState('');
  const [sourceParams, setSourceParams] = useState<ParameterDisplay | null>(null);
  const [isLoadingSource, setIsLoadingSource] = useState(false);
  const [isInheriting, setIsInheriting] = useState(false);

  const { ships, getEquipmentForShip, getEquipmentLabel } = useUserSelectionStore();

  const equipmentGroups = selectedShip ? getEquipmentForShip(selectedShip) : [];
  const sourceEquipmentGroups = sourceShip ? getEquipmentForShip(sourceShip) : [];

  // Fetch parameters for selected TARGET equipment (main page)
  const handleSubmit = async () => {
    if (!selectedShip || !selectedEquipment) {
      toast.error('Please select both ship and equipment');
      return;
    }

    setIsLoadingParams(true);

    try {
      const result = await getAlphaBetaByComponent(selectedEquipment);

      if (result.success && result.data && result.data.length > 0) {
        setParameterData({
          equipmentName: getEquipmentLabel(selectedShip, selectedEquipment),
          data: result.data[0],
        });
        toast.success('Parameters loaded successfully');
      } else {
        setParameterData({
          equipmentName: getEquipmentLabel(selectedShip, selectedEquipment),
          data: null,
        });
        toast.info('No parameters found for this equipment');
      }
    } catch (error) {
      toast.error('Failed to load parameters');
    } finally {
      setIsLoadingParams(false);
    }
  };

  // Open inherit dialog and reset source state
  const handleOpenInheritDialog = () => {
    setSourceShip('');
    setSourceEquipment('');
    setSourceParams(null);
    setIsInheritDialogOpen(true);
  };

  // Fetch SOURCE parameters inside the dialog
  const handleFetchSourceParams = async (equipmentId: string, shipId: string) => {
    if (!equipmentId || !shipId) return;

    setIsLoadingSource(true);

    try {
      const result = await getAlphaBetaByComponent(equipmentId);

      if (result.success && result.data && result.data.length > 0) {
        setSourceParams({
          equipmentName: getEquipmentLabel(shipId, equipmentId),
          data: result.data[0],
        });
      } else {
        setSourceParams({
          equipmentName: getEquipmentLabel(shipId, equipmentId),
          data: null,
        });
      }
    } catch (error) {
      toast.error('Failed to load source parameters');
    } finally {
      setIsLoadingSource(false);
    }
  };

  // Handle source equipment change — auto-fetch source params
  const handleSourceEquipmentChange = (equipmentId: string) => {
    setSourceEquipment(equipmentId);
    setSourceParams(null);
    if (equipmentId && sourceShip) {
      handleFetchSourceParams(equipmentId, sourceShip);
    }
  };

  // Handle parameter inheritance — copy SOURCE into TARGET
  const handleInherit = async () => {
    if (!sourceParams?.data || !selectedEquipment) return;

    if (selectedShip === sourceShip && selectedEquipment === sourceEquipment) {
      toast.error('Source and target cannot be the same');
      return;
    }

    setIsInheriting(true);

    try {
      const result = await createAlphaBeta({
        alpha: sourceParams.data.alpha,
        beta: sourceParams.data.beta,
        component_id: selectedEquipment,
      });

      if (result.success) {
        toast.success(
          `Parameters inherited successfully! ${parameterData?.equipmentName} now has Alpha: ${sourceParams.data.alpha}, Beta: ${sourceParams.data.beta}`
        );
        setIsInheritDialogOpen(false);
        // Refresh target params to reflect new values
        handleSubmit();
      } else {
        toast.error(result.error || 'Failed to inherit parameters');
      }
    } catch (error) {
      toast.error('Failed to inherit parameters');
    } finally {
      setIsInheriting(false);
    }
  };

  const canInherit =
    !!sourceEquipment &&
    !!sourceShip &&
    !!sourceParams?.data &&
    !isLoadingSource &&
    !(selectedShip === sourceShip && selectedEquipment === sourceEquipment);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parameter Inheritance</h1>
      </div>

      {/* Target Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Select Target Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GroupedCombobox
                label="Select Ship"
                placeholder={ships.length === 0 ? 'Loading ships...' : 'Choose a ship'}
                groups={ships}
                value={selectedShip}
                onValueChange={(value) => {
                  setSelectedShip(value);
                  setSelectedEquipment('');
                  setParameterData(null);
                }}
                disabled={ships.length === 0}
              />

              <GroupedCombobox
                label="Select Equipment"
                placeholder={!selectedShip ? 'Select a ship first' : 'Select equipment'}
                groups={equipmentGroups}
                value={selectedEquipment}
                onValueChange={setSelectedEquipment}
                disabled={!selectedShip || equipmentGroups.length === 0}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={isLoadingParams || !selectedShip || !selectedEquipment}
            >
              {isLoadingParams && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoadingParams ? 'Loading...' : 'View Parameters'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Target Parameters Result + Inherit Action */}
      {parameterData && (
        <Card>
          <CardHeader>
            <CardTitle>Target Parameter Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parameterData.data ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium">Equipment Name</th>
                        <th className="text-left p-3 font-medium">Alpha (α)</th>
                        <th className="text-left p-3 font-medium">Beta (β)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border hover:bg-muted/50">
                        <td className="p-3">{parameterData.equipmentName}</td>
                        <td className="p-3">{parameterData.data.alpha}</td>
                        <td className="p-3">{parameterData.data.beta}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <Button onClick={handleOpenInheritDialog} className="w-full" variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Inherit Parameters From Another Equipment
                </Button>
              </>
            ) : (
              <>
                <Alert>
                  <AlertDescription>No parameters found for {parameterData.equipmentName}</AlertDescription>
                </Alert>
                <Button onClick={handleOpenInheritDialog} className="w-full" variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Inherit Parameters From Another Equipment
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inheritance Dialog — selects SOURCE */}
      <Dialog open={isInheritDialogOpen} onOpenChange={setIsInheritDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Inherit Parameters
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Source selection */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Select Source Equipment</p>
              <div className="grid grid-cols-1 gap-3">
                <GroupedCombobox
                  label="Source Ship"
                  placeholder="Select source ship"
                  groups={ships}
                  value={sourceShip}
                  onValueChange={(value) => {
                    setSourceShip(value);
                    setSourceEquipment('');
                    setSourceParams(null);
                  }}
                />
                <GroupedCombobox
                  label="Source Equipment"
                  placeholder={!sourceShip ? 'Select ship first' : 'Select equipment'}
                  groups={sourceEquipmentGroups}
                  value={sourceEquipment}
                  onValueChange={handleSourceEquipmentChange}
                  disabled={!sourceShip}
                />
              </div>

              {/* Source params preview */}
              {isLoadingSource && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading source parameters...
                </div>
              )}

              {sourceParams && !isLoadingSource && (
                <div className="border border-blue-500/30 rounded-lg p-3 bg-blue-500/10 dark:bg-blue-500/5">
                  {sourceParams.data ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-1">Source values (will be copied):</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Alpha:</span> <strong>{sourceParams.data.alpha}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Beta:</span> <strong>{sourceParams.data.beta}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      No parameters found for this equipment — please select another source.
                    </p>
                  )}
                </div>
              )}

              {/* Same source/target warning */}
              {selectedShip === sourceShip && selectedEquipment === sourceEquipment && sourceEquipment && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>Source and target cannot be the same equipment.</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>

            {/* Target — read-only summary */}
            <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/10 dark:bg-green-500/5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">To (Target)</p>
              <p className="font-semibold">{parameterData?.equipmentName}</p>
              {parameterData?.data && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Alpha (α):</span>{' '}
                    <strong>{parameterData.data.alpha}</strong>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Beta (β):</span>{' '}
                    <strong>{parameterData.data.beta}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInheritDialogOpen(false)} disabled={isInheriting}>
              Cancel
            </Button>
            <Button onClick={handleInherit} disabled={!canInherit || isInheriting}>
              {isInheriting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isInheriting ? 'Inheriting...' : 'Confirm Inheritance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}