document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', validazioneRegistrazione);
    }
});

function selectProfile(type) {
    document.getElementById('userType').value = type;

    const btnPrivato = document.getElementById('btnPrivato');
    const btnScuola = document.getElementById('btnScuola');
    const extraFields = document.getElementById('extraFields');

    if (type === 'scuola') {
        // Gestione Bottoni
        btnScuola.classList.add('active');
        btnPrivato.classList.remove('active');
        
        // Mostra campi extra
        extraFields.classList.remove('d-none');
        
        // Setup campi obbligatori
        setRequired(true);
    } else {
        // Gestione Bottoni
        btnPrivato.classList.add('active');
        btnScuola.classList.remove('active');
        
        // Nascondi campi extra
        extraFields.classList.add('d-none');
        
        // Setup campi obbligatori
        setRequired(false);
    }
}

// Funzione helper per pulizia
function setRequired(val) {
    document.getElementById('regScuolaNome').required = val;
    document.getElementById('regPiva').required = val;
    document.getElementById('regSede').required = val;
}

function validazioneRegistrazione(event) {
    // Blocchiamo l'invio nativo del form per gestire la validazione via JS
    event.preventDefault();

    // 1. Riferimenti ai campi principali
    const form = event.target;
    const inputsRequired = form.querySelectorAll('input[required]');
    const emailInput = document.getElementById('regEmail');
    const passInput = document.getElementById('regPass');
    const confPassInput = document.getElementById('regPassConf');
    const pivaInput = document.getElementById('regPiva');
    const userType = document.getElementById('userType').value;

    let isValid = true;

    // Reset degli errori grafici precedenti
    const allInputs = form.querySelectorAll('input');
    allInputs.forEach(i => i.classList.remove('is-invalid', 'border-danger'));

    // --- 1. VALIDAZIONE CAMPI OBBLIGATORI VUOTI ---
    // (Prende automaticamente solo i campi attivi grazie al selectProfile)
    inputsRequired.forEach(i => {
        if (!i.value.trim()) {
            i.classList.add('is-invalid', 'border-danger');
            isValid = false;
        }
    });

    // --- 2. VALIDAZIONE EMAIL ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && !emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add('is-invalid', 'border-danger');
        isValid = false;
    }

    // --- 3. VALIDAZIONE PARTITA IVA (Solo se profilo Scuola) ---
    if (userType === 'scuola' && pivaInput) {
        const cleanPiva = pivaInput.value.replace(/\s+/g, '');
        // Controllo standard: 11 cifre numeriche
        if (cleanPiva.length !== 11 || isNaN(cleanPiva)) {
            pivaInput.classList.add('is-invalid', 'border-danger');
            isValid = false;
        }
    }

    // --- 4. VALIDAZIONE PASSWORD AVANZATA ---
    if (passInput) {
        const password = passInput.value;
        
        // Regole: Minimo 8 caratteri, almeno una MAIUSCOLA, un numero e un carattere speciale (@$!%*?&)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            passInput.classList.add('is-invalid', 'border-danger');
            isValid = false;
            
            // Messaggio specifico per la password
            Swal.fire({
                icon: 'info',
                title: '<span style="color: #fff">Password troppo debole</span>',
                html: `
                    <div class="text-start text-white-50 small">
                        <p>Per la tua sicurezza, la password deve contenere:</p>
                        <ul>
                            <li>Almeno <b>8 caratteri</b></li>
                            <li>Almeno una <b>lettera maiuscola</b></li>
                            <li>Almeno un <b>numero</b></li>
                            <li>Almeno un <b>carattere speciale</b> (@, $, !, %, *, ?, &)</li>
                        </ul>
                    </div>
                `,
                background: '#151515',
                confirmButtonColor: 'var(--brand-color)'
            });
            return; // Interrompiamo subito per far correggere la password
        }
    }

    // --- 5. CONTROLlo COINCIDENZA PASSWORD ---
    if (passInput && confPassInput && passInput.value !== confPassInput.value) {
        confPassInput.classList.add('is-invalid', 'border-danger');
        isValid = false;
    }

    // Se qualcosa è andato storto, mostriamo l'errore in stile pagamento
    if (!isValid) {
        Swal.fire({
            icon: 'error',
            title: '<span style="color: #fff">Errore di Registrazione</span>',
            text: 'Controlla i campi contrassegnati in rosso. Assicurati che le password coincidano e che i dati siano corretti.',
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)'
        });
        return;
    }

    // 2. SIMULAZIONE CARICAMENTO E CREAZIONE ACCOUNT
    const submitBtn = form.querySelector('button[type="submit"]');
    const testoOriginale = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Creazione profilo...`;

    setTimeout(() => {
        // Salviamo il tipo utente nel localStorage per simulare il login andato a buon fine
        localStorage.setItem('userType', userType);
        localStorage.setItem('userName', document.getElementById('regNome').value);

        Swal.fire({
            icon: 'success',
            title: '<span style="color: #fff">Profilo Creato!</span>',
            html: '<p style="color: #aaa">Benvenuto nella nostra rete musicale. Il tuo account è attivo!</p>',
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)',
            confirmButtonText: 'Inizia a Suonare'
        }).then(() => {
            // Reindirizzamento alla homepage o al carrello
            window.location.href = 'account.html';
        });
    }, 1800);
}