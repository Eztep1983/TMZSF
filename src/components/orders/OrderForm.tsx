"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, PlusCircle, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Orden, Cliente } from "@/types";
import { mockClients } from "@/lib/data";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

const formSchema = z.object({
  clientId: z.string().min(1, { message: "El cliente es requerido." }),
  deviceType: z.enum(["Laptop", "Teléfono", "Tablet", "Otro"]),
  problemDescription: z.string().min(10, {
    message: "La descripción del problema debe tener al menos 10 caracteres.",
  }),
  status: z.enum([
    "Recibido",
    "En diagnóstico",
    "En reparación",
    "Listo para entrega",
    "Entregado",
  ]),
  parts: z.array(
    z.object({
      name: z.string().min(1, "El nombre del repuesto es requerido."),
      quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1."),
      price: z.coerce.number().min(0, "El precio no puede ser negativo."),
    })
  ),
  estimatedBudget: z.coerce.number().optional(),
});

type OrderFormValues = z.infer<typeof formSchema>;

interface OrderFormProps {
  initialData?: Orden | null;
}

const newClientSchema = z.object({
    name: z.string().min(2, "El nombre es requerido"),
    email: z.string().email("Dirección de email inválida"),
    phone: z.string().min(8, "El número de teléfono parece muy corto"),
});


export function OrderForm({ initialData }: OrderFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [clients, setClients] = useState<Cliente[]>(mockClients);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

  const defaultValues = initialData
    ? {
        clientId: initialData.client.id,
        deviceType: initialData.deviceType,
        problemDescription: initialData.problemDescription,
        status: initialData.status,
        parts: initialData.parts.map(p => ({name: p.name, quantity: p.quantity, price: p.price})),
        estimatedBudget: initialData.estimatedBudget
      }
    : {
        clientId: "",
        deviceType: "Laptop" as const,
        problemDescription: "",
        status: "Recibido" as const,
        parts: [],
        estimatedBudget: 0,
      };

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parts",
  });

  const newClientForm = useForm<z.infer<typeof newClientSchema>>({
    resolver: zodResolver(newClientSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const handleNewClientSubmit = (values: z.infer<typeof newClientSchema>) => {
    const newClient: Cliente = {
        id: `C${clients.length + 1}`,
        ...values,
    };
    setClients(prev => [...prev, newClient]);
    form.setValue('clientId', newClient.id);
    toast({ title: "Cliente agregado", description: `${newClient.name} ha sido agregado a la lista de clientes.` });
    newClientForm.reset();
    setIsClientDialogOpen(false);
  };


  const onSubmit = (data: OrderFormValues) => {
    toast({
      title: initialData ? "Orden Actualizada" : "Orden Creada",
      description: `La orden ${initialData ? initialData.id : "nueva"} ha sido guardada.`,
    });
    console.log(data);
    router.push("/ordenes");
    router.refresh();
  };

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Cliente y Dispositivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
                <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                    <FormItem className="flex-grow">
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un cliente" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.email}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon">
                            <UserPlus className="h-4 w-4" />
                            <span className="sr-only">Agregar Nuevo Cliente</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                            <DialogDescription>Ingrese los detalles del nuevo cliente.</DialogDescription>
                        </DialogHeader>
                        <Form {...newClientForm}>
                            <form onSubmit={newClientForm.handleSubmit(handleNewClientSubmit)} id="new-client-form" className="space-y-4 py-4">
                               <FormField control={newClientForm.control} name="name" render={({field}) => (
                                   <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} placeholder="John Doe" /></FormControl><FormMessage /></FormItem>
                               )} />
                                <FormField control={newClientForm.control} name="email" render={({field}) => (
                                   <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" placeholder="john.doe@example.com" /></FormControl><FormMessage /></FormItem>
                               )} />
                                <FormField control={newClientForm.control} name="phone" render={({field}) => (
                                   <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} type="tel" placeholder="(123) 456-7890" /></FormControl><FormMessage /></FormItem>
                               )} />
                            </form>
                        </Form>
                        <DialogFooter>
                           <Button type="button" variant="ghost" onClick={() => setIsClientDialogOpen(false)}>Cancelar</Button>
                           <Button type="submit" form="new-client-form">Guardar Cliente</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <FormField
              control={form.control}
              name="deviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Dispositivo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo de dispositivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                      <SelectItem value="Teléfono">Teléfono</SelectItem>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles del Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="problemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Problema</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Pantalla rota, problema de batería, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Estado de la Orden</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Recibido">Recibido</SelectItem>
                        <SelectItem value="En diagnóstico">En diagnóstico</SelectItem>
                        <SelectItem value="En reparación">En reparación</SelectItem>
                        <SelectItem value="Listo para entrega">
                            Listo para entrega
                        </SelectItem>
                        <SelectItem value="Entregado">Entregado</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="estimatedBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presupuesto Estimado ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repuestos Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            {fields.length === 0 && <p className="text-sm text-muted-foreground">No se han agregado repuestos.</p>}
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_120px_auto] gap-4 items-end">
                  <FormField
                    control={form.control}
                    name={`parts.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={cn(index !== 0 && "sr-only")}>
                          Nombre del Repuesto
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: Pantalla iPhone 13" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`parts.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={cn(index !== 0 && "sr-only")}>
                          Cantidad
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`parts.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={cn(index !== 0 && "sr-only")}>
                          Precio ($)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Quitar repuesto</span>
                  </Button>
                </div>
                {index < fields.length - 1 && <Separator />}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => append({ name: "", quantity: 1, price: 0 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Repuesto
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            {initialData ? "Guardar Cambios" : "Crear Orden"}
          </Button>
        </div>
      </form>
    </Form>
    </>
  );
}
