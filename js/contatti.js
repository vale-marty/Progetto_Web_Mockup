document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Blocca l'invio reale del form
            inviaMessaggio();
        });
    }
});

function inviaMessaggio() {
    const form = document.getElementById('contactForm');

    // 1. VALIDAZIONE NATIVA (Attiva i fumetti del browser)
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // 2. RECUPERO DATI E VALIDAZIONE AVANZATA
    const nome = document.getElementById('c-nome').value.trim();
    const telefono = document.getElementById('c-telefono').value.trim();
    const email = document.getElementById('c-email').value.trim();
    const motivo = document.getElementById('c-motivo').value;
    const messaggio = document.getElementById('c-messaggio').value.trim();

    let isValid = true;

    // Validazione Email (se inserita, dato che nell'HTML non ha required)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== "" && !emailRegex.test(email)) {
        document.getElementById('c-email').classList.add('is-invalid', 'border-danger');
        isValid = false;
    } else {
        document.getElementById('c-email').classList.remove('is-invalid', 'border-danger');
    }

    // Validazione Telefono (molto semplice: almeno 6 cifre)
    if (telefono.length < 6 || isNaN(telefono.replace(/\s+/g, ''))) {
        document.getElementById('c-telefono').classList.add('is-invalid', 'border-danger');
        isValid = false;
    } else {
        document.getElementById('c-telefono').classList.remove('is-invalid', 'border-danger');
    }

    if (!isValid) {
        Swal.fire({
            icon: 'error',
            title: '<span style="color: #fff">Dati non validi</span>',
            text: 'Per favore, controlla i campi evidenziati in rosso.',
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)'
        });
        return;
    }

    // 3. SIMULAZIONE INVIO (Loading)
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> INVIO IN CORSO...`;

    // Simuliamo una chiamata al server di 1.5 secondi
    setTimeout(() => {
        Swal.fire({
            icon: 'success',
            title: '<span style="color: #fff">Messaggio Inviato!</span>',
            html: `<p style="color: #aaa">Grazie ${nome}, ti risponderemo al più presto per la tua richiesta di <b>${motivo}</b>.</p>`,
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)',
            confirmButtonText: 'Ottimo'
        }).then(() => {
            // Reset del form e del bottone
            form.reset();
            btn.disabled = false;
            btn.innerHTML = originalText;
        });
    }, 1500);
}