/********************************************************************
 * CONFIGURATEUR DE PRODUITS
 * app.js
 * Point d'entrée de l'application
 ********************************************************************/

import Configurateur from "./configurateur.js";
import { getLangue, setLangue, t, champ } from "./i18n.js";
import { initialiserTheme } from "./theme.js";

export default class Application {

    constructor() {

        this.configurateur = null;
        this.catalogue = null;
        this.genreActif = "homme";

    }

    /**
     * Démarrage
     */
    async demarrer() {

        try {

            // === Initialise le thème (clair/sombre) ===
            initialiserTheme();

            // Applique la langue mémorisée (ou le français par défaut)
            this.appliquerLangue(getLangue());

            this.ecouterSelecteurLangue();

            // Chargement du catalogue
            this.catalogue = await this.chargerCatalogue();

            if (!this.catalogue.produits.length) {

                throw new Error("Aucun produit trouvé.");

            }

            // === Détecte le produit et le genre demandés via l'URL ===
            const params = new URLSearchParams(window.location.search);
            const produitDemande = params.get("produit");
            const genreDemande = params.get("genre");

            const produitTrouve = produitDemande
                ? this.catalogue.produits.find(p => p.fichier === produitDemande)
                : null;

            if (produitTrouve) {
                // Le genre suit celui du produit demandé (source la plus fiable)
                this.genreActif = produitTrouve.genre || "homme";
            } else if (genreDemande === "homme" || genreDemande === "femme" || genreDemande === "enfant") {
                this.genreActif = genreDemande;
            }

            this.ecouterOngletsGenre();
            this.appliquerOngletGenreActif();

            // Remplit le menu déroulant avec les produits du genre actif
            this.genererSelecteurProduits();

            const produitsDuGenre = this.catalogue.produits.filter(
                p => (p.genre || "homme") === this.genreActif
            );

            const fichierProduit = produitTrouve
                ? produitTrouve.fichier
                : (produitsDuGenre[0] ? produitsDuGenre[0].fichier : this.catalogue.produits[0].fichier);

            // Affiche le produit (demandé ou le premier du genre actif)
            await this.afficherProduitParFichier(fichierProduit);

            // Pré-sélectionne la couleur / longueur passées dans l'URL
            // (ex : lien depuis l'aperçu aléatoire de l'accueil)
            this.preselectionnerOptionsDepuisURL(params);

            // Ecoute les changements de produit via le sélecteur
            this.ecouterChangementProduit();

        }

        catch (erreur) {

            console.error(erreur);

            this.afficherErreur(erreur.message);

        }

    }

    /**************************************************************
     * Langue (FR / AR)
     **************************************************************/

    appliquerLangue(langue) {

        const html = document.documentElement;

        html.lang = langue;

        html.dir = langue === "ar" ? "rtl" : "ltr";

        // Bascule Bootstrap sur sa version RTL en arabe
        const bootstrapCss =
            document.getElementById("bootstrapCss");

        if (bootstrapCss) {

            bootstrapCss.href = langue === "ar"
                ? "https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.rtl.min.css"
                : "https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css";

        }

        // Titre de page et meta description
        document.title = t("titrePage", langue);

        const meta =
            document.querySelector('meta[name="description"]');

        if (meta) {

            meta.content = t("metaDescription", langue);

        }

        // Tous les textes statiques marqués data-i18n
        document.querySelectorAll("[data-i18n]").forEach(el => {

            el.textContent = t(el.dataset.i18n, langue);

        });

        // Tous les aria-label statiques marqués data-i18n-aria
        document.querySelectorAll("[data-i18n-aria]").forEach(el => {

            el.setAttribute(
                "aria-label",
                t(el.dataset.i18nAria, langue)
            );

        });

        // Pied de page (avec année dynamique)
        const footerText =
            document.getElementById("footerText");

        if (footerText) {

            const annee = new Date().getFullYear();

            footerText.textContent =
                `${t("footer", langue)} © ${annee}`;

        }

        // Bouton de langue : propose l'AUTRE langue
        const boutonLangue =
            document.getElementById("btnLangue");

        if (boutonLangue) {

            const autreLangue = langue === "ar" ? "fr" : "ar";

            boutonLangue.textContent = t("nomLangue", autreLangue);

            boutonLangue.setAttribute(
                "aria-label",
                t("selecteurLangueLabel", langue)
            );

        }

        // Si un produit est déjà affiché, on le retraduit sans
        // recharger la page (titre, description, options, panier...)
        if (this.configurateur) {

            this.configurateur.changerLangue(langue);

        }

        // Le menu déroulant des produits doit aussi être retraduit
        if (this.catalogue) {

            this.genererSelecteurProduits();

        }

    }

    /**
     * Ecoute le clic sur le bouton de changement de langue
     */
    ecouterSelecteurLangue() {

        const bouton =
            document.getElementById("btnLangue");

        if (!bouton) {

            return;

        }

        bouton.addEventListener("click", () => {

            const nouvelleLangue =
                getLangue() === "ar" ? "fr" : "ar";

            setLangue(nouvelleLangue);

            this.appliquerLangue(nouvelleLangue);

        });

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

        const valeurActuelle = select.value;

        const langue = getLangue();

        select.innerHTML = "";

        const produitsDuGenre = this.catalogue.produits.filter(
            p => (p.genre || "homme") === this.genreActif
        );

        produitsDuGenre.forEach(produit => {

            const option =
                document.createElement("option");

            option.value = produit.fichier;

            option.textContent = champ(produit.nom, langue);

            select.appendChild(option);

        });

        // On garde le produit actuellement affiché sélectionné
        if (valeurActuelle) {

            select.value = valeurActuelle;

        }

    }

    /**
     * Ecoute les clics sur les onglets Homme / Femme
     */
    ecouterOngletsGenre() {

        document.querySelectorAll(".genre-tab").forEach(onglet => {

            onglet.addEventListener("click", async () => {

                this.genreActif = onglet.dataset.genre;
                this.appliquerOngletGenreActif();
                this.genererSelecteurProduits();

                const produitsDuGenre = this.catalogue.produits.filter(
                    p => (p.genre || "homme") === this.genreActif
                );

                if (produitsDuGenre.length) {
                    await this.afficherProduitParFichier(produitsDuGenre[0].fichier);
                }

            });

        });

    }

    /**
     * Met à jour l'état visuel actif/inactif des onglets Homme / Femme
     */
    appliquerOngletGenreActif() {

        document.querySelectorAll(".genre-tab").forEach(onglet => {
            const actif = onglet.dataset.genre === this.genreActif;
            onglet.classList.toggle("active", actif);
            onglet.setAttribute("aria-selected", actif ? "true" : "false");
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

        select.addEventListener("change", async () => {

            try {

                await this.afficherProduitParFichier(select.value);

            }

            catch (erreur) {

                console.error(erreur);

                alert(t("erreurChargementProduit", getLangue()));

            }

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
     * Applique une couleur et/ou une longueur passées dans l'URL
     * (ex : ?couleur=bordeaux&longueur=genou) au formulaire du
     * configurateur, si ces valeurs existent bien pour le produit
     * actuellement affiché.
     */
    preselectionnerOptionsDepuisURL(params) {

        const couleurDemandee = params.get("couleur");
        const longueurDemandee = params.get("longueur");

        if (!couleurDemandee && !longueurDemandee) {
            return;
        }

        const formulaire = document.getElementById("configForm");
        if (!formulaire) return;

        let modifie = false;

        if (couleurDemandee) {

            const radio = formulaire.querySelector(
                `input[name="couleur"][value="${couleurDemandee}"]`
            );

            if (radio) {
                radio.checked = true;
                modifie = true;
            }

        }

        if (longueurDemandee) {

            const select = document.getElementById("longueur");

            if (select && [...select.options].some(o => o.value === longueurDemandee)) {
                select.value = longueurDemandee;
                modifie = true;
            }

        }

        // Un seul rafraîchissement, une fois les deux champs appliqués
        if (modifie) {
            formulaire.dispatchEvent(new Event("change"));
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
                <h3>Erreur</h3>
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
