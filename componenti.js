// ==========================================
// CONTROLLO AGGIORNAMENTO AUTOMATICO (CACHE)
// ==========================================
const VERSIONE_ATTUALE = '1.9'; 

function controllaVersioneComponente() {
  const versioneSalvata = localStorage.getItem('versione_componenti_sito');
  if (versioneSalvata !== VERSIONE_ATTUALE) {
    localStorage.setItem('versione_componenti_sito', VERSIONE_ATTUALE);
    window.location.reload(); 
  }
}
controllaVersioneComponente();


// ==========================================
// CALCOLO PERCORSO BASE PER GITHUB PAGES
// ==========================================
function getBasePath() {
  const path = window.location.pathname;
  const pathSegments = path.split('/').filter(Boolean);
  
  // Se siamo su GitHub Pages (username.github.io/nome-repo/), prende il nome della sottocartella
  if (window.location.hostname.endsWith('github.io') && pathSegments.length > 0) {
    return '/' + pathSegments[0] + '/';
  }
  return '/';
}

const BASE_URL = getBasePath();


// ==========================================
// DEFINIZIONE COMPONENTI
// ==========================================

// Definizione dell'Header (Titolo + Navigazione)
class HeaderSito extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <header id="top">
        <div class="header-main-box">
            
            <img src="${BASE_URL}logo_defcolori-sito.png" alt="Logo dell'associazione Giochiamoci! Un'illustrazione in stile fumetto con toni pastello che mostra due mani viola aperte verso l'alto per sorreggere diversi elementi ludici: un controller per videogiochi verde chiaro, carte da gioco gialle, un lucchetto azzurro con una chiave infilata (simbolo di escape room), un dado a venti facce rosa per giochi di ruolo e schede di gioco. In basso, la scritta in stampatello maiuscolo scuro 'GIOCHIAMOCI!'." class="logo">
            
            <div class="testi-header">
                <h1>Giochiamoci! APS</h1>
                <p class="motto">Perché anche giocare è un diritto di tutte!</p>
            </div>
    
        </div>

        <nav>
            <div class="home-link-box">
                <a href="${BASE_URL}index.html" id="home-link">Home</a>
            </div>
            <details>
                <summary>Chi siamo</summary>
                <ul class="menu-principale">
                    <li><a href="${BASE_URL}01_01_storia.html">Storia e valori</a></li>             
                    <li><a href="${BASE_URL}01_02_sostienici.html">Sostienici</a></li>
                    <li><a href="${BASE_URL}01_03_rete.html">Scopri la rete</a></li>
                </ul>
            </details>
        
            <details>
                <summary>Gioca con noi</summary>
                <ul id="gioca-con-noi">
                    <li><a href="${BASE_URL}02_01_escape.html">Escape Room</a></li>
                    <li><a href="${BASE_URL}02_02_tavolo.html">Giochi da Tavolo</a></li>
                    <li><a href="${BASE_URL}02_03_ruolo.html">Giochi di Ruolo</a></li> 
                </ul>
            </details>
        
            <details>
                <summary>Progetta Accessibile</summary>
                <ul id="progetta-accessibile">
                    <li><a href="${BASE_URL}03_01_accessibile.html">Capire l'accessibilità</a></li>
                    <li><a href="${BASE_URL}03_02_videogiochi.html">Videogiochi</a></li>
                    <li><a href="${BASE_URL}03_03_acc_tavolo.html">Giochi da tavolo e di ruolo</a></li>    
                </ul>
            </details>
            <div class="home-link-box">
                <a href="${BASE_URL}01_04_contatti.html" id="home-link">Contattaci</a>
            </div>
        </nav>
    </header>
    `;
  }
}

// Definizione del Footer
class FooterSito extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <footer class="site-footer">
            <h2>Dati associativi</h2>
            <ul>
                <li><b>Associazione Giochiamoci! APS</b></li>
                <li><b>Sede legale:</b> Via Federico de Roberto 5, 20152 Milano (MI)</li>
                <li><b>Indirizzo e-mail:</b> <a href="mailto:info@giochiamoci.it">info@giochiamoci.it</a></li>
                <li><b>Codice Fiscale:</b> 14228970969</li>
                <li><b>Partita IVA:</b> 14228970969</li>
                <li><b>Codice RUNTS:</b> 155547</li>
                <li><b>Data iscrizione al RUNTS:</b> 07/07/2025</li>
                <li><a href="${BASE_URL}00_01_privacy.html">Privacy Policy</a></li>
                <li><a href="${BASE_URL}00_02_cookies.html">Cookie Policy</a></li>
                <li><b>Tutti i diritti riservati</b></li>
            </ul>
        </footer>
    `;
  }
}

// Registrazione dei tag personalizzati
customElements.define('header-sito', HeaderSito);
customElements.define('footer-sito', FooterSito);
