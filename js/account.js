document.addEventListener('DOMContentLoaded', () => {
    initAccount();
});

// Recuperiamo sia il tipo/ruolo che il nome dell'utente
const userType = localStorage.getItem('userType') || 'ospite';
const userName = localStorage.getItem('userName') || 'Utente'; 

function initAccount() {
    if (userType === 'ospite') {
        window.location.href = 'login.html';
        return;
    }

    // 1. Recupera il nome dell'utente dal localStorage
    const nomeUtente = localStorage.getItem('nomeUtente') || 'Utente';
    
    // 2. Inserisci il nome nell'elemento HTML dedicato
    document.getElementById('userNameDisplay').innerText = nomeUtente;

    // Lascia invariato il badge con il ruolo
    document.getElementById('userRoleBadge').innerText = userType.toUpperCase();
    
    renderSidebar();
}

// 1. RENDERING SIDEBAR IN BASE AL RUOLO
function renderSidebar() {
    const menu = document.getElementById('sidebarMenu');
    let links = '';

    if (userType === 'admin') {
        links = `
            <li class="nav-item"><a class="nav-link text-white" href="#" onclick="switchSection('section-catalogo')"><i class="bi bi-box me-2 text-danger"></i>Catalogo</a></li>
            <li class="nav-item"><a class="nav-link text-white" href="#" onclick="switchSection('section-ordini')"><i class="bi bi-bag me-2 text-danger"></i>Gestione Acquisti</a></li>
            <li class="nav-item"><a class="nav-link text-white" href="#" onclick="switchSection('section-noleggi')"><i class="bi bi-calendar-event me-2 text-danger"></i>Noleggi</a></li>
            <li class="nav-item"><a class="nav-link text-white" href="#" onclick="switchSection('section-contatti')"><i class="bi bi-envelope me-2 text-danger"></i>Richieste Form</a></li>
        `;
        renderTableAdmin();
    } else if (userType === 'scuola') {
        links = `
            <li class="nav-item"><a class="nav-link text-white" href="#" onclick="switchSection('section-ordini')"><i class="bi bi-bag me-2 text-danger"></i>Acquisti</a></li>
            <li class="nav-item"><a class="nav-link text-white" href="#" onclick="switchSection('section-noleggi')"><i class="bi bi-clock-history me-2 text-danger"></i>I tuoi Noleggi</a></li>
        `;
    } else if (userType === 'privato') {
        links = `
            <li class="nav-item"><a class="nav-link text-white" href="#" onclick="switchSection('section-ordini')"><i class="bi bi-bag me-2 text-danger"></i>I miei Ordini</a></li>
        `;
    }

    menu.innerHTML = links;
}

// 2. SWITCH SEZIONI (Aggiornato per caricare i dati al click)
function switchSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('d-none'));
    document.getElementById('welcome-screen').classList.add('d-none');
    
    const targetSection = document.getElementById(sectionId);
    if(targetSection) {
        targetSection.removePartition || targetSection.classList.remove('d-none');
    }
    
    // Aggiorna stato active link
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active', 'bg-danger'));
    if(window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active', 'bg-danger');
    }

    // Caricamento asincrono dei dati a seconda della sezione aperta
    if (sectionId === 'section-ordini') {
        renderOrdini();
    } else if (sectionId === 'section-noleggi') {
        renderNoleggi();
    } else if (sectionId === 'section-contatti') {
        renderRichieste();
    }
}

// 3. LOGICA CATALOGO ADMIN (CON AGGIUNTA COLONNA ID)
async function renderTableAdmin() {
    try {
        const prodotti = prodottiMaster; // Usa la variabile da dati.js
        const tbody = document.getElementById('admin-table-body');
        
        tbody.innerHTML = prodotti.map(p => `
            <tr>
                <td data-label="ID" class="text-white-50 fw-bold">#${p.id}</td>
                <td data-label="Strumento">
                    <div class="d-flex align-items-center justify-content-end justify-content-md-start">
                        <img src="${p.immagine || 'https://via.placeholder.com/40'}" width="40" class="me-3 bg-white rounded">
                        <div class="text-end text-md-start"><b>${p.marca}</b><br><small class="text-white-50">${p.modello}</small></div>
                    </div>
                </td>
                <td data-label="Prezzo" class="text-danger fw-bold">€${p.prezzo}</td>
                <td data-label="Stato"><span class="badge ${p.disponibilita > 0 ? 'bg-success' : 'bg-danger'}">${p.disponibilita} pz</span></td>
                <td data-label="Azioni">
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-sm btn-outline-info" onclick="apriEditorProdotto(${p.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminaProdotto(${p.id})"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Errore nel caricamento dei prodotti:", error);
    }
}

// 4. EDITOR PRODOTTO COMPLETO (MODIFICA E AGGIUNTA)
// 4. EDITOR PRODOTTO COMPLETO (MODIFICA E AGGIUNTA)
async function apriEditorProdotto(id = null) {
    // Inizializziamo l'oggetto con il campo immagine vuoto
    let p = { id: "", marca: "", modello: "", prezzo: 0, immagine: "", descrizione: "", macro_categoria: "", categoria: "", tags: [], disponibilita: 0, prezzo_noleggio_mensile: 0, specifiche: {} };
    
    if (id) {
        p = prodottiMaster.find(item => item.id === id) || p;
    }

    const { value: formValues } = await Swal.fire({
        title: id ? `<span class="text-danger">Modifica Prodotto #${id}</span>` : 'Aggiungi Nuovo Prodotto',
        background: '#151515',
        color: '#fff',
        width: '900px',
        html: `
            <div class="text-start custom-editor p-2" style="max-height: 65vh; overflow-y: auto;">
                <div class="row g-3 mb-4 ">
                    <div class="col-md-4">
                        <label class="small text-white-50">ID Prodotto</label>
                        <input id="edit-id" type="number" class="form-control bg-dark text-white border-secondary" value="${p.id}" ${id ? 'disabled' : ''} placeholder="Es: 105">
                    </div>
                    <div class="col-md-8">
                        <label class="small text-white-50">URL Immagine</label>
                        <input id="edit-img" type="text" class="form-control bg-dark text-white border-secondary" value="${p.immagine}" placeholder="assets/images/prodotti/nomefoto.png">
                    </div>

                    <div class="col-md-6"><label class="small text-white-50">Marca</label><input id="edit-marca" class="form-control bg-dark text-white border-secondary" value="${p.marca}"></div>
                    <div class="col-md-6"><label class="small text-white-50">Modello</label><input id="edit-modello" class="form-control bg-dark text-white border-secondary" value="${p.modello}"></div>
                    
                    <div class="col-md-4"><label class="small text-white-50">Macro Categoria</label><input id="edit-macro" class="form-control bg-dark text-white border-secondary" value="${p.macro_categoria}"></div>
                    <div class="col-md-4"><label class="small text-white-50">Categoria (separate da virgola)</label><input id="edit-cat" class="form-control bg-dark text-white border-secondary" value="${Array.isArray(p.categoria) ? p.categoria.join(', ') : p.categoria}"></div>
                    <div class="col-md-4"><label class="small text-white-50">Disp.</label><input id="edit-disp" type="number" class="form-control bg-dark text-white border-secondary" value="${p.disponibilita}"></div>
                    
                    <div class="col-12"><label class="small text-white-50">Tags (separati da virgola)</label><input id="edit-tags" class="form-control bg-dark text-white border-secondary" value="${p.tags.join(', ')}"></div>
                    <div class="col-md-6"><label class="small text-white-50">Prezzo Vendita (€)</label><input id="edit-prezzo" type="number" class="form-control bg-dark text-white border-secondary" value="${p.prezzo}"></div>
                    <div class="col-md-6"><label class="small text-white-50">Noleggio Mensile (€)</label><input id="edit-noleggio" type="number" class="form-control bg-dark text-white border-secondary" value="${p.prezzo_noleggio_mensile}"></div>
                    <div class="col-12"><label class="small text-white-50">Descrizione</label><textarea id="edit-desc" class="form-control bg-dark text-white border-secondary" rows="3">${p.descrizione}</textarea></div>
                </div>
                
                <div class="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-3">
                    <h6 class="text-danger m-0">SPECIFICHE TECNICHE</h6>
                    <button type="button" class="btn btn-sm btn-outline-success" onclick="aggiungiRigaSpecifica()">+ Aggiungi Specifica</button>
                </div>
                
                <div class="row g-2" id="specs-container">
                    ${Object.entries(p.specifiche).map(([key, val]) => `
                        <div class="col-12 d-flex gap-2 mb-2 spec-row">
                            <input type="text" placeholder="Proprietà" class="form-control form-control-sm bg-dark text-white border-secondary spec-key" value="${key.toUpperCase()}">
                            <input type="text" placeholder="Valore" class="form-control form-control-sm bg-dark text-white border-secondary spec-val" value="${val}">
                            <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.parentElement.remove()"><i class="bi bi-trash"></i></button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Salva nel Database',
        confirmButtonColor: 'var(--brand-color)',
        preConfirm: () => {
            const finalId = document.getElementById('edit-id').value.trim();
            if(!finalId) {
                Swal.showValidationMessage('L\'ID Prodotto è obbligatorio');
                return false;
            }

            const specs = {};
            document.querySelectorAll('.spec-row').forEach(row => {
                const key = row.querySelector('.spec-key').value.trim().toLowerCase();
                const val = row.querySelector('.spec-val').value.trim();
                if(key && val) {
                    specs[key] = val;
                }
            });

            return {
                id: parseInt(finalId),
                immagine: document.getElementById('edit-img').value.trim(), // RACCOLTA DATO IMMAGINE
                marca: document.getElementById('edit-marca').value,
                modello: document.getElementById('edit-modello').value,
                macro_categoria: document.getElementById('edit-macro').value,
                categoria: document.getElementById('edit-cat').value.split(',').map(c => c.trim()).filter(c => c !== ""),
                disponibilita: parseInt(document.getElementById('edit-disp').value) || 0,
                tags: document.getElementById('edit-tags').value.split(',').map(t => t.trim()).filter(t => t !== ""),
                prezzo: parseFloat(document.getElementById('edit-prezzo').value) || 0,
                prezzo_noleggio_mensile: parseFloat(document.getElementById('edit-noleggio').value) || 0,
                descrizione: document.getElementById('edit-desc').value,
                specifiche: specs
            }
        }
    });

    if (formValues) {
        console.log("Dati pronti per il salvataggio:", formValues);
        Swal.fire({ icon: 'success', title: 'Salvataggio riuscito (Simulazione)', background: '#151515', color: '#fff' });
        renderTableAdmin(); // Ricarica la tabella per vedere subito le modifiche (se presenti nel master)
    }
}

// Funzione helper per aggiungere dinamicamente nuove righe chiave/valore nell'editor SweetAlert2
function aggiungiRigaSpecifica() {
    const container = document.getElementById('specs-container');
    const nuovaRiga = document.createElement('div');
    nuovaRiga.className = 'col-12 d-flex gap-2 mb-2 spec-row';
    nuovaRiga.innerHTML = `
        <input type="text" placeholder="Proprietà (es: Tasti)" class="form-control form-control-sm bg-dark text-white border-secondary spec-key">
        <input type="text" placeholder="Valore (es: 24)" class="form-control form-control-sm bg-dark text-white border-secondary spec-val">
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.parentElement.remove()"><i class="bi bi-trash"></i></button>
    `;
    container.appendChild(nuovaRiga);
}

function eliminaProdotto(id) {
    Swal.fire({
        title: `Eliminare il prodotto #${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--brand-color)',
        background: '#151515',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'Eliminato! (Simulazione)', icon: 'success', background: '#151515', color: '#fff' });
        }
    });
}

// 5. RENDERING DEGLI ORDINI 
function renderOrdini() {
    const sectionOrdini = document.getElementById('section-ordini');
    if (!sectionOrdini) return;

    // Recuperiamo l'utente attuale per il filtraggio
    const currentUsername = localStorage.getItem('username');

    // Usiamo gli array globali definiti in dati.js (ordiniMaster e prodottiMaster)
    // L'admin vede tutti gli ordini; la scuola e il privato vedono solo i propri
    const ordiniFiltrati = userType === 'admin' 
        ? ordiniMaster 
        : ordiniMaster.filter(o => o.username === currentUsername);

    // Se non ci sono ordini, mostriamo il messaggio di vuoto
    if (ordiniFiltrati.length === 0) {
        sectionOrdini.innerHTML = `
            <h3>${userType === 'admin' ? 'Gestione Ordini Clienti' : 'Storico Acquisti'}</h3>
            <div class="bg-black p-4 rounded border border-secondary text-white-50 text-center">
                <i class="bi bi-cart-x fs-1 d-block mb-3"></i> Nessun ordine trovato.
            </div>
        `;
        return;
    }

    // Costruiamo la tabella
    sectionOrdini.innerHTML = `
        <h3>${userType === 'admin' ? 'Gestione Ordini Clienti' : 'Storico Acquisti'}</h3>
        <div class="table-responsive bg-black p-3 rounded border border-secondary">
            <table class="table table-dark table-hover align-middle">
                <thead>
                    <tr>
                        <th>ID Ordine</th>
                        ${userType === 'admin' ? '<th>Cliente</th>' : ''}
                        <th>Data</th>
                        <th>Strumento Acquistato</th>
                        <th>Stato</th>
                        <th class="text-end">Totale</th>
                        ${userType === 'admin' ? '<th class="text-center">Azioni</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${ordiniFiltrati.map(o => {
                        // Cerchiamo i dettagli del prodotto nel catalogo locale (prodottiMaster)
                        const infoOrdineProdotto = o.prodotti[0];
                        const prodottoDettaglio = prodottiMaster.find(p => p.id === infoOrdineProdotto.id_prodotto);
                        
                        const marca = prodottoDettaglio ? prodottoDettaglio.marca : "Strumento";
                        const modello = prodottoDettaglio ? prodottoDettaglio.modello : "Dettagli non disponibili";
                        const img = prodottoDettaglio ? (prodottoDettaglio.immagine || 'https://via.placeholder.com/40') : 'https://via.placeholder.com/40';

                        // Gestione dinamica del colore del badge in base allo stato
                        let badgeClass = 'bg-warning text-dark';
                        if (o.stato === 'Spedito') badgeClass = 'bg-success';
                        if (o.stato === 'Annullato') badgeClass = 'bg-danger';

                        return `
                            <tr>
                                <td data-label="ID Ordine" class="text-white-50 fw-bold">#${o.id_ordine}</td>
                                ${userType === 'admin' ? `<td data-label="Cliente"><span class="badge bg-secondary">${o.username}</span></td>` : ''}
                                <td data-label="Data">${o.data}</td>
                                <td data-label="Strumento">
                                    <div class="d-flex align-items-center justify-content-end justify-content-md-start">
                                        <img src="${img}" width="40" class="me-3 bg-white rounded">
                                        <div class="text-end text-md-start">
                                            <b>${marca}</b> (${infoOrdineProdotto.quantita}x)<br>
                                            <small class="text-white-50">${modello}</small>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Stato"><span class="badge ${badgeClass}">${o.stato}</span></td>
                                <td data-label="Totale" class="text-danger fw-bold text-end">€${o.totale.toFixed(2)}</td>
                                ${userType === 'admin' ? `
                                    <td data-label="Azioni">
                                        <div class="d-flex justify-content-center">
                                            <button class="btn btn-sm btn-outline-warning" onclick="modificaStatoOrdine(${o.id_ordine}, '${o.stato}')">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>
                                        </div>
                                    </td>
                                ` : ''}
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// 6. RENDERING DEI NOLEGGI 
function renderNoleggi() {
    // 1. Invece di scaricare i dati, usiamo quelli già presenti in js/dati.js
    const noleggi = (typeof noleggiMaster !== 'undefined') ? noleggiMaster : [];
    const prodotti = (typeof prodottiMaster !== 'undefined') ? prodottiMaster : [];
    
    const sectionNoleggi = document.getElementById('section-noleggi');
    if (!sectionNoleggi) return; // Sicurezza nel caso l'elemento non esista

    const currentUsername = localStorage.getItem('username');

    // L'admin vede tutto l'inventario dei noleggi; la scuola vede solo i suoi
    const noleggiFiltrati = userType === 'admin' 
        ? noleggi 
        : noleggi.filter(n => n.username === currentUsername);

    if (noleggiFiltrati.length === 0) {
        sectionNoleggi.innerHTML = `
            <h3>Gestione Noleggi</h3>
            <div class="bg-black p-4 rounded border border-secondary text-white-50 text-center">
                <i class="bi bi-calendar-x fs-1 d-block mb-3"></i> Nessun noleggio attivo.
            </div>
        `;
        return;
    }

    sectionNoleggi.innerHTML = `
        <h3>Gestione Noleggi</h3>
        <div class="table-responsive bg-black p-3 rounded border border-secondary">
            <table class="table table-dark table-hover align-middle">
                <thead>
                    <tr>
                        <th>ID Noleggio</th>
                        ${userType === 'admin' ? '<th>Cliente</th>' : ''}
                        <th>Strumento</th>
                        <th>Periodo</th>
                        <th>Rata Mensile</th>
                        <th>Stato</th>
                    </tr>
                </thead>
                <tbody>
                    ${noleggiFiltrati.map(n => {
                        // 2. Cerchiamo il prodotto corrispondente nel catalogo prodotti locale usando l'id_prodotto
                        const infoProdotto = prodotti.find(p => p.id === n.id_prodotto);
                        
                        // Se il prodotto viene trovato creiamo una stringa con Marca + Modello, altrimenti usiamo un fallback
                        const nomeStrumento = infoProdotto 
                            ? `${infoProdotto.marca} - ${infoProdotto.modello}` 
                            : "Strumento Sconosciuto";
                        
                        const urlImmagine = infoProdotto?.immagine || 'https://via.placeholder.com/40';

                        return `
                            <tr>
                                <td data-label="ID Noleggio" class="text-white-50 fw-bold">#${n.id_noleggio}</td>
                                ${userType === 'admin' ? `<td data-label="Cliente"><span class="badge bg-secondary">${n.username}</span></td>` : ''}
                                <td data-label="Strumento">
                                    <div class="d-flex align-items-center justify-content-end justify-content-md-start">
                                        <img src="${urlImmagine}" width="40" class="me-3 bg-white rounded">
                                        <div class="text-end text-md-start">
                                            <b>${nomeStrumento}</b><br>
                                            <small class="text-white-50">quantità: ${n.quantità || 1}</small>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Periodo"><small>Dal: ${n.data_inizio}<br>Al: ${n.data_finish || n.data_fine}</small></td>
                                <td data-label="Rata" class="text-danger fw-bold">€${n.canone_mensile.toFixed(2)}/mese</td>
                                <td data-label="Stato"><span class="badge bg-info text-white">${n.stato}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// 7. RENDERING RICHIESTE FORM (ESCLUSIVO ADMIN) 
function renderRichieste() {
    const richieste = (typeof richiesteMaster !== 'undefined') ? richiesteMaster : [];
    const sectionContatti = document.getElementById('section-contatti');

    if (!sectionContatti) return;

    // Se non ci sono messaggi
    if (richieste.length === 0) {
        sectionContatti.innerHTML = `
            <h3 class="mb-4">Richieste Form Contatti</h3>
            <div class="bg-black p-5 rounded border border-secondary text-white-50 text-center">
                <i class="bi bi-envelope-x fs-1 d-block mb-3 text-secondary"></i> 
                Non ci sono nuove richieste da gestire.
            </div>
        `;
        return;
    }

    // Se ci sono messaggi, renderizziamo il template originale
    sectionContatti.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3>Richieste Form Contatti</h3>
            <span class="badge bg-danger">${richieste.length} Nuovi Messaggi</span>
        </div>
        <div class="row g-4">
            ${richieste.map(r => `
                <div class="col-12">
                    <div class="card bg-black border-secondary shadow-sm">
                        <div class="card-header border-secondary bg-dark d-flex justify-content-between align-items-center py-3">
                            <div>
                                <span class="badge bg-danger text-uppercase mb-1" style="font-size: 0.7rem;">${r.motivo || 'Info'}</span>
                                <h5 class="text-white mb-0">${r.nome}</h5>
                            </div>
                            <div class="text-end">
                                <small class="text-white-50 d-block">${r.data}</small>
                                <small class="text-info">${r.email}</small>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-9">
                                    <p class="text-white-50 mb-0 p-3 rounded bg-dark border-start border-danger border-4">
                                        "${r.messaggio}"
                                    </p>
                                </div>
                                <div class="col-md-3 mt-3 mt-md-0 text-md-end border-start border-secondary border-opacity-25">
                                    <label class="small text-white-50 d-block">Contatto Rapido:</label>
                                    <a href="tel:${r.telefono}" class="text-white text-decoration-none fw-bold">
                                        <i class="bi bi-telephone me-2 text-danger"></i>${r.telefono}
                                    </a>
                                    <div class="mt-3">
                                        <button class="btn btn-sm btn-outline-success me-2" onclick="segnaComeLetta(${r.id_richiesta})">
                                            <i class="bi bi-check2-all"></i> Letta
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="eliminaRichiesta(${r.id_richiesta})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Funzioni dummy per i bottoni (per evitare errori in console al click)
function segnaComeLetta(id) {
    Swal.fire({
        icon: 'success',
        title: 'Messaggio archiviato',
        text: `La richiesta #${id} è stata segnata come letta.`,
        background: '#151515',
        color: '#fff',
        confirmButtonColor: 'var(--brand-color)'
    });
}

function eliminaRichiesta(id) {
    Swal.fire({
        title: 'Sei sicuro?',
        text: "Questa azione non è reversibile!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--brand-color)',
        cancelButtonColor: '#333',
        confirmButtonText: 'Sì, elimina!',
        background: '#151515',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Eliminato!',
                background: '#151515',
                color: '#fff',
                icon: 'success'
            });
        }
    });
}

// MODIFICA STATO ORDINE (ESCLUSIVA ADMIN)
async function modificaStatoOrdine(idOrdine, statoAttuale) {
    const { value: nuovoStato } = await Swal.fire({
        title: `Modifica Stato Ordine #${idOrdine}`,
        input: 'select',
        inputOptions: {
            'In lavorazione': 'In lavorazione',
            'Spedito': 'Spedito',
            'Annullato': 'Annullato'
        },
        inputValue: statoAttuale,
        inputPlaceholder: 'Seleziona uno stato',
        background: '#151515',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: 'var(--brand-color)',
        confirmButtonText: 'Aggiorna Stato',
        cancelButtonText: 'Annulla',
        inputValidator: (value) => {
            if (!value) {
                return 'Devi selezionare uno stato valido!';
            }
        }
    });

    if (nuovoStato) {
        console.log(`Ordine #${idOrdine} aggiornato a: ${nuovoStato}`);
        
        // Mostriamo il feedback di successo
        await Swal.fire({
            icon: 'success',
            title: 'Stato aggiornato! (Simulazione)',
            text: `L'ordine #${idOrdine} è ora "${nuovoStato}"`,
            background: '#151515',
            color: '#fff'
        });

        // Ricarichiamo la tabella per mostrare le modifiche a schermo
        renderOrdini();
    }
}

function logout() {
    localStorage.removeItem('isLogged');
    localStorage.removeItem('username');
    localStorage.removeItem('nomeUtente');
    localStorage.removeItem('userType');
    
    window.location.href = 'index.html';
}