"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Send, Paperclip, X, File, Download, MessageCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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

interface SupportTicket {
  subject: string;
  message: string;
  category: string;
  priority: string;
}

/**
 * Page de support complète pour le marchand avec Chat, FAQ et Tickets
 */
export default function MerchantSupportPage() {
  const { token } = useAuth();
  const router = useRouter();
  
  // États pour les onglets
  const [activeTab, setActiveTab] = useState<'faq' | 'chat' | 'ticket'>('chat');
  
  // États pour le chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // États pour les tickets
  const [supportTicket, setSupportTicket] = useState<SupportTicket>({
    subject: '',
    message: '',
    category: 'general',
    priority: 'normal'
  });

  // Fonction pour récupérer les messages
  const fetchMessages = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/me/chat`,
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
      void 0;
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
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/me/chat`,
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
  
  // États pour les tickets
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Charger les tickets
  useEffect(() => {
    if (activeTab === 'ticket' && token) {
      loadTickets();
    }
  }, [activeTab, token]);

  const loadTickets = async () => {
    if (!token) return;
    setLoadingTickets(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      void 0;
    } finally {
      setLoadingTickets(false);
    }
  };

  // Gestion des tickets
  const handleTicketInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSupportTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: supportTicket.subject,
          message: supportTicket.message,
          category: supportTicket.category.toUpperCase(),
          priority: supportTicket.priority.toUpperCase(),
        }),
      });

      if (res.ok) {
        alert('Votre ticket a été soumis avec succès. Un membre de notre équipe vous répondra dans les plus brefs délais.');
        setSupportTicket({
          subject: '',
          message: '',
          category: 'general',
          priority: 'normal'
        });
        loadTickets(); // Recharger la liste
      } else {
        const data = await res.json();
        alert(`Erreur: ${data.message || 'Impossible de créer le ticket'}`);
      }
    } catch (err) {
      void 0;
      alert('Une erreur est survenue lors de la création du ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bottom-16 bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Header fixe */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center space-x-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <MessageCircle className="h-6 w-6 text-purple-600" />
        <h1 className="text-xl font-bold text-gray-800">Support</h1>
      </div>

      {/* Onglets de navigation */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex px-6">
          <button
            className={`py-3 px-5 ${activeTab === 'chat' ? 'border-b-2 border-purple-600 text-purple-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`py-3 px-5 ${activeTab === 'faq' ? 'border-b-2 border-purple-600 text-purple-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('faq')}
          >
            ❓ FAQ
          </button>
          <button
            className={`py-3 px-5 ${activeTab === 'ticket' ? 'border-b-2 border-purple-600 text-purple-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('ticket')}
          >
            🎫 Tickets
          </button>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div className="flex-1 overflow-hidden">
        {/* ONGLET CHAT */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Zone de messages avec scroll */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-3 shadow-sm">
                  {error}
                </div>
              )}
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Aucun message pour le moment</p>
                  <p className="text-sm">Commencez une conversation avec l&apos;administration</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === "admin" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-md p-4 rounded-2xl shadow-md text-sm ${
                        msg.senderId === "admin"
                          ? "bg-white text-gray-900 rounded-tl-none"
                          : "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none"
                      }`}
                    >
                      {msg.content}
                      {msg.fileUrl && (
                        <div className="mt-3 pt-3 border-t border-opacity-20 border-gray-300">
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
                      <div className={`text-xs mt-2 text-right ${
                        msg.senderId === "admin" ? "text-gray-500" : "text-purple-200"
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
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie fixe */}
            <div className="bg-white border-t shadow-lg px-4 py-4 flex-shrink-0">
              {selectedFile && (
                <div className="mb-3 flex items-center justify-between bg-purple-50 p-3 rounded-xl">
                  <div className="flex items-center">
                    <File size={18} className="mr-2 text-purple-600" />
                    <span className="text-sm text-gray-700 font-medium">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                  title="Joindre un fichier"
                >
                  <Paperclip size={22} />
                </button>

                <input
                  type="text"
                  className="flex-1 p-3 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Écrivez votre message…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                
                <button
                  type="submit"
                  className={`p-3 rounded-full transition-all shadow-md ${
                    !newMessage.trim() && !selectedFile
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105"
                  }`}
                  disabled={!newMessage.trim() && !selectedFile}
                  title="Envoyer"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ONGLET FAQ */}
        {activeTab === 'faq' && (
          <div className="h-full overflow-y-auto px-6 py-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl mb-6">
              <h2 className="text-xl font-semibold mb-2">Questions fréquentes</h2>
              <p className="text-sm text-purple-100">
                Trouvez rapidement des réponses à vos questions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span>Comment encaisser un paiement ?</span>
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-gray-600 mt-3 group-open:animate-fadeIn text-sm">
                    Pour encaisser un paiement, rendez-vous dans la section &quot;Encaisser&quot;, scannez le QR code du client ou entrez son identifiant, puis saisissez le montant de la transaction.
                  </p>
                </details>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span>Comment retirer mes fonds ?</span>
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-gray-600 mt-3 group-open:animate-fadeIn text-sm">
                    Vous pouvez retirer vos fonds via virement bancaire. Accédez à votre wallet, sélectionnez &quot;Retirer&quot; et suivez les instructions.
                  </p>
                </details>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span>Comment gérer mon inventaire ?</span>
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-gray-600 mt-3 group-open:animate-fadeIn text-sm">
                    Dans la section &quot;Boutique&quot;, vous pouvez ajouter, modifier ou supprimer des produits, gérer les stocks et ajuster les prix.
                  </p>
                </details>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span>Comment suivre mes ventes ?</span>
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-gray-600 mt-3 group-open:animate-fadeIn text-sm">
                    Consultez votre historique de transactions dans la section &quot;Historique&quot; pour voir toutes vos ventes, filtrer par date et exporter les données.
                  </p>
                </details>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span>Quels sont les frais de transaction ?</span>
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-gray-600 mt-3 group-open:animate-fadeIn text-sm">
                    Les frais varient selon votre plan. Consultez votre profil pour voir les frais applicables à votre compte marchand.
                  </p>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET TICKETS */}
        {activeTab === 'ticket' && (
          <div className="h-full overflow-y-auto px-6 py-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl mb-6">
              <h2 className="text-xl font-semibold mb-2">Créer un ticket</h2>
              <p className="text-sm text-purple-100">
                Besoin d&apos;aide ? Créez un ticket et notre équipe vous répondra rapidement.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 mb-4 shadow-sm">
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={supportTicket.category}
                    onChange={handleTicketInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="general">Question générale</option>
                    <option value="account">Problème de compte</option>
                    <option value="payment">Problème de paiement</option>
                    <option value="technical">Problème technique</option>
                    <option value="inventory">Gestion d&apos;inventaire</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priorité
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={supportTicket.priority}
                    onChange={handleTicketInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Basse</option>
                    <option value="normal">Normale</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Sujet
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={supportTicket.subject}
                    onChange={handleTicketInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={supportTicket.message}
                    onChange={handleTicketInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg shadow hover:shadow-lg"
                  >
                    Envoyer le ticket
                  </motion.button>
                </div>
              </form>
            </div>
            
            <h3 className="font-medium mb-3">Mes tickets récents</h3>
            
            {loadingTickets ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun ticket pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => {
                  const statusColors = {
                    OPEN: 'bg-blue-100 text-blue-800',
                    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
                    RESOLVED: 'bg-green-100 text-green-800',
                    CLOSED: 'bg-gray-100 text-gray-800',
                  };
                  
                  const statusLabels = {
                    OPEN: 'Ouvert',
                    IN_PROGRESS: 'En cours',
                    RESOLVED: 'Résolu',
                    CLOSED: 'Fermé',
                  };

                  const priorityColors = {
                    LOW: 'text-gray-600',
                    NORMAL: 'text-blue-600',
                    HIGH: 'text-orange-600',
                    URGENT: 'text-red-600',
                  };

                  const hasNewMessages = ticket.messages && ticket.messages.some((m: any) => m.senderId === 'admin' && !m.read);
                  
                  return (
                    <div 
                      key={ticket.id} 
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/support/${ticket.id}`)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                            {hasNewMessages && (
                              <span className="text-xs text-purple-600 font-semibold">• Nouvelle réponse</span>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${statusColors[ticket.status as keyof typeof statusColors]}`}>
                            {statusLabels[ticket.status as keyof typeof statusLabels]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.message}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Ticket #{ticket.id.substring(0, 8)} • {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                          <span className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                            Priorité: {ticket.priority === 'LOW' ? 'Basse' : ticket.priority === 'NORMAL' ? 'Normale' : ticket.priority === 'HIGH' ? 'Haute' : 'Urgente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


