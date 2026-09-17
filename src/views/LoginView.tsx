import React, { useState } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { login } = useApp();

  const [identifier, setIdentifier] = useState('alexis');
  const [password, setPassword] = useState('dalexis123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Veuillez renseigner votre nom d\'utilisateur ou adresse e-mail et votre mot de passe.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      if (!result.success) {
        setErrorMessage(result.message || 'Identifiants invalides. Mot de passe par défaut: dalexis123');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible de se connecter au serveur backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (username: string) => {
    setIdentifier(username);
    setPassword('dalexis123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] text-slate-800 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white p-4">
      {/* Background Soft Gradients & Atmospheric Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />

      {/* Main Centered Login Card - Clean Pure White */}
      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-300/40 relative overflow-hidden">
          {/* Top subtle light accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

          {/* Header / Intro */}
          <div className="text-center space-y-2 mb-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Portail Opérationnel Sécurisé</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Connexion Plateforme
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-medium">
              Accédez à la gestion des transferts d'argent, à la trésorerie et au routage télécom multi-opérateurs.
            </p>
          </div>

          {/* Error Alert Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="leading-snug font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier: Username or Email */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Nom d'utilisateur ou Adresse e-mail
                </label>
                <span className="text-[10px] text-blue-600 font-semibold">
                  Ex: @alexis ou @ndjidji
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="alexis ou alexis@dalexistransfer.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs font-medium"
                />
              </div>

              {/* Quick helper user pills */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-0.5">
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Raccourcis :</span>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('alexis')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-mono font-medium text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                >
                  @alexis
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('ndjidji')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-mono font-medium text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                >
                  @ndjidji
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('achmad')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-mono font-medium text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                >
                  @achmad
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Mot de passe
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Démo: <span className="font-mono font-semibold text-slate-600">dalexis123</span>
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500/30 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Mémoriser la session
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Vérification des identifiants...</span>
                </>
              ) : (
                <>
                  <span>Ouvrir la session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
