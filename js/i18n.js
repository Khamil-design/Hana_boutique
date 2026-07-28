/*****************************************************************
 * i18n.js
 * Dictionnaire de traduction de l'interface (FR / AR)
 *****************************************************************/

export const LANGUE_PAR_DEFAUT = "fr";

export const traductions = {

    fr: {

        choisirProduit: "Choisir un produit",
        personnalisation: "Personnalisation",
        recapitulatif: "Récapitulatif",
        prixTotalTitre: "Prix total",
        reinitialiser: "Réinitialiser",
        ajouterAuPanier: "Ajouter au panier",
        monPanier: "Mon panier",
        panierVide: "Votre panier est vide.",
        totalLabel: "Total :",
        commander: "Commander",
        chargement: "Chargement...",
        descriptionPlaceholder: "Description...",

        voirLePanier: "Voir le panier",
        photoPrecedente: "Photo précédente",
        photoSuivante: "Photo suivante",
        diminuerQuantite: "Diminuer la quantité",
        augmenterQuantite: "Augmenter la quantité",
        retirerArticle: "Retirer cet article du panier",
        fermer: "Fermer",

        footer: "Hana Boutique — Tous droits réservés",

        photoAVenir: "Photo à venir",

        confirmationWhatsApp:
            "Vous allez être redirigé vers WhatsApp pour envoyer votre commande. Il ne vous reste qu'à appuyer sur \"Envoyer\" là-bas !",

        bonjourCommande: "Bonjour, je souhaite commander :",
        quantiteLabel: "Quantité",
        prixLabel: "Prix",
        totalCommandeLabel: "Total",

        erreurChargementProduit:
            "Ce produit n'a pas pu être chargé pour le moment. Merci de réessayer dans un instant.",

        titrePage: "Hana Boutique — Configurateur",
        metaDescription:
            "Hana Boutique — pantalons et chemises pour homme personnalisables : choisissez la couleur, la taille et les finitions, et commandez directement via WhatsApp.",

        nomLangue: "Français",
        selecteurLangueLabel: "Changer de langue",
        oui: "Oui",

        livraisonPaiementTitre: "Livraison & Paiement",
        livraisonTitre: "Livraison",
        livraisonTanger: "Tanger : livraison gratuite sous 24 à 48h.",
        livraisonAutres: "Autres villes : livraison possible sur devis — contactez-nous directement via WhatsApp.",
        paiementTitre: "Paiement",
        paiementTexte: "Paiement à la livraison (espèces) ou par virement bancaire — les coordonnées bancaires vous seront communiquées par WhatsApp après confirmation de votre commande.",

        // Toast
        produitAjoute: "Produit ajouté au panier",
        voirMonPanier: "Voir mon panier",

        // === NOUVEAU : Vider le panier ===
        viderPanier: "Vider",

    },

    ar: {

        choisirProduit: "اختر منتجًا",
        personnalisation: "التخصيص",
        recapitulatif: "الملخص",
        prixTotalTitre: "السعر الإجمالي",
        reinitialiser: "إعادة تعيين",
        ajouterAuPanier: "أضف إلى السلة",
        monPanier: "سلتي",
        panierVide: "سلتك فارغة.",
        totalLabel: "المجموع:",
        commander: "إتمام الطلب",
        chargement: "جارٍ التحميل...",
        descriptionPlaceholder: "...الوصف",

        voirLePanier: "عرض السلة",
        photoPrecedente: "الصورة السابقة",
        photoSuivante: "الصورة التالية",
        diminuerQuantite: "تقليل الكمية",
        augmenterQuantite: "زيادة الكمية",
        retirerArticle: "إزالة هذا المنتج من السلة",
        fermer: "إغلاق",

        footer: "هانا بوتيك — جميع الحقوق محفوظة",

        photoAVenir: "الصورة غير متوفرة حاليًا",

        confirmationWhatsApp:
            "سيتم تحويلك إلى واتساب لإرسال طلبك. كل ما عليك هو الضغط على \"إرسال\" هناك!",

        bonjourCommande: "مرحبًا، أرغب في طلب:",
        quantiteLabel: "الكمية",
        prixLabel: "السعر",
        totalCommandeLabel: "المجموع",

        erreurChargementProduit:
            "تعذر تحميل هذا المنتج حاليًا. يرجى المحاولة مرة أخرى بعد قليل.",

        titrePage: "هانا بوتيك — مُهيئ المنتجات",
        metaDescription:
            "هانا بوتيك — بناطيل وقمصان رجالية قابلة للتخصيص: اختر اللون والمقاس والتفاصيل، واطلب مباشرة عبر واتساب.",

        nomLangue: "العربية",
        selecteurLangueLabel: "تغيير اللغة",
        oui: "نعم",

        livraisonPaiementTitre: "التوصيل والدفع",
        livraisonTitre: "التوصيل",
        livraisonTanger: "طنجة: التوصيل مجاني خلال 24 إلى 48 ساعة.",
        livraisonAutres: "المدن الأخرى: التوصيل متاح حسب الطلب — تواصلوا معنا مباشرة عبر واتساب.",
        paiementTitre: "الدفع",
        paiementTexte: "الدفع عند الاستلام (نقدًا) أو عن طريق التحويل البنكي — سيتم إرسال المعلومات البنكية عبر واتساب بعد تأكيد طلبكم.",

        // Toast
        produitAjoute: "تمت إضافة المنتج إلى السلة",
        voirMonPanier: "عرض السلة",

        // === NOUVEAU : Vider le panier ===
        viderPanier: "إفراغ",

    }

};

let langueCourante = LANGUE_PAR_DEFAUT;

try {

    const langueEnregistree = localStorage.getItem("hana_langue");

    if (langueEnregistree && traductions[langueEnregistree]) {

        langueCourante = langueEnregistree;

    }

}

catch (erreur) {

    console.warn("i18n : impossible de lire la langue enregistrée.", erreur);

}

export function getLangue() {

    return langueCourante;

}

export function setLangue(langue) {

    if (!traductions[langue]) {

        return;

    }

    langueCourante = langue;

    try {

        localStorage.setItem("hana_langue", langue);

    }

    catch (erreur) {

        console.warn("i18n : impossible d'enregistrer la langue choisie.", erreur);

    }

}

export function t(cle, langue) {

    const dict = traductions[langue] || traductions[LANGUE_PAR_DEFAUT];

    return dict[cle] !== undefined
        ? dict[cle]
        : traductions[LANGUE_PAR_DEFAUT][cle];

}

export function champ(valeur, langue) {

    if (valeur === undefined || valeur === null) {

        return "";

    }

    if (typeof valeur === "string") {

        return valeur;

    }

    return valeur[langue] !== undefined
        ? valeur[langue]
        : valeur[LANGUE_PAR_DEFAUT];

}
