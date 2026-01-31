import { useState } from 'react';
import { User, Lock, Save, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Settings() {
  const { profile, user } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingProfile(true);
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar perfil.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingPass(true);
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      alert('As senhas não coincidem.');
      setLoadingPass(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      alert('Senha alterada com sucesso!');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error(error);
      alert('Erro ao alterar senha.');
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Configurações da Conta</h2>
        <p className="text-gray-500">Gerencie suas informações pessoais e segurança.</p>
      </div>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input value={user?.email} disabled className="bg-gray-100" />
              <p className="text-xs text-gray-500">O email não pode ser alterado.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome Completo</label>
              <Input name="fullName" defaultValue={profile?.full_name || ''} required />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loadingProfile}>
                {loadingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Salvar Perfil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-600" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nova Senha</label>
              <Input name="password" type="password" required minLength={6} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
              <Input name="confirmPassword" type="password" required minLength={6} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={loadingPass}>
                {loadingPass && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Alterar Senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
