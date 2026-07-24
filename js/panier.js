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

}
