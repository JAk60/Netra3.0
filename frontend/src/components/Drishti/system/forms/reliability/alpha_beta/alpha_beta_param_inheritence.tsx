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
  // View / Source Parameters State
  const [selectedShip, setSelectedShip] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [isLoadingParams, setIsLoadingParams] = useState(false);
  const [parameterData, setParameterData] = useState<ParameterDisplay | null>(null);

  // Inheritance Dialog State
  const [isInheritDialogOpen, setIsInheritDialogOpen] = useState(false);
  const [targetShip, setTargetShip] = useState('');
  const [targetEquipment, setTargetEquipment] = useState('');
  const [targetParams, setTargetParams] = useState<ParameterDisplay | null>(null);
  const [isLoadingTarget, setIsLoadingTarget] = useState(false);
  const [isInheriting, setIsInheriting] = useState(false);

  const { ships, getEquipmentForShip, getEquipmentLabel } = useUserSelectionStore();

  const equipmentGroups = selectedShip ? getEquipmentForShip(selectedShip) : [];
  const targetEquipmentGroups = targetShip ? getEquipmentForShip(targetShip) : [];

  // Fetch parameters for selected equipment (View / Source section)
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

  // Open inherit dialog and reset target state
  const handleOpenInheritDialog = () => {
    setTargetShip('');
    setTargetEquipment('');
    setTargetParams(null);
    setIsInheritDialogOpen(true);
  };

  // Fetch target parameters inside the dialog
  const handleFetchTargetParams = async (equipmentId: string, shipId: string) => {
    if (!equipmentId || !shipId) return;

    setIsLoadingTarget(true);

    try {
      const result = await getAlphaBetaByComponent(equipmentId);

      if (result.success && result.data && result.data.length > 0) {
        setTargetParams({
          equipmentName: getEquipmentLabel(shipId, equipmentId),
          data: result.data[0],
        });
      } else {
        setTargetParams({
          equipmentName: getEquipmentLabel(shipId, equipmentId),
          data: null,
        });
      }
    } catch (error) {
      toast.error('Failed to load target parameters');
    } finally {
      setIsLoadingTarget(false);
    }
  };

  // Handle target equipment change — auto-fetch target params
  const handleTargetEquipmentChange = (equipmentId: string) => {
    setTargetEquipment(equipmentId);
    setTargetParams(null);
    if (equipmentId && targetShip) {
      handleFetchTargetParams(equipmentId, targetShip);
    }
  };

  // Handle parameter inheritance
  const handleInherit = async () => {
    if (!parameterData?.data || !targetEquipment) return;

    if (selectedShip === targetShip && selectedEquipment === targetEquipment) {
      toast.error('Source and target cannot be the same');
      return;
    }

    setIsInheriting(true);

    try {
      const result = await createAlphaBeta({
        alpha: parameterData.data.alpha,
        beta: parameterData.data.beta,
        component_id: targetEquipment,
      });

      if (result.success) {
        toast.success(
          `Parameters inherited successfully! ${targetParams?.equipmentName} now has Alpha: ${parameterData.data.alpha}, Beta: ${parameterData.data.beta}`
        );
        setIsInheritDialogOpen(false);
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
    !!targetEquipment &&
    !!targetShip &&
    !isLoadingTarget &&
    !(selectedShip === targetShip && selectedEquipment === targetEquipment);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parameter Inheritance</h1>
      </div>

      {/* Parameter Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>View Parameters</CardTitle>
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

      {/* Parameters Result + Inherit Action */}
      {parameterData && (
        <Card>
          <CardHeader>
            <CardTitle>Parameter Values</CardTitle>
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

                {/* Inherit Button — lives right here, source is already known */}
                <Button onClick={handleOpenInheritDialog} className="w-full" variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Inherit These Parameters to Another Equipment
                </Button>
              </>
            ) : (
              <Alert>
                <AlertDescription>No parameters found for {parameterData.equipmentName}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inheritance Dialog — only asks for TARGET */}
      <Dialog open={isInheritDialogOpen} onOpenChange={setIsInheritDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Inherit Parameters
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Source — read-only summary */}
            <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/10 dark:bg-blue-500/5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">From (Source)</p>
              <p className="font-semibold">{parameterData?.equipmentName}</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Alpha (α):</span>{' '}
                  <strong>{parameterData?.data?.alpha}</strong>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Beta (β):</span>{' '}
                  <strong>{parameterData?.data?.beta}</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>

            {/* Target selection */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Select Target Equipment</p>
              <div className="grid grid-cols-1 gap-3">
                <GroupedCombobox
                  label="Target Ship"
                  placeholder="Select target ship"
                  groups={ships}
                  value={targetShip}
                  onValueChange={(value) => {
                    setTargetShip(value);
                    setTargetEquipment('');
                    setTargetParams(null);
                  }}
                />
                <GroupedCombobox
                  label="Target Equipment"
                  placeholder={!targetShip ? 'Select ship first' : 'Select equipment'}
                  groups={targetEquipmentGroups}
                  value={targetEquipment}
                  onValueChange={handleTargetEquipmentChange}
                  disabled={!targetShip}
                />
              </div>

              {/* Target params preview */}
              {isLoadingTarget && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading target parameters...
                </div>
              )}

              {targetParams && !isLoadingTarget && (
                <div className="border border-green-500/30 rounded-lg p-3 bg-green-500/10 dark:bg-green-500/5">
                  {targetParams.data ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-1">Current values (will be overwritten):</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Alpha:</span> <strong>{targetParams.data.alpha}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Beta:</span> <strong>{targetParams.data.beta}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      No existing parameters — a new entry will be created.
                    </p>
                  )}
                </div>
              )}

              {/* Same source/target warning */}
              {selectedShip === targetShip && selectedEquipment === targetEquipment && targetEquipment && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>Source and target cannot be the same equipment.</AlertDescription>
                </Alert>
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