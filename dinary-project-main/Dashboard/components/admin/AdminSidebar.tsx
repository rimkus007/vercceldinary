// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { API_URL } from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  Store,
  Wallet,
  DollarSign,
  Trophy,
  MessageSquare,
  LogOut,
  ChevronRight,
  ChevronDown,
  Sparkles,
  UserPlus,
  BarChart3,
  Map,
  Settings,
  Target,
  Bell,
  Banknote,
  Receipt,
  Download,
  CreditCard,
  Ticket,
  CheckCircle,
  MapPin,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarIconProps {
  icon: React.ReactNode;
  text: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  isCategory?: boolean;
  isExpanded?: boolean;
  children?: React.ReactNode;
  notificationCount?: number;
}

const SidebarIcon = ({
  icon,
  text,
  href,
  active,
  onClick,
  isCategory,
  isExpanded,
  children,
  notificationCount,
}: SidebarIconProps) => {
  const content = (
    <div
      className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md relative ${
        isCategory
          ? "text-gray-600 hover:text-dinary-turquoise hover:bg-gray-50"
          : active
          ? "text-white bg-dinary-turquoise"
          : "text-gray-600 hover:text-dinary-turquoise hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center flex-1">
        <div className="relative">
          {icon}
          {/* Petite pastille bleue simple */}
          {notificationCount && notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-blue-500 w-2 h-2 rounded-full border border-white"></span>
          )}
        </div>
        <span className="ml-3 hidden group-hover:block">{text}</span>
      </div>
      {isCategory &&
        (isExpanded ? (
          <ChevronDown className="w-4 h-4 ml-2" />
        ) : (
          <ChevronRight className="w-4 h-4 ml-2" />
        ))}
    </div>
  );

  if (isCategory) {
    return (
      <div className="w-full">
        <button onClick={onClick} className="w-full">
          {content}
        </button>
        {isExpanded && <div className="ml-4 mt-1 space-y-1">{children}</div>}
      </div>
    );
  }

  return (
    <Link href={href || "#"} className="w-full group">
      {content}
    </Link>
  );
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [pendingRecharges, setPendingRecharges] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [pendingSuggestions, setPendingSuggestions] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const { logout, token } = useAuth();

  useEffect(() => {
    const fetchPendingTasks = async () => {
      if (token) {
        try {
          /* log removed */
          
          // Récupérer les vérifications en attente
          const verifyRes = await fetch(
            `${API_URL}/admin/identity/pending`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (verifyRes.ok) {
            const data = await verifyRes.json();
            setPendingVerifications(data.length);
            /* log removed */
          }

          // Récupérer les recharges en attente (endpoint dédié)
          const rechargesRes = await fetch(
            `${API_URL}/admin/recharges/pending`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (rechargesRes.ok) {
            const recharges = await rechargesRes.json();
            setPendingRecharges(recharges.length);
            /* log removed */
          } else {
            /* log removed */
          }

          // Récupérer les retraits en attente (endpoint dédié)
          const withdrawalsRes = await fetch(
            `${API_URL}/admin/withdrawals/pending`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (withdrawalsRes.ok) {
            const withdrawals = await withdrawalsRes.json();
            setPendingWithdrawals(withdrawals.length);
            /* log removed */
          } else {
            /* log removed */
          }

          // Récupérer les suggestions en attente
          const suggestionsRes = await fetch(
            `${API_URL}/admin/merchants/suggestions`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (suggestionsRes.ok) {
            const suggestions = await suggestionsRes.json();
            /* log removed */
            const pending = suggestions.filter((s: any) => s.status === "pending").length;
            setPendingSuggestions(pending);
            /* log removed */
          } else {
            /* log removed */
          }

          // Récupérer les messages non lus
          try {
            const messagesRes = await fetch(
              `${API_URL}/admin/messages/unread-count`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (messagesRes.ok) {
              const data = await messagesRes.json();
              setUnreadMessages(data.count || 0);
              /* log removed */
            } else {
              /* log removed */
            }
          } catch (error) {
            /* log removed */
          }

          // Récupérer les tickets ouverts
          try {
            const ticketsRes = await fetch(
              `${API_URL}/admin/tickets/open-count`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (ticketsRes.ok) {
              const data = await ticketsRes.json();
              setOpenTickets(data.count || 0);
              /* log removed */
            }
          } catch (error) {
            /* log removed */
          }
        } catch (error) {
          /* log removed */
        }
      }
    };

    fetchPendingTasks();
    const interval = setInterval(fetchPendingTasks, 30000); // Réduire à 30 secondes
    return () => clearInterval(interval);
  }, [token]);

  const isActive = (path: string) => {
    if (path === "/admin/dashboard" && pathname === "/admin/dashboard") {
      return true;
    }
    if (path !== "/admin/dashboard" && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Ouvre la catégorie si l'une de ses pages est active
  useEffect(() => {
    const activeCategories = [
      "/admin/users",
      "/admin/merchants",
      "/admin/recharges",
      "/admin/withdrawals",
      "/admin/revenues",
      "/admin/commissions",
      "/admin/gamification",
      "/admin/missions",
      "/admin/advanced-stats",
      "/admin/activity-map",
      "/admin/weekly-objectives",
      "/admin/control-center",
      "/admin/tickets",
      "/admin/archives",
    ].filter((path) => isActive(path));

    const categoriesToExpand: string[] = [];
    if (
      activeCategories.some(
        (path) =>
          path.startsWith("/admin/users") || path.startsWith("/admin/merchants")
      )
    )
      categoriesToExpand.push("comptes");
    if (
      activeCategories.some(
        (path) =>
          path.startsWith("/admin/recharges") ||
          path.startsWith("/admin/withdrawals") ||
          path.startsWith("/admin/revenues") ||
          path.startsWith("/admin/commissions")
      )
    )
      categoriesToExpand.push("finances");
    if (
      activeCategories.some(
        (path) =>
          path.startsWith("/admin/gamification") ||
          path.startsWith("/admin/missions")
      )
    )
      categoriesToExpand.push("engagement");
    if (
      activeCategories.some((path) => path.startsWith("/admin/advanced-stats"))
    )
      categoriesToExpand.push("statistiques");
    if (activeCategories.some((path) => path.startsWith("/admin/activity-map")))
      categoriesToExpand.push("cartographie");
    if (
      activeCategories.some((path) =>
        path.startsWith("/admin/weekly-objectives")
      )
    )
      categoriesToExpand.push("objectifs");
    if (
      activeCategories.some(
        (path) =>
          path.startsWith("/admin/control-center") ||
          path.startsWith("/admin/tickets") ||
          path.startsWith("/admin/archives")
      )
    ) {
      categoriesToExpand.push("controle");
    }

    setExpandedCategories(categoriesToExpand);
  }, [pathname]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const isCategoryExpanded = (category: string) =>
    expandedCategories.includes(category);

  // Debug: Afficher les valeurs des tâches en attente
  /* log removed */

  return (
    <div className="fixed h-screen w-16 hover:w-64 bg-white border-r flex flex-col justify-between shadow-sm z-50 transition-all duration-300 group">
      {/* Logo */}
      <div className="flex items-center h-16 border-b px-4">
        <Link href="/admin/dashboard" className="flex items-center">
          <div className="h-10 w-10 bg-dinary-turquoise text-white flex items-center justify-center text-xl font-bold rounded-lg">
            D
          </div>
          <span className="ml-3 font-semibold text-xl text-gray-900 hidden group-hover:block">
            Dinary
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-1 py-4 space-y-1 overflow-y-auto">
        <SidebarIcon
          icon={<LayoutDashboard size={20} className="min-w-[20px]" />}
          text="Tableau de bord"
          href="/admin/dashboard"
          active={isActive("/admin/dashboard")}
        />

        {/* --- Gestion --- */}
        <SidebarIcon
          icon={<Users size={20} className="min-w-[20px]" />}
          text="Gestion"
          isCategory
          isExpanded={isCategoryExpanded("comptes")}
          onClick={() => toggleCategory("comptes")}
          notificationCount={pendingVerifications + pendingSuggestions}
        >
          <SidebarIcon
            icon={<Users size={20} className="min-w-[20px]" />}
            text="Utilisateurs"
            href="/admin/users"
            active={isActive("/admin/users")}
            notificationCount={pendingVerifications}
          />
          <SidebarIcon
            icon={<Store size={20} className="min-w-[20px]" />}
            text="Commerçants"
            href="/admin/merchants"
            active={isActive("/admin/merchants")}
            notificationCount={pendingSuggestions}
          />
          <SidebarIcon
            icon={<Map size={20} className="min-w-[20px]" />}
            text="Carte des Commerçants"
            href="/admin/merchants/map"
            active={isActive("/admin/merchants/map")}
          />
        </SidebarIcon>

        {/* --- Finances --- */}
        <SidebarIcon
          icon={<Banknote size={20} className="min-w-[20px]" />}
          text="Finances"
          isCategory
          isExpanded={isCategoryExpanded("finances")}
          onClick={() => toggleCategory("finances")}
          notificationCount={pendingRecharges + pendingWithdrawals}
        >
          <SidebarIcon
            icon={<DollarSign size={20} className="min-w-[20px]" />}
            text="Revenus"
            href="/admin/revenues"
            active={isActive("/admin/revenues")}
          />
          <SidebarIcon
            icon={<Download size={20} className="min-w-[20px]" />}
            text="Recharges"
            href="/admin/recharges"
            active={isActive("/admin/recharges")}
            notificationCount={pendingRecharges}
          />
          <SidebarIcon
            icon={<Wallet size={20} className="min-w-[20px]" />}
            text="Retraits"
            href="/admin/withdrawals"
            active={isActive("/admin/withdrawals")}
            notificationCount={pendingWithdrawals}
          />
          <SidebarIcon
            icon={<Receipt size={20} className="min-w-[20px]" />}
            text="Commissions"
            href="/admin/commissions/rules"
            active={isActive("/admin/commissions")}
          />

          {/* Ajout de la page Transactions */}
          <SidebarIcon
            icon={<CreditCard size={20} className="min-w-[20px]" />}
            text="Transactions"
            href="/admin/transactions"
            active={isActive("/admin/transactions")}
          />
        </SidebarIcon>

        {/* --- Engagement --- */}
        <SidebarIcon
          icon={<Sparkles size={20} className="min-w-[20px]" />}
          text="Engagement"
          isCategory
          isExpanded={isCategoryExpanded("engagement")}
          onClick={() => toggleCategory("engagement")}
        >
          <SidebarIcon
            icon={<Trophy size={20} className="min-w-[20px]" />}
            text="Missions"
            href="/admin/missions"
            active={isActive("/admin/missions")}
          />
          <SidebarIcon
            icon={<BarChart3 size={20} className="min-w-[20px]" />}
            text="Classements"
            href="/admin/gamification/rankings"
            active={isActive("/admin/gamification/rankings")}
          />
          <SidebarIcon
            icon={<Sparkles size={20} className="min-w-[20px]" />}
            text="Règles XP"
            href="/admin/gamification/xp"
            active={isActive("/admin/gamification/xp")}
          />
          <SidebarIcon
            icon={<Trophy size={20} className="min-w-[20px]" />}
            text="Règles de Niveaux"
            href="/admin/gamification/levels"
            active={isActive("/admin/gamification/levels")}
          />
        </SidebarIcon>

        <SidebarIcon
          icon={<UserPlus size={20} className="min-w-[20px]" />}
          text="Parrainages"
          href="/admin/parrainages"
          active={isActive("/admin/parrainages")}
        />

        <SidebarIcon
          icon={<CheckCircle size={20} className="min-w-[20px]" />}
          text="Tâches"
          href="/admin/tasks"
          active={isActive("/admin/tasks")}
          notificationCount={pendingVerifications + pendingRecharges + pendingWithdrawals + pendingSuggestions + unreadMessages + openTickets}
        />

        {/* --- Analyse --- */}
        <SidebarIcon
          icon={<BarChart3 size={20} className="min-w-[20px]" />}
          text="Analyse"
          isCategory
          isExpanded={isCategoryExpanded("statistiques")}
          onClick={() => toggleCategory("statistiques")}
        >
          <SidebarIcon
            icon={<BarChart3 size={20} className="min-w-[20px]" />}
            text="Rétention"
            href="/admin/advanced-stats/retention"
            active={isActive("/admin/advanced-stats/retention")}
          />
          <SidebarIcon
            icon={<BarChart3 size={20} className="min-w-[20px]" />}
            text="Conversion"
            href="/admin/advanced-stats/conversion"
            active={isActive("/admin/advanced-stats/conversion")}
          />
          <SidebarIcon
            icon={<BarChart3 size={20} className="min-w-[20px]" />}
            text="Churn"
            href="/admin/advanced-stats/churn"
            active={isActive("/admin/advanced-stats/churn")}
          />

          {/* Nouvelle page de statistiques clients */}
          <SidebarIcon
            icon={<Users size={20} className="min-w-[20px]" />}
            text="Clients"
            href="/admin/advanced-stats/clients"
            active={isActive("/admin/advanced-stats/clients")}
          />
        </SidebarIcon>

        <SidebarIcon
          icon={<Map size={20} className="min-w-[20px]" />}
          text="Cartographie"
          isCategory
          isExpanded={isCategoryExpanded("cartographie")}
          onClick={() => toggleCategory("cartographie")}
        >
          <SidebarIcon
            icon={<Map size={20} className="min-w-[20px]" />}
            text="Zones d'activité"
            href="/admin/activity-map/hot-zones"
            active={isActive("/admin/activity-map/hot-zones")}
          />
          <SidebarIcon
            icon={<Map size={20} className="min-w-[20px]" />}
            text="Carte Interactive"
            href="/admin/activity-map/interactive"
            active={isActive("/admin/activity-map/interactive")}
          />
        </SidebarIcon>

        {/* --- Outils --- */}
        <SidebarIcon
          icon={<Settings size={20} className="min-w-[20px]" />}
          text="Outils"
          isCategory
          isExpanded={isCategoryExpanded("controle")}
          onClick={() => toggleCategory("controle")}
          notificationCount={unreadMessages + openTickets}
        >
          <SidebarIcon
            icon={<UserPlus size={20} className="min-w-[20px]" />}
            text="Création d'utilisateur"
            href="/admin/control-center/user-creation"
            active={isActive("/admin/control-center/user-creation")}
          />
          <SidebarIcon
            icon={<MessageSquare size={20} className="min-w-[20px]" />}
            text="Messagerie"
            href="/admin/messages"
            active={isActive("/admin/messages")}
            notificationCount={unreadMessages}
          />
          <SidebarIcon
            icon={<Bell size={20} className="min-w-[20px]" />}
            text="Notifications"
            href="/admin/notifications"
            active={isActive("/admin/notifications")}
          />
          {/* Lien vers la page des tickets de support */}
          <SidebarIcon
            icon={<Ticket size={20} className="min-w-[20px]" />}
            text="Tickets"
            href="/admin/tickets"
            active={isActive("/admin/tickets")}
            notificationCount={openTickets}
          />
          {/* Lien vers les archives de vérification */}
          <SidebarIcon
            icon={<Shield size={20} className="min-w-[20px]" />}
            text="Archives"
            href="/admin/archives"
            active={isActive("/admin/archives")}
          />
        </SidebarIcon>
      </div>

      {/* Logout */}
      <div className="border-t p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-dinary-turquoise"
        >
          <LogOut className="h-6 w-6 shrink-0" />
          <span className="hidden group-hover:block truncate">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
