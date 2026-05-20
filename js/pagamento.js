document.addEventListener('DOMContentLoaded', () => {
    renderRiepilogoCheckout();
});

function renderRiepilogoCheckout() {
    const container = document.getElementById('checkout-items');
    const carrello = JSON.parse(localStorage.getItem('carrello_musica')) || [];
    const isScuola = localStorage.getItem('userType') === 'scuola';
    
    let totaleScontato = 0;
    let html = "";

    if (carrello.length === 0) {
        window.location.href = 'carrello.html';
        return;
    }

    carrello.forEach(item => {
        let prezzoFinale = item.prezzoUnitario;
        if (item.tipo === 'acquisto' && isScuola) {
            prezzoFinale = item.prezzoUnitario * 0.85;
        }
        
        const subTotaleScontato = prezzoFinale * item.quantita;
        totaleScontato += subTotaleScontato;

        html += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="pe-2">
                    <small class="text-white d-block">${item.marca} ${item.modello}</small>
                    <small class="text-white-50">${item.quantita}x | ${item.tipo.toUpperCase()}</small>
                </div>
                <span class="text-white small">€ ${subTotaleScontato.toFixed(2)}</span>
            </div>
        `;
    });

    container.innerHTML = html;
    
    const containerSconto = document.getElementById("sconto");
    if (containerSconto) {
        if (isScuola) {
            containerSconto.innerHTML = `
                <div class="w-100 text-end">
                    <small class="text-success fw-bold" style="font-size: 0.75rem;">
                        <i class="bi bi-percentage"></i> Sconto Scuola 15% incluso negli acquisti
                    </small>
                </div>`;
        } else {
            containerSconto.innerHTML = "";
        }
    }

    document.getElementById('check-total').innerText = `€ ${totaleScontato.toFixed(2)}`;
}

function confermaOrdine() {
    const form = document.getElementById('paymentForm');

    // --- TRIGGER DEL FUMETTO NATIVO ---
    // Se il form ha campi obbligatori vuoti, il browser mostra il fumetto e ferma la funzione
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // 1. Riferimenti ai campi per validazione avanzata
    const inputs = document.querySelectorAll('input[required]');
    const emailInput = document.getElementById('payEmail');
    const cardInput = document.getElementById('payCard');
    const expInput = document.getElementById('payExp');
    const cvcInput = document.getElementById('payCvc');
    
    let isValid = true;

    // Reset errori grafici precedenti
    inputs.forEach(i => i.classList.remove('is-invalid', 'border-danger'));

    // Validazione Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && !emailRegex.test(emailInput.value)) {
        emailInput.classList.add('is-invalid', 'border-danger');
        isValid = false;
    }

    // Validazione Carta (almeno 16 cifre)
    const cleanCard = cardInput.value.replace(/\s+/g, '');
    if (cardInput && (cleanCard.length < 16 || isNaN(cleanCard))) {
        cardInput.classList.add('is-invalid', 'border-danger');
        isValid = false;
    }

    // Validazione Scadenza (MM/AA)
    const expRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (expInput && !expRegex.test(expInput.value)) {
        expInput.classList.add('is-invalid', 'border-danger');
        isValid = false;
    }

    // Validazione CVC (3 cifre)
    if (cvcInput && (cvcInput.value.length !== 3 || isNaN(cvcInput.value))) {
        cvcInput.classList.add('is-invalid', 'border-danger');
        isValid = false;
    }

    // Se i dati sono logicamente errati (es. carta troppo corta)
    if (!isValid) {
        Swal.fire({
            icon: 'error',
            title: '<span style="color: #fff">Oops! Pagamento non riuscito</span>',
            text: 'I dati inseriti non sembrano corretti. Controlla i campi evidenziati.',
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)'
        });
        return;
    }

    Swal.fire({
        title: '<span style="color: #fff">Confermi l\'acquisto?</span>',
        text: "L'importo verrà addebitato sulla tua carta.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: 'var(--brand-color)',
        cancelButtonColor: '#333',
        confirmButtonText: 'Sì, paga ora!',
        cancelButtonText: 'Annulla',
        background: '#151515',
    }).then((result) => {
        if (result.isConfirmed) {
            // 3. SE L'UTENTE CONFERMA, PARTE IL CARICAMENTO
            eseguiTransazione(form);
        }
    });
}

// Funzione di supporto per pulire il codice
function eseguiTransazione(form) {
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Elaborazione...`;

    setTimeout(() => {
        Swal.fire({
            icon: 'success',
            title: '<span style="color: #fff">Pagamento Autorizzato!</span>',
            html: '<p style="color: #aaa">Il tuo ordine è in viaggio. Preparati a suonare!</p>',
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)',
            confirmButtonText: 'Ottimo!'
        }).then(() => {
            localStorage.removeItem('carrello_musica');
            window.location.href = 'index.html';
        });
    }, 2000);
}