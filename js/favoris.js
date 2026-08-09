/*****************************************************************
 * favoris.js
 * Gestion des articles favoris (mémorisés dans le navigateur)
 *****************************************************************/

import { getLangue } from "./i18n.js";

const CLE_STOCKAGE = "hana_favoris";

/**
 * Lit la liste des favoris enregistrés.
 */
function lireFavoris() {

    try {

        const donnees = localStorage.getItem(CLE_STOCKAGE);

        if (!donnees) {

            return [];

        }

        const favoris = JSON.parse(donnees);

        return Array.isArray(favoris) ? favoris : [];

    }

    catch (erreur) {

        console.warn("Favoris : impossible de lire la liste enregistrée.", erreur);

        return [];

    }

}

/**
 * Sauvegarde la liste des favoris.
 */
function sauvegarderFavoris(favoris) {

    try {

        localStorage.setItem(CLE_STOCKAGE, JSON.stringify(favoris));

    }

    catch (erreur) {

        console.warn("Favoris : impossible d'enregistrer la liste.", erreur);

    }

}

export function obtenirFavoris() {

    return lireFavoris();

}

export function estFavori(fichier) {

    return lireFavoris().includes(fichier);

}

export function nombreFavoris() {

    return lireFavoris().length;

}

/**
 * Ajoute ou retire un article des favoris.
 * @returns {boolean} true si l'article est maintenant favori
 */
export function basculerFavori(fichier) {

    const favoris = lireFavoris();

    const index = favoris.indexOf(fichier);

    let ajoute;

    if (index !== -1) {

        favoris.splice(index, 1);

        ajoute = false;

    } else {

        favoris.push(fichier);

        ajoute = true;

    }

    sauvegarderFavoris(favoris);

    mettreAJourBadge();

    return ajoute;

}

/**
 * Met à jour le compteur affiché dans le header.
 */
export function mettreAJourBadge() {

    const badge = document.getElementById("favorisBadge");

    if (!badge) return;

    const nombre = nombreFavoris();

    badge.textContent = nombre;

    badge.style.display = nombre === 0 ? "none" : "block";

    badge.classList.remove("badge-pulse");

    void badge.offsetWidth;

    badge.classList.add("badge-pulse");

    setTimeout(() => {

        badge.classList.remove("badge-pulse");

    }, 500);

}

/**
 * Petite notification "toast" lors de l'ajout/retrait d'un favori.
 */
export function afficherToastFavori(ajoute, nomProduit) {

    const container = document.getElementById("toastContainer");

    if (!container) return;

    const langue = getLangue();

    const message = ajoute
        ? `${nomProduit} — ${langue === "ar" ? "أُضيف إلى المفضلة" : "ajouté aux favoris"}`
        : `${nomProduit} — ${langue === "ar" ? "أُزيل من المفضلة" : "retiré des favoris"}`;

    const toast = document.createElement("div");

    toast.className = "toast-item";

    toast.innerHTML = `
        <i class="bi ${ajoute ? "bi-heart-fill" : "bi-heart"} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="${langue === "ar" ? "إغلاق" : "Fermer"}">
            <i class="bi bi-x"></i>
        </button>
    `;

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            toast.classList.add("toast-show");

        });

    });

    const delai = setTimeout(() => fermerToast(toast), 3500);

    toast.querySelector(".toast-close").addEventListener("click", () => {

        clearTimeout(delai);

        fermerToast(toast);

    });

    container.appendChild(toast);

}

function fermerToast(toast) {

    toast.classList.remove("toast-show");

    toast.classList.add("toast-hide");

    toast.addEventListener("transitionend", () => {

        if (toast.parentElement) {

            toast.remove();

        }

    });

}
