'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/layouts/PageHeader';
import PromoBanner from '@/components/common/PromoBanner';

// Types pour les produits
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  image: string;
  inStock: boolean;
  isNew: boolean;
  rating: number;
  popularity: number;
  author?: string;
  duration?: string;
  fileFormat?: string;
  downloadSize?: string;
  previewUrl?: string;
}

// Émojis des catégories
const CategoryEmojis: Record<string, string> = {
  all: '🛍️',
  cours: '📚',
  themes: '🎨',
  sons: '🎵',
  templates: '📑',
  videos: '🎬',
  nouveau: '🆕',
};

// Composant pour l'affichage des étoiles
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < rating ? "text-yellow-400 text-xs" : "text-gray-300 text-xs"}>
          ⭐
        </span>
      ))}
    </div>
  );
};

// Liste de produits numériques Dinarus
const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Formation Finance Personnelle',
    description: 'Apprenez à gérer vos finances et investir intelligemment',
    price: 5000,
    discountedPrice: 3500,
    category: 'cours',
    image: '📚',
    inStock: true,
    isNew: true,
    rating: 4.8,
    popularity: 95,
    author: 'Ahmed Benali',
    duration: '12 heures',
    fileFormat: 'Vidéo + PDF',
    downloadSize: '2.3 GB',
    previewUrl: '/preview/finance-course',
  },
  {
    id: '2',
    name: 'Thème Premium Dark Mode',
    description: 'Un thème élégant et sombre pour votre application Dinarus',
    price: 1200,
    category: 'themes',
    image: '🎨',
    inStock: true,
    isNew: false,
    rating: 4.5,
    popularity: 88,
    author: 'Dinarus Design Team',
    fileFormat: 'ZIP',
    downloadSize: '15 MB',
    previewUrl: '/preview/dark-theme',
  },
  {
    id: '3',
    name: 'Pack de sons notifications',
    description: '30 sons professionnels pour personnaliser vos notifications',
    price: 800,
    category: 'sons',
    image: '🎵',
    inStock: true,
    isNew: false,
    rating: 4.2,
    popularity: 75,
    author: 'SoundFX Studio',
    fileFormat: 'MP3/WAV',
    downloadSize: '45 MB',
    previewUrl: '/preview/notification-sounds',
  },
  {
    id: '4',
    name: 'Masterclass Investissement',
    description: 'Stratégies d\'investissement avancées avec des experts',
    price: 8500,
    discountedPrice: 6500,
    category: 'cours',
    image: '🎓',
    inStock: true,
    isNew: true,
    rating: 4.9,
    popularity: 92,
    author: 'Dr. Karim Meziane',
    duration: '20 heures',
    fileFormat: 'Vidéo HD + Resources',
    downloadSize: '4.5 GB',
    previewUrl: '/preview/investment-masterclass',
  },
  {
    id: '5',
    name: 'Templates Budget Mensuels',
    description: 'Collection de templates Excel pour suivre vos dépenses',
    price: 1500,
    category: 'templates',
    image: '📊',
    inStock: true,
    isNew: false,
    rating: 4.6,
    popularity: 85,
    author: 'FinanceTools Pro',
    fileFormat: 'XLSX/PDF',
    downloadSize: '25 MB',
    previewUrl: '/preview/budget-templates',
  },
  {
    id: '6',
    name: 'Thème Minimaliste',
    description: 'Interface épurée et moderne pour Dinarus',
    price: 900,
    category: 'themes',
    image: '✨',
    inStock: true,
    isNew: false,
    rating: 4.3,
    popularity: 78,
    author: 'MinimalDesign',
    fileFormat: 'ZIP',
    downloadSize: '12 MB',
    previewUrl: '/preview/minimal-theme',
  },
  {
    id: '7',
    name: 'Tutoriel Cryptomonnaies',
    description: 'Tout savoir sur les cryptomonnaies pour débutants',
    price: 3000,
    category: 'videos',
    image: '🔐',
    inStock: true,
    description: 'Offrez des dinars à vos proches',
    price: 1000,
    category: 'cartes',
    image: '🎁',
    inStock: true,
    isOfficial: true,
    rating: 4.8,
    popularity: 88,
  }
];

// Composant d'un produit dans la liste
const ProductItem = ({ product, onSelect }: { product: Product, onSelect: (product: Product) => void }) => {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect(product)}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between mb-2">
          <div className="bg-gray-100 h-20 w-20 rounded-xl flex items-center justify-center text-3xl">
            {product.image}
          </div>
          <div className="flex flex-col items-end">
            {product.discountedPrice ? (
              <>
                <span className="line-through text-gray-400 text-sm">{product.price} DA</span>
                <span className="text-green-600 font-bold">{product.discountedPrice} DA</span>
              </>
            ) : (
              <span className="font-bold">{product.price} DA</span>
            )}
            {product.isOfficial && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mt-1">Officiel</span>
            )}
          </div>
        </div>
        <h3 className="font-medium text-base mt-2">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-2 flex-grow">{product.description}</p>
        <div className="flex justify-between items-center">
          <StarRating rating={product.rating} />
          <span className={`text-xs px-2 py-0.5 rounded-full ${product.inStock ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
            {product.inStock ? 'En stock' : 'Rupture'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Composant détail d'un produit
const ProductDetail = ({ product, onClose }: { product: Product, onClose: () => void }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-t-3xl w-full max-w-lg p-5 pb-24"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        style={{ maxHeight: 'calc(100vh - 20px)', overflowY: 'auto' }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-bold text-xl">{product.name}</h2>
            <p className="text-sm text-gray-500">{product.description}</p>
            <StarRating rating={product.rating} />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="bg-gray-100 h-48 w-full rounded-xl flex items-center justify-center text-6xl mb-4">
          {product.image}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Prix</p>
            {product.discountedPrice ? (
              <div>
                <p className="line-through text-gray-400 text-sm">{product.price} DA</p>
                <p className="font-bold text-green-600">{product.discountedPrice} DA</p>
              </div>
            ) : (
              <p className="font-bold">{product.price} DA</p>
            )}
          </div>
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Disponibilité</p>
            <p className={`font-bold ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? 'En stock' : 'Rupture'}
            </p>
          </div>
        </div>

        {product.isOfficial && (
          <div className="bg-blue-50 rounded-xl p-3 mb-4">
            <div className="flex items-center">
              <span className="text-xl mr-2">💎</span>
              <div>
                <h3 className="font-bold text-blue-900">Produit officiel</h3>
                <p className="text-sm text-blue-800">Ce produit est certifié et garanti par Dinarus</p>
              </div>
            </div>
          </div>
        )}

        {product.inStock && (
          <>
            <div className="mb-4">
              <label className="font-medium mb-2 block">Quantité</label>
              <div className="flex items-center">
                <button
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  -
                </button>
                <span className="mx-4 font-medium">{quantity}</span>
                <button
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <button className="flex-1 bg-black text-white py-3 rounded-xl font-medium flex items-center justify-center">
                <span className="mr-2">🛒</span> Ajouter au panier
              </button>
              <button className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-medium flex items-center justify-center">
                <span className="mr-2">💖</span> Favoris
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default function BoutiquePage() {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filtrer les produits par catégorie et recherche
  const filteredProducts = demoProducts.filter(product => {
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen">
      <PageHeader
        title={showSearchBar ? "" : "Boutique"}
        emoji={showSearchBar ? "" : "🛍️"}
        actionButton={
          <button 
            className="p-2" 
            onClick={() => setShowSearchBar(!showSearchBar)}
          >
            <span className="text-lg">{showSearchBar ? "❌" : "🔍"}</span>
          </button>
        }
      />

      {showSearchBar && (
        <div className="px-5 mt-4">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-full py-2 px-4 text-sm focus:outline-none"
            autoFocus
          />
        </div>
      )}

      <div className="px-5">
        {/* Bannière promotionnelle */}
        <div className="my-4">
          <PromoBanner
            title="-15%"
            description="Sur les produits officiels Dinarus"
            emoji="💎"
            action={() => setFilterCategory('premium')}
            actionLabel="Découvrir"
          />
        </div>

        <h2 className="text-xl font-semibold mb-3">Produits officiels</h2>

        {/* Filtres par catégorie */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
          {Object.entries(CategoryEmojis).map(([category, emoji]) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`flex items-center px-3 py-1.5 rounded-full whitespace-nowrap ${
                filterCategory === category
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className="mr-1.5">{emoji}</span>
              <span className="text-sm font-medium">
                {category === 'all' ? 'Tous'
                : category === 'accessoires' ? 'Accessoires'
                : category === 'vetements' ? 'Vêtements'
                : category === 'cartes' ? 'Cartes'
                : category === 'tech' ? 'Tech'
                : category === 'premium' ? 'Premium'
                : category === 'nouveau' ? 'Nouveau'
                : category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {/* Liste des produits */}
        <div className="mt-4 mb-20 grid grid-cols-2 gap-4">
          {filteredProducts.length > 0 ? filteredProducts.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              onSelect={() => setSelectedProduct(product)}
            />
          )) : (
            <div className="py-8 text-center col-span-2">
              <p className="text-gray-500">Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détail si un produit est sélectionné */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}