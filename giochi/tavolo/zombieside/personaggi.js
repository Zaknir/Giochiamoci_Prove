// ==========================================
// DATI CENTRALIZZATI DEI PERSONAGGI (Zombieside)
// ==========================================
// I testi (nome, descrizione, abilità) vivono in un unico file: personaggi.json.
// Sia la scheda "overview" (anteprima) sia la scheda "card" (gioco) leggono da qui,

let personaggiCache = null;

// Testo mostrato quando un livello offre più abilità tra cui scegliere
const TESTO_SCELTA_MULTIPLA = 'Scegli una tra:';

async function caricaPersonaggi() {
  if (!personaggiCache) {
    const risposta = await fetch('personaggi.json');
    personaggiCache = await risposta.json();
  }
  return personaggiCache;
}

// ==========================================
// SCHEDA "OVERVIEW" (anteprima/riepilogo, sola lettura)
// ==========================================
class PersonaggioOverview extends HTMLElement {
  async connectedCallback() {
    const personaggi = await caricaPersonaggi();
    const p = personaggi[this.dataset.id];
    if (!p) {
      this.innerHTML = `<p>Personaggio "${this.dataset.id}" non trovato.</p>`;
      return;
    }

    this.innerHTML = `
      <h1>${p.nome}: riepilogo scheda</h1>
      <p>${p.descrizione}</p>
      ${p.livelli.map(l => `
        <h2>${l.livello}</h2>
        ${l.sceltaMultipla ? `<p>Abilità: ${TESTO_SCELTA_MULTIPLA}</p>` : `<p>Abilità: </p>`}
        <ul>
          ${l.abilita.map(voce => `<li>${voce}</li>`).join('')}
        </ul>
      `).join('')}
      <h2>Condizioni di salute:</h2>
      <p>${p.salute}</p>
      <ul>
        <a href="${p.nome}_card.html">Scegli di giocare con ${p.nome}</a>
      </ul>
    `;
  }
}

// ==========================================
// SCHEDA "CARD" (interattiva, in gioco)
// ==========================================
class PersonaggioCard extends HTMLElement {
  async connectedCallback() {
    const personaggi = await caricaPersonaggi();
    const p = personaggi[this.dataset.id];
    if (!p) {
      this.innerHTML = `<p>Personaggio "${this.dataset.id}" non trovato.</p>`;
      return;
    }

    // Punti ferita salvati in localStorage, così restano invariati ricaricando la pagina
    const chiaveHp = `zombieside_hp_${this.dataset.id}`;
    let hpAttuali = parseInt(localStorage.getItem(chiaveHp), 10);
    if (isNaN(hpAttuali)) hpAttuali = p.hpMax;

    // zombie uccisi salvati in localStorage, così restano invariati ricaricando la pagina
    const chiaveZombie = `zombieside_killeD_zombie_${this.dataset.id}`;
    let zombieAttuali = parseInt(localStorage.getItem(chiaveZombie), 10);
    if (isNaN(zombieAttuali)) zombieAttuali = 0;

    // Il livello attuale è determinato dal numero di zombie uccisi: si passa al
    // livello quando zombieAttuali raggiunge il suo "zombieCounter".
    const livelloCorrente = () => {
      let corrente = null;
      p.livelli.forEach(l => {
        if (zombieAttuali >= l.zombieCounter) corrente = l;
      });
      return corrente ? corrente.livello : 'nessuno';
    };

    this.innerHTML = `
      <h1>${p.nome.toUpperCase()}</h1>

      <div class="game-area" role="region" aria-label="area di gioco">
        <div class="status-summary" aria-live="polite">
            <p id="livello-riga">Livello attuale: ${livelloCorrente()}</p>
            <p id="hp-riga">Punti ferita: ${hpAttuali} / ${p.hpMax}</p>
            <p id="zombie-riga">Zombie uccisi: ${zombieAttuali}</p>
        </div>
      
        <div class="hp-counter">
            <button type="button" data-azione-hp="meno" aria-label="Rimuovi punto ferita">−</button>
            <span id="hp-attuali">${hpAttuali}</span> / ${p.hpMax} punti ferita
            <button type="button" data-azione-hp="piu" aria-label="Aggiungi punto ferita">+</button>
        </div>
        <div class="zombie-counter">
            <button type="button" data-azione-zombie="meno" aria-label="Rimuovi zombie">−</button>
            <span id="zombie-attuali">${zombieAttuali}</span> zombie uccisi
            <button type="button" data-azione-zombie="piu" aria-label="Aggiungi zombie">+</button>
        </div>
        <br>
        
        <button type="button" data-azione-reset-all="piu" aria-label="resetta tutti i dati">+</button>
    </div>

      <h2>scheda di gioco:</h2>
      <p>${p.descrizione}</p>

      ${p.livelli.map(l => `
        <h3>${l.livello}</h3>
        <p class="nota-livello" data-soglia="${l.zombieCounter}">${zombieAttuali < l.zombieCounter ? 'Non hai ancora raggiunto questo livello.' : ''}</p>
        ${l.sceltaMultipla ? `<p>Abilità: ${TESTO_SCELTA_MULTIPLA}</p>` : `<p>Abilità: </p>`}
        <ul>
          ${l.abilita.map(voce => `<li>${voce}</li>`).join('')}
        </ul>
      `).join('')}
      <h3>Condizioni di salute:</h3>
      <p>${p.salute}</p>
    `;

    const spanHp = this.querySelector('#hp-attuali');
    const rigaHp = this.querySelector('#hp-riga');
    this.querySelectorAll('[data-azione-hp]').forEach(hpButton => {
      hpButton.addEventListener('click', () => {
        if (hpButton.dataset.azioneHp === 'piu' && hpAttuali < p.hpMax) hpAttuali++;
        if (hpButton.dataset.azioneHp === 'meno' && hpAttuali > 0) hpAttuali--;
        spanHp.textContent = hpAttuali;
        rigaHp.textContent = `Punti ferita: ${hpAttuali} / ${p.hpMax}`;
        localStorage.setItem(chiaveHp, hpAttuali);
      });
    });

    const spanZombie = this.querySelector('#zombie-attuali');
    const rigaZombie = this.querySelector('#zombie-riga');
    const rigaLivello = this.querySelector('#livello-riga');
    const noteLivelli = this.querySelectorAll('.nota-livello');
    const aggiornaNoteLivelli = () => {
      noteLivelli.forEach(nota => {
        const soglia = parseInt(nota.dataset.soglia, 10);
        nota.textContent = zombieAttuali < soglia ? 'Non hai ancora raggiunto questo livello.' : '';
      });
    };
    this.querySelectorAll('[data-azione-zombie]').forEach(zombieButton => {
      zombieButton.addEventListener('click', () => {
        if (zombieButton.dataset.azioneZombie === 'piu') zombieAttuali++;
        if (zombieButton.dataset.azioneZombie === 'meno' && zombieAttuali > 0) zombieAttuali--;
        spanZombie.textContent = zombieAttuali;
        rigaZombie.textContent = `Zombie uccisi: ${zombieAttuali}`;
        rigaLivello.textContent = `Livello attuale: ${livelloCorrente()}`;
        aggiornaNoteLivelli();
        localStorage.setItem(chiaveZombie, zombieAttuali);
      });
    });

    this.querySelectorAll('[data-azione-reset-all]').forEach(resetButton => {
      resetButton.addEventListener('click', () => {
        const confermato = window.confirm('Sei sicuro di voler resettare tutti i dati (punti ferita e zombie uccisi)?');
        if (!confermato) return;

        hpAttuali = p.hpMax;
        zombieAttuali = 0;

        spanHp.textContent = hpAttuali;
        rigaHp.textContent = `Punti ferita: ${hpAttuali} / ${p.hpMax}`;
        spanZombie.textContent = zombieAttuali;
        rigaZombie.textContent = `Zombie uccisi: ${zombieAttuali}`;
        rigaLivello.textContent = `Livello attuale: ${livelloCorrente()}`;
        aggiornaNoteLivelli();

        localStorage.setItem(chiaveHp, hpAttuali);
        localStorage.setItem(chiaveZombie, zombieAttuali);
      });
    });
  }
}

customElements.define('personaggio-overview', PersonaggioOverview);
customElements.define('personaggio-card', PersonaggioCard);
