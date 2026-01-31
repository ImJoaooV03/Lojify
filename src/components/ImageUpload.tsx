import { useState, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, className, label = "Imagem" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      onChange(data.publicUrl);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-gray-700 block">{label}</label>
      
      {value ? (
        <div className="relative aspect-video w-full max-w-xs rounded-lg overflow-hidden border border-gray-200 group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              type="button" 
              variant="destructive" 
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-4 w-4 mr-2" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          ) : (
            <>
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mb-2 text-indigo-600">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-gray-900">Clique para fazer upload</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG até 2MB</p>
            </>
          )}
        </div>
      )}
      
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleUpload}
        disabled={uploading}
      />
    </div>
  );
}
