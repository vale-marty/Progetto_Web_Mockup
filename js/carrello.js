function renderCarrello() {
    const container = document.getElementById('lista-carrello');
    const carrello = getCarrello();
    
    // Controlliamo il tipo di utente (scuola, privato o non loggato)
    const userType = localStorage.getItem('userType');
    const isScuola = userType === 'scuola';
    
    // Gestione visibilità riga noleggio nel riepilogo: 
    // SOLO la scuola vede la riga dei noleggi.
    const rowNoleggio = document.getElementById('row-noleggio');
    if (rowNoleggio) {
        rowNoleggio.style.setProperty('display', isScuola ? 'flex' : 'none', 'important');
    }

    let html = "";
    let totAcquisto = 0;
    let totNoleggio = 0;

    if (carrello.length === 0) {
        container.innerHTML = `<h4 class="text-white-50">Il carrello è vuoto.</h4>`;
        aggiornaDisplayTotali(0, 0);
        return;
    }

    carrello.forEach(item => {
        let prezzoFinale = item.prezzoUnitario;
        let scontoApplicato = false;

        // Sconto 15% solo per ACQUISTI fatti da SCUOLA
        if (item.tipo === 'acquisto' && isScuola) {
            prezzoFinale = item.prezzoUnitario * 0.85;
            scontoApplicato = true;
        }

        const subTotale = prezzoFinale * item.quantita;

        if (item.tipo === 'acquisto') {
            totAcquisto += subTotale;
        } else {
            totNoleggio += subTotale;
        }

        html += `
        <div class="card bg-dark border-secondary text-white mb-3 overflow-hidden">
            <div class="row g-0 align-items-center">
                <div class="col-3 col-md-2 p-2">
                    <img src="${item.immagine}" class="img-fluid rounded" alt="${item.modello}">
                </div>
                <div class="col-6 col-md-5 p-3">
                    <span class="badge ${item.tipo === 'acquisto' ? 'bg-danger' : 'bg-info'} mb-1">
                        ${item.tipo.toUpperCase()}
                    </span>
                    <h5 class="mb-0">${item.marca} ${item.modello}</h5>
                    ${item.durataMesi ? `<small class="text-white-50 d-block">Durata: ${item.durataMesi} mesi</small>` : ''}
                    
                    ${scontoApplicato ? `<div class="text-success small fw-bold">Sconto Scuola -15% applicato</div>` : ''}
                </div>
                
                <div class="col-6 col-md-2 p-3 text-center contatore">
                    <div class="row mb-2">
                        <p class="mb-0 pb-1 text-white fw-light">Quantità</p>
                        <div class="input-group input-group-sm justify-content-center">
                            <button class="btn btn-outline-secondary" onclick="aggiornaQuantita(${item.cartId}, -1)">-</button>
                            <span class="px-3 border-top border-bottom border-secondary d-flex align-items-center">${item.quantita}</span>
                            <button class="btn btn-outline-secondary" onclick="aggiornaQuantita(${item.cartId}, 1)">+</button>
                        </div>
                    </div>
                </div>

                <div class="col-6 col-md-3 p-3 text-end">
                    <div class="fw-bold fs-5">
                        ${scontoApplicato ? `<del class="text-white-50 fs-6">€${(item.prezzoUnitario * item.quantita).toFixed(2)}</del><br>` : ''}
                        € ${subTotale.toFixed(2)}
                    </div>
                    <button onclick="rimuoviDalCarrello(${item.cartId})" class="btn btn-sm text-danger mt-2 p-0">
                        <i class="bi bi-trash"></i> Rimuovi
                    </button>
                </div>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
    aggiornaDisplayTotali(totAcquisto, totNoleggio);
}

function aggiornaDisplayTotali(acquisto, noleggio) {
    const isScuola = localStorage.getItem('userType') === 'scuola';
    const elProd = document.getElementById('totale-prodotti');
    const elNol = document.getElementById('totale-noleggi');
    const elFin = document.getElementById('totale-finale');

    if(elProd) elProd.innerText = `€ ${acquisto.toFixed(2)}`;
    if(elNol) elNol.innerText = `€ ${noleggio.toFixed(2)}`;
    
    const finale = isScuola ? (acquisto + noleggio) : acquisto;
    if(elFin) elFin.innerText = `€ ${finale.toFixed(2)}`;
}

// Controlla se l'utente può andare alla pagina di pagamento
function gestisciCheckout() {
    const userType = localStorage.getItem('userType');
    const carrello = getCarrello();

    if (carrello.length === 0) return;

    // Se userType non esiste, è vuoto o è esplicitamente 'ospite'
    if (!userType || userType === 'ospite' || userType.trim() === '') {
        
        // Verifichiamo se SweetAlert2 è effettivamente caricato nella pagina
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: '<span style="color: #fff">Accesso richiesto</span>',
                text: 'Devi effettuare l\'accesso o registrarti per poter completare l\'acquisto.',
                background: '#151515',
                showCancelButton: true,
                confirmButtonColor: 'var(--brand-color)',
                cancelButtonColor: '#333',
                confirmButtonText: 'Accedi / Registrati',
                cancelButtonText: 'Annulla'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'login.html'; 
                }
            });
        } else {
            // Fallback: se SweetAlert non si è caricato, usiamo il confirm nativo del browser
            // per evitare che l'utente clicchi a vuoto senza capire cosa succede
            const procedi = confirm("Accesso richiesto: Devi effettuare l'accesso o registrarti per completare l'acquisto. Vuoi andare al login?");
            if (procedi) {
                window.location.href = 'login.html';
            }
        }
        
    } else {
        // Se è loggato (scuola o privato), va alla pagina di pagamento
        window.location.href = 'pagamento.html';
    }
}

function rimuoviDalCarrello(cartId) {
    let carrello = getCarrello();
    carrello = carrello.filter(item => item.cartId !== cartId);
    salvaCarrello(carrello);
    renderCarrello();

    if (typeof aggiornaBadgeCarrello === 'function') aggiornaBadgeCarrello();
}

function aggiornaQuantita(cartId, delta) {
    let carrello = getCarrello();
    const index = carrello.findIndex(item => item.cartId === cartId);
    
    if (index !== -1) {
        const item = carrello[index];
        let nuovaQuantita = item.quantita + delta;

        // --- CONTROLLO LIMITI ---
        
        // 1. Limite minimo: se scende a 0, rimuoviamo l'articolo
        if (nuovaQuantita <= 0) {
            rimuoviDalCarrello(cartId);
            return;
        }

        // 2. Limite massimo: controlla se superiamo il magazzino
        // Usiamo item.disponibilitaMax (che abbiamo salvato prima)
        if (delta > 0 && nuovaQuantita > item.disponibilitaMax) {
            Swal.fire({
                icon: 'info',
                title: 'Disponibilità limitata',
                text: `Siamo spiacenti, sono disponibili solo ${item.disponibilitaMax} unità di questo prodotto.`,
                background: '#151515',
                confirmButtonColor: 'var(--brand-color)'
            });
            return; // Blocca l'esecuzione, non aggiorna la quantità
        }

        // Se i controlli passano, aggiorniamo il valore
        item.quantita = nuovaQuantita;
        
        salvaCarrello(carrello);
        renderCarrello();
        if (typeof aggiornaBadgeCarrello === 'function') aggiornaBadgeCarrello();
    }
}

function getCarrello() {
    const carrello = localStorage.getItem('carrello_musica');
    return carrello ? JSON.parse(carrello) : [];
}

function salvaCarrello(carrello) {
    localStorage.setItem('carrello_musica', JSON.stringify(carrello));
}

document.addEventListener('DOMContentLoaded', () => {
    renderCarrello();
});

