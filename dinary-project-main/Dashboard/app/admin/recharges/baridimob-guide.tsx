'use client';

import { useState } from 'react';
import { X, ChevronDown, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuideProps {
  onClose: () => void;
}

export default function BaridimobGuide({ onClose }: GuideProps) {
  const [openSection, setOpenSection] = useState<string | null>('verification');
  
  const toggleSection = (section: string) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-dinary-turquoise text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Guide de traitement des recharges BaridiMob</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="mb-6">
            <p className="text-gray-700">
              Ce guide explique en détail comment traiter les demandes de recharge effectuées via BaridiMob, 
              pour assurer un traitement rapide et sécurisé des paiements des utilisateurs.
            </p>
          </div>

          <div className="space-y-2">
            {/* Section 1 */}
            <div className="border rounded-md overflow-hidden">
              <button
                className={`w-full flex justify-between items-center p-4 text-left ${
                  openSection === 'verification' ? 'bg-gray-100' : 'bg-white'
                }`}
                onClick={() => toggleSection('verification')}
              >
                <div className="flex items-center">
                  <div className="bg-dinary-turquoise text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">1</div>
                  <h3 className="font-semibold">Vérification de la référence</h3>
                </div>
                <ChevronDown className={`h-5 w-5 transform transition-transform ${openSection === 'verification' ? 'rotate-180' : ''}`} />
              </button>
              
              {openSection === 'verification' && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="space-y-3">
                    <p>La vérification de la référence BaridiMob est l'étape la plus importante du processus de validation :</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Demandez à l'utilisateur de fournir sa référence de transaction BaridiMob, qui doit suivre le format <strong>BRDM-XXXXXXXX</strong>.</li>
                      <li>Connectez-vous à votre compte administrateur BaridiMob.</li>
                      <li>Accédez à la section "Historique des transactions".</li>
                      <li>Recherchez la transaction en utilisant la référence fournie par l'utilisateur.</li>
                      <li>Vérifiez que la transaction apparaît bien dans votre historique et que le statut est "Complétée".</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
            
            {/* Section 2 */}
            <div className="border rounded-md overflow-hidden">
              <button
                className={`w-full flex justify-between items-center p-4 text-left ${
                  openSection === 'montant' ? 'bg-gray-100' : 'bg-white'
                }`}
                onClick={() => toggleSection('montant')}
              >
                <div className="flex items-center">
                  <div className="bg-dinary-turquoise text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">2</div>
                  <h3 className="font-semibold">Vérification du montant</h3>
                </div>
                <ChevronDown className={`h-5 w-5 transform transition-transform ${openSection === 'montant' ? 'rotate-180' : ''}`} />
              </button>
              
              {openSection === 'montant' && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="space-y-3">
                    <p>Après avoir identifié la transaction, vérifiez que le montant correspond à la demande de recharge :</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Comparez le montant de la transaction BaridiMob avec celui indiqué dans la demande de recharge.</li>
                      <li>Le montant doit être <strong>exactement identique</strong>, pas de différence tolérée.</li>
                      <li>Vérifiez également la date et l'heure de la transaction pour vous assurer qu'elle correspond à la période de la demande.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
            
            {/* Section 3 */}
            <div className="border rounded-md overflow-hidden">
              <button
                className={`w-full flex justify-between items-center p-4 text-left ${
                  openSection === 'approbation' ? 'bg-gray-100' : 'bg-white'
                }`}
                onClick={() => toggleSection('approbation')}
              >
                <div className="flex items-center">
                  <div className="bg-dinary-turquoise text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">3</div>
                  <h3 className="font-semibold">Approbation de la recharge</h3>
                </div>
                <ChevronDown className={`h-5 w-5 transform transition-transform ${openSection === 'approbation' ? 'rotate-180' : ''}`} />
              </button>
              
              {openSection === 'approbation' && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="space-y-3">
                    <p>Si toutes les vérifications sont positives, vous pouvez approuver la recharge :</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Entrez la référence BaridiMob dans le champ correspondant sur le formulaire de validation.</li>
                      <li>Entrez la date et l'heure de la transaction.</li>
                      <li>Cliquez sur "Approuver".</li>
                      <li>Le compte de l'utilisateur sera automatiquement crédité du montant correspondant.</li>
                      <li>Une notification sera envoyée à l'utilisateur pour l'informer que sa recharge a été approuvée.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
            
            {/* Section 4 */}
            <div className="border rounded-md overflow-hidden">
              <button
                className={`w-full flex justify-between items-center p-4 text-left ${
                  openSection === 'rejet' ? 'bg-gray-100' : 'bg-white'
                }`}
                onClick={() => toggleSection('rejet')}
              >
                <div className="flex items-center">
                  <div className="bg-dinary-turquoise text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">4</div>
                  <h3 className="font-semibold">Rejet d'une demande</h3>
                </div>
                <ChevronDown className={`h-5 w-5 transform transition-transform ${openSection === 'rejet' ? 'rotate-180' : ''}`} />
              </button>
              
              {openSection === 'rejet' && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="space-y-3">
                    <p>Si les vérifications échouent, vous devrez rejeter la demande :</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Sélectionnez un motif de rejet approprié dans la liste déroulante.</li>
                      <li>Si nécessaire, ajoutez des détails supplémentaires pour expliquer le rejet.</li>
                      <li>Cliquez sur "Rejeter".</li>
                      <li>L'utilisateur recevra une notification l'informant du rejet et du motif.</li>
                      <li>L'utilisateur pourra alors corriger les informations et soumettre une nouvelle demande.</li>
                    </ol>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
                      <p className="text-yellow-800 text-sm">
                        <strong>Important :</strong> Pour les rejets liés à des références incorrectes ou introuvables, 
                        demandez toujours à l'utilisateur de vérifier la référence et de fournir une capture d'écran de sa transaction BaridiMob.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mt-6">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
              <CheckSquare className="h-5 w-5 mr-1" /> 
              Liste de vérification rapide
            </h3>
            <ul className="space-y-1">
              <li className="flex items-center">
                <span className="w-5 h-5 rounded-full border border-blue-400 flex items-center justify-center mr-2 text-blue-500 text-xs">✓</span>
                La référence BaridiMob est valide et correspond à une transaction réelle
              </li>
              <li className="flex items-center">
                <span className="w-5 h-5 rounded-full border border-blue-400 flex items-center justify-center mr-2 text-blue-500 text-xs">✓</span>
                Le montant correspond exactement à la demande de recharge
              </li>
              <li className="flex items-center">
                <span className="w-5 h-5 rounded-full border border-blue-400 flex items-center justify-center mr-2 text-blue-500 text-xs">✓</span>
                La transaction a été effectuée dans les 7 derniers jours
              </li>
              <li className="flex items-center">
                <span className="w-5 h-5 rounded-full border border-blue-400 flex items-center justify-center mr-2 text-blue-500 text-xs">✓</span>
                L'identité de l'expéditeur correspond à celle de l'utilisateur
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
          <Button onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
