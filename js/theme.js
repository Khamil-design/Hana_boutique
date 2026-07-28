/*****************************************************************
 * theme.js
 * Gestion du thème clair / sombre
 *****************************************************************/

const CLE_THEME = "hana_theme";
const THEME_SOMBRE = "dark";
const THEME_CLAIR = "light";
const THEME_PAR_DEFAUT = THEME_SOMBRE;

/**
 * Renvoie le thème actuellement enregistré (ou le défaut)
 */
export function getTheme() {

    try {

        const enregistre = localStorage.getItem(CLE_THEME);

        if (enregistre === THEME_CLAIR || enregistre === THEME_SOMBRE) {
            return enregistre;
        }

    }
    catch (erreur) {
        console.warn("Theme : impossible de lire le thème enregistré.", erreur);
    }

    return THEME_PAR_DEFAUT;

}

/**
 * Enregistre le thème choisi
 */
export function setTheme(theme) {

    if (theme !== THEME_CLAIR && theme !== THEME_SOMBRE) {
        return;
    }

    try {
        localStorage.setItem(CLE_THEME, theme);
    }
    catch (erreur) {
        console.warn("Theme : impossible d'enregistrer le thème.", erreur);
    }

}

/**
 * Applique le thème au document (ajoute data-theme sur <html>)
 */
export function appliquerTheme(theme) {

    const html = document.documentElement;

    html.setAttribute("data-theme", theme);

    // Met à jour l'icône du bouton toggle
    const btnToggle = document.getElementById("btnTheme");

    if (btnToggle) {

        const icone = btnToggle.querySelector("i");

        if (icone) {
            icone.className = theme === THEME_CLAIR
                ? "bi bi-moon-stars-fill"
                : "bi bi-sun-fill";
        }

        btnToggle.setAttribute(
            "aria-label",
            theme === THEME_CLAIR ? "Passer au thème sombre" : "Passer au thème clair"
        );

    }

}

/**
 * Bascule entre clair et sombre
 */
export function basculerTheme() {

    const actuel = getTheme();
    const nouveau = actuel === THEME_CLAIR ? THEME_SOMBRE : THEME_CLAIR;

    setTheme(nouveau);
    appliquerTheme(nouveau);

    return nouveau;

}

/**
 * Écoute le clic sur le bouton toggle
 */
export function ecouterToggleTheme() {

    const btnToggle = document.getElementById("btnTheme");

    if (!btnToggle) return;

    btnToggle.addEventListener("click", () => {
        basculerTheme();
    });

}

/**
 * Initialisation complète (à appeler au démarrage de l'app)
 */
export function initialiserTheme() {

    const theme = getTheme();
    appliquerTheme(theme);
    ecouterToggleTheme();

}
