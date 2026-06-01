/**
 * IHM — F-02 : Sélection des adresses et de la date de livraison
 * (SFD §2.3 — s'affiche APRÈS authentification, AVANT le catalogue)
 *
 * Zone acheteur       : type affichage (lecture seule), pré-rempli depuis le profil client (DS-04)
 * Zone livraison      : type sélection (liste déroulante), référentiel = client.adressesLivraison
 * Zone facturation    : type affichage, centralisée si chaîne, modifiable sinon (DS-04)
 * Zone date livraison : type saisie date, contrôle > aujourd'hui (DS-05)
 * Zone multi-livraison: type toggle + sélection par ligne (DS-06)
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { MapPin, Calendar, Building2, ArrowRight, Truck, User } from 'lucide-react'

function getMinDeliveryDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export function DeliverySetupPage() {
  const navigate = useNavigate()
  const { currentClient } = useAuthStore()
  const { setDelivery } = useCartStore()

  const [selectedAddressId, setSelectedAddressId] = useState(currentClient?.adressesLivraison[0]?.id || '')
  const [deliveryDate, setDeliveryDate] = useState(getMinDeliveryDate())

  if (!currentClient) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Client non reconnu</p>
        <Link to="/login"><Button>Retour a la connexion</Button></Link>
      </div>
    )
  }

  const addressOptions = currentClient.adressesLivraison.map(a => ({
    value: a.id,
    label: a.libelle,
  }))

  const selectedAddress = currentClient.adressesLivraison.find(a => a.id === selectedAddressId)

  const handleContinue = () => {
    setDelivery({
      deliveryAddressId: selectedAddressId,
      deliveryDate,
      billingAddress: currentClient.adrFacturationCentralisee,
      buyerAddress: `${currentClient.raisonSociale}\n${currentClient.contactPrincipal}\n${currentClient.email}`,
      multiLivraison: false,
      lineDeliveries: {},
    })
    navigate('/catalogue')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900">Preparer votre commande</h1>
        <p className="text-gray-500 mt-2">Etape 1 — Selectionnez vos adresses et la date de livraison souhaitee</p>
      </div>

      {/* DS-04: Adresse acheteur (lecture seule) */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-bordeaux-700" />
          <h2 className="text-lg font-serif font-semibold text-gray-900">Adresse acheteur</h2>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium">{currentClient.raisonSociale}</p>
          <p>{currentClient.contactPrincipal}</p>
          <p>{currentClient.email} — {currentClient.telephone}</p>
          <p className="text-xs text-gray-400 mt-1">SIRET : {currentClient.siret}</p>
        </div>
        <p className="text-xs text-gray-400 mt-2">Pre-remplie depuis le profil — lecture seule</p>
      </Card>

      {/* DS-04: Adresse de livraison (sélection) */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="w-5 h-5 text-bordeaux-700" />
          <h2 className="text-lg font-serif font-semibold text-gray-900">Adresse de livraison</h2>
        </div>
        <Select
          label="Lieu de depot physique des produits"
          options={addressOptions}
          value={selectedAddressId}
          onChange={(e) => setSelectedAddressId(e.target.value)}
        />
        {selectedAddress && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium">{selectedAddress.libelle}</p>
            <p>{selectedAddress.rue}</p>
            <p>{selectedAddress.codePostal} {selectedAddress.ville}, {selectedAddress.pays}</p>
          </div>
        )}
        {currentClient.adressesLivraison.length > 1 && (
          <p className="text-xs text-gray-400 mt-2">
            Vous pourrez fractionner la livraison par ligne au panier (DS-06).
          </p>
        )}
      </Card>

      {/* DS-04: Adresse de facturation */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-5 h-5 text-bordeaux-700" />
          <h2 className="text-lg font-serif font-semibold text-gray-900">Adresse de facturation</h2>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-line">
          {currentClient.adrFacturationCentralisee}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Adresse centralisee au siege — unique pour toute la commande, meme en cas de livraisons multiples
        </p>
      </Card>

      {/* DS-05: Date de livraison */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-bordeaux-700" />
          <h2 className="text-lg font-serif font-semibold text-gray-900">Date de livraison souhaitee</h2>
        </div>
        <Input
          type="date"
          value={deliveryDate}
          min={getMinDeliveryDate()}
          onChange={e => setDeliveryDate(e.target.value)}
          label="Date strictement posterieure a aujourd'hui (DS-05)"
        />
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <Link to="/dashboard" className="text-sm text-bordeaux-700 hover:text-bordeaux-900">
          Retour au tableau de bord
        </Link>
        <Button size="lg" onClick={handleContinue} disabled={!selectedAddressId || !deliveryDate}>
          <MapPin className="w-4 h-4 mr-2" />
          Acceder au catalogue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
