"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import PageHeader from "@/components/layouts/PageHeader";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  UserPlus,
  Check,
  Clock,
  UserMinus,
  UserCheck,
} from "lucide-react";

// --- Interfaces pour les données ---
interface User {
  id: string;
  username: string;
  fullName: string;
  lastSeen?: string; // Peut être une chaîne de date ISO
  isFavorite?: boolean;
}

interface PendingRequest {
  id: string; // ID de la demande d'amitié
  requester: User;
}

// --- Animations ---
const buttonTapAnimation = {
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};
const contactItemAnimation = {
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

// --- Composant pour les résultats de recherche ---
// Ce composant reste en dehors car il est simple et réutilisable
const SearchResultItem = ({ user, onAdd, status }) => {
  return (
    <motion.div
      variants={contactItemAnimation}
      className="flex items-center p-3 bg-white rounded-xl"
    >
      <div className="relative mr-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl font-bold text-blue-800">
          {user.fullName.charAt(0)}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{user.fullName}</h3>
        <p className="text-sm text-gray-500">@{user.username}</p>
      </div>
      {status === "already-friend" ? (
        <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
          <Check size={16} className="mr-1.5" /> Amis
        </div>
      ) : status === "pending" ? (
        <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
          <Clock size={16} className="mr-1.5" /> Envoyée
        </div>
      ) : (
        <motion.button
          whileTap="tap"
          variants={buttonTapAnimation}
          onClick={() => onAdd(user.username)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center"
        >
          <UserPlus size={16} className="mr-1.5" /> Ajouter
        </motion.button>
      )}
    </motion.div>
  );
};

export default function AmisPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]); // Pour suivre les demandes que vous avez envoyées
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

  const fetchFriendsAndRequests = useCallback(async () => {
    if (!token) return;
    setIsLoadingInitialData(true);
    try {
      const [friendsRes, pendingRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setFriends(
          friendsData.map((f, index) => ({ ...f, isOnline: index % 3 === 0 }))
        ); // Simule le statut en ligne
      }
      if (pendingRes.ok) setPendingRequests(await pendingRes.json());
    } catch (error) {
      void 0;
    } finally {
      setIsLoadingInitialData(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFriendsAndRequests();
  }, [fetchFriendsAndRequests]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/search?q=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) setSearchResults(await response.json());
    } catch (e) {
      void 0;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (username) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/friends/request/${username}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setSentRequests([...sentRequests, username]);
        alert("Demande envoyée !");
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      void 0;
    }
  };

  const handleRespondRequest = async (
    requestId: string,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/friends/request/${requestId}/respond`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      fetchFriendsAndRequests();
    } catch (error) {
      void 0;
    }
  };

  const handleSelectContact = (contact: User) => {
    localStorage.setItem(
      "selectedContact",
      JSON.stringify({
        id: contact.id,
        nom: contact.fullName,
        username: contact.username,
        photo: contact.fullName.charAt(0),
      })
    );
    router.push("/envoyer");
  };

  // ### DÉPLACEMENT DE LA FONCTION ICI ###
  const getFriendshipStatus = (searchUser: User) => {
    if (friends.some((friend) => friend.id === searchUser.id))
      return "already-friend";
    if (pendingRequests.some((req) => req.requester.id === searchUser.id))
      return "pending-response";
    if (sentRequests.includes(searchUser.username)) return "pending";
    return "none";
  };

  const renderContactList = (contactsList: User[]) => {
    return contactsList.length > 0 ? (
      <div className="space-y-3">
        {contactsList.map((contact) => (
          <motion.div
            key={contact.id}
            variants={contactItemAnimation}
            className="flex items-center p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => handleSelectContact(contact)}
          >
            <div className="relative mr-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl font-bold text-blue-800">
                {contact.fullName.charAt(0)}
              </div>
              {contact.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{contact.fullName}</h3>
              <p className="text-sm text-gray-500">@{contact.username}</p>
            </div>
            <motion.button
              whileTap="tap"
              variants={buttonTapAnimation}
              className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectContact(contact);
              }}
            >
              <span className="text-sm">💸</span>
            </motion.button>
          </motion.div>
        ))}
      </div>
    ) : (
      <div className="py-8 text-center">
        <p className="text-gray-500">Aucun ami dans cette catégorie.</p>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen mb-16">
      <PageHeader
        title="Mes Amis"
        emoji="👥"
        actionButton={
          <Link href="/inviter">
            <motion.button
              whileTap="tap"
              variants={buttonTapAnimation}
              className="p-2 text-blue-600"
            >
              <span className="text-lg">➕</span>
            </motion.button>
          </Link>
        }
      />

      <div className="px-5 py-2">
        {/* Barre de recherche */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500">🔍</span>
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-3 pl-10 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rechercher un ami..."
          />
        </div>

        {searchQuery.trim().length > 1 ? (
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Résultats de la recherche
            </h3>
            {isLoading && (
              <div className="text-center">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            )}
            {!isLoading && searchResults.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Aucun utilisateur trouvé.
              </p>
            )}
            {!isLoading &&
              searchResults.map((u) => (
                <SearchResultItem
                  key={u.id}
                  user={u}
                  onAdd={handleSendRequest}
                  status={getFriendshipStatus(u)}
                />
              ))}
          </div>
        ) : (
          <>
            {/* Section Actions */}
            <div className="mb-6">
              <div className="flex space-x-2 mb-4">
                <Link href="/inviter" className="flex-1">
                  <motion.button
                    whileTap="tap"
                    variants={buttonTapAnimation}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl flex items-center justify-center"
                  >
                    <span className="text-sm mr-2">➕</span>
                    <span className="text-sm font-medium">
                      Inviter des amis
                    </span>
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Demandes en attente */}
            {pendingRequests.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-600 mb-2">
                  Demandes en attente ({pendingRequests.length})
                </h3>
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center p-3 bg-white rounded-xl shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mr-3 font-bold text-amber-800 text-xl">
                        {req.requester.fullName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {req.requester.fullName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          @{req.requester.username}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleRespondRequest(req.id, "ACCEPTED")
                          }
                          className="bg-green-500 text-white p-2 rounded-full"
                        >
                          <UserCheck size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleRespondRequest(req.id, "REJECTED")
                          }
                          className="bg-gray-200 text-gray-700 p-2 rounded-full"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liste unique des amis */}
            {isLoadingInitialData ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            ) : friends.length > 0 ? (
              <div className="mb-4">
                {renderContactList(friends)}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Invitez vos amis à rejoindre Dinary !
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
