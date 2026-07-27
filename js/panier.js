/*****************************************************************
 * panier.js
 * Gestion du panier
 *****************************************************************/

export default class Panier {

    constructor() {

        this.cleStockage = "configurateur_panier";

        this.articles = this.charger();

        // Numéro WhatsApp de la boutique (avec indicatif pays,
        // sans le "+" ni espaces). À remplacer par le numéro
        // professionnel définitif le moment venu.
        this.numeroWhatsApp = "212676725257";

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
     * Construit le texte de la commande, prêt à envoyer sur WhatsApp
     **************************************************************/
    construireMessageWhatsApp() {

        let message = "Bonjour, je souhaite commander :\n\n";

        this.articles.forEach((article, index) => {

            message += `${index + 1}) ${article.produit}\n`;

            (article.details || []).forEach(detail => {

                message += `   - ${detail.label} : ${detail.valeur}\n`;

            });

            message += `   - Quantité : ${article.quantitePanier}\n`;

            message += `   - Prix : ${(
                article.prixUnitaire * article.quantitePanier
            ).toFixed(2)} €\n\n`;

        });

        message += `Total : ${this.total().toFixed(2)} €`;

        return message;

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

        // Ouverture de WhatsApp IMMEDIATE (même tour d'exécution
        // que le clic), sinon le navigateur bloque l'ouverture
        // comme s'il s'agissait d'un pop-up indésirable.

        const message = this.construireMessageWhatsApp();

        const lienWhatsApp =
            "https://wa.me/" +
            this.numeroWhatsApp +
            "?text=" +
            encodeURIComponent(message);

        window.open(lienWhatsApp, "_blank");

        // Message de confirmation affiché dans le panneau

        zone.innerHTML = `

            <div class="alert alert-success text-center mb-0">

                <i class="bi bi-whatsapp fs-3 d-block mb-2"></i>

                Vous allez être redirigé vers WhatsApp pour envoyer
                votre commande. Il ne vous reste qu'à appuyer sur
                "Envoyer" là-bas !

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

        }, 2000);

    }

    /**************************************************************
     * Chargement du panier
     **************************************************************/
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
                "Panier : impossible de lire le panier enregistré (stockage indisponible).",
                erreur
            );

            return [];

        }

    }

    /**************************************************************
     * Sauvegarde
     **************************************************************/
    sauvegarder() {

        try {

            localStorage.setItem(

                this.cleStockage,

                JSON.stringify(this.articles)

            );

        }

        catch (erreur) {

            // Le panier continue de fonctionner pour la session en
            // cours même si la sauvegarde échoue (navigation privée,
            // stockage désactivé ou plein).

            console.warn(
                "Panier : impossible d'enregistrer le panier (stockage indisponible ou plein).",
                erreur
            );

        }

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
        data-index="${index}"
        aria-label="Diminuer la quantité">

        <i class="bi bi-dash"></i>

    </button>

    <span class="mx-3 fw-bold">

        ${article.quantitePanier || 1}

    </span>

    <button
        class="btn btn-sm btn-outline-secondary btn-plus"
        data-index="${index}"
        aria-label="Augmenter la quantité">

        <i class="bi bi-plus"></i>

    </button>

</div>

            <div class="d-flex justify-content-between align-items-center mt-3">

                <strong>

                    ${(article.prixUnitaire * (article.quantitePanier || 1)).toFixed(2)} €

                </strong>

                <button
                    class="btn btn-sm btn-outline-danger btn-supprimer"
                    data-index="${index}"
                    aria-label="Retirer cet article du panier">

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
