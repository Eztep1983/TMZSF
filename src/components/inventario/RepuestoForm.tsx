"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { RepuestoInventario } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "El precio no puede ser negativo." }),
  stock: z.coerce.number().int().min(0, { message: "El stock no puede ser negativo." }),
});

type RepuestoFormValues = z.infer<typeof formSchema>;

interface RepuestoFormProps {
  initialData?: RepuestoInventario | null;
}

export function RepuestoForm({ initialData }: RepuestoFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues = initialData ? initialData : {
    name: "",
    description: "",
    price: 0,
    stock: 0,
  };

  const form = useForm<RepuestoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (data: RepuestoFormValues) => {
    toast({
      title: initialData ? "Repuesto Actualizado" : "Repuesto Creado",
      description: `El repuesto ${data.name} ha sido guardado.`,
    });
    router.push("/inventario");
    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Información del Repuesto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Repuesto</FormLabel>
                  <FormControl>
                    <Input placeholder="Pantalla iPhone 14" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve descripción del repuesto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Actual</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit">
            {initialData ? "Guardar Cambios" : "Crear Repuesto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
