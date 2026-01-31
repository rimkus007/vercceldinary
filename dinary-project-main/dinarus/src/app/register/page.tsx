"use client";

import { useState, useEffect } from "react"; // 👈 Assurez-vous que useEffect est importé
import { useRouter, useSearchParams } from "next/navigation"; // 👈 Importez useSearchParams
import Link from "next/link";
import {
  Loader2,
  User,
  AtSign,
  KeyRound,
  Phone,
  Briefcase,
  Gift, // 👈 Importez l'icône
} from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isMerchant, setIsMerchant] = useState(false);
  const [merchantName, setMerchantName] = useState("");
  const [merchantAddress, setMerchantAddress] = useState("");
  const [merchantCategory, setMerchantCategory] = useState("restaurant");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState(""); // 👈 État pour le code de parrainage

  const router = useRouter();
  const searchParams = useSearchParams(); // 👈 Hook pour lire l'URL
  const [suggestionCode, setSuggestionCode] = useState("");

  // 👇 Ce code s'exécute au chargement de la page pour lire l'URL
  useEffect(() => {
    const codeFromUrl = searchParams.get("referralCode");
    if (codeFromUrl) {
      setReferralCode(codeFromUrl);
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation côté client
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setLoading(false);
      return;
    }

    if (!email || !username || !fullName || !phoneNumber) {
      setError("Tous les champs sont requis");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        email,
        username,
        password,
        fullName,
        phoneNumber,
        referralCode: referralCode || undefined, // 👈 On envoie undefined si vide
      };
      // ... (le reste de votre fonction handleRegister reste inchangé) ...
      let response;
      const endpoint = isMerchant
        ? "http://localhost:3001/api/auth/register-merchant"
        : "http://localhost:3001/api/auth/register";
      const body = isMerchant
        ? {
            ...userData,
            name: merchantName,
            address: merchantAddress,
            category: merchantCategory,
            suggestionCode: suggestionCode || undefined,
          }
        : userData;
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        void 0;
        // Si c'est une erreur de validation, on affiche les détails
        if (errorData.message && Array.isArray(errorData.message)) {
          throw new Error(errorData.message.join(", "));
        }
        throw new Error(errorData.message || "Échec de l'inscription");
      }
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-y-auto bg-gray-50 p-4">
      {/* ... (votre JSX décoratif) ... */}
      <div className="absolute top-10 -left-10 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-20 -right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-10 left-20 w-60 h-60 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className={`relative z-10 w-full my-8 transition-all duration-300 ${isMerchant ? 'max-w-5xl' : 'max-w-sm'}`}>
        <div
          className="text-center mb-8 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Rejoignez Dinary
          </h1>
          <p className="text-gray-500 mt-2">
            Créez votre compte en quelques secondes.
          </p>
        </div>
        <div
          className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-gray-200 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Checkbox pour basculer en mode marchand */}
            <div className="flex items-center pb-4 border-b border-gray-200">
              <input
                type="checkbox"
                checked={isMerchant}
                onChange={(e) => setIsMerchant(e.target.checked)}
                id="isMerchant"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isMerchant"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                S'inscrire en tant que vendeur
              </label>
            </div>

            {/* Layout à 2 colonnes si marchand, sinon 1 colonne */}
            <div className={`grid gap-6 ${isMerchant ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Colonne de gauche - Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Informations personnelles
                </h3>
                
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nom complet"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Numéro de téléphone (ex: +33612345678)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                
                <div className="relative">
                  <AtSign
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nom d'utilisateur"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <div className="relative">
                    <KeyRound
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe (min. 8 caractères)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                      required
                      minLength={8}
                    />
                  </div>
                  {password && password.length < 8 && (
                    <p className="mt-1 text-xs text-orange-600">
                      Le mot de passe doit contenir au moins 8 caractères
                    </p>
                  )}
                </div>

                <div className="relative">
                  <Gift
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Code de parrainage (optionnel)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                    readOnly={!!searchParams.get("referralCode")}
                  />
                </div>
              </div>

              {/* Colonne de droite - Informations boutique (seulement si marchand) */}
              {isMerchant && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Informations boutique
                  </h3>
                  
                  <div className="relative">
                    <Briefcase
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      placeholder="Nom de la boutique"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Briefcase
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={merchantAddress}
                      onChange={(e) => setMerchantAddress(e.target.value)}
                      placeholder="Adresse de la boutique"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div className="relative">
                    <Gift
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={suggestionCode}
                      onChange={(e) => setSuggestionCode(e.target.value.trim().toUpperCase())}
                      placeholder="Code de Suggestion (ex: DINS-XXXXXXXX)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-purple-500 focus:border-purple-500 uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-purple-300"
            >
              {loading ? <Loader2 className="animate-spin" /> : "S'inscrire"}
            </button>
          </form>
          <p className="mt-6 text-sm text-gray-600 text-center">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-purple-600 font-medium hover:underline"
            >
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
