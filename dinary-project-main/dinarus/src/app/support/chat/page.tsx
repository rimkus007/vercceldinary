"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layouts/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { Send, Paperclip, X, File, Download } from "lucide-react";

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

/**
 * Page de chat entre un utilisateur et l'administration.
 * Cette page récupère l'historique de chat via l'API `/users/me/chat` et
 * permet d'envoyer de nouveaux messages à l'admin via `/users/me/chat` (POST).
 */
export default function UserChatPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonction pour récupérer les messages
  const fetchMessages = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/chat`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        throw new Error("Impossible de charger la conversation.");
      }
      const data = await res.json();
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
      
    }
  };

  // Récupérer l'historique du chat au chargement
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      setError(null);
      await fetchMessages();
      setLoading(false);
    };
    loadMessages();
  }, [token]);

  // Polling pour les nouveaux messages toutes les 5 secondes
  useEffect(() => {
    if (!token) return;
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [token, messages]);

  // Faire défiler vers le bas à chaque ajout de message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !token) return;
    
    try {
      const formData = new FormData();
      formData.append('content', newMessage.trim() || '(Fichier joint)');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/chat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Ne PAS mettre Content-Type, FormData le gère automatiquement
          },
          body: formData,
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Échec de l'envoi du message.");
      }
      const newMsg: ChatMessage = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white h-screen flex flex-col overflow-hidden">
      {/* Header fixe */}
      <div className="flex-shrink-0">
        <PageHeader title="Chat Support" emoji="💬" hasBackButton={true} />
      </div>

      {/* Zone de messages avec scroll */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 mb-16">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-3">
            {error}
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === "admin" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg text-sm ${
                msg.senderId === "admin"
                  ? "bg-gray-100 text-gray-900"
                  : "bg-blue-600 text-white"
              }`}
            >
              {msg.content}
              {msg.fileUrl && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <a
                    href={`http://localhost:3001${msg.fileUrl}`}
                    download={msg.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs hover:underline"
                  >
                    <File size={14} className="mr-1" />
                    {msg.fileName || "Fichier joint"}
                    <Download size={12} className="ml-1" />
                  </a>
                </div>
              )}
              <div className={`text-xs mt-1 text-right ${
                msg.senderId === "admin" ? "text-gray-500" : "text-blue-200"
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {msg.senderId !== "admin" && (
                  <span className="ml-2">
                    {msg.read ? "✓ Lu" : "✓ Envoyé"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie fixe */}
      <div className="flex-shrink-0 border-t bg-white px-4 py-3 pb-20">
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
        
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Joindre un fichier"
          >
            <Paperclip size={20} />
          </button>

          <input
            type="text"
            className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Écrivez votre message…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          
          <button
            type="submit"
            className={`p-3 rounded-full transition-colors ${
              !newMessage.trim() && !selectedFile
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={!newMessage.trim() && !selectedFile}
            title="Envoyer"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
