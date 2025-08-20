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
import type { Cliente } from "@/types";
import { useState } from "react";
// Importaciones de Firebase
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor ingrese un email válido." }),
  phone: z.string().min(8, { message: "El número de teléfono parece muy corto." }),
  address: z.string().optional(),
  observations: z.string().optional(),
});

type ClienteFormValues = z.infer<typeof formSchema>;

interface ClienteFormProps {
  initialData?: Cliente | null;
}

export function ClienteForm({ initialData }: ClienteFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = initialData ? initialData : {
    name: "",
    email: "",
    phone: "",
    address: "",
    observations: "",
  };

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: ClienteFormValues) => {
    setIsLoading(true);
    try {
      if (initialData && initialData.id) {
        // Actualizar cliente existente
        const clienteRef = doc(db, "clientes", initialData.id);
        await updateDoc(clienteRef, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        toast({
          title: "Cliente Actualizado",
          description: `El cliente ${data.name} ha sido actualizado correctamente.`,
          variant: "default",
        });
      } else {
        // Crear nuevo cliente con ID automático
        await addDoc(collection(db, "clientes"), {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast({
          title: "Cliente Creado",
          description: `El cliente ${data.name} ha sido creado correctamente.`,
          variant: "default",
        });
      }
      router.push("/clientes");
      router.refresh();
    } catch (error) {
      console.error("Error al guardar el cliente:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el cliente. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle Falsa 123, Springfield" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Cliente referido por..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}