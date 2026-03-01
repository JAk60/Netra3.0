import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/registry/new-york-v4/ui/tabs';
import OverhaulEntryForm from './add_overhaul_info';
import OverhaulReadingsForm from './OverhaulReadingsForm';

export function OverhaulMain() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="metadata" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="metadata" className="flex-1">
            Overhaul Metadata
          </TabsTrigger>
          <TabsTrigger value="readings" className="flex-1">
            Overhaul Readings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metadata" className="w-full">
          <OverhaulEntryForm />
        </TabsContent>

        <TabsContent value="readings" className="w-full">
          <OverhaulReadingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}