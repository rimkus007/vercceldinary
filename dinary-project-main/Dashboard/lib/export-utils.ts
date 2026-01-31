/**
 * Utilitaires pour l'export de données en CSV et PDF
 */

/**
 * Convertit un tableau d'objets en format CSV
 */
export function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return '';

  // Utiliser les headers fournis ou extraire les clés du premier objet
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Créer la ligne d'en-tête
  const headerLine = csvHeaders.join(',');
  
  // Créer les lignes de données
  const dataLines = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      // Échapper les virgules et guillemets
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });
  
  return [headerLine, ...dataLines].join('\n');
}

/**
 * Télécharge un fichier CSV
 */
export function downloadCSV(data: any[], filename: string, headers?: string[]) {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Génère un PDF simple à partir de données
 * Note: Pour une meilleure qualité, utilisez jsPDF ou pdfmake
 */
export function downloadPDF(
  title: string,
  sections: { [key: string]: any[] },
  filename: string,
  options?: {
    pageTitle?: string;
    footer?: string;
  }
) {
  // Créer le contenu HTML pour le PDF avec plusieurs sections
  let tablesHTML = '';
  
  Object.entries(sections).forEach(([sectionName, data]) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    
    tablesHTML += `
      <h2 style="color: #1e40af; margin-top: 30px; border-bottom: 1px solid #3b82f6; padding-bottom: 5px;">
        ${sectionName.toUpperCase()}
      </h2>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  });
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 {
          color: #1e40af;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 10px;
          text-align: center;
        }
        h2 {
          color: #1e40af;
          margin-top: 30px;
          border-bottom: 1px solid #3b82f6;
          padding-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          margin-bottom: 20px;
        }
        th {
          background-color: #3b82f6;
          color: white;
          padding: 12px;
          text-align: left;
          border: 1px solid #ddd;
          font-size: 12px;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
          font-size: 11px;
        }
        tr:nth-child(even) {
          background-color: #f3f4f6;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        .page-title {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 10px;
        }
        @media print {
          body { margin: 0; padding: 10px; }
          table { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      ${options?.pageTitle ? `<div class="page-title">${options.pageTitle}</div>` : ''}
      <h1>${title}</h1>
      ${tablesHTML}
      ${options?.footer ? `<div class="footer">${options.footer}</div>` : ''}
      <div class="footer">
        Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
      </div>
    </body>
    </html>
  `;

  // Ouvrir une nouvelle fenêtre et imprimer
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      printWindow.print();
      // Note: L'utilisateur devra choisir "Enregistrer au format PDF" dans la boîte de dialogue d'impression
    };
  }
}

/**
 * Formate les données de churn pour l'export
 */
export function formatChurnDataForExport(data: {
  metrics?: any[];
  segments?: any[];
  reasons?: any[];
  atRiskUsers?: any[];
}) {
  const exports: { [key: string]: any[] } = {};

  if (data.metrics && data.metrics.length > 0) {
    exports.metrics = data.metrics.map(m => ({
      'Métrique': m.name,
      'Valeur Actuelle': m.current,
      'Valeur Précédente': m.previous,
      'Objectif': m.target,
      'Tendance': m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→',
      'Risque': m.risk,
    }));
  }

  if (data.segments && data.segments.length > 0) {
    exports.segments = data.segments.map(s => ({
      'Segment': s.segment,
      'Utilisateurs': s.totalUsers,
      'Churned': s.churned,
      'Taux (%)': s.churnRate,
      'Durée Vie Moy. (j)': s.avgLifetime,
      'Impact Revenus (DZD)': s.revenueImpact,
      'Risque': s.riskLevel,
    }));
  }

  if (data.reasons && data.reasons.length > 0) {
    exports.reasons = data.reasons.map(r => ({
      'Raison': r.reason,
      'Pourcentage (%)': r.percentage,
      'Utilisateurs': r.users,
      'Impact (DZD)': r.impact,
      'Actionnable': r.actionable ? 'Oui' : 'Non',
    }));
  }

  if (data.atRiskUsers && data.atRiskUsers.length > 0) {
    exports.atRiskUsers = data.atRiskUsers.map(u => ({
      'Nom': u.name,
      'Email': u.email,
      'Score Risque (%)': u.riskScore,
      'Dernière Activité': u.lastActivity,
      'Durée Vie (j)': u.lifetime,
      'Revenus (DZD)': u.revenue,
      'Churn Prédit (j)': u.predictedChurn,
    }));
  }

  return exports;
}

/**
 * Formate les données de conversion pour l'export
 */
export function formatConversionDataForExport(data: {
  metrics?: any[];
  funnel?: any[];
  segments?: any[];
}) {
  const exports: { [key: string]: any[] } = {};

  if (data.metrics && data.metrics.length > 0) {
    exports.metrics = data.metrics.map(m => ({
      'Métrique': m.name,
      'Valeur Actuelle': m.current,
      'Valeur Précédente': m.previous,
      'Objectif': m.target,
      'Tendance': m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→',
    }));
  }

  if (data.funnel && data.funnel.length > 0) {
    exports.funnel = data.funnel.map(f => ({
      'Étape': f.stage,
      'Utilisateurs': f.users,
      'Taux Conversion (%)': f.conversionRate,
      'Taux Abandon (%)': f.dropOffRate,
    }));
  }

  if (data.segments && data.segments.length > 0) {
    exports.segments = data.segments.map(s => ({
      'Segment': s.segment,
      'Utilisateurs': s.users,
      'Conversions': s.conversions,
      'Taux (%)': s.rate,
      'Revenus (DZD)': s.revenue,
    }));
  }

  return exports;
}

/**
 * Formate les données de rétention pour l'export
 */
export function formatRetentionDataForExport(data: {
  retentionData?: any[];
  cohortData?: any[];
  kpi?: any;
}) {
  const exports: { [key: string]: any[] } = {};

  if (data.kpi) {
    exports.kpi = [{
      'Taux de Rétention (%)': data.kpi.retentionRate,
      'Taux de Churn (%)': data.kpi.churnRate,
      'Durée Vie Moyenne (j)': data.kpi.avgLifetime,
      'Nouveaux Utilisateurs': data.kpi.newUsers,
    }];
  }

  if (data.retentionData && data.retentionData.length > 0) {
    exports.retentionData = data.retentionData.map(r => ({
      'Période': r.period,
      'Nouveaux Utilisateurs': r.newUsers,
      'Retenus': r.retained,
      'Taux Rétention (%)': r.retentionRate,
      'Taux Churn (%)': r.churnRate,
      'Durée Vie Moy. (j)': r.avgLifetime,
    }));
  }

  if (data.cohortData && data.cohortData.length > 0) {
    exports.cohortData = data.cohortData.map(c => ({
      'Cohorte': c.cohort,
      'Utilisateurs': c.users,
      'Jour 1 (%)': c.day1,
      'Jour 7 (%)': c.day7,
      'Jour 30 (%)': c.day30,
      'Jour 90 (%)': c.day90,
      'Jour 365 (%)': c.day365,
    }));
  }

  return exports;
}

