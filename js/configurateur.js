/****************************************************************
 * configurateur.js
 * Moteur principal du configurateur
 ****************************************************************/

import UI from "./ui.js";
import Calculateur from "./calculateur.js";
import Panier from "./panier.js";
import { champ, getLangue, t } from "./i18n.js";
export default class Configurateur {

    constructor(produit) {

        this.produit = produit;

        this.ui = new UI();

        this.calculateur = new Calculateur();
        this.panier = new Panier();
        this.panier.afficher();

        /*
         * Contiendra toutes les valeurs
         * choisies par l'utilisateur
         */

        this.configuration = {};

    }

    /**
     * Démarrage
     */
    initialiser() {

        this.ui.afficherProduit(this.produit);

        this.ui.genererOptions(
            this.produit.options,
            this.configuration
        );

        this.ecouterEvenements();

        this.mettreAJour();

    }

    /**
     * Changement de produit (sélecteur) : on réutilise la même
     * interface (galerie, panier) plutôt que de tout recréer,
     * pour éviter les écouteurs d'événements en double.
     */
    changerProduit(produit) {

        this.produit = produit;

        this.configuration = {};

        this.ui.afficherProduit(this.produit);

        this.ui.genererOptions(
            this.produit.options,
            this.configuration
        );

        this.lireConfiguration();

        this.mettreAJour();

    }

    /**
     * Changement de langue : retraduit le produit affiché et les
     * options SANS toucher à la configuration en cours (le client
     * garde ses choix), ni à la couleur/photo actuellement affichée.
     */
    changerLangue(langue) {

        this.ui.retraduireProduit(this.produit);

        this.ui.retraduireOptions(this.produit.options);

        // Recalcule le récapitulatif (les libellés viennent de là)
        // et le prix, désormais dans la nouvelle langue.
        this.mettreAJour();

        // Le panier (déjà affiché) doit aussi être retraduit.
        this.panier.afficher();

    }

    /**
     * Ecoute tous les changements
     */
    ecouterEvenements() {

        const formulaire =
            document.getElementById("configForm");

        formulaire.addEventListener("change", () => {

            this.lireConfiguration();

            this.mettreAJour();

        });

        formulaire.addEventListener("input", () => {

            this.lireConfiguration();

            this.mettreAJour();

        });


        document
            .getElementById("btnReset")
            .addEventListener("click", () => {

                this.reinitialiser();

            });
        document
            .getElementById("btnOrder")
            .addEventListener("click", () => {

            this.ajouterAuPanier();

    });
    }

    /**
     * Lecture des valeurs du formulaire
     */
    lireConfiguration() {

        this.configuration = {};

        this.produit.options.forEach(option => {

            const valeur =
                this.ui.lireValeur(option);

            this.configuration[option.id] = valeur;

        });

    }

    /**
     * Mise à jour complète
     */
    mettreAJour() {

        const resultat =
            this.calculateur.calculer(
                this.produit,
                this.configuration
            );
// Changement automatique de la galerie selon la couleur

if (this.produit.images.parCouleur) {

    const couleurChoisie =
        this.configuration.couleur;

    if (
        couleurChoisie &&
        this.produit.images.parCouleur[couleurChoisie]
    ) {

        this.ui.galerie.initialiser(

            this.produit.images.parCouleur[
                couleurChoisie
            ]

        );

    }

}
        this.ui.mettreAJourRecapitulatif(
            resultat
        );

        this.ui.mettreAJourPrix(
            resultat.total,
            this.produit.devise
        );

    }

    /**
     * Réinitialisation
     */
    reinitialiser() {

        this.ui.reinitialiser(
            this.produit.options
        );

        // On relit les valeurs par défaut réellement affichées
        // (taille, couleur, matière...) pour que le prix et la
        // galerie soient bien synchronisés après le reset.
        this.lireConfiguration();

        this.mettreAJour();

    }
/**************************************************************
 * Ajouter au panier
 **************************************************************/
ajouterAuPanier() {

    const resultat = this.calculateur.calculer(

        this.produit,

        this.configuration

    );

    const article = {

        produit: champ(this.produit.nom, getLangue()),
        produitId: this.produit.id,
        image: document.getElementById("productImage").src,

        configuration: {

            ...this.configuration

        },

        details: this.construireDetailsLisibles(),

        prixUnitaire: resultat.prixUnitaire

    };

this.panier.ajouter(article, resultat.quantite);

this.panier.afficher();

document.getElementById("cartBadge").textContent =
    this.panier.nombreArticles();

//const panneau = bootstrap.Offcanvas.getOrCreateInstance(
    document.getElementById("panierCanvas")
);

panneau.show();/
        // Toast de confirmation au lieu d'ouvrir brutalement le panier
        this.ui.afficherToast(
            t("produitAjoute", getLangue()),
            t("voirMonPanier", getLangue()),
            () => {
                const panneau = bootstrap.Offcanvas.getOrCreateInstance(
                    document.getElementById("panierCanvas")
                );
                panneau.show();
            }
        );

}

/**************************************************************
 * Détail lisible de la configuration choisie
 * (libellés réels, pas les identifiants techniques)
 * ex: [{ label: "Couleur", valeur: "Bleu marine" }, ...]
 **************************************************************/
construireDetailsLisibles() {

    const details = [];

    const langue = getLangue();

    this.produit.options.forEach(option => {

        // La quantité est déjà affichée séparément dans le panier
        if (option.id === "quantite") {

            return;

        }

        const valeur = this.configuration[option.id];

        if (option.type === "checkbox") {

            if (valeur) {

                details.push({
                    label: champ(option.nom, langue),
                    valeur: t("oui", langue)
                });

            }

            return;

        }

        if (valeur === undefined || valeur === null || valeur === "") {

            return;

        }

        const choix = (option.choix || []).find(
            c => c.id === valeur
        );

        details.push({

            label: champ(option.nom, langue),
            valeur: choix ? champ(choix.libelle, langue) : valeur

        });

    });

    return details;

}
}
