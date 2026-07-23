/********************************************************************
 * galerie.js
 * Galerie professionnelle de produits
 ********************************************************************/

export default class Galerie {

    constructor() {

        this.images = [];
        this.index = 0;

        this.viewer = document.getElementById("productImage");
        this.container = document.getElementById("galleryThumbs");

        this.btnPrev = document.getElementById("galleryPrev");
        this.btnNext = document.getElementById("galleryNext");

    }

    /**************************************************************
     * Initialisation
     **************************************************************/
    initialiser(images) {

        this.images = images || [];
        this.index = 0;

        if (!this.images.length)
            return;

        this.creerMiniatures();

        this.afficherImage(0);

        this.ecouter();

    }

    /**************************************************************
     * Création des miniatures
     **************************************************************/
    creerMiniatures() {

        if (!this.container)
            return;

        this.container.innerHTML = "";

        this.images.forEach((image, index) => {

            const miniature = document.createElement("img");

            miniature.src = image;
            miniature.className = "gallery-thumb";

            if (index === 0)
                miniature.classList.add("active");

            miniature.addEventListener("click", () => {

                this.afficherImage(index);

            });

            this.container.appendChild(miniature);

        });

    }

    /**************************************************************
     * Affichage
     **************************************************************/
    afficherImage(index) {

        if (!this.images.length)
            return;

        this.index = index;

        this.viewer.src = this.images[index];

        this.mettreAJourMiniatures();

    }

    /**************************************************************
     * Miniature active
     **************************************************************/
    mettreAJourMiniatures() {

        if (!this.container)
            return;

        [...this.container.children].forEach((img, index) => {

            img.classList.toggle(
                "active",
                index === this.index
            );

        });

    }

    /**************************************************************
     * Image suivante
     **************************************************************/
    suivante() {

        this.index++;

        if (this.index >= this.images.length)
            this.index = 0;

        this.afficherImage(this.index);

    }

    /**************************************************************
     * Image précédente
     **************************************************************/
    precedente() {

        this.index--;

        if (this.index < 0)
            this.index = this.images.length - 1;

        this.afficherImage(this.index);

    }

    /**************************************************************
     * Evènements
     **************************************************************/
    ecouter() {

        if (this.btnPrev) {

            this.btnPrev.onclick = () => {

                this.precedente();

            };

        }

        if (this.btnNext) {

            this.btnNext.onclick = () => {

                this.suivante();

            };

        }

        document.addEventListener("keydown", (e) => {

            if (e.key === "ArrowLeft")
                this.precedente();

            if (e.key === "ArrowRight")
                this.suivante();

        });

    }

}