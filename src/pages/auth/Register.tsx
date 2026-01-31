import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store as StoreIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { refreshStore } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const storeName = formData.get('storeName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    // Gerar slug simples
    const slug = storeName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create Store
        // A trigger creates the profile, but we need to create the store manually
        // We might need to wait a moment for the trigger to finish creating the profile
        // but typically RLS allows inserting if we own the record.
        
        // Wait a bit for trigger to run (safety measure)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { error: storeError } = await supabase
          .from('stores')
          .insert({
            owner_id: authData.user.id,
            name: storeName,
            slug: `${slug}-${Math.floor(Math.random() * 1000)}`, // Ensure uniqueness
          });

        if (storeError) throw storeError;

        await refreshStore();
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 font-bold text-3xl text-indigo-600 mb-2">
          <StoreIcon className="h-10 w-10" />
          <span>Lojify</span>
        </div>
        <p className="text-gray-600">Comece sua jornada no e-commerce</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Criar sua Loja</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome da Loja</label>
              <Input name="storeName" placeholder="Minha Loja Incrível" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Seu Nome Completo</label>
              <Input name="fullName" placeholder="João Silva" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input name="email" type="email" placeholder="seu@email.com" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <Input name="password" type="password" required minLength={6} />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Começar Grátis
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
