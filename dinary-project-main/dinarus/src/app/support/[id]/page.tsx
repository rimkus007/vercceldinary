"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/layouts/PageHeader";
import { Send, MessageCircle, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface TicketMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface TicketDetails {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  messages: TicketMessage[];
}

export default function TicketDetailsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTicket = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTicket(data);
      }
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    const interval = setInterval(loadTicket, 5000); // Rafraîchir toutes les 5s
    return () => clearInterval(interval);
  }, [ticketId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !token || sending) return;

    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
        loadTicket();
      }
    } catch (err) {
      
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Ouvert';
      case 'IN_PROGRESS': return 'En cours';
      case 'RESOLVED': return 'Résolu';
      case 'CLOSED': return 'Fermé';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <AlertCircle className="w-4 h-4" />;
      case 'RESOLVED': return <CheckCircle className="w-4 h-4" />;
      case 'CLOSED': return <CheckCircle className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-white min-h-screen mb-16">
        <PageHeader title="Ticket non trouvé" emoji="❌" hasBackButton={true} />
        <div className="px-5 pt-4 text-center">
          <p className="text-gray-600">Ce ticket n'existe pas ou vous n'y avez pas accès.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bottom-16 bg-white flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <PageHeader 
          title={`Ticket #${ticket.id.substring(0, 8)}`}
          emoji="🎫"
          hasBackButton={true}
        />
      </div>

      {/* Info ticket fixe */}
      <div className="flex-shrink-0 px-5 pt-2">
        <div className="bg-blue-50 rounded-xl p-3 border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-gray-800">{ticket.subject}</h2>
            <div className="flex items-center gap-2">
              {getStatusIcon(ticket.status)}
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-1 line-clamp-2">{ticket.message}</p>
          <p className="text-xs text-gray-500">
            Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')} à{' '}
            {new Date(ticket.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Messages avec scroll interne */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {ticket.messages.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucune réponse pour le moment</p>
              <p className="text-sm">L'équipe support vous répondra bientôt</p>
            </div>
          ) : (
            ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === "admin" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg shadow text-sm ${
                    msg.senderId === "admin"
                      ? "bg-gray-100 text-gray-900 rounded-tl-none"
                      : "bg-blue-600 text-white rounded-tr-none"
                  }`}
                >
                  {msg.senderId === "admin" && (
                    <p className="text-xs font-semibold mb-1 text-blue-600">Support Admin</p>
                  )}
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-2 text-right ${
                    msg.senderId === "admin" ? "text-gray-500" : "text-blue-200"
                  }`}>
                    {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie fixe */}
      {ticket.status !== 'CLOSED' ? (
        <div className="flex-shrink-0 bg-white border-t shadow-lg px-5 py-3">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Écrivez votre message…"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className={`p-3 rounded-full transition-all ${
                !newMessage.trim() || sending
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-shrink-0 bg-gray-100 border-t px-5 py-3 text-center text-gray-600">
          <CheckCircle className="w-5 h-5 inline mr-2" />
          Ce ticket a été fermé
        </div>
      )}
    </div>
  );
}

