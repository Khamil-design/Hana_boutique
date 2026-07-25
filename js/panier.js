/*****************************************************************
 * panier.js
 * Gestion du panier
 *****************************************************************/

export default class Panier {

    constructor() {

        this.cleStockage = "configurateur_panier";

        this.articles = this.charger();

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
ajouter(article) {

    article.quantitePanier = 1;

    const index = this.articles.findIndex(item =>

        item.produit === article.produit &&

        JSON.stringify(item.configuration) ===
        JSON.stringify(article.configuration)

    );

    if (index !== -1) {

        this.articles[index].quantitePanier++;

    } else {

        this.articles.push(article);

    }

    this.sauvegarder();
    this.sauvegarder();

    this.mettreAJourBadge();
}

    /**************************************************************
     * Supprimer un article
     **************************************************************/
    supprimer(index) {

        this.articles.splice(index, 1);

        this.sauvegarder();

    }
    this.sauvegarder();
    this.mettreAJourBadge();
/*****************************************************************
 * Augmenter la quantité
 *****************************************************************/
augmenterQuantite(index) {

    if (!this.articles[index]) {

        return;

    }

    this.articles[index].quantitePanier++;

    this.sauvegarder();

}
this.sauvegarder();
this.mettreAJourBadge();
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

}
    this.sauvegarder();
    this.mettreAJourBadge();
    /**************************************************************
     * Vider le panier
     **************************************************************/
    vider() {

        this.articles = [];

        this.sauvegarder();

    }
this.sauvegarder();
this.mettreAJourBadge();
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

                total + (article.total * (article.quantitePanier || 1)),

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

                    ${(article.total * (article.quantitePanier || 1)).toFixed(2)} €

                </strong>

                <button
                    class="btn btn-sm btn-outline-danger"
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
    total.textContent =
        this.total().toFixed(2) + " €";

}
}
