let prodottoCorrente = null; // Variabile globale per questa pagina

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));

    if (typeof prodottiMaster !== 'undefined') {
        prodottoCorrente = prodottiMaster.find(p => p.id === productId);
        
        if (prodottoCorrente) {
            mostraDettaglio(prodottoCorrente);
            aggiornaBadgeCarrello(); // Aggiorna il badge all'avvio
        } else {
            document.getElementById('prodotto-container').innerHTML = 
                `<div class="col-12 text-center text-white mt-5"><h2>Strumento non trovato</h2></div>`;
        }
    } else {
        console.error("Errore: prodottiMaster non trovato. Verifica l'ordine degli script nell'HTML.");
    }
});

function mostraDettaglio(p) {
    const container = document.getElementById('prodotto-container');
    document.getElementById('breadcrumb-nome').innerText = p.modello;

    // Generazione specifiche
    let specificheHTML = "";
    for (const [chiave, valore] of Object.entries(p.specifiche)) {
        const etichetta = chiave.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
        specificheHTML += `<div class="col-md-6 border-bottom border-secondary py-2">
            <span class="text-danger fw-bold">${etichetta}:</span> <span class="text-white ms-2">${valore}</span>
        </div>`;
    }

    // DETERMINA SE IL PRODOTTO È NOLEGGIABILE
    // Escludiamo accessori, corde e prodotti senza prezzo di noleggio
    const isNoleggiabile = p.macro_categoria !== 'accessori' && p.prezzo_noleggio_mensile !== undefined;

    container.innerHTML = `
        <div class="col-lg-6">
            <div class="product-image-container sticky-lg-top" style="top: 120px;">
                <div class="bg-dark p-2 rounded border border-secondary shadow-lg overflow-hidden">
                    <img src="${p.immagine}" alt="${p.modello}" class="img-fluid w-100 rounded zoom-image">
                </div>
            </div>
        </div>

        <div class="col-lg-6">
            <span class="text-danger text-uppercase">${p.marca}</span>
            <h1 class="display-4 text-white mb-3">${p.modello}</h1>
            
            <div class="action-box rounded border border-secondary overflow-hidden mb-5">
                <div class="p-4 bg-dark">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <small class="text-white-50 text-uppercase letter-spacing-1">Prezzo d'acquisto</small>
                            <h2 class="text-white fw-bold mb-0">€ ${p.prezzo.toFixed(2)}</h2>
                        </div>
                        <span class="badge ${p.disponibilita > 0 ? 'bg-success bg-opacity-75' : 'bg-danger'}">
                            ${p.disponibilita > 0 ? 'Disponibile' : 'Esaurito'}
                        </span>
                    </div>
                    
                    <div class="d-flex gap-2 mt-4">
                        <div class="input-group w-50 custom-qty">
                            <button class="btn btn-outline-secondary" onclick="cambiaQty('qty-acquisto', -1, 1, ${p.disponibilita})">-</button>
                            <input type="number" id="qty-acquisto" class="form-control bg-transparent text-white border-secondary text-center" value="1" readonly>
                            <button class="btn btn-outline-secondary" onclick="cambiaQty('qty-acquisto', 1, 1, ${p.disponibilita})">+</button>
                        </div>
                        <button onclick="aggiungiAlCarrello(${p.id}, 'acquisto')" class="btn btn-outline-red flex-grow-1 text-uppercase py-3" ${p.disponibilita === 0 ? 'disabled' : ''}>
                            Aggiungi al carrello
                        </button>
                    </div>
                </div>

                ${isNoleggiabile ? `
                <div class="p-4 border-top border-secondary">
                    <div class="d-flex align-items-center mb-3">
                        <i class="bi bi-mortarboard text-danger me-2 fs-5"></i>
                        <small class="text-white-50 text-uppercase fw-bold">Noleggio Esclusivo Scuole</small>
                    </div>
                    <h3 class="text-white">€ ${p.prezzo_noleggio_mensile.toFixed(2)} <small class="fs-6 text-white">/ mese</small></h3>
                    
                    <div class="row g-2 mt-3">
                        <div class="col-sm-6">
                            <label class="text-white-50 mb-2">Mesi</label>
                            <div class="input-group custom-qty">
                                <button class="btn btn-outline-secondary" onclick="cambiaQty('mesi-noleggio', -1, 1, 36)">-</button>
                                <input type="number" id="mesi-noleggio" class="form-control bg-transparent text-white border-secondary text-center" value="1" readonly>
                                <button class="btn btn-outline-secondary" onclick="cambiaQty('mesi-noleggio', 1, 1, 36)">+</button>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <label class="text-white-50 mb-2">Quantità</label>
                            <div class="input-group custom-qty">
                                <button class="btn btn-outline-secondary" onclick="cambiaQty('qty-noleggio', -1, 1, ${p.disponibilita})">-</button>
                                <input type="number" id="qty-noleggio" class="form-control bg-transparent text-white border-secondary text-center" value="1" readonly>
                                <button class="btn btn-outline-secondary" onclick="cambiaQty('qty-noleggio', 1, 1, ${p.disponibilita})">+</button>
                            </div>
                        </div>
                        <div class="col-sm-12">
                            <button onclick="gestisciNoleggio(${p.id}, ${p.prezzo_noleggio_mensile})" class="btn btn-outline-light w-100 h-100 text-uppercase py-2">
                                Noleggia
                            </button>
                        </div>
                    </div>
                </div>` : `
                <div class="p-4 border-top border-secondary bg-black bg-opacity-25 text-center">
                    <small class="text-white-50 text-uppercase">Noleggio non disponibile per questo articolo</small>
                </div>
                `}
            </div>
            
        </div>
        <p class="text-white-50 lead mb-4">${p.descrizione}</p>
        <div class="row specifiche mt-5 px-4 px-md-0 mx-auto">
            <div class="col-12 px-3">
                <h4 class="text-white border-bottom border-danger pb-2 mb-4">Scheda Tecnica</h4>
                <div class="row g-3">${specificheHTML}</div>
            </div>
        </div>
    `;
}

/* --- FUNZIONI DI GESTIONE --- */

function cambiaQty(id, delta, min, max) {
    const input = document.getElementById(id);
    let valoreAttuale = parseInt(input.value);
    let nuovoValore = valoreAttuale + delta;

    if (delta > 0 && nuovoValore > max) {
        Swal.fire({
            icon: 'info',
            title: '<span style="color: #fff">Disponibilità limitata</span>',
            text: `Siamo spiacenti, sono disponibili solo ${max} unità di questo prodotto.`,
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)',
            confirmButtonText: 'Capito'
        });
        return; // Blocca l'esecuzione
    }
    
    if (nuovoValore >= min && nuovoValore <= max) {
        input.value = nuovoValore;
    }
    
}

// Recupera il carrello dal localStorage o crea un array vuoto
function getCarrello() {
    const carrello = localStorage.getItem('carrello_musica');
    return carrello ? JSON.parse(carrello) : [];
}

// Salva il carrello nel localStorage
function salvaCarrello(carrello) {
    localStorage.setItem('carrello_musica', JSON.stringify(carrello));
    aggiornaBadgeCarrello(); // Funzione opzionale per mostrare il numero di oggetti nell'icona
}

function aggiungiAlCarrello(id, tipo, opzioni = {}) {
    let carrello = getCarrello();
    
    if (!prodottoCorrente) return;

    // 1. Determiniamo la quantità che l'utente vuole aggiungere ora
    let qtyAggiuntiva;
    if (tipo === 'acquisto') {
        qtyAggiuntiva = parseInt(document.getElementById('qty-acquisto').value);
    } else {
        qtyAggiuntiva = parseInt(document.getElementById('qty-noleggio').value);
    }

    // 2. Cerchiamo se il prodotto è già nel carrello
    // Nota: per il noleggio controlliamo anche che i mesi siano uguali
    const prodottoEsistente = carrello.find(item => 
        item.id === id && 
        item.tipo === tipo && 
        (tipo === 'acquisto' || item.durataMesi === opzioni.durataMesi)
    );

    if (prodottoEsistente) {
        // 3. CALCOLO NUOVA QUANTITÀ
        let nuovaTotale = prodottoEsistente.quantita + qtyAggiuntiva;

        // Controllo disponibilità massima
        if (nuovaTotale > prodottoCorrente.disponibilita) {
            Swal.fire({
                icon: 'warning',
                title: '<span style="color: #fff">Limite raggiunto</span>',
                text: `Hai già ${prodottoEsistente.quantita} unità nel carrello. Non puoi superare le ${prodottoCorrente.disponibilita} totali disponibili.`,
                background: '#151515',
                confirmButtonColor: 'var(--brand-color)'
            });
            return;
        }

        // Aggiorniamo il prodotto esistente
        prodottoEsistente.quantita = nuovaTotale;

    } else {
        // 4. AGGIUNGIAMO NUOVO OGGETTO (se non esisteva)
        const nuovoItem = {
            cartId: Date.now(), 
            id: id,
            marca: prodottoCorrente.marca,
            modello: prodottoCorrente.modello,
            immagine: prodottoCorrente.immagine,
            tipo: tipo,
            // Per il noleggio il prezzo unitario è (PrezzoMensile * Mesi)
            prezzoUnitario: (tipo === 'acquisto') ? prodottoCorrente.prezzo : (prodottoCorrente.prezzo_noleggio_mensile * opzioni.durataMesi),
            quantita: qtyAggiuntiva,
            disponibilitaMax: prodottoCorrente.disponibilita,
            durataMesi: opzioni.durataMesi || null
        };

        carrello.push(nuovoItem);
    }

    // 5. Salvataggio e feedback
    salvaCarrello(carrello);
    
    Swal.fire({
        icon: 'success',
        title: `<span style="color: #fff">${tipo.toUpperCase()} AGGIUNTO!</span>`,
        html: `<p style="color: #aaa">${prodottoCorrente.marca} ${prodottoCorrente.modello} è nel carrello.</p>`,
        background: '#151515',
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: 'top-end'
    });
}

function gestisciNoleggio(id, prezzoMensile) {
    const userType = localStorage.getItem('userType'); // 'scuola' o 'privato'
    const mesi = parseInt(document.getElementById('mesi-noleggio').value);
    const quantitaN = parseInt(document.getElementById('qty-noleggio').value);
    const totaleNoleggioComplessivo = prezzoMensile * mesi * quantitaN;

    if (userType !== 'scuola') {
        Swal.fire({
            icon: 'warning',
            title: '<span style="color: #fff">ACCESSO NEGATO</span>',
            html: '<p style="color: #aaa">Il noleggio è un servizio esclusivo riservato alle <b>Scuole di Musica</b>. Accedi con un account scuola per procedere.</p>',
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)'
        });
        return;
    }

    Swal.fire({
        title: '<span style="color: #fff">Conferma Noleggio</span>',
        html: `
            <div style="text-align: left; color: #aaa; font-size: 0.9rem;">
                <p>Strumento: <b>${prodottoCorrente.modello}</b></p>
                <p>Unità: <b>${quantitaN}</b></p>
                <p>Durata: <b>${mesi} mesi</b></p>
                <hr>
                <h4 style="color: #fff">Totale periodo: €${totaleNoleggioComplessivo}</h4>
            </div>
        `,
        background: '#151515',
        showCancelButton: true,
        confirmButtonColor: 'var(--brand-color)',
        cancelButtonColor: '#444',
        confirmButtonText: 'Inserisci nel carrello',
        cancelButtonText: 'Annulla'
    }).then((result) => {
        if (result.isConfirmed) {
            aggiungiAlCarrello(id, 'noleggio', { durataMesi: mesi, qtyNoleggio: quantitaN, totaleNoleggio: totaleNoleggioComplessivo });
        }
    });

    if (conferma) {
        aggiungiAlCarrello(id, 'noleggio', { durataMesi: mesi, qtyNoleggio: quantitaN, totaleNoleggio: totale });
    }
}

function aggiornaBadgeCarrello() {
    const carrello = getCarrello();
    const badge = document.getElementById('cart-badge'); 
    if (badge) {
        badge.innerText = carrello.length;
    }
    console.log("Badge aggiornato:", carrello.length);
}

