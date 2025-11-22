import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Layers, Package, Cpu, Boxes } from 'lucide-react';

interface Stats {
  totalDepartments: number;
  totalSystems: number;
  totalEquipment: number;
  componentsWithHierarchy: number;
}

interface SystemCardsProps {
  stats?: Stats;
  loading?: boolean;
}

export default function System_cards({ stats, loading = false }: SystemCardsProps) {
  // Show loading state or placeholder values
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loading...</CardTitle>
              <div className="w-4 h-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Default values when no stats available
  const displayStats = stats || {
    totalDepartments: 0,
    totalSystems: 0,
    totalEquipment: 0,
    componentsWithHierarchy: 0,
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Departments
          </CardTitle>
          <Layers className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayStats.totalDepartments}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total departments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Systems
          </CardTitle>
          <Cpu className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayStats.totalSystems}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Active systems
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Equipment
          </CardTitle>
          <Package className="w-4 h-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayStats.totalEquipment}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total equipment
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            With Hierarchy
          </CardTitle>
          <Boxes className="w-4 h-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${displayStats.componentsWithHierarchy > 0 ? 'text-orange-600' : ''}`}>
            {displayStats.componentsWithHierarchy}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Components with parent
          </p>
        </CardContent>
      </Card>
    </div>
  );
}