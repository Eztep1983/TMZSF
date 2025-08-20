import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Configuración</h1>
      <Card>
        <CardHeader>
          <CardTitle>Información del Negocio</CardTitle>
          <CardDescription>
            Actualiza los datos de tu negocio. Estos cambios se reflejarán en todo el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="business-name">Nombre del Negocio</label>
                <Input id="business-name" defaultValue="TecniControl" />
            </div>
            <div className="space-y-2">
                <label htmlFor="business-phone">Teléfono</label>
                <Input id="business-phone" defaultValue="(123) 456-7890" />
            </div>
             <div className="space-y-2">
                <label htmlFor="business-logo">Logo</label>
                <Input id="business-logo" type="file" />
                <p className="text-sm text-muted-foreground">Sube el logo de tu negocio (opcional).</p>
            </div>
            <div className="flex justify-end">
                <Button>Guardar Cambios</Button>
            </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>
            Administra los roles de los usuarios de tu equipo.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">La gestión de usuarios y roles estará disponible próximamente.</p>
        </CardContent>
      </Card>
    </div>
  );
}
