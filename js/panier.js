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

        this.articles.push(article);

        this.sauvegarder();

    }

    /**************************************************************
     * Supprimer un article
     **************************************************************/
    supprimer(index) {

        this.articles.splice(index, 1);

        this.sauvegarder();

    }

    /**************************************************************
     * Vider le panier
     **************************************************************/
    vider() {

        this.articles = [];

        this.sauvegarder();

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

        return this.articles.length;

    }

    /**************************************************************
     * Total du panier
     **************************************************************/
    total() {

        return this.articles.reduce(

            (total, article) =>

                total + article.total,

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

            <div class="d-flex justify-content-between align-items-center mt-3">

                <strong>

                    ${article.total.toFixed(2)} €

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

        `;

        zone.appendChild(carte);

    });

    total.textContent =
        this.total().toFixed(2) + " €";

}
}
