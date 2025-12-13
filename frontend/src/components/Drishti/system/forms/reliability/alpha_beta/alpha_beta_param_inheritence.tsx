import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/registry/new-york-v4/ui/dialog';
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { Copy, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { createAlphaBeta, getAlphaBetaByComponent } from '@/actions/alpahbeta';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { DialogFooter } from '@/registry/new-york-v4/ui/dialog';
import { AlertTriangle, ArrowRight } from 'lucide-react';

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
  // View Parameters State
  const [selectedShip, setSelectedShip] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [isLoadingParams, setIsLoadingParams] = useState(false);
  const [parameterData, setParameterData] = useState<ParameterDisplay | null>(null);
  
  // Inheritance States
  const [sourceShip, setSourceShip] = useState('');
  const [targetShip, setTargetShip] = useState('');
  const [sourceEquipment, setSourceEquipment] = useState('');
  const [targetEquipment, setTargetEquipment] = useState('');
  const [sourceParams, setSourceParams] = useState<ParameterDisplay | null>(null);
  const [targetParams, setTargetParams] = useState<ParameterDisplay | null>(null);
  const [isLoadingSource, setIsLoadingSource] = useState(false);
  const [isLoadingTarget, setIsLoadingTarget] = useState(false);
  
  // Confirmation Dialog State
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isInheriting, setIsInheriting] = useState(false);

  const { ships, getEquipmentForShip, getEquipmentLabel } = useUserSelectionStore();

  // Get equipment groups for selected ships
  const equipmentGroups = selectedShip ? getEquipmentForShip(selectedShip) : [];
  const sourceEquipmentGroups = sourceShip ? getEquipmentForShip(sourceShip) : [];
  const targetEquipmentGroups = targetShip ? getEquipmentForShip(targetShip) : [];

  // Handle ship selection change
  const handleShipChange = (shipId: string) => {
    setSelectedShip(shipId);
    setSelectedEquipment('');
    setParameterData(null);
  };

  // Handle equipment selection change
  const handleEquipmentChange = (equipmentId: string) => {
    setSelectedEquipment(equipmentId);
  };

  // Fetch parameters for selected equipment (View section)
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

  // Fetch source parameters
  const handleFetchSourceParams = async () => {
    if (!sourceShip || !sourceEquipment) {
      toast.error('Please select source ship and equipment');
      return;
    }

    setIsLoadingSource(true);

    try {
      const result = await getAlphaBetaByComponent(sourceEquipment);

      if (result.success && result.data && result.data.length > 0) {
        setSourceParams({
          equipmentName: getEquipmentLabel(sourceShip, sourceEquipment),
          data: result.data[0],
        });
        toast.success('Source parameters loaded');
      } else {
        setSourceParams({
          equipmentName: getEquipmentLabel(sourceShip, sourceEquipment),
          data: null,
        });
        toast.error('No parameters found for source equipment');
      }
    } catch (error) {
      toast.error('Failed to load source parameters');
    } finally {
      setIsLoadingSource(false);
    }
  };

  // Fetch target parameters
  const handleFetchTargetParams = async () => {
    if (!targetShip || !targetEquipment) {
      toast.error('Please select target ship and equipment');
      return;
    }

    setIsLoadingTarget(true);

    try {
      const result = await getAlphaBetaByComponent(targetEquipment);

      if (result.success && result.data && result.data.length > 0) {
        setTargetParams({
          equipmentName: getEquipmentLabel(targetShip, targetEquipment),
          data: result.data[0],
        });
      } else {
        setTargetParams({
          equipmentName: getEquipmentLabel(targetShip, targetEquipment),
          data: null,
        });
      }
      toast.success('Target parameters loaded');
    } catch (error) {
      toast.error('Failed to load target parameters');
    } finally {
      setIsLoadingTarget(false);
    }
  };

  // Open confirmation dialog
  const handleOpenConfirmation = () => {
    if (!sourceShip || !targetShip || !sourceEquipment || !targetEquipment) {
      toast.error('Please select all fields and load parameters');
      return;
    }

    if (!sourceParams?.data) {
      toast.error('Source parameters not found. Please load source parameters first.');
      return;
    }

    if (sourceShip === targetShip && sourceEquipment === targetEquipment) {
      toast.error('Source and target cannot be the same');
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  // Handle parameter inheritance
  const handleInherit = async () => {
    if (!sourceParams?.data || !targetEquipment) {
      return;
    }

    setIsInheriting(true);

    try {
      const result = await createAlphaBeta({
        alpha: sourceParams.data.alpha,
        beta: sourceParams.data.beta,
        component_id: targetEquipment,
      });

      if (result.success) {
        toast.success(
          `Parameters inherited successfully! ${targetParams?.equipmentName} now has Alpha: ${sourceParams.data.alpha}, Beta: ${sourceParams.data.beta}`
        );

        // Refresh target parameters to show updated values
        await handleFetchTargetParams();
        
        setIsConfirmDialogOpen(false);
      } else {
        toast.error(result.error || 'Failed to inherit parameters');
      }
    } catch (error) {
      toast.error('Failed to inherit parameters');
    } finally {
      setIsInheriting(false);
    }
  };

  // Reset inheritance form
  const handleResetInheritance = () => {
    setSourceShip('');
    setTargetShip('');
    setSourceEquipment('');
    setTargetEquipment('');
    setSourceParams(null);
    setTargetParams(null);
  };

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
              <div>
                <GroupedCombobox
                  label="Select Ship"
                  placeholder={ships.length === 0 ? "Loading ships..." : "Choose a ship"}
                  groups={ships}
                  value={selectedShip}
                  onValueChange={handleShipChange}
                  disabled={ships.length === 0}
                />
              </div>

              <div>
                <GroupedCombobox
                  label="Select Equipment"
                  placeholder={!selectedShip ? "Select a ship first" : "Select equipment"}
                  groups={equipmentGroups}
                  value={selectedEquipment}
                  onValueChange={handleEquipmentChange}
                  disabled={!selectedShip || equipmentGroups.length === 0}
                />
              </div>
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

      {/* Parameters Table */}
      {parameterData && (
        <Card>
          <CardHeader>
            <CardTitle>Parameter Values</CardTitle>
          </CardHeader>
          <CardContent>
            {parameterData.data ? (
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
            ) : (
              <Alert>
                <AlertDescription>
                  No parameters found for {parameterData.equipmentName}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inheritance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Inherit Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Source Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-500 dark:text-blue-400">Source Equipment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                </div>
                <div>
                  <GroupedCombobox
                    label="Source Equipment"
                    placeholder={!sourceShip ? "Select ship first" : "Select equipment"}
                    groups={sourceEquipmentGroups}
                    value={sourceEquipment}
                    onValueChange={(value) => {
                      setSourceEquipment(value);
                      setSourceParams(null);
                    }}
                    disabled={!sourceShip}
                  />
                </div>
              </div>

              <Button
                onClick={handleFetchSourceParams}
                variant="outline"
                className="w-full"
                disabled={isLoadingSource || !sourceShip || !sourceEquipment}
              >
                {isLoadingSource && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoadingSource ? 'Loading...' : 'Load Source Parameters'}
              </Button>

              {/* Source Parameters Display */}
              {sourceParams && (
                <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/10 dark:bg-blue-500/5">
                  <h4 className="font-medium mb-2">{sourceParams.equipmentName}</h4>
                  {sourceParams.data ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Alpha (α):</span>
                        <p className="text-lg font-semibold">{sourceParams.data.alpha}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Beta (β):</span>
                        <p className="text-lg font-semibold">{sourceParams.data.beta}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-red-500 dark:text-red-400">No parameters found</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-muted-foreground" />
            </div>

            {/* Target Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Target Equipment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                </div>
                <div>
                  <GroupedCombobox
                    label="Target Equipment"
                    placeholder={!targetShip ? "Select ship first" : "Select equipment"}
                    groups={targetEquipmentGroups}
                    value={targetEquipment}
                    onValueChange={(value) => {
                      setTargetEquipment(value);
                      setTargetParams(null);
                    }}
                    disabled={!targetShip}
                  />
                </div>
              </div>

              <Button
                onClick={handleFetchTargetParams}
                variant="outline"
                className="w-full"
                disabled={isLoadingTarget || !targetShip || !targetEquipment}
              >
                {isLoadingTarget && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoadingTarget ? 'Loading...' : 'Load Target Parameters'}
              </Button>

              {/* Target Parameters Display */}
              {targetParams && (
                <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/10 dark:bg-green-500/5">
                  <h4 className="font-medium mb-2">{targetParams.equipmentName}</h4>
                  {targetParams.data ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Alpha (α):</span>
                        <p className="text-lg font-semibold">{targetParams.data.alpha}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Beta (β):</span>
                        <p className="text-lg font-semibold">{targetParams.data.beta}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">No existing parameters (will create new)</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleOpenConfirmation}
                className="flex-1"
                disabled={!sourceParams?.data || !targetParams}
              >
                <Copy className="w-4 h-4 mr-2" />
                Inherit Parameters
              </Button>
              <Button
                onClick={handleResetInheritance}
                variant="outline"
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              Confirm Parameter Inheritance
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                This is a critical operation. You are about to overwrite the target equipment's parameters.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="border border-blue-500/30 rounded-lg p-3 bg-blue-500/10 dark:bg-blue-500/5">
                <p className="text-sm font-medium text-muted-foreground mb-1">From (Source):</p>
                <p className="font-semibold">{sourceParams?.equipmentName}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Alpha:</span> <strong>{sourceParams?.data?.alpha}</strong>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Beta:</span> <strong>{sourceParams?.data?.beta}</strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
              </div>

              <div className="border border-green-500/30 rounded-lg p-3 bg-green-500/10 dark:bg-green-500/5">
                <p className="text-sm font-medium text-muted-foreground mb-1">To (Target):</p>
                <p className="font-semibold">{targetParams?.equipmentName}</p>
                {targetParams?.data ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Current Alpha:</span> <strong>{targetParams.data.alpha}</strong>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Current Beta:</span> <strong>{targetParams.data.beta}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">No existing parameters (new entry will be created)</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isInheriting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInherit}
              disabled={isInheriting}
            >
              {isInheriting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isInheriting ? 'Inheriting...' : 'Confirm Inheritance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}