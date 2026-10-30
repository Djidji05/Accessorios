import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle,
  Globe2,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { login, t, currentLang } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forcer le Mode Clair absolu et retirer la classe 'dark' du DOM
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage(
        currentLang === 'HT' 
          ? 'Tanpri mete non itilizatè oswa nimewo w ak modpas ou.' 
          : (currentLang === 'ES' 
            ? 'Por favor ingrese su usuario o teléfono y su contraseña.' 
            : 'Veuillez saisir votre nom d\'utilisateur ou numéro et votre mot de passe.')
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      if (!result.success) {
        setErrorMessage(result.message || (
          currentLang === 'HT'
            ? 'Enfòmasyon sa yo pa kòrèk. Tanpri tcheke aksè ou.'
            : (currentLang === 'ES'
              ? 'Credenciales inválidas. Por favor verifique sus accesos.'
              : 'Identifiants invalides. Veuillez vérifier vos accès.')
        ));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible de se connecter au serveur backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 relative overflow-hidden font-sans flex items-center justify-center p-4 sm:p-6 lg:p-12 transition-colors duration-300 selection:bg-blue-600 selection:text-white">
      
      {/* Dynamic Background Mesh Aurora Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-blue-300/40 via-cyan-200/50 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-indigo-300/40 via-sky-200/50 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[45%] h-[45%] bg-blue-200/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.25] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#3b82f6 0.8px, transparent 0.8px)',
          backgroundSize: '32px 32px'
        }} 
      />

      {/* Top Header Bar inside Login Page */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <img 
            src="/images/alexis-emblem.png" 
            alt="Alexis Transferencia" 
            className="w-10 h-10 rounded-2xl shadow-lg ring-1 ring-blue-500/20 object-contain bg-slate-950 p-1"
          />
          <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            Alexis <span className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-extrabold uppercase tracking-wider">Transferencia</span>
          </span>
        </div>
      </div>

      {/* Main Split Layout Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 pt-20 lg:pt-12">
        
        {/* Left Side: Brand Visuals & Features */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-center space-y-8 pr-8 relative">
          
          {/* Official 3D Branding Banner */}
          <div className="space-y-4">
            <div className="relative group max-w-md">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-35 transition duration-1000" />
              <img 
                src="/images/alexis-banner.png" 
                alt="Alexis Transferencia Logo" 
                className="relative w-full rounded-2xl shadow-2xl border border-slate-800/30 object-contain bg-slate-950/60"
              />
            </div>

            <span className="text-xs font-black tracking-widest text-blue-600 uppercase block">
              {currentLang === 'HT' ? 'PLATFÒM OFISYÈL TRANSFÈ SAN KASE TÈT' : (currentLang === 'ES' ? 'PLATAFORMA OFICIAL DE TRANSFERENCIAS' : 'PLATEFORME OFFICIELLE DE TRANSFERT UNIFIÉE')}
            </span>
            <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-md">
              {currentLang === 'HT'
                ? 'Solisyon senp epi ansekirite pou jere transfè ant Repiblik Dominikèn ak Ayiti, ak verifikasyon otomatik.'
                : (currentLang === 'ES'
                  ? 'La solución unificada y segura para la gestión de sus transferencias entre República Dominicana y Haití.'
                  : 'La solution unifiée et sécurisée pour la gestion de vos transferts entre la République Dominicaine et Haïti, avec rapprochement automatique.')}
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4 max-w-md">
            <div className="bg-white/70 border border-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl shadow-blue-900/5 flex items-start gap-4 transition-all hover:bg-white/90 group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {currentLang === 'HT' ? 'Transfè R.D. ⇄ Ayiti an sekirite' : (currentLang === 'ES' ? 'Transferencias R.D. ⇄ Haití seguras' : 'Transferts R.D. ⇄ Haïti sécurisés')}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                  {currentLang === 'HT' ? 'Sistèm otomatik Natcash ak MonCash pou tout kont kòrèk.' : (currentLang === 'ES' ? 'Conciliaciones automáticas Natcash y MonCash para una contabilidad exacta.' : 'Rapprochements automatiques Natcash & MonCash pour une comptabilité sans faille.')}
                </p>
              </div>
            </div>

            <div className="bg-white/70 border border-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl shadow-blue-900/5 flex items-start gap-4 transition-all hover:bg-white/90 group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {currentLang === 'HT' ? 'Tays ofisyèl an dirèk' : (currentLang === 'ES' ? 'Tasa oficial actualizada en vivo' : 'Taux officiel actualisé en direct')}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                  {currentLang === 'HT' ? 'Tays yo mete ajou touswit pou konvèsyon yo toujou egzat.' : (currentLang === 'ES' ? 'Tasas sincronizadas en tiempo real para conversiones precisas.' : 'Les taux de change sont synchronisés en temps réel pour des conversions exactes.')}
                </p>
              </div>
            </div>

            <div className="bg-white/70 border border-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl shadow-blue-900/5 flex items-start gap-4 transition-all hover:bg-white/90 group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {currentLang === 'HT' ? 'Kontwòl & Sipèvizyon' : (currentLang === 'ES' ? 'Control y Supervisión' : 'Contrôle & Supervision')}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                  {currentLang === 'HT' ? 'Separasyon wòl klè ak prèv foto obligatwa pou chak operasyon.' : (currentLang === 'ES' ? 'Separación estricta de roles con validación por comprobantes.' : 'Séparation stricte des rôles avec validation par preuves et journaux d\'audit inaltérables.')}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: The Modern Glassmorphic Login Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[460px] bg-white/95 border border-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-900/10 backdrop-blur-2xl relative overflow-hidden">
            
            {/* Soft Ambient Glow inside card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Title */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4 lg:hidden">
                <img 
                  src="/images/alexis-emblem.png" 
                  alt="Alexis Transferencia" 
                  className="w-11 h-11 rounded-2xl shadow-md object-contain bg-slate-950 p-1 ring-1 ring-blue-500/20"
                />
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Alexis Transferencia</h3>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Portail Sécurisé</span>
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {t('login_title', 'Connexion au Portail')}
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-2">
                {t('login_subtitle', 'Veuillez entrer vos identifiants pour accéder à votre espace sécurisé.')}
              </p>
            </div>

            {/* Error Notice */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-semibold animate-in fade-in">
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
                    placeholder={t('identifier_placeholder', "Nom d'utilisateur ou Téléphone")}
                    className="w-full pl-11 pr-4 py-3 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-inner font-medium"
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
                    placeholder={t('password_placeholder', "Saisissez votre mot de passe")}
                    className="w-full pl-11 pr-11 py-3 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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
                    <span>{t('loading', 'Connexion en cours...')}</span>
                  </>
                ) : (
                  <span>{t('connect', 'Se Connecter')}</span>
                )}
              </button>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
