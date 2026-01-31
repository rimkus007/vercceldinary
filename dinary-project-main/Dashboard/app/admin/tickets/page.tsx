"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Ticket, RefreshCw, Eye, MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  adminResponse?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    username: string;
  };
  messages: Array<{
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  }>;
}

export default function TicketsPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState("");
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const fetchTickets = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/tickets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Impossible de charger les tickets.");
      }
      const data = await res.json();
      setTickets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    if (!token) return;
    setUpdating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/tickets/${ticketId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          const updated = await res.json();
          setSelectedTicket(updated);
        }
      }
    } catch (err) {
      /* log removed */
    } finally {
      setUpdating(false);
    }
  };

  const handleRespond = async (ticketId: string) => {
    if (!token || !responseText.trim()) return;
    setUpdating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/tickets/${ticketId}/respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ response: responseText }),
        }
      );
      if (res.ok) {
        setResponseText("");
        fetchTickets();
        alert("Réponse envoyée avec succès !");
      }
    } catch (err) {
      /* log removed */
      alert("Erreur lors de l'envoi de la réponse");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Ouvert";
      case "IN_PROGRESS":
        return "En cours";
      case "RESOLVED":
        return "Résolu";
      case "CLOSED":
        return "Fermé";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "text-gray-600";
      case "NORMAL":
        return "text-blue-600";
      case "HIGH":
        return "text-orange-600";
      case "URGENT":
        return "text-red-600 font-bold";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "Basse";
      case "NORMAL":
        return "Normale";
      case "HIGH":
        return "Haute";
      case "URGENT":
        return "Urgente";
      default:
        return priority;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "GENERAL":
        return "Général";
      case "ACCOUNT":
        return "Compte";
      case "PAYMENT":
        return "Paiement";
      case "TECHNICAL":
        return "Technique";
      case "INVENTORY":
        return "Inventaire";
      case "OTHER":
        return "Autre";
      default:
        return category;
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filterStatus !== "all" && ticket.status !== filterStatus) return false;
    if (filterPriority !== "all" && ticket.priority !== filterPriority) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dinary-turquoise"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Ticket className="w-8 h-8 text-dinary-turquoise mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tickets de Support</h1>
            <p className="text-gray-600 text-sm">Gestion des demandes d'assistance</p>
          </div>
        </div>
        <button
          onClick={fetchTickets}
          className="flex items-center gap-2 px-4 py-2 bg-dinary-turquoise text-white rounded-lg hover:bg-opacity-90"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Ouverts</div>
          <div className="text-2xl font-bold text-blue-800">
            {tickets.filter((t) => t.status === "OPEN").length}
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-yellow-600 font-medium">En cours</div>
          <div className="text-2xl font-bold text-yellow-800">
            {tickets.filter((t) => t.status === "IN_PROGRESS").length}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Résolus</div>
          <div className="text-2xl font-bold text-green-800">
            {tickets.filter((t) => t.status === "RESOLVED").length}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-red-600 font-medium">Urgents</div>
          <div className="text-2xl font-bold text-red-800">
            {tickets.filter((t) => t.priority === "URGENT").length}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Statut:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="all">Tous</option>
            <option value="OPEN">Ouverts</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolus</option>
            <option value="CLOSED">Fermés</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Priorité:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="all">Toutes</option>
            <option value="LOW">Basse</option>
            <option value="NORMAL">Normale</option>
            <option value="HIGH">Haute</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>
      )}

      {/* Liste des tickets */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Aucun ticket trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sujet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      #{ticket.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.user.fullName}</div>
                      <div className="text-sm text-gray-500">{ticket.user.email}</div>
                      <div className="text-xs text-gray-400">
                        {ticket.user.role === "MERCHANT" ? "Marchand" : "Client"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryLabel(ticket.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-dinary-turquoise hover:text-dinary-turquoise/80 flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal détails ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedTicket.subject}</h2>
                  <p className="text-sm text-gray-500">Ticket #{selectedTicket.id.substring(0, 8)}</p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Utilisateur:</span>
                  <p className="font-medium">{selectedTicket.user.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedTicket.user.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Catégorie:</span>
                  <p className="font-medium">{getCategoryLabel(selectedTicket.category)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Priorité:</span>
                  <p className={`font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {getPriorityLabel(selectedTicket.priority)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Statut:</span>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm text-gray-500">Message initial:</span>
                <p className="mt-1 p-3 bg-blue-50 rounded border-l-4 border-blue-600">{selectedTicket.message}</p>
              </div>

              {/* Conversation */}
              {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500 mb-2 block">💬 Conversation:</span>
                  <div className="max-h-[300px] overflow-y-auto space-y-2 bg-gray-50 p-3 rounded">
                    {selectedTicket.messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.senderId === 'admin'
                            ? 'bg-dinary-turquoise text-white ml-10'
                            : 'bg-white border border-gray-200 mr-10'
                        }`}
                      >
                        <div className="text-xs mb-1 font-semibold">
                          {msg.senderId === 'admin' ? '🛡️ Admin' : '👤 ' + selectedTicket.user.fullName}
                        </div>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === 'admin' ? 'text-white/70' : 'text-gray-500'}`}>
                          {new Date(msg.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions rapides */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, "IN_PROGRESS")}
                  disabled={updating || selectedTicket.status === "IN_PROGRESS"}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 disabled:opacity-50"
                >
                  Marquer en cours
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, "RESOLVED")}
                  disabled={updating || selectedTicket.status === "RESOLVED"}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 disabled:opacity-50"
                >
                  Marquer résolu
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, "CLOSED")}
                  disabled={updating || selectedTicket.status === "CLOSED"}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
                >
                  Fermer
                </button>
              </div>

              {/* Répondre via messagerie */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Répondre via la messagerie
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 mb-2"
                  rows={4}
                  placeholder="Tapez votre réponse ici. Elle sera envoyée dans la messagerie de l'utilisateur avec le contexte du ticket."
                />
                <button
                  onClick={async () => {
                    await handleRespond(selectedTicket.id);
                    setSelectedTicket(null);
                  }}
                  disabled={updating || !responseText.trim()}
                  className="w-full px-4 py-2 bg-dinary-turquoise text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Envoi..." : "Envoyer la réponse"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
