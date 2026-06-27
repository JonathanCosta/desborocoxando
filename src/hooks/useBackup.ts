import { useCallback } from 'react';
import { isValidDate } from '../utils/dateUtils';
import { AppDatabaseSchema } from '../schemas';

const STORAGE_KEY = 'desborocoxando_data';

export function useBackup() {
  const exportData = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'desborocoxando-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback((file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (typeof e.target?.result !== 'string') {
            resolve('Erro ao ler o arquivo.');
            return;
          }
          const text = e.target.result;
          const parsed = JSON.parse(text);

          // Verificar se é um objeto plano
          if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            resolve('Arquivo inválido: formato não reconhecido.');
            return;
          }

          // Verificar se as chaves são datas válidas
          const keys = Object.keys(parsed);
          for (const key of keys) {
            if (!isValidDate(key)) {
              resolve(`Arquivo inválido: chave "${key}" não é uma data válida (YYYY-MM-DD).`);
              return;
            }
          }

          // Validar schema completo com Zod
          const result = AppDatabaseSchema.safeParse(parsed);
          if (!result.success) {
            resolve(`Arquivo inválido: schema não corresponde. ${result.error.issues[0]?.message || ''}`);
            return;
          }

          // Sobrescrever localStorage e recarregar
          localStorage.setItem(STORAGE_KEY, text);
          window.location.reload();
          resolve(null); // sucesso
        } catch {
          resolve('Erro ao ler o arquivo. Verifique se é um JSON válido.');
        }
      };
      reader.onerror = () => resolve('Erro ao ler o arquivo.');
      reader.readAsText(file);
    });
  }, []);

  return { exportData, importData };
}
