'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  UserPlus, 
  Users, 
  Store,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Loader2,
  User
} from 'lucide-react';

type UserType = 'client' | 'merchant';

interface BaseForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  city: string;
  wilaya: string;
  sendWelcomeEmail: boolean;
  requireEmailVerification: boolean;
  initialStatus: 'active' | 'pending' | 'suspended';
}

interface ClientForm extends BaseForm {}

interface MerchantForm extends BaseForm {
  businessName: string;
  businessType: string;
  registrationNumber: string;
  taxNumber: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function UserCreationPage() {
  const { token } = useAuth();
  const [activeType, setActiveType] = useState<UserType>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [clientForm, setClientForm] = useState<ClientForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    wilaya: 'Alger',
    sendWelcomeEmail: true,
    requireEmailVerification: false,
    initialStatus: 'active'
  });

  const [merchantForm, setMerchantForm] = useState<MerchantForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    wilaya: 'Alger',
    businessName: '',
    businessType: '',
    registrationNumber: '',
    taxNumber: '',
    sendWelcomeEmail: true,
    requireEmailVerification: false,
    initialStatus: 'pending'
  });

  const wilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'MSila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane'
  ];

  const businessTypes = [
    'Commerce de détail',
    'Commerce de gros',
    'Restaurant/Café',
    'Services professionnels',
    'Artisanat',
    'Agriculture',
    'Technologie',
    'Santé',
    'Éducation',
    'Transport',
    'Immobilier',
    'Autre'
  ];

  const currentForm = activeType === 'client' ? clientForm : merchantForm;
  const setCurrentForm = activeType === 'client' ? setClientForm : setMerchantForm;

  const handleInputChange = (field: string, value: string | boolean) => {
    setCurrentForm((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) return;

    setIsCheckingEmail(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/admin/check-email/${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEmailExists(data.exists);
        if (data.exists) {
          setErrors(prev => ({ ...prev, email: 'Cet email est déjà utilisé' }));
        }
      }
    } catch (error) {
      /* log removed */
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!currentForm.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!currentForm.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    
    if (activeType === 'merchant') {
      const form = currentForm as MerchantForm;
      if (!form.businessName.trim()) newErrors.businessName = 'Le nom de l\'entreprise est requis';
      if (!form.businessType) newErrors.businessType = 'Le type d\'activité est requis';
    }
    
    if (!currentForm.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(currentForm.email)) newErrors.email = 'Email invalide';
    else if (emailExists) newErrors.email = 'Cet email est déjà utilisé';
    
    if (!currentForm.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    if (!currentForm.password) newErrors.password = 'Le mot de passe est requis';
    else if (currentForm.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    
    if (currentForm.password !== currentForm.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccess(false);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const endpoint = activeType === 'client' ? '/admin/create-user' : '/admin/create-merchant';
      
      const payload: any = {
        firstName: currentForm.firstName,
        lastName: currentForm.lastName,
        email: currentForm.email,
        phone: currentForm.phone,
        password: currentForm.password,
        address: currentForm.address || undefined,
        city: currentForm.city || undefined,
        wilaya: currentForm.wilaya,
        sendWelcomeEmail: currentForm.sendWelcomeEmail,
        requireEmailVerification: currentForm.requireEmailVerification,
        initialStatus: currentForm.initialStatus,
      };

      if (activeType === 'merchant') {
        const form = currentForm as MerchantForm;
        payload.businessName = form.businessName;
        payload.businessType = form.businessType;
        payload.registrationNumber = form.registrationNumber || undefined;
        payload.taxNumber = form.taxNumber || undefined;
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du compte');
      }

      const data = await response.json();
      /* log removed */

      // Reset form
      if (activeType === 'client') {
        setClientForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          address: '',
          city: '',
          wilaya: 'Alger',
          sendWelcomeEmail: true,
          requireEmailVerification: false,
          initialStatus: 'active'
        });
      } else {
        setMerchantForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          address: '',
          city: '',
          wilaya: 'Alger',
          businessName: '',
          businessType: '',
          registrationNumber: '',
          sendWelcomeEmail: true,
          requireEmailVerification: false,
          initialStatus: 'pending'
        });
      }

      setSuccess(true);
      setEmailExists(false);
      setShowPassword(false);
      setShowConfirmPassword(false);

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      /* log removed */
      setErrors({ submit: error.message || 'Une erreur est survenue' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-0 bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col px-6">
        {/* Header fixe */}
        <div className="flex-shrink-0 pt-4 pb-3">
          <h1 className="text-2xl font-bold text-gray-900">Création d'Utilisateurs</h1>
          <p className="text-gray-600 text-sm mt-1">Créer de nouveaux comptes clients et marchands</p>
        </div>

        {/* Type Selector fixe */}
        <div className="flex-shrink-0 pb-3">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => {
              setActiveType('client');
              setErrors({});
              setEmailExists(false);
              setSuccess(false);
            }}
            className={`px-6 py-3 rounded-md transition-colors flex items-center gap-2 ${
              activeType === 'client'
                ? 'bg-white text-dinary-turquoise shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Créer un Client</span>
          </button>
          <button
            onClick={() => {
              setActiveType('merchant');
              setErrors({});
              setEmailExists(false);
              setSuccess(false);
            }}
            className={`px-6 py-3 rounded-md transition-colors flex items-center gap-2 ${
              activeType === 'merchant'
                ? 'bg-white text-dinary-turquoise shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="font-medium">Créer un Marchand</span>
          </button>
          </div>
        </div>

        {/* Success Message (fixed overlay) */}
        {success && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">
                  {activeType === 'client' ? 'Client' : 'Marchand'} créé avec succès !
                </p>
                <p className="text-sm text-green-700">
                  Le compte a été créé et le wallet a été initialisé.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form avec scroll interne */}
        <div className="flex-1 pb-4">
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activeType === 'client' ? (
                <>
                  <User className="w-5 h-5" />
                  Informations du Client
                </>
              ) : (
                <>
                  <Store className="w-5 h-5" />
                  Informations du Marchand
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={currentForm.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nom *</label>
                  <input
                    type="text"
                    required
                    value={currentForm.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      required
                      value={currentForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={(e) => checkEmailAvailability(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {isCheckingEmail && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
                    )}
                    {!isCheckingEmail && currentForm.email && !errors.email && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                    )}
                    {!isCheckingEmail && emailExists && (
                      <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                    )}
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      required
                      value={currentForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+213 555 123 456"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mot de passe *</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={currentForm.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirmer le mot de passe *</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={currentForm.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Business Information (for merchants only) */}
              {activeType === 'merchant' && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Informations Commerciales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom de l'entreprise *</label>
                      <input
                        type="text"
                        required
                        value={(merchantForm as MerchantForm).businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise ${
                          errors.businessName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Type d'activité *</label>
                      <select
                        required
                        value={(merchantForm as MerchantForm).businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise ${
                          errors.businessType ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Sélectionner...</option>
                        {businessTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Numéro de registre commerce</label>
                    <input
                      type="text"
                      value={(merchantForm as MerchantForm).registrationNumber}
                      onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Numéro d'impôt</label>
                    <input
                      type="text"
                      value={(merchantForm as MerchantForm).taxNumber}
                      onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise"
                      placeholder="Ex: 123456789012"
                    />
                  </div>
                </div>
              )}

              {/* Address Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Adresse</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                      value={currentForm.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={2}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ville</label>
                    <input
                      type="text"
                      value={currentForm.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Wilaya</label>
                    <select
                      value={currentForm.wilaya}
                      onChange={(e) => handleInputChange('wilaya', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise"
                    >
                      {wilayas.map(wilaya => (
                        <option key={wilaya} value={wilaya}>{wilaya}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="text-base font-semibold">Paramètres du Compte</h3>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Statut initial</label>
                    <select
                      value={currentForm.initialStatus}
                      onChange={(e) => handleInputChange('initialStatus', e.target.value as 'active' | 'pending' | 'suspended')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise"
                    >
                      <option value="active">Actif</option>
                      <option value="pending">En attente</option>
                      <option value="suspended">Suspendu</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-900">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || emailExists}
                  className="px-6 py-2 bg-dinary-turquoise text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Créer le Compte
                    </>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
