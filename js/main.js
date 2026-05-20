document.addEventListener('DOMContentLoaded', () => {
    aggiornaNavbarLoggata();
    aggiornaBadgeCarrello();
});

function aggiornaNavbarLoggata() {
    const iconaAccount = document.getElementById('navAccountIcon');
    
    // Controlliamo se nel localStorage esiste una chiave che identifica l'utente
    
    const tipoUtente = localStorage.getItem('userType');

    if (tipoUtente && tipoUtente !== 'ospite') {
        // Cambia la destinazione del link
        iconaAccount.href = 'account.html'; 
        
    } else {
        // Se non è loggato punta a login.html
        iconaAccount.href = 'login.html';
    }
}

// FUNZIONE PER IL PALLINO DEL CARRELLO
function aggiornaBadgeCarrello() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;

    // Recuperiamo i dati (stessa chiave usata in carrello.js)
    const datiCarrello = localStorage.getItem('carrello_musica');
    const carrello = datiCarrello ? JSON.parse(datiCarrello) : [];

    // Calcoliamo la somma delle quantità di tutti gli oggetti
    const totaleArticoli = carrello.reduce((acc, item) => acc + item.quantita, 0);

    if (totaleArticoli > 0) {
        badge.innerText = totaleArticoli;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}