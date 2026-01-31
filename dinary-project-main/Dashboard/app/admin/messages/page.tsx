"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Clock,
  CheckCircle,
  X,
  File,
  Download,
} from "lucide-react";

// Interfaces for conversations and messages
interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    address: string | null;
    avatar: string;
    status: "online" | "away" | "offline";
    isBusiness?: boolean;
    merchantProfile?: {
      name: string;
      category: string;
      isApproved: boolean;
    };
  };
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

// Fonction pour formater la date
const formatMessageTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return `Hier ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays < 7) {
    return date.toLocaleDateString("fr-FR", { weekday: "long" });
  } else {
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  }
};

export default function MessagesPage() {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fonction pour récupérer les conversations
  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Impossible de charger les conversations.");
      const data: any[] = await res.json();
      setConversations(data);
      
      // Mettre à jour les conversations filtrées en préservant le filtre
      if (searchTerm) {
        const filtered = data.filter((conv) =>
          conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredConversations(filtered);
      } else {
        setFilteredConversations(data);
      }
      
      // Si c'est le premier chargement et qu'il y a des conversations, sélectionner la première
      if (!activeConversationId && data.length > 0) {
        setActiveConversationId(data[0].id);
      }
    } catch (err: any) {
      if (!loadingConversations) { // N'afficher l'erreur que si ce n'est pas le premier chargement
        /* log removed */
      }
    }
  };

  // Fonction pour récupérer les messages
  const fetchMessages = async () => {
    if (!token || !activeConversationId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/messages/${activeConversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Impossible de charger l'historique.");
      const data: any[] = await res.json();
      
      // Mettre à jour uniquement si les messages ont changé
      if (JSON.stringify(data) !== JSON.stringify(messages)) {
        setMessages(data);
      }
    } catch (err: any) {
      if (loadingMessages) { // N'afficher l'erreur que lors du premier chargement
        setError(err.message);
      }
    }
  };

  // Fetch conversations au montage
  useEffect(() => {
    const loadConversations = async () => {
      setLoadingConversations(true);
      setError(null);
      await fetchConversations();
      setLoadingConversations(false);
    };
    loadConversations();
  }, [token]);

  // Polling des conversations toutes les 3 secondes
  useEffect(() => {
    if (!token) return;
    
    const interval = setInterval(() => {
      fetchConversations();
    }, 3000);

    return () => clearInterval(interval);
  }, [token, searchTerm, activeConversationId]);

  // Fetch messages quand on change de conversation
  useEffect(() => {
    if (!token || !activeConversationId) return;
    
    const loadMessages = async () => {
      setLoadingMessages(true);
      setError(null);
      await fetchMessages();
      setLoadingMessages(false);
    };
    loadMessages();
  }, [token, activeConversationId]);

  // Polling des messages toutes les 3 secondes
  useEffect(() => {
    if (!token || !activeConversationId) return;
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [token, activeConversationId, messages]);

  // Filter conversations
  const handleSearch = (e: any) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter((conv) =>
        conv.user.name.toLowerCase().includes(term)
      );
      setFilteredConversations(filtered);
    }
  };

  const currentConversation = conversations.find((conv) => conv.id === activeConversationId) || null;

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Send message
  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !activeConversationId) return;
    
    try {
      const formData = new FormData();
      formData.append('content', newMessage.trim() || '(Fichier joint)');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/messages/${activeConversationId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Ne PAS mettre Content-Type, FormData le gère automatiquement
          },
          body: formData,
        }
      );
      
      if (!res.ok) throw new Error("Échec de l'envoi du message.");
      const newMsg: ChatMessage = await res.json();
      
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Rafraîchir les conversations pour mettre à jour le dernier message
      fetchConversations();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loadingConversations) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dinary-turquoise"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] -mx-6 -mb-6 overflow-hidden">
      {/* Sidebar - Conversations */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:border-dinary-turquoise focus:outline-none text-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Aucune conversation
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                  conv.id === activeConversationId
                    ? "bg-dinary-turquoise/10 border-l-4 border-l-dinary-turquoise"
                    : ""
                }`}
                onClick={() => setActiveConversationId(conv.id)}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dinary-turquoise to-blue-500 flex items-center justify-center text-white font-medium">
                      {conv.user.name.charAt(0)}
                    </div>
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conv.user.name}
                        </h3>
                        {conv.user.isBusiness && (
                          <span className="ml-1.5 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
                            Pro
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {conv.lastMessage ? formatMessageTime(conv.lastMessage.timestamp) : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 truncate">
                        {conv.lastMessage?.fileUrl && !conv.lastMessage.content.trim() ? (
                          <span className="flex items-center">
                            <File size={12} className="mr-1" />
                            {conv.lastMessage.fileName || "Fichier"}
                          </span>
                        ) : (
                          conv.lastMessage?.content || "Nouvelle conversation"
                        )}
                      </p>

                      {conv.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-dinary-turquoise text-white text-xs">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {currentConversation ? (
          <>
            {/* Header */}
            <div className="h-16 border-b bg-white flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dinary-turquoise to-blue-500 flex items-center justify-center text-white font-medium">
                    {currentConversation.user.name.charAt(0)}
                  </div>
                </div>

                <div className="ml-3">
                  <h3 className="text-sm font-medium">{currentConversation.user.name}</h3>
                </div>
              </div>

              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message, index) => {
                const isAdmin = message.senderId === "admin";
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const showSenderInfo = !previousMessage || previousMessage.senderId !== message.senderId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"} mb-3`}
                  >
                    {!isAdmin && showSenderInfo && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dinary-turquoise to-blue-500 flex items-center justify-center text-white font-medium mr-2 flex-shrink-0">
                        {currentConversation.user.name.charAt(0)}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${!isAdmin && !showSenderInfo ? "ml-10" : ""}`}>
                      {showSenderInfo && (
                        <div className={`flex items-center mb-1 ${isAdmin ? "justify-end" : "justify-start"}`}>
                          <span className="text-xs font-medium text-gray-500">
                            {isAdmin ? "Vous" : currentConversation.user.name}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatMessageTime(message.timestamp)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`rounded-lg py-2 px-3 inline-block ${
                          isAdmin
                            ? "bg-dinary-turquoise text-white"
                            : "bg-white text-gray-800 border"
                        }`}
                      >
                        {message.content}
                        {message.fileUrl && (
                          <div className="mt-2 pt-2 border-t border-white/20">
                            <a
                              href={`http://localhost:3001${message.fileUrl}`}
                              download={message.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm hover:underline"
                            >
                              <File size={16} className="mr-2" />
                              {message.fileName || "Fichier joint"}
                              <Download size={14} className="ml-2" />
                            </a>
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex justify-end mt-1 items-center gap-1">
                          {message.read ? (
                            <>
                              <CheckCircle size={14} className="text-dinary-turquoise" />
                              <span className="text-xs text-dinary-turquoise font-medium">Lu</span>
                            </>
                          ) : (
                            <>
                              <Clock size={14} className="text-gray-400" />
                              <span className="text-xs text-gray-400">Envoyé</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t bg-white p-4 flex-shrink-0">
              {selectedFile && (
                <div className="mb-2 flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                  <div className="flex items-center">
                    <File size={16} className="mr-2 text-gray-600" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-dinary-turquoise hover:bg-gray-100 rounded-full transition-colors"
                  title="Joindre un fichier"
                >
                  <Paperclip size={20} />
                </button>

                <input
                  type="text"
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-dinary-turquoise focus:ring-1 focus:ring-dinary-turquoise"
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />

                <button
                  type="submit"
                  className={`p-2 rounded-full transition-colors ${
                    newMessage.trim() === "" && !selectedFile
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-dinary-turquoise text-white hover:bg-opacity-90"
                  }`}
                  disabled={newMessage.trim() === "" && !selectedFile}
                  title="Envoyer"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <MessageSquare size={64} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500">Sélectionnez une conversation</h3>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="w-80 border-l bg-white hidden lg:flex flex-col overflow-hidden">
        <div className="p-4 border-b flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-700">Informations</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {currentConversation && (
            <div>
              {/* Avatar et nom */}
              <div className="flex flex-col items-center mb-6 pb-6 border-b">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-dinary-turquoise to-blue-500 flex items-center justify-center text-white text-2xl font-medium mb-3">
                  {currentConversation.user.name.charAt(0)}
                </div>
                <h3 className="font-medium text-lg text-center">
                  {currentConversation.user.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {currentConversation.user.isBusiness ? "Compte Professionnel" : "Compte Personnel"}
                </p>
              </div>

              {/* Informations */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Email</h4>
                  <p className="text-sm text-gray-700">{currentConversation.user.email}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Téléphone</h4>
                  <p className="text-sm text-gray-700">{currentConversation.user.phoneNumber}</p>
                </div>

                {currentConversation.user.address && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Adresse</h4>
                    <p className="text-sm text-gray-700">{currentConversation.user.address}</p>
                  </div>
                )}

                {currentConversation.user.merchantProfile && (
                  <>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Commerce</h4>
                      <p className="text-sm text-gray-700">
                        {currentConversation.user.merchantProfile.name}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Catégorie</h4>
                      <p className="text-sm text-gray-700">
                        {currentConversation.user.merchantProfile.category}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Statut</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        currentConversation.user.merchantProfile.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {currentConversation.user.merchantProfile.isApproved ? "Approuvé" : "En attente"}
                      </span>
                    </div>
                  </>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">ID</h4>
                  <p className="text-xs text-gray-500 font-mono">{currentConversation.user.id}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
