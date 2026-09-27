import React, { useState } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Moon,
  Sun,
  Globe2,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { login } = useApp();

  const [identifier, setIdentifier] = useState('alexis');
  const [password, setPassword] = useState('dalexis123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Veuillez saisir votre nom d\'utilisateur ou numéro et votre mot de passe.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      if (!result.success) {
        setErrorMessage(result.message || 'Identifiants invalides. Mot de passe par défaut : dalexis123');
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
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative overflow-hidden font-sans flex items-center justify-center p-4 sm:p-6 lg:p-12 transition-colors duration-300 selection:bg-blue-600 selection:text-white">
      
      {/* Dynamic Background Mesh Aurora Glows matching the reference image */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-blue-300/40 via-cyan-200/50 to-transparent dark:from-blue-900/30 dark:via-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-indigo-300/40 via-sky-200/50 to-transparent dark:from-indigo-950/40 dark:via-blue-950/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[45%] h-[45%] bg-blue-200/30 dark:bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.1] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#3b82f6 0.8px, transparent 0.8px)',
          backgroundSize: '32px 32px'
        }} 
      />

      {/* Top Header Bar inside Login Page */}
      <div className="absolute top-6 left-6 right-6 hidden md:flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            D'Alexis <span className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider">Accessorio y Transferencia</span>
          </span>
        </div>

        {/* Theme switch button */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-sm transition-all"
          title="Basculez le thème"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Main Split Layout Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 pt-16 lg:pt-0">
        
        {/* Left Side: Brand Visuals & Floating Glass Badges */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-center space-y-8 pr-4 relative">
          
          {/* Floating Glass Speech / Notification Cards */}
          <div className="space-y-3.5 max-w-md ml-auto">
            <div className="bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-slate-800 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl shadow-blue-900/5 flex items-center gap-3 transform -translate-x-4 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Transferts R.D. ⇄ Haïti sécurisés</p>
                <p className="text-[10px] text-slate-400">Rapprochements automatiques Natcash & MonCash</p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 border border-white/90 dark:border-slate-800 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl shadow-blue-900/5 flex items-center gap-3 translate-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Taux officiel actualisé en direct</p>
                <p className="text-[10px] text-slate-400">100 DOP = 230 HTG (Mise à jour automatique)</p>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-slate-800 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl shadow-blue-900/5 flex items-center gap-3 transform -translate-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Session agent & gestionnaire protégée</p>
                <p className="text-[10px] text-slate-400">Vérification des preuves d'exécution en 1-clic</p>
              </div>
            </div>
          </div>

          {/* Futuristic Branding Banner */}
          <div className="pt-4">
            <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block mb-1">
              D'ALEXIS
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Accessorio y Transferencia
            </h1>
            <span className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase block mt-2">
              PLATAFORMA DE TRANSFERENCIAS
            </span>
          </div>

        </div>

        {/* Right Side: The Modern Glassmorphic Login Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[460px] bg-white/90 dark:bg-slate-900/90 border border-white dark:border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-blue-900/10 dark:shadow-black/50 backdrop-blur-2xl relative overflow-hidden">
            
            {/* Soft Ambient Glow inside card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Title */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                Bienvenue sur D'Alexis Accessorio y Transferencia
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">
                Veuillez entrer vos identifiants pour accéder à votre espace sécurisé
              </p>
            </div>

            {/* Error Notice */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Field 1: Username or Phone Input */}
              <div className="space-y-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Nom d'utilisateur ou Téléphone"
                    className="w-full pl-11 pr-4 py-3 bg-slate-100/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all shadow-inner font-medium"
                  />
                </div>
              </div>

              {/* Field 2: Password Input */}
              <div className="space-y-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Saisissez votre mot de passe"
                    className="w-full pl-11 pr-11 py-3 bg-slate-100/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all font-mono shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Large Vibrant Blue Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:opacity-95 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <span>Se Connecter</span>
                )}
              </button>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
