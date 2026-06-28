import { useState, useRef } from 'react';
import { Download, Upload, ChevronRight, Share2, X, Beaker } from 'lucide-react';
import { useBackup } from '../hooks/useBackup';
import { usePWA } from '../hooks/usePWA';

interface SettingsProps {
  populateMockData?: () => void;
}

export default function Settings({ populateMockData }: SettingsProps) {
  const { exportData, importData } = useBackup();
  const { isIOS, triggerInstall, canInstall } = usePWA();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = await importData(file);
    if (error) {
      alert(error);
    }

    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const closeModal = () => {
    setShowInstallModal(false);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-[#922d4d] mb-4">Configurações</h2>

      {/* Export Backup */}
      <button
        onClick={exportData}
        className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-[#cd8ea1]/30 text-[#922d4d] font-medium active:scale-95 transition-all duration-300 ease-in-out"
        aria-label="Exportar backup dos dados"
      >
        <div className="flex items-center gap-3">
          <Download className="w-5 h-5" />
          <span>Exportar Backup</span>
        </div>
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Import Backup */}
      <button
        onClick={handleImportClick}
        className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-[#cd8ea1]/30 text-[#922d4d] font-medium active:scale-95 transition-all duration-300 ease-in-out"
        aria-label="Importar backup dos dados"
      >
        <div className="flex items-center gap-3">
          <Upload className="w-5 h-5" />
          <span>Importar Backup</span>
        </div>
        <ChevronRight className="w-5 h-5" />
      </button>

      <input
        type="file"
        accept=".json"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Install App */}
      {canInstall && (
        <button
          onClick={() => setShowInstallModal(true)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-[#cd8ea1]/30 text-[#922d4d] font-medium active:scale-95 transition-all duration-300 ease-in-out"
          aria-label="Instalar aplicativo"
        >
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5" />
            <span>Instalar App</span>
          </div>
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Dev-only: Popular Dados de Teste */}
      {import.meta.env.DEV && populateMockData && (
        <>
          <hr className="border-t border-dashed border-[#c47590]/30 my-4" />
          <button
            onClick={() => {
              if (window.confirm('Gerar 365 dias de dados de teste? Isso substituirá todos os dados existentes.')) {
                populateMockData();
              }
            }}
            className="w-full flex items-center justify-between p-4 bg-[#c47590]/10 rounded-xl border border-dashed border-[#c47590]/40 text-[#c47590] font-medium active:scale-95 transition-all duration-300 ease-in-out"
            aria-label="Popular dados de teste"
          >
            <div className="flex items-center gap-3">
              <Beaker className="w-5 h-5" />
              <span>Popular Dados de Teste</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* PWA Install Modal */}
      {canInstall && showInstallModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Instalar aplicativo"
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl p-6 shadow-[0_-10px_25px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-500 translate-y-0"
          >
            <div className="flex justify-center mb-4">
              <img src="/logo-transparente.png" alt="Desborocoxando" className="h-12 w-auto" />
            </div>

            {!isIOS ? (
              /* Android / Chrome */
              <>
                <p className="text-center text-[#922d4d] mb-4">
                  Instale o Desborocoxando para acesso rápido offline!
                </p>
                <button
                  onClick={() => {
                    triggerInstall();
                    closeModal();
                  }}
                  className="w-full bg-[#c47590] text-white py-3 rounded-xl font-semibold active:scale-95 transition-all"
                  aria-label="Instalar aplicativo"
                >
                  Instalar App Desborocoxando
                </button>
              </>
            ) : (
              /* iOS / Safari */
              <>
                <div className="bg-[#f7e1e3] rounded-xl p-4 mb-4">
                  <p className="text-sm text-[#922d4d] text-center leading-relaxed">
                    Para instalar no seu iPhone, toque no ícone de compartilhamento
                    <span className="inline-block mx-1">
                      <Share2 className="w-4 h-4 inline" />
                    </span>
                    do Safari e depois selecione &ldquo;Adicionar à Tela de Início&rdquo;.
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full bg-[#cd8ea1]/30 text-[#922d4d] py-3 rounded-xl font-medium active:scale-95 transition-all"
                >
                  Entendi
                </button>
              </>
            )}

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#922d4d]"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
