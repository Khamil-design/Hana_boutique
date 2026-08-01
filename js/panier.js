/*****************************************************************
 * panier.js
 * Gestion du panier + code promo
 *****************************************************************/

import { t, getLangue } from "./i18n.js";

export default class Panier {

    constructor() {

        this.cleStockage = "configurateur_panier";
        this.clePromo = "configurateur_promo";

        this.articles = this.charger();
        this.codePromoActif = this.chargerPromo();

        this.numeroWhatsApp = "212676725257";
        this.devise = "DH";

        this.codesPromo = {
            "HANA10": { type: "pourcentage", valeur: 10 },
            "HANA20": { type: "pourcentage", valeur: 20 },
            "WELCOME": { type: "fixe", valeur: 50 }
        };

        this.ecouterCheckout();
        this.ecouterVider();

    }

    ecouterCheckout() {

        const bouton = document.getElementById("btnCheckout");

        if (!bouton) return;

        bouton.addEventListener("click", () => {
            this.commander();
        });

    }

    ecouterVider() {

        const bouton = document.getElementById("btnViderPanier");

        if (!bouton) return;

        bouton.addEventListener("click", () => {
            this.vider();
            this.afficher();
        });

    }

    validerCodePromo(code) {

        if (!code) return null;

        const codeNet = code.trim().toUpperCase();

        return this.codesPromo[codeNet] || null;

    }

    calculerRemise(sousTotal) {

        if (!this.codePromoActif) return 0;

        const promo = this.validerCodePromo(this.codePromoActif);

        if (!promo) return 0;

        if (promo.type === "pourcentage") {
            return sousTotal * (promo.valeur / 100);
        }

        if (promo.type === "fixe") {
            return Math.min(promo.valeur, sousTotal);
        }

        return 0;

    }

    appliquerPromo(code) {

        const promo = this.validerCodePromo(code);

        const messageEl = document.getElementById("promoMessage");

        if (!promo) {
            this.codePromoActif = null;
            this.sauvegarderPromo();
            if (messageEl) {
                messageEl.textContent = t("promoInvalide", getLangue());
                messageEl.className = "promo-message error";
            }
            this.afficher();
            return;
        }

        this.codePromoActif = code.trim().toUpperCase();
        this.sauvegarderPromo();

        if (messageEl) {
            messageEl.textContent = t("promoValide", getLangue());
            messageEl.className = "promo-message success";
        }

        this.afficher();

    }

    retirerPromo() {

        this.codePromoActif = null;
        this.sauvegarderPromo();
        this.afficher();

    }

    sauvegarderPromo() {

        try {
            if (this.codePromoActif) {
                localStorage.setItem(this.clePromo, this.codePromoActif);
            } else {
                localStorage.removeItem(this.clePromo);
            }
        }
        catch (erreur) {
            console.warn("Panier : impossible d'enregistrer le code promo.", erreur);
        }

    }

    chargerPromo() {

        try {
            const code = localStorage.getItem(this.clePromo);
            if (code && this.validerCodePromo(code)) {
                return code;
            }
        }
        catch (erreur) {
            console.warn("Panier : impossible de lire le code promo.", erreur);
        }

        return null;

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

        const sousTotal = this.sousTotal();
        const remise = this.calculerRemise(sousTotal);
        const totalFinal = Math.max(0, sousTotal - remise);

        message += `${t("sousTotalLabel", langue)} : ${sousTotal.toFixed(2)} ${this.devise}\n`;

        if (remise > 0) {
            message += `${t("remiseLabel", langue)} (${this.codePromoActif}) : -${remise.toFixed(2)} ${this.devise}\n`;
        }

        message += `${t("totalCommandeLabel", langue)} : ${totalFinal.toFixed(2)} ${this.devise}`;

        return message;

    }

    commander() {

        const zone = document.getElementById("cartItems");

        if (!zone) return;

        if (this.articles.length === 0) {
            zone.innerHTML = `
                <p class="text-muted mb-0">${t("panierVide", getLangue())}</p>
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
        this.retirerPromo();

        setTimeout(() => {
            const offcanvasEl = document.getElementById("panierCanvas");
            const panneau = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
            panneau.hide();
        }, 2000);

    }

    charger() {

        try {
            const donnees = localStorage.getItem(this.cleStockage);
            if (!donnees) return [];
            return JSON.parse(donnees);
        }
        catch (erreur) {
            console.warn("Panier : impossible de lire le panier enregistré.", erreur);
            return [];
        }

    }

    sauvegarder() {

        try {
            localStorage.setItem(this.cleStockage, JSON.stringify(this.articles));
        }
        catch (erreur) {
            console.warn("Panier : impossible d'enregistrer le panier.", erreur);
        }

    }

    ajouter(article, quantiteInitiale = 1) {

        const quantite = quantiteInitiale > 0 ? quantiteInitiale : 1;

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

        if (!this.articles[index]) return;

        this.articles[index].quantitePanier++;
        this.sauvegarder();
        this.mettreAJourBadge();
    }

    diminuerQuantite(index) {

        if (!this.articles[index]) return;

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
            (total, article) => total + (article.quantitePanier || 1),
            0
        );
    }

    mettreAJourBadge() {

        const badge = document.getElementById("cartBadge");
        const btnVider = document.getElementById("btnViderPanier");

        if (!badge) return;

        const nombre = this.nombreArticles();

        badge.textContent = nombre;

        if (nombre === 0) {
            badge.style.display = "none";
            if (btnVider) btnVider.style.display = "none";
        } else {
            badge.style.display = "block";
            if (btnVider) btnVider.style.display = "inline-block";
        }

        badge.classList.remove("badge-pulse");
        void badge.offsetWidth;
        badge.classList.add("badge-pulse");

        setTimeout(() => {
            badge.classList.remove("badge-pulse");
        }, 500);

    }

    sousTotal() {
        return this.articles.reduce(
            (total, article) =>
                total + (article.prixUnitaire * (article.quantitePanier || 1)),
            0
        );
    }

    total() {
        const sousTotal = this.sousTotal();
        const remise = this.calculerRemise(sousTotal);
        return Math.max(0, sousTotal - remise);
    }

    /**************************************************************
     * Met à jour l'état du bouton Commander (actif/inactif)
     **************************************************************/
    mettreAJourBoutonCommander() {

        const btnCheckout = document.getElementById("btnCheckout");

        if (!btnCheckout) return;

        if (this.articles.length === 0) {
            btnCheckout.disabled = true;
            btnCheckout.classList.add("disabled");
        } else {
            btnCheckout.disabled = false;
            btnCheckout.classList.remove("disabled");
        }

    }

    afficher() {

        const zone = document.getElementById("cartItems");
        const totalEl = document.getElementById("cartTotal");

        if (!zone || !totalEl) return;

        zone.innerHTML = "";

        const langue = getLangue();
        const sousTotal = this.sousTotal();
        const remise = this.calculerRemise(sousTotal);
        const totalFinal = Math.max(0, sousTotal - remise);

        if (this.articles.length === 0) {
            zone.innerHTML = `<p class="text-muted">${t("panierVide", langue)}</p>`;
            totalEl.textContent = "0 " + this.devise;
            this.mettreAJourBoutonCommander();
            return;
        }

        // --- Section Code Promo (avec label) ---
        let promoHTML = `
            <div class="promo-section mb-3">
                <label for="codePromo" class="promo-label">${t("codePromoTitre", langue)}</label>
                <div class="input-group input-group-sm">
                    <input
                        type="text"
                        id="codePromo"
                        class="form-control"
                        placeholder="${t("codePromoPlaceholder", langue)}"
                        value="${this.codePromoActif || ""}"
                        ${this.codePromoActif ? "disabled" : ""}>
                    <button
                        class="btn btn-outline-gold"
                        id="btnAppliquerPromo">
                        ${this.codePromoActif ? t("retirerPromo", langue) : t("appliquerPromo", langue)}
                    </button>
                </div>
                <div id="promoMessage" class="promo-message"></div>
            </div>
        `;

        zone.innerHTML = promoHTML;

        // --- Articles ---
        this.articles.forEach((article, index) => {

            const carte = document.createElement("div");
            carte.className = "card mb-3";

            carte.innerHTML = `
<div class="card-body">
    <div class="d-flex">
        <img
            src="${article.image}"
            alt="${article.produit}"
            loading="lazy"
            style="
                width:90px;
                height:90px;
                object-fit:cover;
                border-radius:8px;
                margin-right:15px;
            ">
        <div class="flex-grow-1">
            <h6 class="mb-2">${article.produit}</h6>
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
                    aria-label="${t("diminuerQuantite", langue)}">
                    <i class="bi bi-dash"></i>
                </button>
                <span class="mx-3 fw-bold">${article.quantitePanier || 1}</span>
                <button
                    class="btn btn-sm btn-outline-secondary btn-plus"
                    data-index="${index}"
                    aria-label="${t("augmenterQuantite", langue)}">
                    <i class="bi bi-plus"></i>
                </button>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-3">
                <strong>${(article.prixUnitaire * (article.quantitePanier || 1)).toFixed(2)} ${this.devise}</strong>
                <button
                    class="btn btn-sm btn-outline-danger btn-supprimer"
                    data-index="${index}"
                    aria-label="${t("retirerArticle", langue)}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    </div>
</div>
`;

            zone.appendChild(carte);

        });

        // --- Récap prix ---
        const recap = document.createElement("div");
        recap.className = "mb-2";

        let recapHTML = `
            <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">${t("sousTotalLabel", langue)}</span>
                <span class="text-muted">${sousTotal.toFixed(2)} ${this.devise}</span>
            </div>
        `;

        if (remise > 0) {
            recapHTML += `
                <div class="d-flex justify-content-between text-success mb-1">
                    <span>${t("remiseLabel", langue)} (${this.codePromoActif})</span>
                    <span>-${remise.toFixed(2)} ${this.devise}</span>
                </div>
            `;
        }

        recap.innerHTML = recapHTML;
        zone.appendChild(recap);

        // --- Écouteurs ---
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

        const btnPromo = document.getElementById("btnAppliquerPromo");
        if (btnPromo) {
            btnPromo.addEventListener("click", () => {
                if (this.codePromoActif) {
                    this.retirerPromo();
                } else {
                    const input = document.getElementById("codePromo");
                    if (input) this.appliquerPromo(input.value);
                }
            });
        }

        const inputPromo = document.getElementById("codePromo");
        if (inputPromo) {
            inputPromo.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    this.appliquerPromo(inputPromo.value);
                }
            });
        }

        totalEl.textContent = totalFinal.toFixed(2) + " " + this.devise;

        // Met à jour l'état du bouton Commander
        this.mettreAJourBoutonCommander();

    }
}
