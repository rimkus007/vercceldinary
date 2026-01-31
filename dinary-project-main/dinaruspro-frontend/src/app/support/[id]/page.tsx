"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Send, MessageCircle, CheckCircle, Clock, AlertCircle } from "lucide-react";

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
      void 0;
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
      void 0;
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ticket non trouvé</p>
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bottom-16 bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{ticket.subject}</h1>
            <p className="text-xs text-gray-500">Ticket #{ticket.id.substring(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(ticket.status)}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
            {getStatusLabel(ticket.status)}
          </span>
        </div>
      </div>

      {/* Message initial */}
      <div className="flex-shrink-0 bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm border-l-4 border-purple-600">
        <p className="text-sm text-gray-600 mb-1">Message initial</p>
        <p className="text-gray-800">{ticket.message}</p>
        <p className="text-xs text-gray-400 mt-2">
          {new Date(ticket.createdAt).toLocaleString('fr-FR')}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {ticket.messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
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
                className={`max-w-md p-4 rounded-2xl shadow-md text-sm ${
                  msg.senderId === "admin"
                    ? "bg-white text-gray-900 rounded-tl-none"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none"
                }`}
              >
                {msg.senderId === "admin" && (
                  <p className="text-xs font-semibold mb-1 text-purple-600">Support Admin</p>
                )}
                <p>{msg.content}</p>
                <p className={`text-xs mt-2 text-right ${
                  msg.senderId === "admin" ? "text-gray-500" : "text-purple-200"
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

      {/* Zone de saisie */}
      {ticket.status !== 'CLOSED' && (
        <div className="bg-white border-t shadow-lg px-4 py-4 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <input
              type="text"
              className="flex-1 p-3 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Écrivez votre message…"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className={`p-3 rounded-full transition-all shadow-md ${
                !newMessage.trim() || sending
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105"
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {ticket.status === 'CLOSED' && (
        <div className="bg-gray-100 border-t px-4 py-4 text-center text-gray-600 flex-shrink-0">
          <CheckCircle className="w-6 h-6 inline mr-2" />
          Ce ticket a été fermé
        </div>
      )}
    </div>
  );
}

