"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, User, Users, Send, Search, X, Store, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Interface pour les résultats de recherche
interface UserSearchResult {
  id: string;
  username: string;
  fullName: string;
  role: "USER" | "MERCHANT";
}

export default function NotificationsAdminPage() {
  const { token } = useAuth();
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | "merchants" | "users" | "single">("all");
  const [userTypeFilter, setUserTypeFilter] = useState<"USER" | "MERCHANT">("USER");
  const [selectedEmoji, setSelectedEmoji] = useState("🔔");

  // États pour la recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);

  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIQUE DE RECHERCHE AVEC "DEBOUNCING" ---
  const searchUsers = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/users/search?q=${query}&role=${userTypeFilter}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          setSearchResults(await response.json());
        }
      } catch (error) {
        /* log removed */
      } finally {
        setIsSearching(false);
      }
    },
    [token, userTypeFilter]
  );

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchTerm) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(searchTerm);
      }, 500); // Attend 500ms après la dernière frappe pour lancer la recherche
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, searchUsers]);

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setSearchTerm(user.fullName); // Affiche le nom complet dans la barre
    setSearchResults([]); // Ferme la liste
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || (target === "single" && !selectedUser)) {
      setStatus({
        type: "error",
        message: "Veuillez remplir le message et sélectionner un utilisateur.",
      });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/notifications/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message,
            target,
            username: target === "single" ? selectedUser?.username : undefined,
            emoji: selectedEmoji,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setStatus({
          type: "success",
          message: data.message || "Notification envoyée avec succès !",
        });
        setMessage("");
        setSearchTerm("");
        setSelectedUser(null);
      } else {
        throw new Error(data.message || "Une erreur s'est produite.");
      }
    } catch (error: any) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Bell className="w-8 h-8 text-gray-700 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">
          Envoyer une Notification
        </h1>
      </div>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md border">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-3">
              Destinataire
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTarget("all")}
                className={`p-4 rounded-lg border-2 text-sm flex flex-col items-center justify-center transition-all ${
                  target === "all"
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <Users className={`w-6 h-6 mb-2 ${target === "all" ? "text-blue-600" : "text-gray-600"}`} />
                <span className={`font-semibold ${target === "all" ? "text-blue-600" : "text-gray-700"}`}>
                  Tous (Clients + Marchands)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTarget("users")}
                className={`p-4 rounded-lg border-2 text-sm flex flex-col items-center justify-center transition-all ${
                  target === "users"
                    ? "border-green-600 bg-green-50 shadow-md"
                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                }`}
              >
                <UserCircle className={`w-6 h-6 mb-2 ${target === "users" ? "text-green-600" : "text-gray-600"}`} />
                <span className={`font-semibold ${target === "users" ? "text-green-600" : "text-gray-700"}`}>
                  Tous les Clients
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTarget("merchants")}
                className={`p-4 rounded-lg border-2 text-sm flex flex-col items-center justify-center transition-all ${
                  target === "merchants"
                    ? "border-purple-600 bg-purple-50 shadow-md"
                    : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                }`}
              >
                <Store className={`w-6 h-6 mb-2 ${target === "merchants" ? "text-purple-600" : "text-gray-600"}`} />
                <span className={`font-semibold ${target === "merchants" ? "text-purple-600" : "text-gray-700"}`}>
                  Tous les Marchands
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTarget("single")}
                className={`p-4 rounded-lg border-2 text-sm flex flex-col items-center justify-center transition-all ${
                  target === "single"
                    ? "border-orange-600 bg-orange-50 shadow-md"
                    : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                }`}
              >
                <User className={`w-6 h-6 mb-2 ${target === "single" ? "text-orange-600" : "text-gray-600"}`} />
                <span className={`font-semibold ${target === "single" ? "text-orange-600" : "text-gray-700"}`}>
                  Utilisateur spécifique
                </span>
              </button>
            </div>
          </div>
          {target === "single" && (
            <div className="mb-6 relative">
              <label
                htmlFor="userSearch"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
                Rechercher un utilisateur
              </label>
              
              {/* Filtre Client/Marchand */}
              <div className="flex rounded-md border p-1 bg-gray-50 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setUserTypeFilter("USER");
                    setSearchTerm("");
                    setSelectedUser(null);
                    setSearchResults([]);
                  }}
                  className={`flex-1 p-2 rounded-md text-sm flex items-center justify-center transition-colors ${
                    userTypeFilter === "USER"
                      ? "bg-green-600 text-white shadow"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <UserCircle className="w-4 h-4 mr-2" /> Clients
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserTypeFilter("MERCHANT");
                    setSearchTerm("");
                    setSelectedUser(null);
                    setSearchResults([]);
                  }}
                  className={`flex-1 p-2 rounded-md text-sm flex items-center justify-center transition-colors ${
                    userTypeFilter === "MERCHANT"
                      ? "bg-purple-600 text-white shadow"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Store className="w-4 h-4 mr-2" /> Marchands
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="userSearch"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Chercher un ${userTypeFilter === "USER" ? "client" : "marchand"}...`}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="off"
                />
              </div>
              <AnimatePresence>
                {(isSearching || searchResults.length > 0) && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto"
                  >
                    {isSearching && searchResults.length === 0 && (
                      <li className="px-4 py-2 text-sm text-gray-500">
                        Recherche...
                      </li>
                    )}
                    {!isSearching &&
                      searchResults.length === 0 &&
                      searchTerm.length > 1 && (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          Aucun utilisateur trouvé.
                        </li>
                      )}
                    {searchResults.map((user) => (
                      <li
                        key={user.id}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div>
                          <p className="font-semibold">{user.fullName}</p>
                          <p className="text-xs text-gray-500">
                            @{user.username}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === "MERCHANT" 
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-green-100 text-green-700"
                        }`}>
                          {user.role === "MERCHANT" ? "🏪 Marchand" : "👤 Client"}
                        </span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Sélecteur d'emoji */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-3">
              Icône de notification
            </label>
            <div className="grid grid-cols-8 gap-2">
              {[
                "🔔", "📢", "💰", "🎉", "⚠️", "✅", "🎁", "📱",
                "💳", "🏆", "⭐", "🔥", "👍", "❤️", "📊", "🚀",
                "💡", "🎯", "✨", "🌟", "📈", "💎", "🎊", "⚡"
              ].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                    selectedEmoji === emoji
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Icône sélectionnée : <span className="text-2xl">{selectedEmoji}</span>
            </p>
          </div>

          {/* Champ pour le message */}
          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrivez votre message ici..."
              rows={6}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bouton d'envoi */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-gray-400"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" /> Envoyer la Notification
              </>
            )}
          </button>
        </form>

        {/* Affichage du statut */}
        {status && (
          <div
            className={`mt-4 p-3 rounded-md text-sm ${
              status.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
