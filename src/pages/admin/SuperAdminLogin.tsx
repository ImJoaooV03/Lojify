import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader2, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const { login } = useSuperAdmin();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Simulating network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = login(email, password);

    if (success) {
      navigate('/admin/super');
    } else {
      setError('Credenciais de administrador inválidas.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 font-bold text-3xl text-white mb-2">
          <ShieldAlert className="h-10 w-10 text-indigo-500" />
          <span>Lojify Admin</span>
        </div>
        <p className="text-slate-400">Acesso Restrito - Nível Super Admin</p>
      </div>

      <Card className="w-full max-w-md border-slate-800 bg-slate-950 text-slate-200">
        <CardHeader>
          <CardTitle className="text-center text-white flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" /> Autenticação Segura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-900 text-red-400 p-3 rounded-md text-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Email Administrativo</label>
              <Input 
                name="email" 
                type="email" 
                placeholder="admin@lojify.com" 
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500"
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Chave de Acesso</label>
              <Input 
                name="password" 
                type="password" 
                className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-500"
                required 
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Acessar Painel
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Este acesso é monitorado. IP registrado: 192.168.1.X
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
