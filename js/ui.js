/********************************************************************
 * ui.js
 * Gestion de toute l'interface utilisateur
 ********************************************************************/
import Galerie from "./galerie.js";
import { champ, getLangue } from "./i18n.js";
export default class UI {

    constructor() {

        this.form = document.getElementById("configForm");
        this.summary = document.getElementById("summary");
        this.total = document.getElementById("totalPrice");
        this.galerie = new Galerie();
    }
    /**************************************************************
     * Toast notification
     **************************************************************/
    afficherToast(message, actionText = null, actionCallback = null) {

        const container = document.getElementById("toastContainer");

        if (!container) return;

        const toast = document.createElement("div");

        toast.className = "toast-item";

        toast.innerHTML = `

            <i class="bi bi-check-circle-fill toast-icon"></i>

            <div class="toast-content">

                <div class="toast-message">${message}</div>

                ${actionText ? `<button class="toast-action">${actionText}</button>` : ""}

            </div>

            <button class="toast-close" aria-label="${typeof t !== 'undefined' ? t("fermer", getLangue()) : "Fermer"}">

                <i class="bi bi-x"></i>

            </button>

        `;

        // Animation d'entrée
        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                toast.classList.add("toast-show");

            });

        });

        // Fermeture auto après 3.5s
        const timeout = setTimeout(() => this.fermerToast(toast), 3500);

        // Fermeture manuelle
        toast.querySelector(".toast-close").addEventListener("click", () => {

            clearTimeout(timeout);

            this.fermerToast(toast);

        });

        // Action optionnelle (ex: "Voir mon panier")
        if (actionText && actionCallback) {

            toast.querySelector(".toast-action").addEventListener("click", () => {

                clearTimeout(timeout);

                actionCallback();

                this.fermerToast(toast);

            });

        }

        container.appendChild(toast);

    }

    fermerToast(toast) {

        toast.classList.remove("toast-show");

        toast.classList.add("toast-hide");

        toast.addEventListener("transitionend", () => {

            if (toast.parentElement) {

                toast.remove();

            }

        });

    }
    /**************************************************************
     * Affichage du produit
     **************************************************************/
    afficherProduit(produit){

        const langue = getLangue();

        const nomProduit = champ(produit.nom, langue);

        document.getElementById("productTitle").textContent =
            nomProduit;

        document.getElementById("productDescription").textContent =
            champ(produit.description, langue);

// Initialisation de la galerie

if (produit.images.parCouleur) {

    // Produits avec une image différente par couleur (ex: pantalon)

    const premiereCouleur =
        Object.keys(produit.images.parCouleur)[0];

    this.galerie.initialiser(
        produit.images.parCouleur[premiereCouleur],
        nomProduit
    );

}
else {

    // Produits avec une galerie fixe (ex: chemise) :
    // image principale + photos complémentaires

    const images = [

        ...(produit.images.principale
            ? [produit.images.principale]
            : []),

        ...(produit.images.galerie || [])

    ];

    this.galerie.initialiser(images, nomProduit);

}
}
    /**
     * Retraduit le titre/la description du produit affiché,
     * sans toucher à la couleur/l'image actuellement sélectionnée
     * (utilisé lors d'un changement de langue, pas d'un changement
     * de produit ou de couleur).
     */
    retraduireProduit(produit){

        const langue = getLangue();

        const nomProduit = champ(produit.nom, langue);

        document.getElementById("productTitle").textContent =
            nomProduit;

        document.getElementById("productDescription").textContent =
            champ(produit.description, langue);

        this.galerie.mettreAJourNom(nomProduit);

    }
    /**************************************************************
     * Génération automatique des options
     **************************************************************/
    genererOptions(options){

        const langue = getLangue();

        this.form.innerHTML = "";

        options.forEach(option=>{

            const bloc = document.createElement("div");

            bloc.className = "option-group";

            bloc.dataset.optionId = option.id;

            // Pour select/number : un vrai <label> relié au champ.
            // Pour radio/checkbox : chaque choix a déjà son propre
            // <label>, celui-ci ne sert que de titre de groupe.
            const estChampUnique =
                option.type === "select" || option.type === "number";

            const titre = document.createElement(
                estChampUnique ? "label" : "h5"
            );

            titre.className = "option-title";

            if (estChampUnique) {

                titre.htmlFor = option.id;

            }

            titre.textContent = champ(option.nom, langue);

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

    /**
     * Retraduit les libellés des options déjà générées, SANS
     * reconstruire le formulaire — les choix déjà faits par le
     * client (taille, couleur, quantité...) restent intacts.
     * Utilisé uniquement lors d'un changement de langue.
     */
    retraduireOptions(options){

        const langue = getLangue();

        options.forEach(option => {

            const bloc = this.form.querySelector(

                `[data-option-id="${option.id}"]`

            );

            if (!bloc) {

                return;

            }

            const titre = bloc.querySelector(".option-title");

            if (titre) {

                titre.textContent = champ(option.nom, langue);

            }

            switch (option.type) {

                case "select": {

                    const select = bloc.querySelector("select");

                    if (select) {

                        Array.from(select.options).forEach(opt => {

                            const choix = option.choix.find(
                                c => c.id === opt.value
                            );

                            if (choix) {

                                opt.textContent =
                                    `${champ(choix.libelle, langue)} (+${choix.prix})`;

                            }

                        });

                    }

                    break;

                }

                case "radio": {

                    const labels =
                        bloc.querySelectorAll(".form-check-label");

                    labels.forEach((label, index) => {

                        const choix = option.choix[index];

                        if (choix) {

                            label.textContent =
                                `${champ(choix.libelle, langue)} (+${choix.prix})`;

                        }

                    });

                    break;

                }

                case "checkbox": {

                    const label =
                        bloc.querySelector(".form-check-label");

                    if (label) {

                        label.textContent =
                            `${champ(option.nom, langue)} (+${option.prix})`;

                    }

                    break;

                }

                // "number" : le titre du groupe suffit, rien de plus
                // à traduire sur le champ lui-même.

            }

        });

    }

    /**************************************************************
     * SELECT
     **************************************************************/
    creerSelect(option){

        const langue = getLangue();

        const select = document.createElement("select");

        select.className = "form-select";

        select.id = option.id;

        option.choix.forEach(choix=>{

            const opt = document.createElement("option");

            opt.value = choix.id;

            opt.textContent =
                `${champ(choix.libelle, langue)} (+${choix.prix})`;

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

        const langue = getLangue();

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
                `${champ(choix.libelle, langue)} (+${choix.prix})`;

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

        const langue = getLangue();

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
            `${champ(option.nom, langue)} (+${option.prix})`;

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

                case "select": {

                    const select =
                        document.getElementById(option.id);

                    const valeurParDefaut =
                        option.valeurDefaut !== undefined
                            ? option.valeurDefaut
                            : (option.choix && option.choix[0]
                                ? option.choix[0].id
                                : null);

                    if (valeurParDefaut !== null) {

                        select.value = valeurParDefaut;

                    }

                    break;

                }

                case "checkbox":

                    document.getElementById(option.id).checked=
                        option.valeurDefaut || false;

                    break;

                case "number":

                    document.getElementById(option.id).value=
                        option.valeurDefaut || option.minimum || 1;

                    break;

                case "radio": {

                    const radios=document.getElementsByName(option.id);

                    if(radios.length){

                        let radioParDefaut = null;

                        if (option.valeurDefaut !== undefined) {

                            radioParDefaut = Array.from(radios).find(
                                radio => radio.value === option.valeurDefaut
                            );

                        }

                        (radioParDefaut || radios[0]).checked = true;

                    }

                    break;

                }

            }

        });

    }

}
