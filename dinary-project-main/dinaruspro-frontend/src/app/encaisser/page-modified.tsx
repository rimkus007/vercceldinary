'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Définition des interfaces pour TypeScript
interface Product {
  id: number | string;
  name: string;
  price: number;
  category: string;
  description: string;
  quantity?: number;
}

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  category?: string;
}

const productsMock: Product[] = [
  { id: 1, name: '☕ Café', price: 200, category: 'drinks', description: 'Tasse classique' },
  { id: 2, name: '🥪 Sandwich', price: 450, category: 'food', description: 'Poulet & crudités' },
  { id: 3, name: '🍰 Gâteau', price: 300, category: 'desserts', description: 'Chocolat noir' },
  { id: 4, name: '🍵 Thé', price: 150, category: 'drinks', description: 'Menthe fraîche' },
  { id: 5, name: '🍕 Pizza', price: 600, category: 'food', description: 'Quatre fromages' },
  { id: 6, name: '🍦 Glace', price: 250, category: 'desserts', description: 'Vanille-chocolat' },
];

export default function EncaisserPage() {
  // États pour le panier et les modals
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customAmount, setCustomAmount] = useState('');
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Effet pour simuler un paiement après génération du QR
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (showQRModal) {
      timer = setTimeout(() => {
        setPaymentComplete(true);
        setShowQRModal(false);
      }, 3000); // Simule un paiement après 3 secondes
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [showQRModal]);

  // Fonctions pour le panier
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    // Notification discrète
    showNotification(`${product.name} ajouté au panier`);
    // Le modal reste ouvert pour permettre la sélection multiple
  };

  const addCustomAmount = () => {
    if (!customAmount || parseFloat(customAmount) <= 0) {
      showNotification('Veuillez entrer un montant valide', 'error');
      return;
    }
    
    const amount = parseFloat(customAmount);
    setCart([...cart, { 
      id: `custom-${Date.now()}`, 
      name: '💲 Montant personnalisé', 
      price: amount,
      quantity: 1,
      description: 'Saisie manuelle'
    }]);
    
    setCustomAmount('');
    setShowAmountModal(false);
    showNotification('Montant ajouté au panier');
  };

  const updateQuantity = (id: string | number, delta: number) => {
    setCart(prev =>
      prev
        .map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
        .filter(item => item.quantity > 0)
    );
  };

  const removeCartItem = (id: string | number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    showNotification('Panier vidé');
  };

  // Notification simple
  const showNotification = (message: string, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 1500);
  };

  // Calculs des totaux
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const commission = subtotal * 0.015;
  const total = subtotal + commission;

  // Filtre par catégorie et recherche
  const filteredProducts = productsMock
    .filter(p => filter === 'all' ? true : p.category === filter)
    .filter(p => searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true);

  return (
    <main className="p-4 pb-32 bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <header className="mb-6 relative">
        <Link href="/" className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md">
          <span className="text-gray-600">←</span>
        </Link>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center">Encaissement</h1>
      </header>

      {/* Mini panier toujours visible */}
      <div className="bg-white rounded-xl p-4 shadow-md mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-800">Mon panier</h2>
          <div className="flex gap-2">
            {cart.length > 0 && (
              <button 
                onClick={clearCart}
                className="text-xs text-red-500 font-medium"
              >
                Vider
              </button>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Votre panier est vide</p>
            <p className="text-xs text-gray-400 mt-1">Ajoutez des produits ou un montant</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-36 overflow-y-auto mb-3">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.name.split(' ')[0]}</span>
                  <div className="text-sm">
                    <span className="text-gray-600">{item.price} DA × {item.quantity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex border border-gray-200 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-2 text-gray-500 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="px-2 text-sm flex items-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-2 text-gray-500 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeCartItem(item.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {cart.length > 0 && (
          <div className="flex justify-between items-center text-sm mt-4 pt-2 border-t border-gray-100">
            <span className="font-medium">Total:</span>
            <span className="font-bold text-purple-600">{total.toFixed(2)} DA</span>
          </div>
        )}
        
        {cart.length > 0 && (
          <button
            onClick={() => setShowQRModal(true)}
            className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:opacity-90 transition"
          >
            Encaisser {total.toFixed(2)} DA
          </button>
        )}
      </div>

      {/* Principales options d'ajout */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setShowAmountModal(true)}
          className="bg-white p-5 rounded-xl shadow-md flex flex-col items-center justify-center hover:shadow-lg transition"
        >
          <div className="text-3xl mb-2">💲</div>
          <div className="text-sm font-medium">Montant libre</div>
        </button>
        <button
          onClick={() => setShowProductModal(true)}
          className="bg-white p-5 rounded-xl shadow-md flex flex-col items-center justify-center hover:shadow-lg transition"
        >
          <div className="text-3xl mb-2">🛒</div>
          <div className="text-sm font-medium">Ajouter produits</div>
        </button>
      </div>
      
      {/* Favoris / Raccourcis */}
      <div className="mb-4">
        <h3 className="font-medium text-sm text-gray-700 mb-2">Produits fréquents</h3>
        <div className="grid grid-cols-3 gap-2">
          {productsMock.slice(0, 3).map(product => (
            <div 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-3 rounded-lg shadow-sm flex flex-col items-center hover:shadow transition cursor-pointer"
            >
              <div className="text-2xl mb-1">{product.name.split(' ')[0]}</div>
              <div className="text-xs text-gray-600">{product.price} DA</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal pour montant libre */}
      {showAmountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 shadow-xl w-full max-w-md animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-center">Montant personnalisé</h2>
            
            <div className="mb-6">
              <div className="relative mb-2">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-4 text-3xl font-bold text-center border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                  DA
                </div>
              </div>
              
              {/* Boutons de raccourcis */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[100, 200, 500, 1000, 1500, 2000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setCustomAmount(amount.toString())}
                    className="py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    {amount} DA
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowAmountModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={addCustomAmount}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour sélection de produits */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg">Choisir des produits</h2>
              <button 
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Rechercher un produit..." 
                  className="w-full px-4 py-2 pl-10 rounded-lg bg-gray-100 text-sm focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filtres par catégorie */}
              <div className="flex gap-2 overflow-x-auto py-2 mt-2">
                {[
                  { id: 'all', label: '🔄 Tout' },
                  { id: 'food', label: '🍽️ Repas' },
                  { id: 'drinks', label: '🥤 Boissons' },
                  { id: 'desserts', label: '🍰 Desserts' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                      filter === cat.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des produits */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id} 
                      onClick={() => addToCart(product)}
                      className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md cursor-pointer transition active:bg-gray-50"
                    >
                      <div className="text-2xl mb-1">{product.name.split(' ')[0]}</div>
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500 mb-1">{product.description}</div>
                      <div className="text-purple-600 font-bold">{product.price} DA</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun produit trouvé
                </div>
              )}
            </div>

            {/* Bouton pour terminer la sélection */}
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => setShowProductModal(false)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium"
              >
                Terminer la sélection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code pour paiement */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl text-center shadow-xl w-80 max-w-[90%] animate-fade-in">
            {/* Simulation de QR code */}
            <div className="relative mx-auto mb-4" style={{ width: '180px', height: '180px' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
              <div className="bg-white p-2 rounded" style={{ width: '180px', height: '180px' }}>
                <div className="h-full w-full border-2 border-gray-300 rounded flex items-center justify-center">
                  <div className="grid grid-cols-5 grid-rows-5 gap-1 p-2 w-36 h-36">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`${Math.random() > 0.6 ? 'bg-gray-800' : 'bg-white'}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-lg font-bold mb-1">Scannez pour payer</h2>
            <p className="text-gray-600 text-sm">Total: {total.toFixed(2)} DA</p>
            <div className="mt-4 text-xs text-gray-400">En attente du paiement...</div>
            <button 
              onClick={() => setShowQRModal(false)} 
              className="mt-4 text-sm text-purple-600 font-semibold"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Confirmation de paiement réussi */}
      {paymentComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pt-16">
          <div className="bg-white p-6 rounded-2xl text-center shadow-xl w-80 max-w-[90%] max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-500 text-4xl">✓</span>
            </div>
            <h2 className="text-lg font-bold mb-1">Paiement reçu !</h2>
            <p className="text-gray-600 text-sm mb-4">Montant: {total.toFixed(2)} DA</p>
            
            {/* Résumé simplifié */}
            <div className="bg-gray-50 p-3 rounded-xl mb-6 max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <p>
                      {item.name} <span className="text-gray-500">x{item.quantity}</span>
                    </p>
                    <p>{(item.price * item.quantity).toFixed(2)} DA</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setPaymentComplete(false);
                  setCart([]);
                }}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg"
              >
                Nouvelle vente
              </button>
              <Link href="/" className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-lg">
                Retour
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Styles pour les animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
