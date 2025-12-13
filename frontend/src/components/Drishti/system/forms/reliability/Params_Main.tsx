import { AppWindowIcon, CodeIcon } from "lucide-react"

import { Button } from "@/registry/new-york-v4/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/registry/new-york-v4/ui/card"
import { Input } from "@/registry/new-york-v4/ui/input"
import { Label } from "@/registry/new-york-v4/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/registry/new-york-v4/ui/tabs"
import AlphaBetaParamInheritance from "./alpha_beta/alpha_beta_param_inheritence"
import EtaBetaParamInheritance from "./eta_beta/eta_beta_param_inheritence"

export function Parameters() {
    return (
        <div className="flex w-full flex-col gap-6">
            {/* Removed max-w-sm so tabs can stretch full width */}

            <Tabs defaultValue="AlphaBeta" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="AlphaBeta" className="flex-1">
                        AlphaBeta
                    </TabsTrigger>
                    <TabsTrigger value="EtaBeta" className="flex-1">
                        EtaBeta
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="AlphaBeta" className="w-full">
                    <AlphaBetaParamInheritance />
                </TabsContent>

                <TabsContent value="EtaBeta" className="w-full">
                    <EtaBetaParamInheritance />
                </TabsContent>
            </Tabs>
        </div>
    )
}
