/****************************************************************
 * configurateur.js
 * Moteur principal du configurateur
 ****************************************************************/

import UI from "./ui.js";
import Calculateur from "./calculateur.js";
import Panier from "./panier.js";
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

        this.configuration = {};

        this.ui.reinitialiser(
            this.produit.options
        );

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

        produit: this.produit.nom,
        image: document.getElementById("productImage").src,

        configuration: {

            ...this.configuration

        },

        prixUnitaire: resultat.prixUnitaire

    };

this.panier.ajouter(article, resultat.quantite);

this.panier.afficher();

document.getElementById("cartBadge").textContent =
    this.panier.nombreArticles();

const panneau = bootstrap.Offcanvas.getOrCreateInstance(
    document.getElementById("panierCanvas")
);

panneau.show();

}
}
