/********************************************************************
 * CONFIGURATEUR DE PRODUITS
 * app.js
 * Point d'entrée de l'application
 ********************************************************************/

import Configurateur from "./configurateur.js";

export default class Application {

    constructor() {

        this.configurateur = null;
        this.catalogue = null;

    }

    /**
     * Démarrage
     */
    async demarrer() {

        try {

            // Chargement du catalogue
            this.catalogue = await this.chargerCatalogue();

            if (!this.catalogue.produits.length) {

                throw new Error("Aucun produit trouvé.");

            }

            // Remplit le menu déroulant avec tous les produits du catalogue
            this.genererSelecteurProduits();

            // Affiche le premier produit du catalogue
            await this.afficherProduitParFichier(
                this.catalogue.produits[0].fichier
            );

            // Ecoute les changements de produit via le sélecteur
            this.ecouterChangementProduit();

        }

        catch (erreur) {

            console.error(erreur);

            this.afficherErreur(erreur.message);

        }

    }

    /**
     * Remplit le menu déroulant avec la liste des produits du catalogue
     */
    genererSelecteurProduits() {

        const select =
            document.getElementById("productSelector");

        if (!select) {

            return;

        }

        select.innerHTML = "";

        this.catalogue.produits.forEach(produit => {

            const option =
                document.createElement("option");

            option.value = produit.fichier;

            option.textContent = produit.nom;

            select.appendChild(option);

        });

    }

    /**
     * Ecoute le changement de sélection dans le menu déroulant
     */
    ecouterChangementProduit() {

        const select =
            document.getElementById("productSelector");

        if (!select) {

            return;

        }

        select.addEventListener("change", () => {

            this.afficherProduitParFichier(select.value);

        });

    }

    /**
     * Charge un produit par son nom de fichier et l'affiche.
     * Réutilise le configurateur existant s'il y en a déjà un
     * (pas de rechargement complet de la page).
     */
    async afficherProduitParFichier(fichier) {

        const produit =
            await this.chargerProduit(fichier);

        if (this.configurateur) {

            this.configurateur.changerProduit(produit);

        } else {

            this.configurateur = new Configurateur(produit);

            this.configurateur.initialiser();

        }

    }

    /**
     * Charge le catalogue
     */
    async chargerCatalogue() {

        const reponse =
            await fetch("data/catalogue.json");

        if (!reponse.ok) {

            throw new Error("Impossible de charger le catalogue.");

        }

        return await reponse.json();

    }

    /**
     * Charge un produit
     */
    async chargerProduit(fichier) {

        const reponse =
            await fetch("data/produits/" + fichier);

        if (!reponse.ok) {

            throw new Error("Impossible de charger le produit.");

        }

        return await reponse.json();

    }

    /**
     * Affichage des erreurs
     */
    afficherErreur(message) {

        document.body.innerHTML = `

        <div class="container mt-5">

            <div class="alert alert-danger">

                <h3>

                    Erreur

                </h3>

                <p>${message}</p>

            </div>

        </div>

        `;

    }

}


/*************************************************************
 * Lancement
 *************************************************************/

document.addEventListener(

    "DOMContentLoaded",

    () => {

        const app = new Application();

        app.demarrer();

    }

);
