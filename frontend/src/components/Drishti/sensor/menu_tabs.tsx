import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import Add_sensor_data from './add_sensor_data';
import Bulk_operations from './bulk_operations';
import Failure_mode_view from './failure_mode_view';
import Sensor_view from './sensor_view';
import { FailureMode, Sensor } from '@/actions/sensors/metadata';

export default function Menu_tabs({
    componentId,
    failureModes = [],
    sensors = [],
    loading = false
}: {componentId?: string,
    failureModes?: FailureMode[],
    sensors?: Sensor[],
    loading?: boolean
}) {
    return (
        <Tabs defaultValue="failure-modes" className="space-y-4">
            <TabsList>
                <TabsTrigger value="failure-modes">Failure Modes</TabsTrigger>
                <TabsTrigger value="sensors">Sensors</TabsTrigger>
                <TabsTrigger value="readings">Add Readings</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
            </TabsList>

            <TabsContent value="failure-modes" className="space-y-4">
                <Failure_mode_view failureModes={failureModes} loading={loading} componentId={componentId || null}/>
            </TabsContent>

            <TabsContent value="sensors" className="space-y-4">
                <Sensor_view failureModes={failureModes} sensors={sensors} loading={loading} componentId={componentId || null} />
            </TabsContent>
            <TabsContent value="readings" className='flex justify-center space-y-4'>
                <Add_sensor_data sensors={sensors} componentId={componentId || null}/>
            </TabsContent>

            <TabsContent value="bulk" className='flex justify-center space-y-4'>
                <Bulk_operations />
            </TabsContent>
        </Tabs>
    );
}

