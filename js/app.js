/********************************************************************
 * CONFIGURATEUR DE PRODUITS
 * app.js
 * Point d'entrée de l'application
 ********************************************************************/

import Configurateur from "./configurateur.js";

class Application {

    constructor() {

        this.configurateur = null;

    }

    /**
     * Démarrage
     */
    async demarrer() {

        try {

            // Chargement du catalogue
            const catalogue = await this.chargerCatalogue();

            if (!catalogue.produits.length) {

                throw new Error("Aucun produit trouvé.");

            }

            // Premier produit
            const produit = await this.chargerProduit(
                catalogue.produits[0].fichier
            );

            // Création du configurateur
            this.configurateur = new Configurateur(produit);

            // Initialisation
            this.configurateur.initialiser();

        }

        catch (erreur) {

            console.error(erreur);

            this.afficherErreur(erreur.message);

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