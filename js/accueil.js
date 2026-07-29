/*****************************************************************
 * accueil.js
 * Page d'accueil Hana Boutique
 *****************************************************************/

import { t, getLangue, setLangue, champ } from "./i18n.js";
import { initialiserTheme } from "./theme.js";

class PageAccueil {

    constructor() {
        this.catalogue = null;
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
            this.afficherProduits();

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
     * Catalogue
     **************************************************************/
    async chargerCatalogue() {
        const reponse = await fetch("data/catalogue.json");
        if (!reponse.ok) throw new Error("Impossible de charger le catalogue.");
        return await reponse.json();
    }

    /**************************************************************
     * Affichage des produits
     **************************************************************/
    async afficherProduits() {

        const grid = document.getElementById("produitsGrid");
        if (!grid || !this.catalogue) return;

        const langue = getLangue();

        grid.innerHTML = "";

        for (const produit of this.catalogue.produits) {

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
                <div class="produit-card">
                    <div class="produit-image-wrapper">
                        <img
                            src="${imagePreview}"
                            alt="${nom}"
                            class="produit-image"
                            loading="lazy"
                            onerror="this.src='images/placeholder.jpg'">
                        <div class="produit-overlay">
                            <a href="configurateur.html?produit=${encodeURIComponent(produit.fichier)}" class="btn btn-produit">
                                <i class="bi bi-sliders me-2"></i>${langue === "ar" ? "تخصيص" : "Personnaliser"}
                            </a>
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
                </div>
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
        heroSubtitle: "Pantalons et chemises personnalisables pour homme. Choisissez, configurez, commandez.",
        decouvrirCollection: "Découvrir la collection",
        nosProduits: "Nos produits",
        produitsSubtitle: "Chaque pièce est pensée pour s'adapter à votre style.",
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
        footerDesc: "Pantalons et chemises personnalisables pour homme. Qualité, élégance et sur-mesure.",
        footerLiens: "Liens",
        footerContact: "Contact",
        accueil: "Accueil",
        configurateur: "Configurateur",
        contactWhatsApp: "Contact WhatsApp",
    },
    ar: {
        slogan: "أناقة حسب الطلب",
        heroSubtitle: "بناطيل وقمصان رجالية قابلة للتخصيص. اختر، خصص، اطلب.",
        decouvrirCollection: "اكتشف المجموعة",
        nosProduits: "منتجاتنا",
        produitsSubtitle: "كل قطعة مصممة لتتناسب مع أسلوبك.",
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
        footerDesc: "بناطيل وقمصان رجالية قابلة للتخصيص. الجودة، الأناقة والتفصيل.",
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
