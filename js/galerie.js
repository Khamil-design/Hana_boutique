/*****************************************************************
 * galerie.js
 * Galerie professionnelle
 *****************************************************************/
import Zoom from "./zoom.js";
export default class Galerie {

    constructor() {

        this.images = [];
        this.index = 0;
        this.nomProduit = "";

        this.image = document.getElementById("productImage");
        this.backdrop = document.getElementById("productImageBackdrop");

        this.container = this.image.closest(".gallery-viewer");
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

    initialiser(images, nomProduit = "") {

        this.images = images;

        this.index = 0;

        this.nomProduit = nomProduit;

        this.afficher();

        this.genererMiniatures();

    }

    /**
     * Met à jour uniquement le nom du produit utilisé dans les
     * textes alt (accessibilité), sans changer la photo affichée
     * ni l'index en cours. Utilisé lors d'un changement de langue.
     */
    mettreAJourNom(nomProduit) {

        this.nomProduit = nomProduit;

        if (this.images.length) {

            this.image.alt = `${this.nomProduit} — vue ${this.index + 1} sur ${this.images.length}`;

        }

        this.genererMiniatures();

    }

afficher() {

    const DUREE_FONDU = 280; // ms — doit correspondre à la transition CSS de #productImage

    // Disparition en fondu
    this.image.style.opacity = 0;

    // Changement de l'image une fois le fondu de sortie terminé
    setTimeout(() => {

        this.image.src = this.images[this.index];

        if (this.backdrop) {
            this.backdrop.style.backgroundImage = `url("${this.images[this.index]}")`;
        }

        this.image.alt = this.nomProduit
            ? `${this.nomProduit} — vue ${this.index + 1} sur ${this.images.length}`
            : `Vue ${this.index + 1} sur ${this.images.length}`;

        // Force le navigateur à prendre en compte le opacity:0
        // avant de relancer la transition vers opacity:1 — sans
        // ça, la réapparition peut sauter directement à 1 sans
        // animation (notamment quand l'image vient du cache).
        void this.image.offsetWidth;

        this.image.style.opacity = 1;

    }, DUREE_FONDU);

    // Photo manquante ou cassée : on affiche un visuel de secours
    // plutôt que l'icône d'image cassée du navigateur
    this.image.onerror = () => {

        this.image.onerror = null;

        this.image.src = this.imageIndisponible();

        if (this.backdrop) {
            this.backdrop.style.backgroundImage = "none";
        }

        this.image.style.opacity = 1;

    };

}

    /**
     * Petit visuel de secours (SVG), affiché quand une photo
     * est introuvable ou pas encore mise en ligne
     */
    imageIndisponible() {

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
                <rect width="400" height="500" fill="#17151A"/>
                <rect x="20" y="20" width="360" height="460"
                    fill="none" stroke="#8C6D2F" stroke-width="2"
                    stroke-dasharray="8 6"/>
                <g stroke="#C6A15B" stroke-width="2" fill="none"
                    stroke-linecap="round" stroke-linejoin="round">
                    <rect x="140" y="190" width="120" height="90" rx="4"/>
                    <circle cx="165" cy="215" r="8"/>
                    <path d="M140 260 L185 225 L210 250 L235 230 L260 260"/>
                </g>
                <text x="200" y="330" font-family="sans-serif"
                    font-size="16" fill="#A79E93" text-anchor="middle">
                    Photo à venir
                </text>
            </svg>
        `;

        return "data:image/svg+xml;utf8," + encodeURIComponent(svg);

    }


    genererMiniatures() {

        this.thumbnails.innerHTML = "";

        this.images.forEach((img, index) => {

            const miniature =
                document.createElement("img");

            miniature.src = img;

            miniature.loading = "lazy";

            miniature.alt = this.nomProduit
                ? `${this.nomProduit} — miniature ${index + 1}`
                : `Miniature ${index + 1}`;

            miniature.onerror = () => {

                miniature.onerror = null;

                miniature.src = this.imageIndisponible();

            };

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
