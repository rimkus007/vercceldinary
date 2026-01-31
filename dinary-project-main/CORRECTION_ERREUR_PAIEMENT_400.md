# Correction de l'Erreur 400 - Paiement QR Code

## 🔍 Problème Identifié

L'erreur `400 Bad Request` lors du paiement via QR code était causée par plusieurs problèmes :

1. **Structure des données incorrecte** : Les données envoyées au backend ne correspondaient pas exactement au DTO attendu
2. **Validation UUID manquante** : Le champ `paymentRequestId` n'avait pas la validation `@IsUUID()` dans le DTO
3. **Champs non définis** : Le frontend envoyait `customAmount` qui n'existe pas dans le DTO backend

## ✅ Corrections Apportées

### 1. Backend - DTO de Paiement (`pay-qr.dto.ts`)

**Fichier** : `c:\Users\Yanis-M\websites\versions de dinary\dinary\dinarus-backend\src\wallet\dto\pay-qr.dto.ts`

**Modification** :
```typescript
@IsString()
@IsUUID()  // ✅ Ajouté pour valider que c'est un UUID valide
@IsOptional()
paymentRequestId?: string;
```

### 2. Frontend Marchand - Génération du QR Code (`encaisser/page.tsx`)

**Fichier** : `c:\Users\Yanis-M\websites\versions de dinary\dinary\dinaruspro-frontend\src\app\encaisser\page.tsx`

**Modifications** :
- ✅ Retour à la génération locale du QR code (pas d'appel API)
- ✅ Suppression du champ `customAmount` non supporté par le backend
- ✅ Le panier n'est inclus que s'il contient des articles

```typescript
const handleGenerateQR = () => {
  if (totalAmount <= 0 || !user) return;

  const paymentRequestId = uuidv4();
  const paymentData = {
    merchantUserId: user.id,
    amount: parseFloat(totalAmount.toFixed(2)),
    paymentRequestId: paymentRequestId,
    // Ne pas inclure cart s'il est vide
    ...(cart.length > 0 && {
      cart: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))
    })
  };

  // Générer le QR code localement avec les données de paiement
  setQrValue(JSON.stringify(paymentData));
  setCurrentRequestId(paymentRequestId);
  setShowQRModal(true);
};
```

### 3. Frontend Client - Scanner et Paiement (`scanner/page.tsx`)

**Fichier** : `c:\Users\Yanis-M\websites\versions de dinary\dinary\dinarus\src\app\scanner\page.tsx`

**Modifications** :
- ✅ Validation et nettoyage des données avant envoi
- ✅ Conversion explicite du montant en nombre
- ✅ Vérification que le panier existe avant de l'inclure
- ✅ Meilleure gestion des erreurs avec logs

```typescript
const handleConfirmPayment = async () => {
  if (!paymentData || !token) return;
  try {
    // Préparer les données de paiement en s'assurant qu'elles correspondent au DTO
    const paymentPayload: any = {
      merchantUserId: paymentData.merchantUserId,
      amount: parseFloat(paymentData.amount),
      paymentRequestId: paymentData.paymentRequestId,
    };

    // Ajouter le panier seulement s'il existe et n'est pas vide
    if (paymentData.cart && Array.isArray(paymentData.cart) && paymentData.cart.length > 0) {
      paymentPayload.cart = paymentData.cart;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/wallet/pay-qr`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentPayload),
      }
    );
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Erreur de paiement:', errorData);
      throw new Error(errorData.message || "Le paiement a échoué.");
    }

    setIsSuccess(true);
  } catch (e: any) {
    setError(e.message);
    setPaymentData(null);
  }
};
```

## 🔄 Flux de Paiement Corrigé

1. **Marchand** : Génère un QR code contenant :
   - `merchantUserId` (UUID du marchand)
   - `amount` (montant total)
   - `paymentRequestId` (UUID unique pour cette transaction)
   - `cart` (optionnel, liste des articles)

2. **Client** : Scanne le QR code et voit les détails du paiement

3. **Client** : Confirme le paiement → Envoi de la requête au backend

4. **Backend** : Valide les données selon le DTO et traite le paiement

5. **Client** : Reçoit la confirmation de succès

## 📋 Structure du DTO Backend

```typescript
export class PayQrDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  merchantUserId: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  paymentRequestId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  @IsOptional()
  cart?: CartItemDto[];
}
```

## ⚠️ Points Importants

1. **UUID Valides** : Tous les IDs doivent être des UUIDs valides (format v4)
2. **Montant** : Doit être un nombre, pas une chaîne
3. **Panier Optionnel** : Ne pas envoyer un tableau vide, ne pas l'inclure du tout
4. **customAmount** : Non supporté actuellement par le backend

## 🧪 Tests à Effectuer

1. ✅ Paiement avec panier (articles)
2. ✅ Paiement avec montant libre uniquement
3. ✅ Paiement mixte (articles + montant libre)
4. ✅ Vérification des commissions
5. ✅ Détection du paiement côté marchand (polling)

## 📝 Notes pour le Futur

Si vous souhaitez ajouter le support de `customAmount` :

1. Mettre à jour le DTO backend :
```typescript
@IsNumber()
@IsOptional()
customAmount?: number;
```

2. Mettre à jour le service backend pour gérer ce champ

3. Réactiver l'envoi de `customAmount` dans le frontend marchand
