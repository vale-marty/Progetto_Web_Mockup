let macroCategoriaAttiva = 'all'; // Stato per i tab (Bassi, Ampli, ecc.)

document.addEventListener('DOMContentLoaded', () => {
    if (typeof prodottiMaster !== 'undefined') {
        initFiltri();
        aggiornaOpzioniSelect('all'); 
        mostraProdotti(prodottiMaster);
    } else {
        console.error("Errore: prodottiMaster non trovato. Verifica di aver caricato dati.js prima di prodotti.js nell'HTML.");
    }
});

function initFiltri() {
    const searchInput = document.getElementById('searchInput');
    const rentRange = document.getElementById('rentRange');
    const priceRange = document.getElementById('priceRange');
    const filterTag = document.getElementById('filterTag'); 
    const filterTabs = document.querySelectorAll('.filter-tab'); 

    if(searchInput) searchInput.addEventListener('input', filtraRisultati);
    if(rentRange) rentRange.addEventListener('input', filtraRisultati);
    if(priceRange) priceRange.addEventListener('input', filtraRisultati);
    if(filterTag) filterTag.addEventListener('change', filtraRisultati);

    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // 1. Gestione estetica: toglie 'active' da tutti e lo mette a quello cliccato
            filterTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // 2. Aggiorna la variabile globale con la macro-categoria scelta (es. "bassi")
            macroCategoriaAttiva = e.target.getAttribute('data-macro');

            // 3. Cambia le opzioni dentro il select in base a cosa hai cliccato
            aggiornaOpzioniSelect(macroCategoriaAttiva);
            
            // 4. Riesegue il filtro per mostrare i prodotti corretti
            filtraRisultati();
        });
    });
}

// Questa funzione crea le "tendine" diverse per ogni categoria
function aggiornaOpzioniSelect(macro) {
    const select = document.getElementById('filterTag');
    if(!select) return;

    // Reset iniziale: l'opzione "Tutti" c'è sempre
    let opzioni = '<option value="all">Tutte le caratteristiche</option>';

    // Aggiunge opzioni specifiche in base al tasto cliccato
    if (macro === 'bassi') {
        opzioni += `
            <option value="entry-level">Entry Level</option>
            <option value="4-corde">4 Corde</option>
            <option value="5-corde">5 Corde</option>
            <option value="6-corde">6 Corde</option>
            <option value="7-corde">7 Corde</option>
            <option value="headless">Headless</option>
            <option value="freatless">Fretless</option>
            <option value="mancini">Mancini</option>
            <option value="signature">Signature</option>`;
    } else if (macro === 'amplificatori') {
        opzioni += `
            <option value="combo">Combo</option>
            <option value="testata">Testate</option>
            <option value="valvolare">Valvolari</option>`;
    } else if (macro === 'accessori') {
        opzioni += `
            <option value="corde">Corde</option>
            <option value="cavi">Cavi</option>
            <option value="accessori">Accessori</option>
            <option value="custodie">Custodie</option>`;
    } else if (macro === 'all') {
        opzioni += `<option value="ibanez">Marca: Ibanez</option>
            <option value="fender">Marca: Fender</option>
            <option value="squire">Marca: Squire</option>
            <option value="esp">Marca: ESP</option>
            <option value="strandberg">Marca: Strandberg</option>
            <option value="dingwall">Marca: Dingwall</option>
            <option value="lakland">Marca: Lakland</option>
            <option value="marcus">Marca: Marcus Miller</option>
            <option value="marleaux">Marca: Marleaux</option>
            <option value="markbass">Marca: Markbass</option>
            <option value="ampeg">Marca: Ampeg</option>
            <option value="daddario">Marca: Daddario</option>
            <option value="ernie">Marca: Ernie ball</option>
            <option value="dunlop">Marca: Dunlop</option>
            <option value="cordial">Marca: Cordial</option>
            <option value="pro">Marca: Pro Snake</option>
            <option value="korg">Marca: Korg</option>
            <option value="millenium">Marca: Millenium</option>`;
    }

    select.innerHTML = opzioni;
}

function filtraRisultati() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const maxRent = parseInt(document.getElementById('rentRange').value);
    const maxPrice = parseInt(document.getElementById('priceRange').value);
    const selectedTag = document.getElementById('filterTag').value;
    
    
    if(document.getElementById('rentLabel')) {
        document.getElementById('rentLabel').innerText = `€${maxRent}`;
    }
    if(document.getElementById('PriceLabel')) {
        document.getElementById('PriceLabel').innerText = `€${maxPrice}`;
    }


    const prodottiFiltrati = prodottiMaster.filter(prodotto => {
        // 1. Filtro Macro-Categoria
        const matchMacro = (macroCategoriaAttiva === 'all') || (prodotto.macro_categoria === macroCategoriaAttiva);

        // 2. Filtro Noleggio 
        const prezzoNoleggio = prodotto.prezzo_noleggio_mensile || (prodotto.prezzo * 0.05);
        const matchPrezzo = prezzoNoleggio <= maxRent;

        // 3. Filtro Noleggio 
        const prezzoAcquisto = prodotto.prezzo;
        const matchPrezzoAcq = prezzoAcquisto <= maxPrice;

        // 4. Filtro Sottocategoria o Marca dal SELECT
        let matchTag = false;
        if (selectedTag === 'all') {
            matchTag = true;
        } else {
            const marcaProdotto = prodotto.marca.toLowerCase();
            
            // Gestione sicura delle categorie (possono essere stringhe, array o undefined)
            let categorieProdotto = [];
            if (prodotto.categoria) {
                categorieProdotto = Array.isArray(prodotto.categoria) 
                    ? prodotto.categoria.map(c => c.toLowerCase()) 
                    : [prodotto.categoria.toLowerCase()];
            }

            // CONTROLLO INCROCIATO:
            // Se il tag selezionato è una marca (es. "ibanez") O è presente nelle categorie (es. "corde")
            matchTag = marcaProdotto.includes(selectedTag) || categorieProdotto.includes(selectedTag);
        }

        // 5. RICERCA TESTUALE (Logica corretta)
        let matchTesto = true;
        if (query !== "") {
            const marca = prodotto.marca.toLowerCase();
            const modello = prodotto.modello.toLowerCase();
            const tags = (prodotto.tags || []).map(t => t.toLowerCase());

            // Controlliamo se la query è ESATTAMENTE la marca o l'inizio del modello
            const queryInMarca = marca.includes(query);
            const queryInModello = modello.includes(query);
            const queryInTags = tags.some(t => t.includes(query));

            // Solo se non trova nulla in marca/modello/tag, cerchiamo nella descrizione
            // ma in modo molto restrittivo (solo come parola isolata)
            const regexDesc = new RegExp('\\b' + query + '\\b', 'i');
            const queryInDescrizione = regexDesc.test(prodotto.descrizione);

            matchTesto = queryInMarca || queryInModello || queryInTags || queryInDescrizione;
        }

        return matchMacro && matchPrezzo && matchPrezzoAcq && matchTag && matchTesto ;
    });

    mostraProdotti(prodottiFiltrati);
}

function resetFiltri() {
    // 1. Svuota solo il campo di ricerca testuale
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    // 2. Riporta lo slider del prezzo al massimo
    const rentRange = document.getElementById('rentRange');
    if (rentRange) {
        rentRange.value = 700; 
        const rentLabel = document.getElementById('rentLabel');
        if (rentLabel) rentLabel.innerText = `€700`;
    }

    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        priceRange.value = 10000; 
        const priceLabel = document.getElementById('PriceLabel');
        if (priceLabel) priceLabel.innerText = `€10000`;
    }

    // 3. Ripristina il select delle sottocategorie su "Tutti"
    // NOTA: Non chiamiamo aggiornaOpzioniSelect perché vogliamo mantenere le opzioni della categoria in cui ci troviamo (Bassi, Ampli, ecc.)
    const filterTag = document.getElementById('filterTag');
    if (filterTag) filterTag.value = 'all';

    // 4. Eseguiamo il filtraggio
    // macroCategoriaAttiva NON viene toccata, quindi resta quella corrente
    filtraRisultati();
}

function mostraProdotti(listaProdotti) {
    const mainGrid = document.getElementById('main-catalogo');
    const noResults = document.getElementById('noResults');
    const productCount = document.getElementById('productCount');

    if (!mainGrid) return;

    // Svuota la griglia unica
    mainGrid.innerHTML = '';
    
    // Aggiorna il contatore
    if(productCount) productCount.innerText = listaProdotti.length;

    // Gestione Nessun Risultato
    if (listaProdotti.length === 0) {
        noResults.classList.remove('d-none');
        return;
    } else {
        noResults.classList.add('d-none');
    }

    listaProdotti.forEach(prodotto => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 col-xl-3 mb-4'; 
        
        card.innerHTML = `
            <div class="product-card h-100 position-relative" style="cursor:pointer"> 
                <div class="img-container">
                    <img src="${prodotto.immagine}" alt="${prodotto.modello}" class="img-fluid">
                </div>
                <div class="product-info p-3 d-flex flex-column flex-grow-1">
                    <span class="brand-label">${prodotto.marca}</span>
                    <h5 class="product-title">${prodotto.modello}</h5>
                    <p class="product-desc">${prodotto.descrizione}</p>
                    <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-secondary">
                        <div class="d-flex flex-column">
                            <span class="product-price">€ ${prodotto.prezzo}</span>
                            ${prodotto.macro_categoria !== 'accessori' ? 
                                `<small class="text-white-50">Noleggio: €${prodotto.prezzo_noleggio_mensile}/m</small>` : 
                                `<small class="text-danger-emphasis">Solo acquisto</small>`
                            }
                        </div>
                        <a href="prodotto-singolo.html?id=${prodotto.id}" class="btn btn-danger btn-sm shadow-sm">DETTAGLI</a>
                    </div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if(!e.target.classList.contains('btn')) {
                window.location.href = `prodotto-singolo.html?id=${prodotto.id}`;
            }
        });

        mainGrid.appendChild(card);
    });
}