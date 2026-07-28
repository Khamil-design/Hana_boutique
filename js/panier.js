/*****************************************************************
 * panier.js
 * Gestion du panier
 *****************************************************************/

import { t, getLangue } from "./i18n.js";

export default class Panier {

    constructor() {

        this.cleStockage = "configurateur_panier";

        this.articles = this.charger();

        this.numeroWhatsApp = "212676725257";

        this.devise = "DH";

        this.ecouterCheckout();
        this.ecouterVider();

    }

    ecouterCheckout() {

        const bouton = document.getElementById("btnCheckout");

        if (!bouton) {

            return;

        }

        bouton.addEventListener("click", () => {

            this.commander();

        });

    }

    /**************************************************************
     * Ecoute le bouton "Vider le panier"
     **************************************************************/
    ecouterVider() {

        const bouton = document.getElementById("btnViderPanier");

        if (!bouton) {

            return;

        }

        bouton.addEventListener("click", () => {

            this.vider();
            this.afficher();

        });

    }

    construireMessageWhatsApp() {

        const langue = getLangue();

        let message = t("bonjourCommande", langue) + "\n\n";

        this.articles.forEach((article, index) => {

            message += `${index + 1}) ${article.produit}\n`;

            (article.details || []).forEach(detail => {

                message += `   - ${detail.label} : ${detail.valeur}\n`;

            });

            message += `   - ${t("quantiteLabel", langue)} : ${article.quantitePanier}\n`;

            message += `   - ${t("prixLabel", langue)} : ${(
                article.prixUnitaire * article.quantitePanier
            ).toFixed(2)} ${this.devise}\n\n`;

        });

        message += `${t("totalCommandeLabel", langue)} : ${this.total().toFixed(2)} ${this.devise}`;

        return message;

    }

    commander() {

        const zone = document.getElementById("cartItems");

        if (!zone) {

            return;

        }

        if (this.articles.length === 0) {

            zone.innerHTML = `
                <p class="text-muted mb-0">
                    ${t("panierVide", getLangue())}
                </p>
            `;

            return;

        }

        const message = this.construireMessageWhatsApp();

        const lienWhatsApp =
            "https://wa.me/" +
            this.numeroWhatsApp +
            "?text=" +
            encodeURIComponent(message);

        window.open(lienWhatsApp, "_blank");

        zone.innerHTML = `
            <div class="alert alert-success text-center mb-0">
                <i class="bi bi-whatsapp fs-3 d-block mb-2"></i>
                ${t("confirmationWhatsApp", getLangue())}
            </div>
        `;

        this.vider();

        setTimeout(() => {

            const offcanvasEl =
                document.getElementById("panierCanvas");

            const panneau =
                bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);

            panneau.hide();

        }, 2000);

    }

    charger() {

        try {

            const donnees =
                localStorage.getItem(this.cleStockage);

            if (!donnees) {

                return [];

            }

            return JSON.parse(donnees);

        }

        catch (erreur) {

            console.warn(
                "Panier : impossible de lire le panier enregistré.",
                erreur
            );

            return [];

        }

    }

    sauvegarder() {

        try {

            localStorage.setItem(
                this.cleStockage,
                JSON.stringify(this.articles)
            );

        }

        catch (erreur) {

            console.warn(
                "Panier : impossible d'enregistrer le panier.",
                erreur
            );

        }

    }

    ajouter(article, quantiteInitiale = 1) {

        const quantite =
            quantiteInitiale > 0 ? quantiteInitiale : 1;

        article.quantitePanier = quantite;

        const index = this.articles.findIndex(item =>
            (
                article.produitId
                    ? item.produitId === article.produitId
                    : item.produit === article.produit
            ) &&
            JSON.stringify(item.configuration) ===
            JSON.stringify(article.configuration)
        );

        if (index !== -1) {

            this.articles[index].quantitePanier += quantite;

        } else {

            this.articles.push(article);

        }

        this.sauvegarder();
        this.mettreAJourBadge();
    }

    supprimer(index) {

        this.articles.splice(index, 1);

        this.sauvegarder();
        this.mettreAJourBadge();
    }

    augmenterQuantite(index) {

        if (!this.articles[index]) {

            return;

        }

        this.articles[index].quantitePanier++;

        this.sauvegarder();
        this.mettreAJourBadge();
    }

    diminuerQuantite(index) {

        if (!this.articles[index]) {

            return;

        }

        this.articles[index].quantitePanier--;

        if (this.articles[index].quantitePanier <= 0) {

            this.supprimer(index);

            return;

        }

        this.sauvegarder();
        this.mettreAJourBadge();
    }

    vider() {

        this.articles = [];

        this.sauvegarder();
        this.mettreAJourBadge();
    }

    obtenirArticles() {

        return this.articles;

    }

    nombreArticles() {

        return this.articles.reduce(
            (total, article) =>
                total + (article.quantitePanier || 1),
            0
        );

    }

    mettreAJourBadge() {

        const badge = document.getElementById("cartBadge");

        if (!badge) {

            return;

        }

        const nombre = this.nombreArticles();

        badge.textContent = nombre;

        if (nombre === 0) {
            badge.style.display = "none";
        } else {
            badge.style.display = "block";
        }

        badge.classList.remove("badge-pulse");
        void badge.offsetWidth;
        badge.classList.add("badge-pulse");

        setTimeout(() => {
            badge.classList.remove("badge-pulse");
        }, 500);

    }

    total() {

        return this.articles.reduce(
            (total, article) =>
                total + (article.prixUnitaire * (article.quantitePanier || 1)),
            0
        );

    }

    afficher() {

        const zone =
            document.getElementById("cartItems");

        const total =
            document.getElementById("cartTotal");

        if (!zone || !total) {

            return;

        }

        zone.innerHTML = "";

        if (this.articles.length === 0) {

            zone.innerHTML = `
                <p class="text-muted">
                    ${t("panierVide", getLangue())}
                </p>
            `;

            total.textContent = "0 " + this.devise;

            return;

        }

        this.articles.forEach((article, index) => {

            const carte =
                document.createElement("div");

            carte.className =
                "card mb-3";

            carte.innerHTML = `
<div class="card-body">
    <div class="d-flex">
        <img
            src="${article.image}"
            alt="${article.produit}"
            style="
                width:90px;
                height:90px;
                object-fit:cover;
                border-radius:8px;
                margin-right:15px;
            ">
        <div class="flex-grow-1">
            <h6 class="mb-2">
                ${article.produit}
            </h6>
            <small class="text-muted">
                ${(article.details || [])
                    .map(detail =>
                        `<strong>${detail.label}</strong> : ${detail.valeur}`
                    )
                    .join("<br>")
                }
            </small>
            <div class="d-flex align-items-center mt-2">
                <button
                    class="btn btn-sm btn-outline-secondary btn-moins"
                    data-index="${index}"
                    aria-label="${t("diminuerQuantite", getLangue())}">
                    <i class="bi bi-dash"></i>
                </button>
                <span class="mx-3 fw-bold">
                    ${article.quantitePanier || 1}
                </span>
                <button
                    class="btn btn-sm btn-outline-secondary btn-plus"
                    data-index="${index}"
                    aria-label="${t("augmenterQuantite", getLangue())}">
                    <i class="bi bi-plus"></i>
                </button>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-3">
                <strong>
                    ${(article.prixUnitaire * (article.quantitePanier || 1)).toFixed(2)} ${this.devise}
                </strong>
                <button
                    class="btn btn-sm btn-outline-danger btn-supprimer"
                    data-index="${index}"
                    aria-label="${t("retirerArticle", getLangue())}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    </div>
</div>
`;

            zone.appendChild(carte);

        });

        zone.querySelectorAll(".btn-plus").forEach(btn => {
            btn.addEventListener("click", () => {
                this.augmenterQuantite(btn.dataset.index);
                this.afficher();
            });
        });

        zone.querySelectorAll(".btn-moins").forEach(btn => {
            btn.addEventListener("click", () => {
                this.diminuerQuantite(btn.dataset.index);
                this.afficher();
            });
        });

        zone.querySelectorAll(".btn-supprimer").forEach(btn => {
            btn.addEventListener("click", () => {
                this.supprimer(btn.dataset.index);
                this.afficher();
            });
        });

        total.textContent =
            this.total().toFixed(2) + " " + this.devise;

    }
}
