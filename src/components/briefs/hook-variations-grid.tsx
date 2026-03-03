import type { HookVariation } from "@/lib/types";
import { StatusBadge } from "@/components/shared/status-badge";

export function HookVariationsGrid({ hooks }: { hooks: HookVariation[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Hook Variations ({hooks.length})
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {hooks.map((hook) => (
          <div
            key={hook.id}
            className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {hook.hookTitle || "Hook"}
              </h3>
              {hook.hookType && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {hook.hookType}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {hook.hookText}
            </p>
            {hook.visualDescription && (
              <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500">Visual</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {hook.visualDescription}
                </p>
              </div>
            )}
            {hook.whyItWorks && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-500">Why it works</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {hook.whyItWorks}
                </p>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              {hook.platformBestFit && (
                <span className="text-xs text-gray-500">{hook.platformBestFit}</span>
              )}
              {hook.estimatedStopRate && (
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Stop rate: {hook.estimatedStopRate}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
