/********************************************************************
 * ui.js
 * Gestion de toute l'interface utilisateur
 ********************************************************************/
import Galerie from "./galerie.js";
export default class UI {

    constructor() {

        this.form = document.getElementById("configForm");
        this.summary = document.getElementById("summary");
        this.total = document.getElementById("totalPrice");
        this.galerie = new Galerie();
    }

    /**************************************************************
     * Affichage du produit
     **************************************************************/
    afficherProduit(produit){

        document.getElementById("productTitle").textContent =
            produit.nom;

        document.getElementById("productDescription").textContent =
            produit.description;

        // Compatibilité avec la nouvelle structure des images

if (produit.images.parCouleur) {

    const premiereCouleur =
        Object.keys(produit.images.parCouleur)[0];

    document.getElementById("productImage").src =
        produit.images.parCouleur[premiereCouleur][0];

}
else {

    document.getElementById("productImage").src =
        produit.images.principale;

};

    }

    /**************************************************************
     * Génération automatique des options
     **************************************************************/
    genererOptions(options){

        this.form.innerHTML = "";

        options.forEach(option=>{

            const bloc = document.createElement("div");

            bloc.className = "option-group";

            const titre = document.createElement("h5");

            titre.className = "option-title";

            titre.textContent = option.nom;

            bloc.appendChild(titre);

            switch(option.type){

                case "select":
                    bloc.appendChild(
                        this.creerSelect(option)
                    );
                    break;

                case "radio":
                    bloc.appendChild(
                        this.creerRadio(option)
                    );
                    break;

                case "checkbox":
                    bloc.appendChild(
                        this.creerCheckbox(option)
                    );
                    break;

                case "number":
                    bloc.appendChild(
                        this.creerNombre(option)
                    );
                    break;

            }

            this.form.appendChild(bloc);

        });

    }

    /**************************************************************
     * SELECT
     **************************************************************/
    creerSelect(option){

        const select = document.createElement("select");

        select.className = "form-select";

        select.id = option.id;

        option.choix.forEach(choix=>{

            const opt = document.createElement("option");

            opt.value = choix.id;

            opt.textContent =
                `${choix.libelle} (+${choix.prix})`;

            if(option.valeurDefaut===choix.id)
                opt.selected=true;

            select.appendChild(opt);

        });

        return select;

    }

    /**************************************************************
     * RADIO
     **************************************************************/
    creerRadio(option){

        const div = document.createElement("div");

        option.choix.forEach((choix,index)=>{

            const wrapper =
                document.createElement("div");

            wrapper.className="form-check";

            const radio =
                document.createElement("input");

            radio.type="radio";

            radio.name=option.id;

            radio.id=option.id+"_"+choix.id;

            radio.value=choix.id;

            radio.className="form-check-input";

            if(index===0)
                radio.checked=true;

            const label =
                document.createElement("label");

            label.className="form-check-label";

            label.htmlFor=radio.id;

            label.textContent=
                `${choix.libelle} (+${choix.prix})`;

            wrapper.appendChild(radio);

            wrapper.appendChild(label);

            div.appendChild(wrapper);

        });

        return div;

    }

    /**************************************************************
     * CHECKBOX
     **************************************************************/
    creerCheckbox(option){

        const wrapper=document.createElement("div");

        wrapper.className="form-check";

        const check=document.createElement("input");

        check.type="checkbox";

        check.id=option.id;

        check.className="form-check-input";

        check.checked=
            option.valeurDefaut || false;

        const label=document.createElement("label");

        label.className="form-check-label";

        label.htmlFor=option.id;

        label.textContent=
            `${option.nom} (+${option.prix})`;

        wrapper.appendChild(check);

        wrapper.appendChild(label);

        return wrapper;

    }

    /**************************************************************
     * NUMBER
     **************************************************************/
    creerNombre(option){

        const input=document.createElement("input");

        input.type="number";

        input.id=option.id;

        input.className="form-control";

        input.min=option.minimum;

        input.max=option.maximum;

        input.value=option.valeurDefaut;

        return input;

    }

    /**************************************************************
     * Lecture d'une valeur
     **************************************************************/
    lireValeur(option){

        switch(option.type){

            case "select":

                return document
                    .getElementById(option.id)
                    .value;

            case "radio":

                const radio=document.querySelector(

                    `input[name="${option.id}"]:checked`

                );

                return radio ? radio.value : null;

            case "checkbox":

                return document
                    .getElementById(option.id)
                    .checked;

            case "number":

                return parseInt(

                    document
                    .getElementById(option.id)
                    .value

                );

        }

    }

    /**************************************************************
     * Prix
     **************************************************************/
    mettreAJourPrix(total,devise){

        this.total.textContent =
            total.toFixed(2)+" "+devise;

    }

    /**************************************************************
     * Récapitulatif
     **************************************************************/
    mettreAJourRecapitulatif(resultat){

        this.summary.innerHTML="";

        resultat.supplements.forEach(item=>{

            const ligne=document.createElement("div");

            ligne.className="summary-row";

            ligne.innerHTML=`

                <span>

                    ${item.option}

                    : ${item.choix}

                </span>

                <strong>

                    +${item.prix}

                </strong>

            `;

            this.summary.appendChild(ligne);

        });

    }

    /**************************************************************
     * Reset
     **************************************************************/
    reinitialiser(options){

        options.forEach(option=>{

            switch(option.type){

                case "select":

                    document.getElementById(option.id).selectedIndex=0;

                    break;

                case "checkbox":

                    document.getElementById(option.id).checked=false;

                    break;

                case "number":

                    document.getElementById(option.id).value=
                        option.valeurDefaut || 1;

                    break;

                case "radio":

                    const radios=document.getElementsByName(option.id);

                    if(radios.length)
                        radios[0].checked=true;

                    break;

            }

        });

    }

}
