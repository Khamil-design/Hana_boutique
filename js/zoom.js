/*****************************************************************
 * zoom.js
 * Zoom professionnel sur l'image du produit
 *****************************************************************/

export default class Zoom {

    constructor(image) {

        this.image = image;

        this.activer();

    }

    activer() {

        // Animation fluide

        this.image.style.transition =
            "transform .15s ease";

        this.image.style.transformOrigin =
            "center center";

        // Entrée de la souris

        this.image.addEventListener(

            "mouseenter",

            () => {

                this.image.style.cursor = "zoom-in";

            }

        );

        // Déplacement

        this.image.addEventListener(

            "mousemove",

            (e) => {

                const rect =
                    this.image.getBoundingClientRect();

                const x =
                    ((e.clientX - rect.left) / rect.width) * 100;

                const y =
                    ((e.clientY - rect.top) / rect.height) * 100;

                this.image.style.transformOrigin =
                    `${x}% ${y}%`;

                this.image.style.transform =
                    "scale(2)";

            }

        );

        // Sortie

        this.image.addEventListener(

            "mouseleave",

            () => {

                this.image.style.transformOrigin =
                    "center center";

                this.image.style.transform =
                    "scale(1)";

            }

        );

    }

}
