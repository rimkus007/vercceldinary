"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/lib/api";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Store,
  Users,
  MapPin,
  DollarSign,
  RefreshCw,
  Filter,
  TrendingUp,
  Zap,
  MessageSquare,
  Bell,
  Shield,
} from "lucide-react";

interface AdminTask {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: "low" | "medium" | "high";
  count: number;
  action: string;
  href: string;
}

interface TasksResponse {
  tasks: AdminTask[];
  totalTasks: number;
  urgentTasks: number;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [totalTasks, setTotalTasks] = useState(0);
  const [urgentTasks, setUrgentTasks] = useState(0);
  const { token } = useAuth();

  const fetchTasks = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/admin/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Impossible de récupérer les tâches");
      const data: TasksResponse = await res.json();
      setTasks(data.tasks);
      setFilteredTasks(data.tasks);
      setTotalTasks(data.totalTasks);
      setUrgentTasks(data.urgentTasks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // Filtrer les tâches selon la priorité et le type
  useEffect(() => {
    let filtered = tasks;

    if (selectedPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === selectedPriority);
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((task) => task.type === selectedType);
    }

    setFilteredTasks(filtered);
  }, [selectedPriority, selectedType, tasks]);

  const getIconForTaskType = (type: string) => {
    switch (type) {
      case "verification":
        return <Shield className="w-6 h-6" />;
      case "recharge":
        return <Zap className="w-6 h-6" />;
      case "suggestion":
        return <MapPin className="w-6 h-6" />;
      case "withdrawal":
        return <DollarSign className="w-6 h-6" />;
      case "merchant":
        return <Store className="w-6 h-6" />;
      case "user":
        return <Users className="w-6 h-6" />;
      case "message":
        return <MessageSquare className="w-6 h-6" />;
      case "alert":
        return <Bell className="w-6 h-6" />;
      default:
        return <CheckCircle className="w-6 h-6" />;
    }
  };

  const getColorForTaskType = (type: string) => {
    switch (type) {
      case "verification":
        return "bg-orange-100 text-orange-600";
      case "recharge":
        return "bg-blue-100 text-blue-600";
      case "suggestion":
        return "bg-green-100 text-green-600";
      case "withdrawal":
        return "bg-red-100 text-red-600";
      case "merchant":
        return "bg-purple-100 text-purple-600";
      case "user":
        return "bg-gray-100 text-gray-600";
      case "message":
        return "bg-cyan-100 text-cyan-600";
      case "alert":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200",
    };

    const labels = {
      high: "🔴 Urgente",
      medium: "🟡 Moyenne",
      low: "🟢 Basse",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[priority as keyof typeof styles]
        }`}
      >
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  // Obtenir les types uniques
  const uniqueTypes = Array.from(new Set(tasks.map((task) => task.type)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dinary-turquoise"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Erreur</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📋 Centre de Contrôle
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez toutes vos tâches administratives en un seul endroit
            </p>
          </div>
          <button
            onClick={fetchTasks}
            className="flex items-center gap-2 px-4 py-2 bg-dinary-turquoise text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total des Tâches
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalTasks}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredTasks.length !== totalTasks &&
                    `${filteredTasks.length} affichées`}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tâches Urgentes
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {urgentTasks}
                </p>
                <p className="text-xs text-gray-500 mt-1">Priorité haute</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tâches Moyennes
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {tasks.filter((t) => t.priority === "medium").length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Priorité moyenne</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filtres :
              </span>
            </div>

            {/* Filtre par priorité */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Priorité :</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dinary-turquoise focus:border-transparent"
              >
                <option value="all">Toutes</option>
                <option value="high">Urgente</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </div>

            {/* Filtre par type */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Type :</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dinary-turquoise focus:border-transparent"
              >
                <option value="all">Tous</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Bouton reset */}
            {(selectedPriority !== "all" || selectedType !== "all") && (
              <button
                onClick={() => {
                  setSelectedPriority("all");
                  setSelectedType("all");
                }}
                className="text-sm text-dinary-turquoise hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Liste des tâches */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              🎉 Aucune tâche en attente !
            </h3>
            <p className="text-gray-600">
              {tasks.length > 0
                ? "Aucune tâche ne correspond aux filtres sélectionnés"
                : "Tout est à jour. Bon travail !"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                {/* En-tête de la carte */}
                <div
                  className={`p-4 rounded-t-lg ${getColorForTaskType(
                    task.type
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getIconForTaskType(task.type)}
                      <div>
                        <h3 className="font-semibold text-sm">{task.title}</h3>
                        <p className="text-xs opacity-90 mt-0.5">
                          {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-30 rounded-full px-3 py-1">
                      <span className="text-lg font-bold">{task.count}</span>
                    </div>
                  </div>
                </div>

                {/* Corps de la carte */}
                <div className="p-4">
                  <p className="text-gray-700 text-sm mb-4">
                    {task.description}
                  </p>

                  <div className="flex items-center justify-between">
                    {getPriorityBadge(task.priority)}
                    <a
                      href={task.href}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-dinary-turquoise text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                      {task.action}
                      <TrendingUp className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
