/*****************************************************************
 * panier.js
 * Gestion du panier
 *****************************************************************/

export default class Panier {

    constructor() {

        this.cleStockage = "configurateur_panier";

        this.articles = this.charger();

        this.ecouterCheckout();

    }

    /**************************************************************
     * Bouton "Commander" du panneau panier
     **************************************************************/
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
     * Validation de la commande
     **************************************************************/
    commander() {

        const zone = document.getElementById("cartItems");

        if (!zone) {

            return;

        }

        if (this.articles.length === 0) {

            zone.innerHTML = `

                <p class="text-muted mb-0">

                    Votre panier est vide.

                </p>

            `;

            return;

        }

        // Message de confirmation

        zone.innerHTML = `

            <div class="alert alert-success text-center mb-0">

                <i class="bi bi-check-circle-fill fs-3 d-block mb-2"></i>

                Merci ! Votre commande a bien été enregistrée.

            </div>

        `;

        this.vider();

        // Fermeture du panneau après un court instant

        setTimeout(() => {

            const offcanvasEl =
                document.getElementById("panierCanvas");

            const panneau =
                bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);

            panneau.hide();

        }, 1800);

    }

    /**************************************************************
     * Chargement du panier
     **************************************************************/
    charger() {

        const donnees =
            localStorage.getItem(this.cleStockage);

        if (!donnees) {

            return [];

        }

        try {

            return JSON.parse(donnees);

        }

        catch {

            return [];

        }

    }

    /**************************************************************
     * Sauvegarde
     **************************************************************/
    sauvegarder() {

        localStorage.setItem(

            this.cleStockage,

            JSON.stringify(this.articles)

        );

    }

    /**************************************************************
     * Ajouter un article
     **************************************************************/
ajouter(article, quantiteInitiale = 1) {

    const quantite =
        quantiteInitiale > 0 ? quantiteInitiale : 1;

    article.quantitePanier = quantite;

    const index = this.articles.findIndex(item =>

        item.produit === article.produit &&

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

    /**************************************************************
     * Supprimer un article
     **************************************************************/
    supprimer(index) {

        this.articles.splice(index, 1);

        this.sauvegarder();
        this.mettreAJourBadge();
    }
        
/*****************************************************************
 * Augmenter la quantité
 *****************************************************************/
augmenterQuantite(index) {

    if (!this.articles[index]) {

        return;

    }

    this.articles[index].quantitePanier++;

    this.sauvegarder();
    this.mettreAJourBadge();
}

/*****************************************************************
 * Diminuer la quantité
 *****************************************************************/
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
   
    
    /**************************************************************
     * Vider le panier
     **************************************************************/
    vider() {

        this.articles = [];

        this.sauvegarder();
        this.mettreAJourBadge();
    }

    /**************************************************************
     * Retourner les articles
     **************************************************************/
    obtenirArticles() {

        return this.articles;

    }

    /**************************************************************
     * Nombre d'articles
     **************************************************************/
    nombreArticles() {

    return this.articles.reduce(

        (total, article) =>

            total + (article.quantitePanier || 1),

            0

        );

    }
/*****************************************************************
 * Mise à jour du badge
 *****************************************************************/
mettreAJourBadge() {

    const badge = document.getElementById("cartBadge");

    if (!badge) {

        return;

    }

    badge.textContent = this.nombreArticles();

}
    /**************************************************************
     * Total du panier
     **************************************************************/
    total() {

        return this.articles.reduce(

            (total, article) =>

                total + (article.prixUnitaire * (article.quantitePanier || 1)),

            0

        );

    }
/**************************************************************
 * Affichage du panier
 **************************************************************/
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

                Votre panier est vide.

            </p>

        `;

        total.textContent = "0 €";

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

                ${Object.entries(article.configuration)

                    .map(([cle, valeur]) => {

                        const labels = {

                            couleur: "Couleur",
                            taille: "Taille",
                            longueur: "Longueur",
                            matiere: "Matière",
                            quantite: "Quantité"

                        };

                        return `
                            <strong>${labels[cle] || cle}</strong> :
                            ${String(valeur).charAt(0).toUpperCase() + String(valeur).slice(1)}
                        `;

                    })

                    .join("<br>")
                }

            </small>
<div class="d-flex align-items-center mt-2">

    <button
        class="btn btn-sm btn-outline-secondary btn-moins"
        data-index="${index}">

        <i class="bi bi-dash"></i>

    </button>

    <span class="mx-3 fw-bold">

        ${article.quantitePanier || 1}

    </span>

    <button
        class="btn btn-sm btn-outline-secondary btn-plus"
        data-index="${index}">

        <i class="bi bi-plus"></i>

    </button>

</div>

            <div class="d-flex justify-content-between align-items-center mt-3">

                <strong>

                    ${(article.prixUnitaire * (article.quantitePanier || 1)).toFixed(2)} €

                </strong>

                <button
                    class="btn btn-sm btn-outline-danger btn-supprimer"
                    data-index="${index}">

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
        this.total().toFixed(2) + " €";

}
}
