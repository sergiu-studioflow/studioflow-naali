import { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
      <Icon className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {action}
    </div>
  );
}
