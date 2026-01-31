import * as React from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "../../lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: "bg-white border-l-4 border-green-500 text-gray-900",
  error: "bg-white border-l-4 border-red-500 text-gray-900",
  info: "bg-white border-l-4 border-blue-500 text-gray-900",
};

export function Toast({ id, title, description, type = "info", onClose }: ToastProps) {
  const Icon = icons[type];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className={cn(
      "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition-all transform ease-out duration-300 mb-3",
      styles[type]
    )}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn("h-6 w-6", {
              "text-green-500": type === "success",
              "text-red-500": type === "error",
              "text-blue-500": type === "info",
            })} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{title}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => onClose(id)}
            >
              <span className="sr-only">Fechar</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
