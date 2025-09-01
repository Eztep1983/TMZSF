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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Cliente, Dispositivo } from "@/types/orden";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { Plus, Trash2, Monitor, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const dispositivoSchema = z.object({
  tipo: z.string().min(1, { message: "El tipo es requerido" }),
  marca: z.string().min(1, { message: "La marca es requerida" }),
  modelo: z.string().min(1, { message: "El modelo es requerido" }),
  numeroSerie: z.string().min(1, { message: "El número de serie es requerido" }),
});

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  cedula: z.string()
    .min(4, { message: "La cédula/NIT debe tener al menos 4 caracteres." })
    .regex(/^[0-9A-Za-z-]+$/, { message: "Solo se permiten números, letras y guiones." }),
  email: z.string().email({ message: "Por favor ingrese un email válido." }),
  phone: z.string().min(8, { message: "El número de teléfono parece muy corto." }),
  address: z.string().optional(),
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
  const [formError, setFormError] = useState<string | null>(null);

  // Función para crear valores por defecto seguros
  const createDefaultValues = (data?: Cliente | null): ClienteFormValues => {
    
    if (data) {
      const result = {
        name: data.name || "",
        cedula: data.cedula || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        dispositivos: data.dispositivos?.map(d => ({
          tipo: d.tipo || "",
          marca: d.marca || "",
          modelo: d.modelo || "",
          numeroSerie: d.numeroSerie || "",
        })) || [{
          tipo: "",
          marca: "",
          modelo: "",
          numeroSerie: "",
        }]
      };
      return result;
    }
    
    return {
      name: "",
      cedula: "",
      email: "",
      phone: "",
      address: "",
      dispositivos: [{
        tipo: "",
        marca: "",
        modelo: "",
        numeroSerie: "",
      }]
    };
  };

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(initialData),
    mode: "onChange"
  });

  // Usar directamente los valores del formulario en lugar de estado separado
  const dispositivos = form.watch("dispositivos") || [];

  // Efecto simplificado que se ejecuta cada vez que cambia initialData
  useEffect(() => {
    
    if (initialData) {
      const resetData = createDefaultValues(initialData);      
      // Reset inmediato sin setTimeout
      form.reset(resetData);
      
    }
  }, [initialData]); // Dependencia simple: solo initialData

  const agregarDispositivo = () => {
    const dispositivosActuales = form.getValues("dispositivos");
    const nuevosDispositivos = [...dispositivosActuales, {
      tipo: "",
      marca: "",
      modelo: "",
      numeroSerie: "",
    }];
    form.setValue("dispositivos", nuevosDispositivos, { shouldValidate: true });
  };

  const eliminarDispositivo = (index: number) => {
    const dispositivosActuales = form.getValues("dispositivos");
    
    if (dispositivosActuales.length > 1) {
      const nuevosDispositivos = dispositivosActuales.filter((_, i) => i !== index);
      form.setValue("dispositivos", nuevosDispositivos, { shouldValidate: true });
      
      toast({
        title: "Dispositivo eliminado",
        description: "El dispositivo ha sido removido de la lista.",
        variant: "default",
      });
    } else {
      toast({
        title: "No se puede eliminar",
        description: "Debe haber al menos un dispositivo.",
        variant: "destructive",
      });
    }
  };

  const actualizarDispositivo = (index: number, campo: string, valor: string) => {
    const dispositivosActuales = form.getValues("dispositivos");
    const nuevosDispositivos = [...dispositivosActuales];
    nuevosDispositivos[index] = { ...nuevosDispositivos[index], [campo]: valor };
    form.setValue("dispositivos", nuevosDispositivos, { shouldValidate: true });
  };

  const onSubmit = async (data: ClienteFormValues) => {
    setIsLoading(true);
    setFormError(null);
    
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

        return dispositivoData;
      });

      // Construir datos del cliente, filtrando undefined
      const clienteData: any = {
        name: data.name,
        cedula: data.cedula,
        email: data.email,
        phone: data.phone,
        dispositivos: dispositivosConId,
        updatedAt: new Date().toISOString(),
      };

      // Solo agregar campos opcionales si tienen valor
      if (data.address && data.address.trim()) {
        clienteData.address = data.address.trim();
      }

      if (initialData && initialData.id) {
        // Actualizar cliente existente
        const clienteRef = doc(db, "clientes", initialData.id);
        await updateDoc(clienteRef, clienteData);
        toast({
          title: "✅ Cliente Actualizado",
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
          title: "✅ Cliente Creado",
          description: `El cliente ${data.name} ha sido creado correctamente.`,
          variant: "default",
        });
      }
      
      // Redirigir después de un breve delay para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        router.push("/clientes");
        router.refresh();
      }, 1000);
      
    } catch (error) {
      console.error("Error al guardar el cliente:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado";
      setFormError(errorMessage);
      
      toast({
        title: "❌ Error",
        description: "Ocurrió un error al guardar el cliente. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {formError && (
          <Alert variant="destructive" className="animate-in fade-in duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        <Card className="shadow-sm transition-all duration-300 hover:shadow-md">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <span className="text-gray-700">Nombre Completo</span>
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nombre del cliente" 
                      {...field} 
                      disabled={isLoading}
                      className="transition-colors focus:ring-2 focus:ring-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cedula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <span className="text-gray-700">Número de Cédula o NIT</span>
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Cédula o NIT del cliente" 
                      {...field} 
                      disabled={isLoading}
                      className="transition-colors focus:ring-2 focus:ring-green-500"
                    />
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
                    <FormLabel className="flex items-center">
                      <span className="text-gray-700">Email</span>
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="cliente@ejemplo.com" 
                        {...field} 
                        disabled={isLoading}
                        className="transition-colors focus:ring-2 focus:ring-green-500"
                      />
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
                    <FormLabel className="flex items-center">
                      <span className="text-gray-700">Teléfono</span>
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="(57) 123-456-7890" 
                        {...field} 
                        disabled={isLoading}
                        className="transition-colors focus:ring-2 focus:ring-green-500"
                      />
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
                  <FormLabel className="text-gray-700">Dirección</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Dirección completa del cliente" 
                      {...field} 
                      disabled={isLoading}
                      className="transition-colors focus:ring-2 focus:ring-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Dispositivos */}
        <Card className="shadow-sm transition-all duration-300 hover:shadow-md">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-blue-500" />
                Dispositivos del Cliente
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                  {dispositivos.length} {dispositivos.length === 1 ? 'dispositivo' : 'dispositivos'}
                </Badge>
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarDispositivo}
                disabled={isLoading}
                className="border-green-200 text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar Dispositivo
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            {form.formState.errors.dispositivos && (
              <Alert variant="destructive" className="animate-in fade-in duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {form.formState.errors.dispositivos.message}
                </AlertDescription>
              </Alert>
            )}
            
            {dispositivos.map((dispositivo, index) => (
              <div key={index} className="p-4 border rounded-lg relative bg-gray-50/50 transition-all hover:bg-white">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Dispositivo {index + 1}
                    </h4>
                    {dispositivo.tipo && (
                      <Badge variant="secondary" className="ml-2">
                        {dispositivo.tipo}
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarDispositivo(index)}
                    disabled={isLoading || dispositivos.length <= 1}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Dispositivo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={dispositivo.tipo}
                      onChange={(e) => actualizarDispositivo(index, "tipo", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Seleccionar tipo...</option>
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
                      Marca <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={dispositivo.marca}
                      onChange={(e) => actualizarDispositivo(index, "marca", e.target.value)}
                      placeholder="Ej: Canon, HP, Epson"
                      required
                      disabled={isLoading}
                      className="transition-colors focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={dispositivo.modelo}
                      onChange={(e) => actualizarDispositivo(index, "modelo", e.target.value)}
                      placeholder="Modelo del dispositivo"
                      required
                      disabled={isLoading}
                      className="transition-colors focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Serie <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={dispositivo.numeroSerie}
                      onChange={(e) => actualizarDispositivo(index, "numeroSerie", e.target.value)}
                      placeholder="Número de serie único"
                      required
                      disabled={isLoading}
                      className="transition-colors focus:ring-2 focus:ring-green-500"
                    />
                  </div> 
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isLoading}
            className="transition-colors"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 transition-colors min-w-[150px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : initialData ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Crear Cliente
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}