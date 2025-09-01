"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Loader2, User, Mail, Phone, MapPin, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
} from "lucide-react";
import type { Cliente } from "@/types/orden";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

interface ClientesDataTableProps {
  data: Cliente[];
}

export function ClientesDataTable({ data }: ClientesDataTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<Record<string, string>>({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtrar clientes basado en el término de búsqueda
  const filteredClientes = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((cliente) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        cliente.name?.toLowerCase().includes(searchLower) ||
        cliente.email?.toLowerCase().includes(searchLower) ||
        cliente.phone?.toLowerCase().includes(searchLower) ||
        cliente.cedula?.toLowerCase().includes(searchLower) ||
        cliente.address?.toLowerCase().includes(searchLower) 
      );
    });
  }, [data, searchTerm]);

  // Calcular el total de páginas
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

  // Asegurarse de que la página actual esté dentro del rango válido
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Obtener los clientes para la página actual
  const paginatedClientes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClientes.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredClientes, itemsPerPage]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Confirmación antes de eliminar
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.")) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, [id]: "deleting" }));
    
    try {
      await deleteDoc(doc(db, "clientes", id));
      
      toast({
        title: "✅ Cliente eliminado",
        description: "El cliente ha sido eliminado correctamente.",
        variant: "default", 
      });

      // Si eliminamos el último elemento de la página, retroceder una página
      if (paginatedClientes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      router.refresh();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar el cliente. " + 
                    (error instanceof Error ? error.message : "Intente nuevamente más tarde."),
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => {
        const newStates = { ...prev };
        delete newStates[id];
        return newStates;
      });
    }
  };

  const handleNavigation = async (path: string, id: string, action: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: action }));
    
    // Pequeña demora para que se vea el feedback visual
    await new Promise(resolve => setTimeout(resolve, 300));
    
    router.push(path);
  };

  const handleRowClick = async (id: string) => {
    await handleNavigation(`/clientes/${id}`, id, "viewing");
  };

  const handleEditClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await handleNavigation(`/clientes/${id}/editar`, id, "editing");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4">
      {/* Loading overlay global */}
      {globalLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Cargando...</p>
          </div>
        </div>
      )}
      
      {/* Tarjeta con el total de clientes */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border p-4 md:p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Total de Clientes Registrados</h2>
            <p className="text-3xl font-bold text-blue-700">{data.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? `${filteredClientes.length} coinciden con tu búsqueda` : 'Gestión completa de clientes'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Barra de búsqueda y controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-md">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes..."
            className="pl-8 w-full sm:w-[800px]"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Mostrar
          </span>
          <select
            className="h-9 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-sm text-muted-foreground">
            por página
          </span>
        </div>
      </div>
      
      {/* Información de resultados */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {filteredClientes.length === 0 
            ? "No se encontraron clientes" 
            : `Mostrando ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, filteredClientes.length)} de ${filteredClientes.length} cliente${filteredClientes.length !== 1 ? 's' : ''}`
          }
        </p>
        
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm("")}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar búsqueda
            <span className="sr-only">Limpiar búsqueda</span>
          </Button>
        )}
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table className="min-w-[600px] lg:min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Nombre</TableHead>
              <TableHead className="w-[25%] hidden md:table-cell">Email</TableHead>
              <TableHead className="w-[15%]">Teléfono</TableHead>
              <TableHead className="w-[30%] hidden sm:table-cell">Dirección</TableHead>
              <TableHead className="w-[10%] text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClientes.length > 0 ? (
              paginatedClientes.map((client) => {
                const isLoading = loadingStates[client.id!];
                const isDeleting = isLoading === "deleting";
                const isViewing = isLoading === "viewing";
                const isEditing = isLoading === "editing";
                
                return (
                  <TableRow 
                    key={client.id}
                    onClick={() => !isLoading && handleRowClick(client.id!)}
                    className={`cursor-pointer transition-all duration-200 ${isLoading ? "opacity-70 pointer-events-none" : "hover:bg-muted/50"}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isViewing ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex flex-col">
                          <span>{client.name}</span>
                          <span className="text-xs text-muted-foreground">{client.cedula}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {client.phone}
                      </div>
                    </TableCell>
                    
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{client.address || "-"}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        {/* Botones de acción visibles en pantallas grandes */}
                        <div className="hidden md:flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => handleEditClick(client.id!, e)}
                            title="Editar cliente"
                            disabled={!!isLoading}
                          >
                            {isEditing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRowClick(client.id!)}
                            title="Ver detalles"
                            disabled={!!isLoading}
                          >
                            {isViewing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => handleDelete(client.id!, e)}
                            title="Eliminar cliente"
                            disabled={!!isLoading}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                        
                        {/* Menú desplegable para pantallas pequeñas */}
                        <div className="md:hidden">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" className="h-8 w-8 p-0" disabled={!!isLoading}>
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </>
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              
                              <DropdownMenuItem 
                                onClick={(e) => handleEditClick(client.id!, e)}
                                className="cursor-pointer"
                                disabled={!!isLoading}
                              >
                                {isEditing ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Edit className="mr-2 h-4 w-4" />
                                )}
                                Editar
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => handleRowClick(client.id!)}
                                className="cursor-pointer"
                                disabled={!!isLoading}
                              >
                                {isViewing ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Eye className="mr-2 h-4 w-4" />
                                )}
                                Ver detalles
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                className="text-destructive cursor-pointer"
                                onClick={(e) => handleDelete(client.id!, e)}
                                disabled={!!isLoading}
                              >
                                {isDeleting ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {searchTerm ? 
                    "No se encontraron clientes que coincidan con tu búsqueda." : 
                    "No hay clientes registrados."
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Ir a la primera página</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Ir a la página anterior</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Números de página */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      className="h-8 w-8 p-0"
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-1">...</span>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => goToPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Ir a la página siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Ir a la última página</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast de confirmación de eliminación */}
      <div className="fixed bottom-4 right-4 z-50 transition-transform duration-300 transform translate-y-0">
        {/* Este espacio está reservado para toasts personalizados si es necesario */}
      </div>
    </div>
  );
}