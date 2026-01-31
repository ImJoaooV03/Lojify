import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function SuperAdminSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Configurações Globais</h2>
        <p className="text-slate-500">Parâmetros que afetam toda a plataforma.</p>
      </div>

      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-red-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-100 shadow-sm">
            <div>
              <h3 className="font-medium text-slate-900">Modo de Manutenção</h3>
              <p className="text-sm text-slate-500">
                Se ativado, impede o login de lojistas e exibe página de manutenção.
                <br/>
                <span className="font-bold text-red-600">O Super Admin continua com acesso.</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${maintenanceMode ? 'text-red-600' : 'text-slate-400'}`}>
                {maintenanceMode ? 'ATIVADO' : 'DESATIVADO'}
              </span>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  maintenanceMode ? 'bg-red-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-slate-900">Novos Checkouts (Beta)</p>
              <p className="text-sm text-slate-500">Habilita o novo fluxo de checkout para 10% das lojas.</p>
            </div>
            <Button variant="outline" size="sm">Configurar</Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">Integração IA Generativa</p>
              <p className="text-sm text-slate-500">Permite geração de descrição de produtos via IA.</p>
            </div>
            <Button variant="outline" size="sm">Configurar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
