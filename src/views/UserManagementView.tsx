import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  SlidersHorizontal, 
  Lock, 
  Check, 
  X, 
  Shield, 
  Search, 
  Power,
  Sparkles,
  MapPin,
  Mail,
  Cpu,
  User as UserIcon,
  ShieldAlert,
  Building2,
  Key,
  Eye,
  EyeOff,
  AtSign,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Layers,
  Edit3,
  Copy,
  Save,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorCode, Role, User } from '../types';

export const UserManagementView: React.FC = () => {
  const { 
    permissions, 
    updateUserPermissions, 
    currentUser, 
    availableUsers, 
    addUser, 
    updateUser,
    toggleUserStatus,
    activeTab,
    setActiveTab,
    transactions,
    settlements
  } = useApp();

  const [subTab, setSubTab] = useState<'user_list' | 'create_user' | 'permissions_matrix'>(
    activeTab === 'create_user' 
      ? 'create_user' 
      : activeTab === 'permissions_matrix' 
        ? 'permissions_matrix' 
        : 'user_list'
  );

  const [searchQuery, setSearchQuery] = useState('');
  
  // Full-page User Inspection State (NO POPUP DIV MODAL)
  const [inspectedUser, setInspectedUser] = useState<User | null>(null);

  // Synchronize when activeTab changes
  React.useEffect(() => {
    setInspectedUser(null);
    if (activeTab === 'create_user') setSubTab('create_user');
    else if (activeTab === 'permissions_matrix') setSubTab('permissions_matrix');
    else if (activeTab === 'user_list' || activeTab === 'users') setSubTab('user_list');
  }, [activeTab]);

  // Form State for New User (with Username & Password)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'agent_rd' as Role,
    location: 'Agence Santo Domingo',
    nodeId: `node-agent-${Math.floor(100 + Math.random() * 900)}`,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    status: 'online' as 'online' | 'busy' | 'offline',
    commissionRate: 1.0
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
    let generated = 'Dx#';
    for (let i = 0; i < 7; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: generated }));
    setShowPassword(true);
  };

  const autoGenerateUsername = () => {
    if (formData.name) {
      const parts = formData.name.trim().toLowerCase().split(/\s+/);
      const suggested = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1]}` : parts[0];
      const clean = suggested.replace(/[^a-z0-9]/g, '');
      setFormData((prev) => ({ ...prev, username: clean }));
    }
  };

  // State for Editing Inspected User
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'agent_rd' as Role,
    location: '',
    commissionRate: 1.0,
  });
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [saveUserMsg, setSaveUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // State for Quick Password Modification & Reveal
  const [quickPassword, setQuickPassword] = useState('');
  const [showQuickPassword, setShowQuickPassword] = useState(true);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [lastAssignedPassword, setLastAssignedPassword] = useState<string | null>(null);

  const handleStartEdit = (user: User) => {
    setEditFormData({
      name: user.name,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      role: user.role,
      location: user.location,
      commissionRate: user.commissionRate !== undefined ? user.commissionRate : 1.0,
    });
    setEditPassword('');
    setShowEditPassword(false);
    setSaveUserMsg(null);
    setIsEditingUser(true);
  };

  const handleSaveUser = async () => {
    if (!inspectedUser) return;
    setIsSavingUser(true);
    setSaveUserMsg(null);

    const payload: Partial<User> & { password?: string } = {
      name: editFormData.name,
      username: editFormData.username,
      email: editFormData.email,
      role: editFormData.role,
      location: editFormData.location,
      commissionRate: Number(editFormData.commissionRate),
    };

    if (editPassword && editPassword.trim()) {
      payload.password = editPassword.trim();
    }

    try {
      const res = await updateUser(inspectedUser.id, payload);
      if (res.success && res.user) {
        setInspectedUser(res.user);
        setSaveUserMsg({ type: 'success', text: res.message });
        setIsEditingUser(false);
        if (editPassword.trim()) {
          setLastAssignedPassword(editPassword.trim());
        }
      } else {
        setSaveUserMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setSaveUserMsg({ type: 'error', text: err?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setIsSavingUser(false);
    }
  };

  const generateQuickPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
    let generated = 'Dx#';
    for (let i = 0; i < 7; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setQuickPassword(generated);
    setShowQuickPassword(true);
  };

  const handleUpdatePasswordOnly = async () => {
    if (!inspectedUser || !quickPassword.trim()) return;
    setIsUpdatingPassword(true);
    setPasswordMsg(null);

    try {
      const res = await updateUser(inspectedUser.id, { password: quickPassword.trim() });
      if (res.success) {
        setLastAssignedPassword(quickPassword.trim());
        setPasswordMsg({ type: 'success', text: 'Nouveau mot de passe enregistré avec succès pour cet agent !' });
        setQuickPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err?.message || 'Erreur lors de la modification du mot de passe.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const allOperators: OperatorCode[] = ['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice'];

  const filteredUsers = availableUsers.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nodeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const toggleOperatorPermission = (userId: string, operator: OperatorCode) => {
    const userPerm = permissions.find(p => p.userId === userId);
    if (!userPerm) return;

    if (userPerm.role === 'gestionnaire' && (operator === 'natcash' || operator === 'natcom')) {
      alert("Les transferts Natcash et Natcom sont réservés aux agents d'exécution.");
      return;
    }

    const currentServices = userPerm.servicesAllowed || [];
    const isAllowed = currentServices.includes(operator);
    
    const updatedServices = isAllowed 
      ? currentServices.filter(s => s !== operator)
      : [...currentServices, operator];

    updateUserPermissions(userId, { servicesAllowed: updatedServices });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setFormMsg({ type: 'error', text: 'Veuillez remplir le nom et le courriel.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addUser(formData);
      if (res.success) {
        setFormMsg({ type: 'success', text: res.message });
        setFormData({
          name: '',
          username: '',
          email: '',
          password: '',
          role: 'agent_rd',
          location: 'Agence Santo Domingo',
          nodeId: `node-agent-${Math.floor(100 + Math.random() * 900)}`,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          status: 'online',
          commissionRate: 1.0
        });
        setShowPassword(false);
      } else {
        setFormMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err?.message || 'Erreur lors de la création de l\'utilisateur.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* FULL-PAGE USER DETAILS VIEW (RENDERED WHEN ADMIN CLICKS VOIR UTILISATEUR)  */
  /* -------------------------------------------------------------------------- */
  if (inspectedUser) {
    const userPerm = permissions.find(p => p.userId === inspectedUser.id);
    const userTx = transactions.filter(t => t.assignedToName.includes(inspectedUser.name) || t.createdByName.includes(inspectedUser.name));
    const userSettlements = settlements.filter(s => s.agentId === inspectedUser.id || s.agentName.toLowerCase() === inspectedUser.name.toLowerCase());
    const userDebt = userSettlements.reduce((sum, s) => sum + s.remainingBalance, 0);
    const userTotalCollected = userSettlements.reduce((sum, s) => sum + s.totalCollected, 0);
    const userTotalDeposited = userSettlements.reduce((sum, s) => sum + s.amountDeposited, 0);
    const isOffline = inspectedUser.status === 'offline';

    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-in fade-in">
        
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setInspectedUser(null);
                setIsEditingUser(false);
                setSaveUserMsg(null);
                setPasswordMsg(null);
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 font-bold text-xs whitespace-nowrap flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="whitespace-nowrap">Retour à la Liste</span>
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Fiche Profil Employé Nœud</span>
                <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-sm border border-blue-200">
                  {inspectedUser.nodeId}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Supervision des privilèges, gestion du mot de passe et modification des informations agent.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-nowrap flex-shrink-0">
            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  if (isEditingUser) {
                    setIsEditingUser(false);
                  } else {
                    handleStartEdit(inspectedUser);
                  }
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                  isEditingUser
                    ? 'bg-slate-800 hover:bg-slate-900 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditingUser ? 'Fermer le Mode Édition' : 'Modifier les Informations'}</span>
              </button>
            )}

            {currentUser.role === 'admin' && inspectedUser.id !== currentUser.id && (
              <button
                onClick={() => {
                  toggleUserStatus(inspectedUser.id);
                  setInspectedUser({
                    ...inspectedUser,
                    status: isOffline ? 'online' : 'offline'
                  });
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                  isOffline 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{isOffline ? 'Activer le Compte' : 'Désactiver le Compte'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Action Feedback Alert Messages */}
        {saveUserMsg && (
          <div className={`p-4 rounded-2xl text-xs font-extrabold flex items-center justify-between shadow-2xs animate-in fade-in ${
            saveUserMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{saveUserMsg.text}</span>
            </div>
            <button onClick={() => setSaveUserMsg(null)} className="underline text-white text-xs">Fermer</button>
          </div>
        )}

        {passwordMsg && (
          <div className={`p-4 rounded-2xl text-xs font-extrabold flex items-center justify-between shadow-2xs animate-in fade-in ${
            passwordMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{passwordMsg.text}</span>
            </div>
            <button onClick={() => setPasswordMsg(null)} className="underline text-white text-xs">Fermer</button>
          </div>
        )}

        {/* 2-Column Full-Page User View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Left: Profile Identity, Edit Form & Password Management */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* FULL EDIT USER PROFILE CARD (WHEN ADMIN CLICKS MODIFIER) */}
            {isEditingUser ? (
              <div className="bg-white rounded-2xl border-2 border-blue-500/30 p-6 space-y-6 shadow-sm animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">Modifier le Profil & Identifiants</h3>
                      <p className="text-xs text-slate-500 font-medium">Modification des informations personnelles, du rôle et du mot de passe</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg font-bold">
                    {inspectedUser.nodeId}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  {/* Nom Complet */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nom Complet de l'Employé *</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  {/* Nom d'utilisateur (Username) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nom d'Utilisateur (Username) *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                        @
                      </div>
                      <input
                        type="text"
                        value={editFormData.username}
                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 pl-7 pr-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Courriel Professionnel */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Courriel Professionnel *</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  {/* Rôle Système */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Rôle Système & Privilèges *</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as Role })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="agent_rd">Agent RD (Guichet Saisie Rep. Dom.)</option>
                      <option value="agent_haiti">Agent Haïti (Décaissement Natcash/Natcom)</option>
                      <option value="gestionnaire">Gestionnaire (Flux MonCash/Digicel)</option>
                      <option value="admin">Administrateur Système (Accès Global)</option>
                    </select>
                  </div>

                  {/* Localisation Agence */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Localisation / Agence Physique *</label>
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  {/* Taux de Commission Agent (%) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Taux de Commission Agent (%) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={editFormData.commissionRate}
                        onChange={(e) => setEditFormData({ ...editFormData, commissionRate: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 pl-3.5 pr-8 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center font-mono font-bold text-xs text-slate-400">%</span>
                    </div>
                  </div>

                  {/* Modifier Mot de passe (Optionnel dans la fiche) */}
                  <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">Changer le Mot de Passe (Optionnel)</label>
                      <button
                        type="button"
                        onClick={() => {
                          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
                          let gen = 'Dx#';
                          for (let i = 0; i < 7; i++) gen += chars.charAt(Math.floor(Math.random() * chars.length));
                          setEditPassword(gen);
                          setShowEditPassword(true);
                        }}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Générer sécurisé
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Laisser vide pour conserver le mot de passe actuel..."
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 pl-3.5 pr-20 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
                        {editPassword && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(editPassword)}
                            className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                            title="Copier le mot de passe"
                          >
                            {copiedPassword ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                          title={showEditPassword ? "Masquer" : "Afficher"}
                        >
                          {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Si vous saisissez un nouveau mot de passe, il remplacera l'ancien avec hachage bcrypt.</p>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsEditingUser(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveUser}
                    disabled={isSavingUser}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingUser ? 'Enregistrement en cours...' : 'Enregistrer les Modifications'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* STANDARD IDENTITY CARD */
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={inspectedUser.avatar} 
                      alt={inspectedUser.name} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 text-lg">{inspectedUser.name}</h3>
                        {inspectedUser.username && (
                          <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-md font-bold border border-slate-200">
                            @{inspectedUser.username}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {inspectedUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-nowrap flex-shrink-0">
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => handleStartEdit(inspectedUser)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-bold text-xs flex items-center gap-1 border border-slate-200 whitespace-nowrap flex-shrink-0"
                        title="Modifier les données de cet agent"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="whitespace-nowrap">Modifier</span>
                      </button>
                    )}
                    <span className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap flex-shrink-0 ${
                      inspectedUser.role === 'admin' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                      inspectedUser.role === 'agent_rd' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                      inspectedUser.role === 'agent_haiti' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                      'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}>
                      {inspectedUser.role.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 text-xs font-extrabold rounded-xl inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                      isOffline ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOffline ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                      <span className="whitespace-nowrap">{isOffline ? 'INACTIF' : 'ACTIF EN LIGNE'}</span>
                    </span>
                  </div>
                </div>

                {/* Situation Financière & Dette du Client / Agent Card */}
                <div className={`p-5 rounded-3xl border shadow-xs space-y-3 ${
                  userDebt > 0 
                    ? 'bg-rose-50/90 border-rose-200 text-rose-900' 
                    : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                        userDebt > 0 ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}>
                        {userDebt > 0 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                          Situation Financière & Dettes
                        </span>
                        <h4 className="font-black text-base tracking-tight">
                          {userDebt > 0 ? `Solde Dû / Dette : ${userDebt.toLocaleString()} DOP` : '0 DOP — Aucune Dette en Cours'}
                        </h4>
                      </div>
                    </div>

                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-black font-mono self-start sm:self-auto ${
                      userDebt > 0 ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {userDebt > 0 ? `🔴 DOIT ${userDebt.toLocaleString()} DOP` : '🟢 TOUT PAYÉ'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono bg-white/80 p-3 rounded-2xl border border-slate-200/60">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Encaissé</span>
                      <span className="font-extrabold text-slate-900">{userTotalCollected.toLocaleString()} DOP</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Déposé à l'Admin</span>
                      <span className="font-extrabold text-blue-600">{userTotalDeposited.toLocaleString()} DOP</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Reste à Payer (Dette)</span>
                      <span className={`font-black ${userDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {userDebt.toLocaleString()} DOP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Node Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-sans">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Code Agence / Guichet</span>
                    <p className="font-mono font-black text-slate-900 text-sm">{inspectedUser.nodeId}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Nom d'Utilisateur</span>
                    <p className="font-mono font-black text-blue-600 text-sm">
                      {inspectedUser.username ? `@${inspectedUser.username}` : `@${inspectedUser.email.split('@')[0]}`}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Taux de Commission</span>
                    <p className="font-mono font-black text-emerald-600 text-sm">
                      {inspectedUser.commissionRate !== undefined ? `${inspectedUser.commissionRate}%` : '1.0%'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Localisation Agence</span>
                    <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5 truncate">
                      <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{inspectedUser.location}</span>
                    </p>
                  </div>
                </div>

                {/* Allowed Operators List */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Services & Opérateurs Autorisés
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {allOperators.map((op) => {
                      const isAllowed = userPerm?.servicesAllowed?.includes(op);
                      return (
                        <div 
                          key={op}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                            isAllowed 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                          }`}
                        >
                          {isAllowed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                          <span className="capitalize">{op}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* SECURITY & PASSWORD MANAGEMENT CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Sécurité & Gestion du Mot de Passe</h3>
                    <p className="text-xs text-slate-500 font-medium">Réinitialisation, visualisation et transmission du mot de passe pour cet agent</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                  Gestion Admin
                </span>
              </div>

              {/* Dernier mot de passe généré ou défini */}
              {lastAssignedPassword && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Dernier mot de passe attribué à cet agent :
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(lastAssignedPassword)}
                      className="px-2.5 py-1 bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-2xs transition-all"
                    >
                      {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPassword ? 'Copié !' : 'Copier'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-200 font-mono text-base font-black text-slate-900 select-all tracking-wider">
                    {lastAssignedPassword}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Vous pouvez copier ce mot de passe et le transmettre directement à l'employé pour sa connexion.
                  </p>
                </div>
              )}

              {/* Saisie & Génération Rapide */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Définir / Réinitialiser le Mot de Passe de l'Agent</label>
                  <button
                    type="button"
                    onClick={generateQuickPassword}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Générer un mot de passe fort
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type={showQuickPassword ? 'text' : 'password'}
                      value={quickPassword}
                      onChange={(e) => setQuickPassword(e.target.value)}
                      placeholder="Saisissez ou générez un nouveau mot de passe..."
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 pl-3.5 pr-20 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
                      {quickPassword && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(quickPassword)}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                          title="Copier le mot de passe"
                        >
                          {copiedPassword ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowQuickPassword(!showQuickPassword)}
                        className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                        title={showQuickPassword ? "Masquer" : "Afficher"}
                      >
                        {showQuickPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleUpdatePasswordOnly}
                    disabled={!quickPassword.trim() || isUpdatingPassword || currentUser.role !== 'admin'}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                  >
                    <Key className="w-4 h-4" />
                    <span>{isUpdatingPassword ? 'Enregistrement...' : 'Appliquer ce Mot de Passe'}</span>
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 font-medium space-y-1">
                  <p className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    Sécurité Cryptographique (Bcrypt) :
                  </p>
                  <p>
                    Conformément aux normes bancaires et de sécurité, les mots de passe sont hachés de manière irréversible avec bcrypt en base de données. L'administrateur peut à tout moment définir un nouveau mot de passe pour un agent, le révéler en clair ici et le copier pour le lui transmettre.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: User Metrics & Quick Admin Actions */}
          <div className="space-y-6">
            
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-2xs">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
                Actions Administrateur Rapides
              </h3>

              <div className="space-y-2 text-xs">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      if (isEditingUser) setIsEditingUser(false);
                      else handleStartEdit(inspectedUser);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold border border-slate-200/70 transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-blue-600" />
                      Modifier les coordonnées
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Édition</span>
                  </button>
                )}

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsEditingUser(false);
                      generateQuickPassword();
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-bold border border-slate-200/70 transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-600" />
                      Générer nouveau mot de passe
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Sécurité</span>
                  </button>
                )}

                {currentUser.role === 'admin' && inspectedUser.id !== currentUser.id && (
                  <button
                    onClick={() => {
                      toggleUserStatus(inspectedUser.id);
                      setInspectedUser({
                        ...inspectedUser,
                        status: isOffline ? 'online' : 'offline'
                      });
                    }}
                    className={`w-full text-left p-2.5 rounded-xl font-bold border transition-colors flex items-center justify-between ${
                      isOffline
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Power className="w-4 h-4" />
                      {isOffline ? 'Réactiver le compte' : 'Suspendre le compte'}
                    </span>
                    <span className="text-[10px] uppercase font-mono">{isOffline ? 'Inactif' : 'Actif'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
                Statistiques d'Activité Employé
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-semibold">Transactions Traitées:</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{userTx.length}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-semibold">Plafond Max Transaction:</span>
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    {userPerm?.maxSingleTransactionDOP.toLocaleString() || '100 000'} Pesos
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-semibold">Autorisation Annulation:</span>
                  <span className={`font-bold text-[11px] px-2 py-0.5 rounded ${
                    userPerm?.canCancelTransaction ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {userPerm?.canCancelTransaction ? 'AUTORISÉ' : 'RESTREINT'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* MAIN USER MANAGEMENT VIEW                                                  */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* 1. PAGE HEADER & SUBTAB NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 truncate">
              <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Gestion des Utilisateurs</span>
            </h2>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              {availableUsers.length} Comptes
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Supervision des rôles employés, création des accès Nœud et configuration des privilèges.
          </p>
        </div>

        {/* TAB NAVIGATION BUTTONS: RESPONSIVE PILLS */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 self-start sm:self-auto flex-shrink-0 flex-wrap">
          
          <button
            onClick={() => {
              setSubTab('user_list');
              setActiveTab('user_list');
            }}
            title="Liste des Utilisateurs"
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${
              subTab === 'user_list' 
                ? 'bg-slate-900 text-white shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Liste</span>
          </button>

          <button
            onClick={() => {
              setSubTab('create_user');
              setActiveTab('create_user');
            }}
            title="Créer un Utilisateur"
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${
              subTab === 'create_user' 
                ? 'bg-slate-900 text-white shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Créer</span>
          </button>

          <button
            onClick={() => {
              setSubTab('permissions_matrix');
              setActiveTab('permissions_matrix');
            }}
            title="Matrice de Permissions"
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${
              subTab === 'permissions_matrix' 
                ? 'bg-slate-900 text-white shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Matrice</span>
          </button>

        </div>
      </div>

      {currentUser.role !== 'admin' && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Accès en Lecture Seule : Seul l'Administrateur peut activer/désactiver des comptes employés ou modifier la matrice.</span>
        </div>
      )}

      {/* SUB-VIEW 1: LISTE DES UTILISATEURS */}
      {subTab === 'user_list' && (
        <div className="space-y-4">
          
          {/* Search Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, email, rôle, identifiant nœud ou agence..."
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 flex-shrink-0">
              <span>{filteredUsers.length} / {availableUsers.length} Utilisateurs</span>
            </div>
          </div>

          {/* 📱 MOBILE CARD VIEW (md:hidden) */}
          <div className="space-y-3 md:hidden">
            {filteredUsers.map((user) => {
              const isOffline = user.status === 'offline';
              return (
                <div 
                  key={user.id}
                  onClick={() => {
                    setInspectedUser(user);
                    setIsEditingUser(false);
                    setSaveUserMsg(null);
                    setPasswordMsg(null);
                    setLastAssignedPassword(null);
                  }}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-sm truncate">{user.name}</h4>
                          {user.username && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded font-bold border border-slate-200">
                              @{user.username}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate">{user.email}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1 flex-shrink-0 ${
                      isOffline ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                      {isOffline ? 'INACTIF' : 'ACTIF'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                      user.role === 'agent_rd' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                      user.role === 'agent_haiti' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                      'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>

                    <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 font-extrabold text-xs border border-blue-200 font-mono">
                      Com.: {user.commissionRate !== undefined ? `${user.commissionRate}%` : '1.0%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1 font-mono">
                      <Cpu className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-bold text-slate-700">{user.nodeId}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate max-w-[180px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-semibold truncate">{user.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setInspectedUser(user);
                        setIsEditingUser(false);
                        setSaveUserMsg(null);
                        setPasswordMsg(null);
                        setLastAssignedPassword(null);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Fiche</span>
                    </button>

                    {currentUser.role === 'admin' && user.id !== currentUser.id && (
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isOffline
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                            : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{isOffline ? 'Activer' : 'Désactiver'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 💻 DESKTOP TABLE VIEW (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Répertoire des Comptes Employés & Accès
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Liste des Employés</span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[850px]">
                {/* Table Header Row */}
                <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50/40 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 items-center">
                  <div className="col-span-3">Utilisateur / Courriel</div>
                  <div className="col-span-2">Rôle / Privilège</div>
                  <div className="col-span-1 text-center">Taux (%)</div>
                  <div className="col-span-2">Code Agence</div>
                  <div className="col-span-2">Emplacement / Agence</div>
                  <div className="col-span-1 text-center">Statut</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>

                {/* Table Body Rows */}
                <div className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredUsers.map((user) => {
                    const isOffline = user.status === 'offline';

                    return (
                      <div 
                        key={user.id} 
                        onClick={() => {
                          setInspectedUser(user);
                          setIsEditingUser(false);
                          setSaveUserMsg(null);
                          setPasswordMsg(null);
                          setLastAssignedPassword(null);
                        }}
                        className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-slate-50/80 transition-colors cursor-pointer"
                        title="Cliquer pour voir la fiche utilisateur complète"
                      >
                        
                        {/* 1. Utilisateur / Profil */}
                        <div className="col-span-3 flex items-center gap-3 min-w-0">
                          <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <p className="font-extrabold text-slate-900 truncate">{user.name}</p>
                              {user.username && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded font-bold border border-slate-200">
                                  @{user.username}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 font-mono">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {/* 2. Rôle & Responsabilité */}
                        <div className="col-span-2 flex items-center">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                            user.role === 'agent_rd' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                            user.role === 'agent_haiti' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                            'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>

                        {/* 3. Taux % Commission Agent */}
                        <div className="col-span-1 text-center font-mono">
                          <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 font-extrabold text-xs border border-blue-200 whitespace-nowrap">
                            {user.commissionRate !== undefined ? `${user.commissionRate}%` : '1.0%'}
                          </span>
                        </div>

                        {/* 3. Nœud Identifiant */}
                        <div className="col-span-2 font-mono text-[11px]">
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                            <Cpu className="w-3 h-3 text-slate-400" />
                            {user.nodeId}
                          </span>
                        </div>

                        {/* 4. Emplacement / Agence */}
                        <div className="col-span-2 text-slate-700 truncate">
                          <span className="flex items-center gap-1 font-semibold truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{user.location}</span>
                          </span>
                        </div>

                        {/* 5. Statut Compte */}
                        <div className="col-span-1 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1 ${
                            isOffline 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                            {isOffline ? 'INACTIF' : 'ACTIF'}
                          </span>
                        </div>

                        {/* 6. Actions Admin */}
                        <div className="col-span-1 flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          
                          {/* Bouton Voir Utilisateur */}
                          <button
                            onClick={() => {
                              setInspectedUser(user);
                              setIsEditingUser(false);
                              setSaveUserMsg(null);
                              setPasswordMsg(null);
                              setLastAssignedPassword(null);
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center shadow-2xs cursor-pointer"
                            title="Ouvrir la Fiche Complète"
                          >
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </button>

                          {/* Bouton Activer / Désactiver */}
                          {currentUser.role === 'admin' && user.id !== currentUser.id && (
                            <button
                              onClick={() => toggleUserStatus(user.id)}
                              className={`p-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                                isOffline
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                  : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                              }`}
                              title={isOffline ? "Activer le compte" : "Désactiver le compte"}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: FORMULAIRE D'AJOUT D'UN NOUVEL UTILISATEUR */}
      {subTab === 'create_user' && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Créer un Nouveau Compte Employé</h3>
                <p className="text-xs text-slate-500 font-medium">Attribution des identifiants et configuration des accès agence</p>
              </div>
            </div>
          </div>

          {formMsg && (
            <div className={`p-4 rounded-2xl text-xs font-extrabold flex items-center justify-between shadow-2xs ${
              formMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{formMsg.text}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubTab('user_list');
                    setActiveTab('user_list');
                  }}
                  className="px-3 py-1 bg-white text-slate-900 rounded-lg text-xs font-extrabold hover:bg-slate-100"
                >
                  Voir la Liste →
                </button>
                <button onClick={() => setFormMsg(null)} className="underline text-white text-xs">Fermer</button>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-6 text-xs font-sans">
            
            {/* Identity & Contact Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  1. Identité & Identifiants de Connexion
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  Identifiants requis pour l'accès au portail Dalexis
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nom Complet */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom Complet de l'Employé *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => {
                        const parts = val.trim().toLowerCase().split(/\s+/);
                        const autoUser = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1]}` : parts[0];
                        const cleanAuto = autoUser.replace(/[^a-z0-9]/g, '');
                        return {
                          ...prev,
                          name: val,
                          username: !prev.username || prev.username === cleanAuto ? cleanAuto : prev.username,
                        };
                      });
                    }}
                    placeholder="ex: Pierre Emmanuel Joseph"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    required
                  />
                </div>

                {/* Nom d'utilisateur (Username) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Nom d'utilisateur (Username) *</label>
                    <button
                      type="button"
                      onClick={autoGenerateUsername}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Suggérer
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                      @
                    </div>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })}
                      placeholder="ex: pemmanuel"
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 pl-7 pr-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Identifiant unique court utilisé lors de la connexion.</p>
                </div>

                {/* Courriel Professionnel */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Courriel Professionnel *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="p.emmanuel@dalexistransfer.com"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    required
                  />
                </div>

                {/* Mot de passe Initial */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Mot de Passe Initial *</label>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Key className="w-3 h-3" />
                      Générer sécurisé
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min. 6 caractères (défaut: dalexis123)"
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 pl-3.5 pr-10 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                      title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Mot de passe pour la première connexion de l'agent.</p>
                </div>
              </div>
            </div>

            {/* Role & Location Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                2. Rôle Système & Affectation Agence
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rôle Système & Privilèges *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const newRole = e.target.value as Role;
                      setFormData({ 
                        ...formData, 
                        role: newRole,
                        nodeId: `node-${newRole}-${Math.floor(100 + Math.random() * 900)}`
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="agent_rd">Agent RD (Guichet Saisie Rep. Dom.)</option>
                    <option value="agent_haiti">Agent Haïti (Décaissement Natcash/Natcom)</option>
                    <option value="gestionnaire">Gestionnaire (Flux MonCash/Digicel)</option>
                    <option value="admin">Administrateur Système (Accès Global)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Localisation / Agence Physique *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="ex: Agence Santo Domingo - Av. 27 de Febrero"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Taux de Commission Agent (%) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                      placeholder="ex: 1.0 pour 1%"
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 pl-3.5 pr-8 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      required
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center font-mono font-bold text-xs text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSubTab('user_list');
                  setActiveTab('user_list');
                }}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={currentUser.role !== 'admin' || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer le Nouvel Utilisateur'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-VIEW 3: MATRICE DE MODÉLISATION DES PERMISSIONS */}
      {subTab === 'permissions_matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4 animate-in fade-in">
          
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
                <span>Matrice de Modélisation des Permissions Nœud</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Modélisation dynamique des autorisations par opérateur et plafonds de transaction.
              </p>
            </div>

            <span className="text-[11px] font-bold text-slate-500 font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
              Contrôle d'Accès JSONB Dynamic
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div className="divide-y divide-slate-100">
              {permissions.map((perm) => (
                <div key={perm.userId} className="py-4 space-y-3">
                  
                  {/* User Header & Max Limit */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                        {perm.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm">{perm.userName}</p>
                        <p className="text-[11px] text-slate-400 font-semibold capitalize">{perm.role.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Plafond Max Transaction</span>
                        {currentUser.role === 'admin' ? (
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            <input
                              type="number"
                              step="10000"
                              min="0"
                              value={perm.maxSingleTransactionDOP}
                              onChange={(e) => updateUserPermissions(perm.userId, { maxSingleTransactionDOP: parseInt(e.target.value) || 0 })}
                              className="w-24 bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 px-2 py-0.5 rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[11px] font-mono font-bold text-slate-500">DOP</span>
                          </div>
                        ) : (
                          <span className="font-mono font-black text-slate-900 text-xs">{perm.maxSingleTransactionDOP.toLocaleString()} Pesos</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md ${
                          perm.canCancelTransaction ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {perm.canCancelTransaction ? 'Annulation Autorisée' : 'Annulation Restreinte'}
                        </span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md ${
                          perm.canManageKillSwitch ? 'bg-purple-100 text-purple-900' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {perm.canManageKillSwitch ? 'Sécurité Services Autorisée' : 'Sécurité Services Restreinte'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Operator Permission Toggles Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
                    {allOperators.map((op) => {
                      const isForbiddenGestionnaire = perm.role === 'gestionnaire' && (op === 'natcash' || op === 'natcom');
                      const isAllowed = !isForbiddenGestionnaire && perm.servicesAllowed?.includes(op);
                      
                      return (
                        <button
                          key={op}
                          disabled={currentUser.role !== 'admin' || isForbiddenGestionnaire}
                          onClick={() => toggleOperatorPermission(perm.userId, op)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            isForbiddenGestionnaire
                              ? 'bg-amber-50/50 border-amber-200 text-amber-800 opacity-60'
                              : isAllowed 
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 shadow-2xs hover:bg-emerald-100' 
                                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 hover:opacity-100'
                          } disabled:cursor-not-allowed`}
                          title={isForbiddenGestionnaire ? "Interdit : Un gestionnaire/superviseur ne peut pas effectuer de transactions Natcash et Natcom." : undefined}
                        >
                          <span className="capitalize text-xs font-extrabold">{op}</span>
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            isForbiddenGestionnaire ? 'bg-amber-200 text-amber-800 font-mono text-[9px] font-black' : isAllowed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                          }`}>
                            {isForbiddenGestionnaire ? '✕' : isAllowed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
