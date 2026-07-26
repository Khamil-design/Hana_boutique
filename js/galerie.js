/*****************************************************************
 * galerie.js
 * Galerie professionnelle
 *****************************************************************/
import Zoom from "./zoom.js";
export default class Galerie {

    constructor() {

        this.images = [];
        this.index = 0;

        this.image = document.getElementById("productImage");

        this.container = this.image.parentElement;
        this.zoom = new Zoom(this.image);

        this.creerInterface();
        this.ecouterNavigation();

    }

    /**************************************************************
     * Boutons ❮ / ❯
     **************************************************************/
    ecouterNavigation() {

        const boutonPrecedent =
            document.getElementById("galleryPrev");

        const boutonSuivant =
            document.getElementById("galleryNext");

        if (boutonPrecedent) {

            boutonPrecedent.addEventListener("click", () => {

                this.precedent();

            });

        }

        if (boutonSuivant) {

            boutonSuivant.addEventListener("click", () => {

                this.suivant();

            });

        }

    }

    /**
     * Image précédente (revient à la dernière si on est sur la première)
     */
    precedent() {

        if (!this.images.length) return;

        this.index =
            (this.index - 1 + this.images.length) % this.images.length;

        this.afficher();
        this.genererMiniatures();

    }

    /**
     * Image suivante (revient à la première si on est sur la dernière)
     */
    suivant() {

        if (!this.images.length) return;

        this.index =
            (this.index + 1) % this.images.length;

        this.afficher();
        this.genererMiniatures();

    }

    creerInterface() {

        // Barre des miniatures

        this.thumbnails = document.createElement("div");

        this.thumbnails.className =
            "d-flex justify-content-center gap-2 mt-3 flex-wrap";

        this.container.appendChild(this.thumbnails);

    }

    initialiser(images) {

        this.images = images;

        this.index = 0;

        this.afficher();

        this.genererMiniatures();

    }

afficher() {

    // Disparition
    this.image.style.opacity = 0;

    // Changement de l'image
    setTimeout(() => {

        this.image.src = this.images[this.index];

    }, 180);

    // Réapparition
    this.image.onload = () => {

        this.image.style.opacity = 1;

    };

}


    genererMiniatures() {

        this.thumbnails.innerHTML = "";

        this.images.forEach((img, index) => {

            const miniature =
                document.createElement("img");

            miniature.src = img;

            miniature.style.width = "70px";
            miniature.style.height = "70px";
            miniature.style.objectFit = "cover";
            miniature.style.cursor = "pointer";
            miniature.style.borderRadius = "6px";

            miniature.className =
                index === this.index
                ? "border border-success border-3"
                : "border";

            miniature.addEventListener("click", () => {

                this.index = index;

                this.afficher();

                this.genererMiniatures();

            });

            this.thumbnails.appendChild(miniature);

        });

    }

}
