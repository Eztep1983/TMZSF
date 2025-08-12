import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/orders/StatusBadge";
import type { Orden } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface LatestOrdersTableProps {
  orders: Orden[];
}

export function LatestOrdersTable({ orders }: LatestOrdersTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Últimas Órdenes</CardTitle>
        <Button asChild variant="ghost" size="sm">
            <Link href="/ordenes">Ver todas <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Orden</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.client.name}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>{format(order.createdAt, "PPP", { locale: es })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
