/*****************************************************************
 * accueil.js
 * Page d'accueil Hana Boutique
 *****************************************************************/

import { t, getLangue, setLangue, champ } from "./i18n.js";
import { initialiserTheme } from "./theme.js";

class PageAccueil {

    constructor() {
        this.catalogue = null;
        this.genreActif = "homme";
        this.variantesFemme = null;
    }

    async demarrer() {

        try {

            // Thème
            initialiserTheme();

            // Langue
            this.appliquerLangue(getLangue());
            this.ecouterLangue();

            // Catalogue
            this.catalogue = await this.chargerCatalogue();

            // Genre demandé via l'URL (ex: lien retour depuis le configurateur)
            const params = new URLSearchParams(window.location.search);
            const genreDemande = params.get("genre");
            if (genreDemande === "homme" || genreDemande === "femme") {
                this.genreActif = genreDemande;
            }

            this.ecouterOngletsGenre();
            this.appliquerOngletGenreActif();
            this.afficherProduits();

            // Aperçu aléatoire de la collection Femme
            this.afficherApercuAleatoire();

            // Footer année
            this.mettreAJourFooter();

        }
        catch (erreur) {
            console.error("Accueil :", erreur);
        }

    }

    /**************************************************************
     * Langue
     **************************************************************/
    appliquerLangue(langue) {

        const html = document.documentElement;
        html.lang = langue;
        html.dir = langue === "ar" ? "rtl" : "ltr";

        // Bootstrap RTL
        const bootstrapCss = document.getElementById("bootstrapCss");
        if (bootstrapCss) {
            bootstrapCss.href = langue === "ar"
                ? "https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.rtl.min.css"
                : "https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css";
        }

        // data-i18n
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const cle = el.dataset.i18n;
            if (traductionsAccueil[langue] && traductionsAccueil[langue][cle]) {
                el.textContent = traductionsAccueil[langue][cle];
            }
        });

        // Bouton langue
        const btnLangue = document.getElementById("btnLangue");
        if (btnLangue) {
            const autre = langue === "ar" ? "fr" : "ar";
            btnLangue.textContent = autre === "ar" ? "العربية" : "Français";
        }

        // Retraduire les produits si déjà affichés
        if (this.catalogue) {
            this.afficherProduits();
        }

        // Les libellés de l'aperçu (nom produit, couleur) sont mémorisés
        // dans la langue où ils ont été construits : on invalide le
        // cache pour les reconstruire dans la nouvelle langue.
        this.variantesFemme = null;
        this.afficherApercuAleatoire();

    }

    ecouterLangue() {
        const btn = document.getElementById("btnLangue");
        if (!btn) return;
        btn.addEventListener("click", () => {
            const nouvelle = getLangue() === "ar" ? "fr" : "ar";
            setLangue(nouvelle);
            this.appliquerLangue(nouvelle);
        });
    }

    /**************************************************************
     * Onglets Homme / Femme
     **************************************************************/
    ecouterOngletsGenre() {
        const onglets = document.querySelectorAll(".genre-tab");
        onglets.forEach(onglet => {
            onglet.addEventListener("click", () => {
                this.genreActif = onglet.dataset.genre;
                this.appliquerOngletGenreActif();
                this.afficherProduits();
            });
        });
    }

    appliquerOngletGenreActif() {
        document.querySelectorAll(".genre-tab").forEach(onglet => {
            const actif = onglet.dataset.genre === this.genreActif;
            onglet.classList.toggle("active", actif);
            onglet.setAttribute("aria-selected", actif ? "true" : "false");
        });
    }

    /**************************************************************
     * Catalogue
     **************************************************************/
    async chargerCatalogue() {
        const reponse = await fetch("data/catalogue.json");
        if (!reponse.ok) throw new Error("Impossible de charger le catalogue.");
        return await reponse.json();
    }

    /**************************************************************
     * Aperçu aléatoire de la collection Femme
     **************************************************************/

    /**
     * Construit la liste de toutes les "variantes" (une par dossier
     * de photos réel) pour les produits femme du catalogue :
     * une couleur = une variante, et pour la jupe (qui dépend de la
     * longueur ET de la couleur), chaque combinaison compte comme
     * une variante à part entière.
     */
    async chargerVariantesFemme() {

        if (this.variantesFemme) {
            return this.variantesFemme;
        }

        if (!this.catalogue) {
            return [];
        }

        const produitsFemme = this.catalogue.produits.filter(
            p => p.genre === "femme"
        );

        const langue = getLangue();
        const variantes = [];

        for (const produitCatalogue of produitsFemme) {

            try {

                const reponse = await fetch(`data/produits/${produitCatalogue.fichier}`);
                if (!reponse.ok) continue;

                const detail = await reponse.json();
                const nom = champ(produitCatalogue.nom, langue);

                if (detail.images.parCombinaison && Array.isArray(detail.images.dependDe)) {

                    // Cas à double dépendance (ex: jupe → longueur + couleur)
                    Object.entries(detail.images.parCombinaison).forEach(([cle, images]) => {

                        if (!images.length) return;

                        const valeurs = cle.split("|");
                        const parametres = {};
                        detail.images.dependDe.forEach((idOption, index) => {
                            parametres[idOption] = valeurs[index];
                        });

                        const optionCouleur = (detail.options.find(o => o.id === "couleur") || {}).choix || [];
                        const choixCouleur = optionCouleur.find(c => c.id === parametres.couleur);

                        variantes.push({
                            fichier: produitCatalogue.fichier,
                            genre: "femme",
                            nomProduit: nom,
                            image: images[0],
                            couleur: parametres.couleur,
                            longueur: parametres.longueur,
                            libelleCouleur: choixCouleur ? champ(choixCouleur.libelle, langue) : parametres.couleur,
                            codeCouleur: choixCouleur ? choixCouleur.codeCouleur : "#999"
                        });

                    });

                } else if (detail.images.parCouleur) {

                    // Cas simple : une variante par couleur
                    const optionCouleur = (detail.options.find(o => o.id === "couleur") || {}).choix || [];

                    Object.entries(detail.images.parCouleur).forEach(([idCouleur, images]) => {

                        if (!images.length) return;

                        const choixCouleur = optionCouleur.find(c => c.id === idCouleur);

                        variantes.push({
                            fichier: produitCatalogue.fichier,
                            genre: "femme",
                            nomProduit: nom,
                            image: images[0],
                            couleur: idCouleur,
                            longueur: null,
                            libelleCouleur: choixCouleur ? champ(choixCouleur.libelle, langue) : idCouleur,
                            codeCouleur: choixCouleur ? choixCouleur.codeCouleur : "#999"
                        });

                    });

                }

            } catch (erreur) {
                console.error(`Aperçu — impossible de charger ${produitCatalogue.fichier}`, erreur);
            }

        }

        this.variantesFemme = variantes;

        return variantes;

    }

    /**
     * Affiche 3 variantes tirées au hasard (jamais deux fois le
     * même dossier de photos, mais un même produit peut apparaître
     * deux fois avec une couleur/longueur différente).
     */
    async afficherApercuAleatoire() {

        const grid = document.getElementById("apercuGrid");
        if (!grid) return;

        const variantes = await this.chargerVariantesFemme();
        if (!variantes.length) return;

        // Mélange (Fisher-Yates) puis on prend les 3 premières
        const melange = [...variantes];
        for (let i = melange.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [melange[i], melange[j]] = [melange[j], melange[i]];
        }
        const selection = melange.slice(0, Math.min(3, melange.length));

        grid.innerHTML = "";

        selection.forEach(variante => {

            const col = document.createElement("div");
            col.className = "col-md-4";

            const lienConfigurateur =
                `configurateur.html?produit=${encodeURIComponent(variante.fichier)}` +
                `&genre=femme&couleur=${encodeURIComponent(variante.couleur)}` +
                (variante.longueur ? `&longueur=${encodeURIComponent(variante.longueur)}` : "");

            col.innerHTML = `
                <a href="${lienConfigurateur}" class="apercu-card text-decoration-none">
                    <div class="apercu-image-wrapper">
                        <div class="apercu-image-backdrop" style="background-image:url('${variante.image}')" aria-hidden="true"></div>
                        <img
                            src="${variante.image}"
                            alt="${variante.nomProduit} — ${variante.libelleCouleur}"
                            class="apercu-image"
                            loading="lazy">
                    </div>
                    <div class="apercu-legende">
                        <span class="apercu-nom">${variante.nomProduit}</span>
                        <span class="apercu-couleur">
                            <span class="apercu-pastille" style="background:${variante.codeCouleur}"></span>
                            ${variante.libelleCouleur}
                        </span>
                    </div>
                </a>
            `;

            grid.appendChild(col);

        });

    }

    /**************************************************************
     * Affichage des produits
     **************************************************************/
    async afficherProduits() {

        const grid = document.getElementById("produitsGrid");
        if (!grid || !this.catalogue) return;

        const langue = getLangue();

        grid.innerHTML = "";

        const produitsFiltres = this.catalogue.produits.filter(
            p => (p.genre || "homme") === this.genreActif
        );

        if (!produitsFiltres.length) {
            grid.innerHTML = `<p class="text-center produit-desc">${langue === "ar" ? "لا توجد منتجات بعد في هذه الفئة." : "Aucun produit disponible dans cette catégorie pour le moment."}</p>`;
            return;
        }

        for (const produit of produitsFiltres) {

            const col = document.createElement("div");
            col.className = "col-md-6 col-lg-4";

            const nom = champ(produit.nom, langue);
            const description = champ(produit.description, langue);
            const prixBase = produit.prixBase || 0;
            const devise = produit.devise || "DH";

            // Image de preview : première image du produit
            let imagePreview = "images/placeholder.jpg";
            if (produit.images) {
                if (produit.images.parCouleur) {
                    const premiereCouleur = Object.keys(produit.images.parCouleur)[0];
                    if (premiereCouleur && produit.images.parCouleur[premiereCouleur].length) {
                        imagePreview = produit.images.parCouleur[premiereCouleur][0];
                    }
                } else if (produit.images.principale) {
                    imagePreview = produit.images.principale;
                } else if (produit.images.galerie && produit.images.galerie.length) {
                    imagePreview = produit.images.galerie[0];
                }
            }

            col.innerHTML = `
                <a href="configurateur.html?produit=${encodeURIComponent(produit.fichier)}&genre=${encodeURIComponent(produit.genre || 'homme')}" class="produit-card">
                    <div class="produit-image-wrapper">
                        <div class="produit-image-backdrop" style="background-image:url('${imagePreview}')" aria-hidden="true"></div>
                        <img
                            src="${imagePreview}"
                            alt="${nom}"
                            class="produit-image"
                            loading="lazy"
                            onerror="this.src='images/placeholder.jpg'">
                        <div class="produit-overlay">
                            <span class="btn-produit">
                                <i class="bi bi-sliders me-2"></i>${langue === "ar" ? "تخصيص" : "Personnaliser"}
                            </span>
                        </div>
                    </div>
                    <div class="produit-info">
                        <h5 class="produit-nom">${nom}</h5>
                        <p class="produit-desc">${description}</p>
                        <div class="produit-prix">
                            <span class="produit-prix-base">${prixBase} ${devise}</span>
                            <span class="produit-prix-label">${langue === "ar" ? "يبدأ من" : "À partir de"}</span>
                        </div>
                    </div>
                </a>
            `;

            grid.appendChild(col);
        }

    }

    mettreAJourFooter() {
        const footer = document.getElementById("footerText");
        if (footer) {
            const annee = new Date().getFullYear();
            const langue = getLangue();
            footer.textContent = langue === "ar"
                ? `هانا بوتيك — جميع الحقوق محفوظة © ${annee}`
                : `Hana Boutique — Tous droits réservés © ${annee}`;
        }
    }

}


/*****************************************************************
 * Traductions spécifiques à la page d'accueil
 *****************************************************************/

const traductionsAccueil = {
    fr: {
        slogan: "L'élégance sur-mesure",
        heroSubtitle: "Vêtements personnalisables pour homme et femme. Choisissez, configurez, commandez.",
        decouvrirCollection: "Découvrir la collection",
        nosProduits: "Nos produits",
        produitsSubtitle: "Chaque pièce est pensée pour s'adapter à votre style.",
        ongletHomme: "Homme",
        ongletFemme: "Femme",
        ongletEnfant: "Enfant",
        apercuTitre: "Un aperçu de la collection Femme",
        apercuSubtitle: "Trois pièces choisies au hasard à chaque visite.",
        pourquoiHana: "Pourquoi Hana ?",
        avantage1Titre: "Sur-mesure",
        avantage1Texte: "Chaque vêtement est configurable selon vos préférences : taille, couleur, matière et finitions.",
        avantage2Titre: "Qualité premium",
        avantage2Texte: "Des tissus soigneusement sélectionnés et une finition irréprochable pour un confort durable.",
        avantage3Titre: "Livraison rapide",
        avantage3Texte: "Livraison gratuite à Tanger sous 24–48h. Autres villes sur devis via WhatsApp.",
        avisTitre: "Ce que disent nos clients",
        avisSubtitle: "La confiance de nos clients à Tanger et ailleurs.",
        avis1Texte: "« La chemise est exactement comme configurée, finitions impeccables. Livraison rapide en plus ! »",
        avis2Texte: "« Premier achat sur-mesure et je ne suis pas déçue. Le pantalon tombe parfaitement. »",
        avis3Texte: "« Le configurateur est simple à utiliser et le contact WhatsApp très réactif. Je recommande. »",
        avis4Texte: "« Qualité au-dessus de mes attentes pour le prix. La broderie personnalisée est un vrai plus. »",
        ctaTitre: "Prêt à créer votre style ?",
        ctaSubtitle: "Configurez votre pantalon ou votre chemise en quelques clics et commandez directement via WhatsApp.",
        ctaBouton: "Configurer mon produit",
        footerDesc: "Vêtements personnalisables pour homme et femme. Qualité, élégance et sur-mesure.",
        footerLiens: "Liens",
        footerContact: "Contact",
        accueil: "Accueil",
        configurateur: "Configurateur",
        contactWhatsApp: "Contact WhatsApp",
    },
    ar: {
        slogan: "أناقة حسب الطلب",
        heroSubtitle: "ملابس قابلة للتخصيص للرجال والنساء. اختر، خصص، اطلب.",
        decouvrirCollection: "اكتشف المجموعة",
        nosProduits: "منتجاتنا",
        produitsSubtitle: "كل قطعة مصممة لتتناسب مع أسلوبك.",
        ongletHomme: "رجال",
        ongletFemme: "نساء",
        ongletEnfant: "أطفال",
        apercuTitre: "لمحة عن مجموعة النساء",
        apercuSubtitle: "ثلاث قطع مختارة عشوائيًا في كل زيارة.",
        pourquoiHana: "لماذا هانا؟",
        avantage1Titre: "حسب الطلب",
        avantage1Texte: "كل قطعة ملابس قابلة للتخصيص حسب رغبتك: المقاس، اللون، الخامة والتفاصيل.",
        avantage2Titre: "جودة ممتازة",
        avantage2Texte: "أقمشة منتقاة بعناية وتشطيب لا تشوبه شائبة لراحة تدوم.",
        avantage3Titre: "توصيل سريع",
        avantage3Texte: "توصيل مجاني في طنجة خلال 24–48 ساعة. مدن أخرى حسب الطلب عبر واتساب.",
        avisTitre: "ماذا يقول عملاؤنا",
        avisSubtitle: "ثقة عملائنا في طنجة وخارجها.",
        avis1Texte: "«القميص مطابق تمامًا لما تم تخصيصه، تشطيب ممتاز. والتوصيل كان سريعًا أيضًا!»",
        avis2Texte: "«أول طلبية حسب الطلب ولم أُخيّب. البنطلون يناسبني تمامًا.»",
        avis3Texte: "«أداة التخصيص سهلة الاستخدام والتواصل عبر واتساب سريع جدًا. أنصح به.»",
        avis4Texte: "«جودة تفوق توقعاتي مقارنة بالسعر. التطريز المخصص لمسة إضافية رائعة.»",
        ctaTitre: "مستعد لابتكار أسلوبك؟",
        ctaSubtitle: "خصص بنطلونك أو قميصك في بضع نقرات واطلب مباشرة عبر واتساب.",
        ctaBouton: "تخصيص منتجي",
        footerDesc: "ملابس قابلة للتخصيص للرجال والنساء. الجودة، الأناقة والتفصيل.",
        footerLiens: "روابط",
        footerContact: "تواصل",
        accueil: "الرئيسية",
        configurateur: "المُهيئ",
        contactWhatsApp: "تواصل عبر واتساب",
    }
};


/*************************************************************
 * Lancement
 *************************************************************/

document.addEventListener("DOMContentLoaded", () => {
    const page = new PageAccueil();
    page.demarrer();
});
