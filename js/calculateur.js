/********************************************************************
 * calculateur.js
 * Calcul du prix du configurateur
 ********************************************************************/

import { champ, getLangue, t } from "./i18n.js";

export default class Calculateur {

    constructor() {

        this.resultat = null;

    }

    /**
     * Calcul principal
     */
    calculer(produit, configuration) {

        const resultat = {

            prixBase: produit.prixBase,

            supplements: [],

            sousTotal: produit.prixBase,

            remise: 0,

            tva: 0,

            livraison: 0,

            quantite: 1,

            total: 0

        };



        //--------------------------------------------------
        // Lecture des options
        //--------------------------------------------------

        produit.options.forEach(option => {

            const valeur =
                configuration[option.id];

            switch(option.type){

                case "select":

                case "radio":

                    this.calculerListe(
                        option,
                        valeur,
                        resultat
                    );

                    break;



                case "checkbox":

                    this.calculerCheckbox(
                        option,
                        valeur,
                        resultat
                    );

                    break;



                case "number":

                    this.calculerNombre(
                        option,
                        valeur,
                        resultat
                    );

                    break;

            }

        });



        //--------------------------------------------------
        // Total
        //--------------------------------------------------

        const prixUnitaire =

            resultat.sousTotal

            - resultat.remise

            + resultat.tva

            + resultat.livraison;

        // Prix d'une seule unité, réutilisé par le panier

        resultat.prixUnitaire = prixUnitaire;

        // Prix affiché en temps réel dans le configurateur
        // (déjà multiplié par la quantité choisie)

        resultat.total =
            prixUnitaire * resultat.quantite;



        this.resultat = resultat;

        return resultat;

    }






    /**
     * Select / Radio
     */
    calculerListe(option, valeur, resultat){

        if(valeur === undefined)
            return;

        const choix =
            option.choix.find(

                c => c.id == valeur

            );

        if(!choix)
            return;

        const langue = getLangue();

        resultat.supplements.push({

            option: champ(option.nom, langue),

            choix: champ(choix.libelle, langue),

            prix: choix.prix

        });

        resultat.sousTotal += choix.prix;

    }





    /**
     * Checkbox
     */
    calculerCheckbox(option, valeur, resultat){

        if(!valeur)
            return;

        const langue = getLangue();

        resultat.supplements.push({

            option: champ(option.nom, langue),

            choix: t("oui", langue),

            prix: option.prix

        });

        resultat.sousTotal += option.prix;

    }







    /**
     * Quantité
     */
    calculerNombre(option, valeur, resultat){

        if(option.id !== "quantite")
            return;

        const q =

            parseInt(valeur)

            ||

            option.valeurDefaut

            ||

            1;

        resultat.quantite = q;

    }

}
