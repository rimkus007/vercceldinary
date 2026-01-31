'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layouts/PageHeader';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function SupportPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'normal'
  });

  // États pour les tickets
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Router pour la navigation vers le chat support
  const router = useRouter();

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
      
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSupportTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    alert('Votre demande a été soumise avec succès. Un conseiller vous répondra dans les plus brefs délais.');
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
      
      alert('Une erreur est survenue lors de la création du ticket');
    }
  };

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader
        title="Support"
        emoji="💬"
        hasBackButton={true}
      />

      <div className="px-5 pt-2 pb-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-2">Besoin d&apos;aide ?</h2>
          <p className="text-sm text-blue-100">
            Notre équipe de support est disponible 24/7 pour répondre à vos questions et résoudre vos problèmes.
          </p>
        </div>

        {/* Onglets de navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-5 ${activeTab === 'faq' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('faq')}
          >
            FAQ
          </button>
          <button
            className={`py-3 px-5 ${activeTab === 'contact' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('contact')}
          >
            Nous contacter
          </button>
          <button
            className={`py-3 px-5 ${activeTab === 'ticket' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('ticket')}
          >
            Mes tickets
          </button>
        </div>

        {/* Contenu de l&apos;onglet FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                  <span>Comment recharger mon compte ?</span>
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="text-gray-600 mt-3 group-open:animate-fadeIn text-sm">
                  Vous pouvez recharger votre compte Dinary via plusieurs méthodes : carte bancaire, virement bancaire, ou dans les points de vente partenaires. Rendez-vous dans la section &quot;Recharger&quot; pour plus de détails.
                </p>
              </details>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                  <span>Comment envoyer de l&apos;argent à un ami ?</span>
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="text-gray-600 mt-3 group-open:animate-fadeIn text-sm">
                  Pour envoyer de l&apos;argent, accédez à la section &quot;Envoyer&quot;, sélectionnez un contact ou entrez les informations du destinataire, spécifiez le montant et confirmez la transaction.
                </p>
              </details>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                  <span>Comment sécuriser mon compte ?</span>
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="text-gray-600 mt-3 group-open:animate-fadeIn text-sm">
                  Pour sécuriser votre compte, activez l&apos;authentification à deux facteurs, utilisez un mot de passe fort et unique, et vérifiez régulièrement votre historique de transactions pour détecter toute activité suspecte.
                </p>
              </details>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                  <span>Comment gérer mes cartes virtuelles ?</span>
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="text-gray-600 mt-3 group-open:animate-fadeIn text-sm">
                  Vous pouvez gérer vos cartes virtuelles dans la section &quot;Carte&quot;. Vous pouvez y créer de nouvelles cartes, bloquer temporairement une carte, définir des limites de dépenses et consulter l&apos;historique des transactions.
                </p>
              </details>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                  <span>Comment gagner des points de fidélité ?</span>
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="text-gray-600 mt-3 group-open:animate-fadeIn text-sm">
                  Vous gagnez des points de fidélité en utilisant régulièrement nos services : transactions, achats avec votre carte, parrainage de nouveaux utilisateurs et participation à nos défis mensuels. Consultez la section &quot;Rewards&quot; pour plus d&apos;informations.
                </p>
              </details>
            </div>

            <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Voir toutes les questions
            </button>
          </div>
        )}

        {/* Contenu de l&apos;onglet Contact */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            {/* Options de contact */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="text-xl">📞</span>
              </div>
              <div>
                <h3 className="font-medium">Service Client</h3>
                <p className="text-sm text-gray-600">+213 (0) 770 123 456</p>
                <p className="text-xs text-gray-500 mt-1">Disponible 8h-20h, 7j/7</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="text-xl">💬</span>
              </div>
              <div>
                <h3 className="font-medium">Chat en direct</h3>
                <p className="text-sm text-gray-600">Discutez avec un conseiller</p>
                <p className="text-xs text-green-600 mt-1">En ligne • Temps d&apos;attente &lt; 3 min</p>
                <button
                  className="mt-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  type="button"
                  onClick={() => router.push('/support/chat')}
                >
                  Démarrer le chat
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="text-xl">✉️</span>
              </div>
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-sm text-gray-600">support@dinary.dz</p>
                <p className="text-xs text-gray-500 mt-1">Réponse sous 24h</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="text-xl">🏢</span>
              </div>
              <div>
                <h3 className="font-medium">Agences</h3>
                <p className="text-sm text-gray-600">Trouver l&apos;agence la plus proche</p>
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">
                  Voir les agences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenu de l&apos;onglet Ticket */}
        {activeTab === 'ticket' && (
          <div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-4">
              <h3 className="font-medium mb-4">Créer un ticket de support</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={supportTicket.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">Question générale</option>
                    <option value="account">Problème de compte</option>
                    <option value="payment">Problème de paiement</option>
                    <option value="technical">Problème technique</option>
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
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700"
                  >
                    Envoyer le ticket
                  </motion.button>
                </div>
              </form>
            </div>
            
            <h3 className="font-medium mb-3">Mes tickets récents</h3>
            
            {loadingTickets ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/support/${ticket.id}`)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                            {hasNewMessages && (
                              <span className="text-xs text-blue-600 font-semibold">• Nouvelle réponse</span>
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