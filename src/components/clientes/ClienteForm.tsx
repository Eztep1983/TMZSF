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
import type { Cliente, Dispositivo } from "@/types/orden";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { Plus, Trash2, Monitor } from "lucide-react";

const dispositivoSchema = z.object({
  tipo: z.string().min(1, { message: "El tipo es requerido" }),
  marca: z.string().min(1, { message: "La marca es requerida" }),
  modelo: z.string().min(1, { message: "El modelo es requerido" }),
  numeroSerie: z.string().min(1, { message: "El número de serie es requerido" }),
  fechaCompra: z.string().optional(),
  observaciones: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor ingrese un email válido." }),
  phone: z.string().min(8, { message: "El número de teléfono parece muy corto." }),
  address: z.string().optional(),
  observations: z.string().optional(),
  dispositivos: z.array(dispositivoSchema).min(1, { message: "Debe agregar al menos un dispositivo" }),
});

type ClienteFormValues = z.infer<typeof formSchema>;

interface ClienteFormProps {
  initialData?: Cliente | null;
}

export function ClienteForm({ initialData }: ClienteFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = initialData ? {
    name: initialData.name,
    email: initialData.email,
    phone: initialData.phone,
    address: initialData.address || "",
    observations: initialData.observations || "",
    dispositivos: initialData.dispositivos.map(d => ({
      tipo: d.tipo,
      marca: d.marca,
      modelo: d.modelo,
      numeroSerie: d.numeroSerie,
      fechaCompra: d.fechaCompra ? new Date(d.fechaCompra).toISOString().split('T')[0] : "",
      observaciones: d.observaciones || "",
    }))
  } : {
    name: "",
    email: "",
    phone: "",
    address: "",
    observations: "",
    dispositivos: [{
      tipo: "",
      marca: "",
      modelo: "",
      numeroSerie: "",
      fechaCompra: "",
      observaciones: "",
    }]
  };

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [dispositivos, setDispositivos] = useState(defaultValues.dispositivos);

  const agregarDispositivo = () => {
    const nuevosDispositivos = [...dispositivos, {
      tipo: "",
      marca: "",
      modelo: "",
      numeroSerie: "",
      fechaCompra: "",
      observaciones: "",
    }];
    setDispositivos(nuevosDispositivos);
    form.setValue("dispositivos", nuevosDispositivos);
  };

  const eliminarDispositivo = (index: number) => {
    if (dispositivos.length > 1) {
      const nuevosDispositivos = dispositivos.filter((_, i) => i !== index);
      setDispositivos(nuevosDispositivos);
      form.setValue("dispositivos", nuevosDispositivos);
    }
  };

  const actualizarDispositivo = (index: number, campo: string, valor: string) => {
    const nuevosDispositivos = [...dispositivos];
    nuevosDispositivos[index] = { ...nuevosDispositivos[index], [campo]: valor };
    setDispositivos(nuevosDispositivos);
    form.setValue("dispositivos", nuevosDispositivos);
  };

  const onSubmit = async (data: ClienteFormValues) => {
    setIsLoading(true);
    try {
      // Convertir dispositivos al formato correcto, filtrando undefined
      const dispositivosConId = data.dispositivos.map((dispositivo, index) => {
        const dispositivoData: any = {
          id: initialData?.dispositivos[index]?.id || `${Date.now()}-${index}`,
          tipo: dispositivo.tipo,
          marca: dispositivo.marca,
          modelo: dispositivo.modelo,
          numeroSerie: dispositivo.numeroSerie,
        };

        // Solo agregar campos opcionales si tienen valor
        if (dispositivo.fechaCompra) {
          dispositivoData.fechaCompra = new Date(dispositivo.fechaCompra);
        }
        if (dispositivo.observaciones && dispositivo.observaciones.trim()) {
          dispositivoData.observaciones = dispositivo.observaciones.trim();
        }

        return dispositivoData;
      });

      // Construir datos del cliente, filtrando undefined
      const clienteData: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        dispositivos: dispositivosConId,
        updatedAt: new Date().toISOString(),
      };

      // Solo agregar campos opcionales si tienen valor
      if (data.address && data.address.trim()) {
        clienteData.address = data.address.trim();
      }
      if (data.observations && data.observations.trim()) {
        clienteData.observations = data.observations.trim();
      }

      if (initialData && initialData.id) {
        // Actualizar cliente existente
        const clienteRef = doc(db, "clientes", initialData.id);
        await updateDoc(clienteRef, clienteData);
        toast({
          title: "Cliente Actualizado",
          description: `El cliente ${data.name} ha sido actualizado correctamente.`,
          variant: "default",
        });
      } else {
        // Crear nuevo cliente
        await addDoc(collection(db, "clientes"), {
          ...clienteData,
          createdAt: new Date().toISOString(),
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
                    <Input placeholder="Nombre" {...field} />
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
                      <Input type="email" placeholder="email@example.com" {...field} />
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
                      <Input type="tel" placeholder="(57) 123456789" {...field} />
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
                    <Input placeholder="Escriba la dirección de su cliente" {...field} />
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
                    <Textarea placeholder="Observaciones adicionales sobre el cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Dispositivos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                Dispositivos del Cliente
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarDispositivo}
                className="text-green-600 hover:text-green-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar 
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {dispositivos.map((dispositivo, index) => (
              <div key={index} className="p-4 border rounded-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Dispositivo {index + 1}
                  </h4>
                  {dispositivos.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarDispositivo(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Dispositivo *
                    </label>
                    <select
                      value={dispositivo.tipo}
                      onChange={(e) => actualizarDispositivo(index, "tipo", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="impresora">Impresora</option>
                      <option value="fotocopiadora">Fotocopiadora</option>
                      <option value="multifuncional">Multifuncional</option>
                      <option value="escaner">Escáner</option>
                      <option value="plotter">Plotter</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca *
                    </label>
                    <Input
                      value={dispositivo.marca}
                      onChange={(e) => actualizarDispositivo(index, "marca", e.target.value)}
                      placeholder="Ej: Canon, HP, Epson"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo *
                    </label>
                    <Input
                      value={dispositivo.modelo}
                      onChange={(e) => actualizarDispositivo(index, "modelo", e.target.value)}
                      placeholder="Modelo del dispositivo"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Serie *
                    </label>
                    <Input
                      value={dispositivo.numeroSerie}
                      onChange={(e) => actualizarDispositivo(index, "numeroSerie", e.target.value)}
                      placeholder="Número de serie"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Compra
                    </label>
                    <Input
                      type="date"
                      value={dispositivo.fechaCompra}
                      onChange={(e) => actualizarDispositivo(index, "fechaCompra", e.target.value)}
                    />
                  </div>
                  
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones
                    </label>
                    <Textarea
                      value={dispositivo.observaciones}
                      onChange={(e) => actualizarDispositivo(index, "observaciones", e.target.value)}
                      placeholder="Observaciones sobre el dispositivo"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
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