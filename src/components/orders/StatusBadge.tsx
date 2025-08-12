import { Badge } from "@/components/ui/badge";
import { EstadoOrden } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: EstadoOrden;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusColors: Record<EstadoOrden, string> = {
    "Recibido": "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700",
    "En diagnóstico": "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
    "En reparación": "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700",
    "Listo para entrega": "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700",
    "Entregado": "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", statusColors[status])}
    >
      {status}
    </Badge>
  );
}
