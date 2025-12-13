import React from 'react';
import { CheckCircle, TrendingUp, Clock, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { OptimizationResult, ComponentOptimizationResult } from '@/actions/optimize';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/new-york-v4/ui/accordion";

interface OptimizationResultsProps {
  results: OptimizationResult;
  methodType: string;
}

const OptimizationResults: React.FC<OptimizationResultsProps> = ({ results, methodType }) => {
  const isRiskBased = methodType === 'risk-based' || methodType === 'risk_target';
  const hasMultipleComponents = results.components && results.components.length > 1;

  // Helper function to get component display name
  const getComponentName = (component: ComponentOptimizationResult, index: number): string => {
    // Try multiple possible name fields
    const name = component.assembly_name || 
                 component.component_name || 
                 component.component_id;
    
    // If it's a UUID, return a friendlier fallback
    if (name && name.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return `Component ${index + 1}`;
    }
    
    return name || `Component ${index + 1}`;
  };

  // Risk-based results table
  const RiskBasedTable = ({ component }: { component: ComponentOptimizationResult }) => {
    if (!component.t_values || !component.p_values) return null;

    // Calculate confidence intervals (±10% for demonstration)
    const calculateBounds = (value: number) => ({
      lower: value * 0.9,
      upper: value * 1.1,
    });

    return (
      <div className="overflow-hidden rounded-lg border border-gray-700">
        <table className="w-full">
          <thead>
            <tr className="bg-indigo-950/50 border-b border-gray-700">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                Risk Level
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                Optimized Time
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                Lower Bound
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                Upper Bound
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {component.p_values.map((p, idx) => {
              const bounds = calculateBounds(component.t_values![idx]);
              return (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {(p * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-400">
                    {component.t_values![idx].toFixed(4)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {bounds.lower.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {bounds.upper.toFixed(4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Cost/Downtime optimization results
  const OptimizationSummary = ({ component }: { component: ComponentOptimizationResult }) => {
    if (component.t === undefined) return null;

    const isCostBased = methodType.includes('cost');
    const isTimeBased = methodType.includes('time') || methodType.includes('calendar');

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-blue-950/50 to-blue-900/30 rounded-xl border border-blue-800/50">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h4 className="text-sm font-semibold text-gray-300">Optimal Maintenance Time</h4>
          </div>
          <p className="text-3xl font-bold text-blue-400">
            {component.t.toFixed(2)} <span className="text-lg text-gray-400">hours</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Recommended interval</p>
        </div>

        {component.objective_value !== undefined && (
          <div className="p-6 bg-gradient-to-br from-green-950/50 to-green-900/30 rounded-xl border border-green-800/50">
            <div className="flex items-center gap-3 mb-2">
              {isCostBased ? (
                <DollarSign className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingUp className="w-5 h-5 text-green-400" />
              )}
              <h4 className="text-sm font-semibold text-gray-300">
                {isCostBased ? 'Cost per Unit Time' : 'Downtime per Unit Time'}
              </h4>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {component.objective_value.toFixed(4)}
              <span className="text-lg text-gray-400 ml-1">
                {isCostBased ? '$/hr' : 'hrs/hr'}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Minimized objective value</p>
          </div>
        )}
      </div>
    );
  };

  // Debug log
  console.log('OptimizationResults received:', results);

  // Single component view
  if (!hasMultipleComponents && results.components && results.components[0]) {
    const component = results.components[0];
    
    return (
      <div className="w-full bg-muted/30 rounded-xl p-8 border border-gray-800 mt-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1a1a1a] rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <h2 className="text-2xl font-light">Optimization Results</h2>
            </div>

            <div className="mb-4 p-4 bg-blue-950/30 rounded-lg border border-blue-900/50">
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Component:</span> {getComponentName(component, 0)}
              </p>
            </div>

            {isRiskBased ? (
              <>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">
                  Optimized Time For Maintenance (t):
                </h3>
                <RiskBasedTable component={component} />
              </>
            ) : (
              <OptimizationSummary component={component} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Multiple components view with accordion
  if (hasMultipleComponents) {
    return (
      <div className="w-full bg-muted/30 rounded-xl p-8 border border-gray-800 mt-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1a1a1a] rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <h2 className="text-2xl font-light">Optimization Results</h2>
            </div>

            <p className="text-gray-400 mb-6">
              Results for {results.components!.length} component{results.components!.length > 1 ? 's' : ''}
            </p>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {results.components!.map((component, idx) => {
                const displayName = getComponentName(component, idx);
                
                return (
                  <AccordionItem
                    key={component.component_id || idx}
                    value={`item-${idx}`}
                    className="border border-gray-700 rounded-lg bg-muted/40"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/60 rounded-lg transition-colors">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="font-semibold text-gray-200">
                            {displayName}
                          </span>
                        </div>
                        {component.t !== undefined && (
                          <span className="text-sm text-gray-400">
                            Optimal time: <span className="text-blue-400 font-semibold">{component.t.toFixed(2)}h</span>
                          </span>
                        )}
                        {/* {component.t_values && component.t_values.length > 0 && (
                          <span className="text-sm text-gray-400">
                            Risk levels: <span className="text-blue-400 font-semibold">{component.t_values.length}</span>
                          </span>
                        )} */}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      {isRiskBased ? (
                        <>
                          <h4 className="text-sm font-semibold text-gray-300 mb-4">
                            Optimized Time For Maintenance (t):
                          </h4>
                          {/* Weibull Parameters Display */}
{(component.eta !== undefined || component.beta !== undefined) && (
  <div className="mb-4 p-4 bg-purple-950/30 rounded-lg border border-purple-900/50">
    <p className="text-sm text-gray-300 flex items-center gap-4">
      <span className="font-semibold text-purple-400">Weibull Parameters:</span>
      {component.eta !== undefined && (
        <span>
          <span className="text-gray-400">η (eta):</span> 
          <span className="ml-1 font-mono text-purple-300">{component.eta.toFixed(4)}</span>
        </span>
      )}
      {component.beta !== undefined && (
        <span>
          <span className="text-gray-400">β (beta):</span> 
          <span className="ml-1 font-mono text-purple-300">{component.beta.toFixed(4)}</span>
        </span>
      )}
    </p>
  </div>
)}
                          <RiskBasedTable component={component} />
                        </>
                      ) : (
                        <OptimizationSummary component={component} />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OptimizationResults;