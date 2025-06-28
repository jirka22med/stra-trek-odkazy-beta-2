// links.js

// Zde bude tvé pole s počátečními odkazy.
// DŮLEŽITÉ: Obsahuje pouze HTTPS URL adresy pro zajištění online funkčnosti.
const initialLinks = [
    { name: 'Starfleet Command', url: 'https://www.startrek.com' },
    { name: 'Vincentka Sirup', url: 'https://www.benu.cz/vincentka-sirup-s-jitrocelem-a-materidouskou-200ml' },
    { name: 'Star Trek Universe', url: 'https://jirka22med.github.io/star-trek-universe/' },
    { name: 'QR Kód Generátor', url: 'https://jirka22med.github.io/qr-kod-generato-novy/' },
    { name: 'ST Hudební přehrávač (mobil)', url: 'https://jirka22med.github.io/Star-Trek-audio-prehravac-novy-2/' },
    { name: 'ST Hudební přehrávač v.2.1', url: 'https://jirka22med.github.io/Star-Trek-Hudebni-prehravac/' },
    { name: 'Star Trek Hudební Přehravač 3', url: 'https://jirka22med.github.io/-jirka22med-star-trek-audio-player-v.3/' },
    { name: 'Můj osobní web (Genesis)', url: 'https://jirka22med.github.io/jirikuv-projekt-genesis/index.html' },
    { name: 'Pokročilý váhový tracker', url: 'https://jirka22med.github.io/moje-vaha-log-beta-2/' },
    { name: 'Jirkův váhový tracker', url: 'https://jirka22med.github.io/jirikuv-vahovy-tracker/' },
    { name: 'audio prehravac test', url: 'https://jirka22med.github.io/-jirka22med-star-trek-audio-player-v.3/' },
    { name: 'prehravac', url: 'https://jirka22med.github.io/star-trek-hudebni-prehravac-2/' },
    { name: 'firebase-synced-player', url: 'https://jirka22med.github.io/firebase-synced-player/' },
    { name: 'Star Trek: Kapitoly', url: 'https://jirka22med.github.io/Pribehy-posadek-Enerprise/' },
    { name: 'Můj osobní web', url: 'https://jirka22med.github.io/muj-osobni-web/' },
    { name: 'Example Link 8', url: 'https://example.com/link8' },    
    { name: 'Example Link 9', url: 'https://example.com/link9' },
    { name: 'Example Link 10', url: 'https://example.com/link10' },
    { name: 'Example Link 11', url: 'https://example.com/link11' },
    { name: 'Example Link 12', url: 'https://example.com/link12' },
    { name: 'Example Link 13', url: 'https://example.com/link13' },
    { name: 'Example Link 14', url: 'https://example.com/link14' },
    { name: 'Example Link 15', url: 'https://example.com/link15' },
    { name: 'Example Link 16', url: 'https://example.com/link16' },
    { name: 'Example Link 17', url: 'https://example.com/link17' },
    { name: 'Example Link 18', url: 'https://example.com/link18' },
];


// Získání odkazů na HTML elementy
const linksTableBody = document.getElementById('linksTableBody');
const addLinkButton = document.getElementById('addLinkButton');
const linkNameInput = document.getElementById('linkName');
const linkUrlInput = document.getElementById('linkUrl');
const syncStatusMessageElement = document.getElementById('syncStatusMessage');
const clearAllLinksButton = document.getElementById('clearAllLinksButton'); // NOVÉ: Tlačítko pro smazání všech odkazů

// Funkce pro zobrazení/skrytí zprávy o synchronizaci
function toggleSyncMessage(show) {
    if (syncStatusMessageElement) {
        syncStatusMessageElement.style.display = show ? 'block' : 'none';
    }
}

// Funkce pro dynamické plnění tabulky (UPRAVENO: Přidá tlačítka pro přesun A EDITACI)
function populateLinksTable(links) {
    linksTableBody.innerHTML = '';    

    if (links.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="4" style="text-align: center; color: #888;">Žádné odkazy v Hvězdné databázi.</td>`;
        linksTableBody.appendChild(noDataRow);
        return;
    }

    links.forEach((link, index) => { // Link objekt by měl nyní obsahovat orderIndex z Firebase
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${link.name}</td>
            <td><a href="${link.url}" target="_blank" title="${link.url}">${link.url.length > 50 ? link.url.substring(0, 47) + '...' : link.url}</a></td>
            <td>
                <div class="action-buttons">
                    <button class="move-up-button" data-id="${link.id}" data-order="${link.orderIndex}" ${index === 0 ? 'disabled' : ''}>⬆️</button>
                    <button class="move-down-button" data-id="${link.id}" data-order="${link.orderIndex}" ${index === links.length - 1 ? 'disabled' : ''}>⬇️</button>
                    <button class="edit-link-button" data-id="${link.id}" data-name="${link.name}" data-url="${link.url}">✏️</button> <button class="delete-link-button" data-id="${link.id}">🗑️</button>
                </div>
            </td>
        `;
        linksTableBody.appendChild(row);

        // Posluchače událostí pro tlačítka Smazat, Nahoru, Dolů
        row.querySelector('.delete-link-button').addEventListener('click', async (e) => {
            const linkIdToDelete = e.target.dataset.id;
            if (confirm('Opravdu chcete smazat tento odkaz z Hvězdné databáze? Tato akce je nevratná.')) {
                toggleSyncMessage(true);    
                const success = await window.deleteLinkFromFirestore(linkIdToDelete);
                if (success) {
                    await loadAndDisplayLinks();    
                } else {
                    alert('Chyba při mazání odkazu. Zkuste to prosím znovu.');
                }
                toggleSyncMessage(false);    
            }
        });

        // Posluchače pro tlačítka přesunu
        row.querySelector('.move-up-button').addEventListener('click', async (e) => {
            const currentLink = { id: e.target.dataset.id, orderIndex: parseInt(e.target.dataset.order) };
            await moveLink(currentLink, 'up', links);    
        });

        row.querySelector('.move-down-button').addEventListener('click', async (e) => {
            const currentLink = { id: e.target.dataset.id, orderIndex: parseInt(e.target.dataset.order) };
            await moveLink(currentLink, 'down', links);    
        });

        // NOVÝ Posluchač pro tlačítko EDITACE
        row.querySelector('.edit-link-button').addEventListener('click', async (e) => {
            const linkIdToEdit = e.target.dataset.id;
            const currentName = e.target.dataset.name;
            const currentUrl = e.target.dataset.url;

            // Použijeme prompt pro jednoduché získání nových hodnot
            const newName = prompt('Zadejte nový název pro odkaz:', currentName);
            // Zkontrolujeme, zda uživatel nezrušil prompt nebo nezadal prázdný název
            if (newName === null || newName.trim() === '') {
                alert('Editace zrušena nebo název odkazu nemůže být prázdný.');
                return;
            }

            const newUrl = prompt('Zadejte novou URL pro odkaz:', currentUrl);
            // Zkontrolujeme, zda uživatel nezrušil prompt nebo nezadal prázdnou URL
            if (newUrl === null || newUrl.trim() === '') {
                alert('Editace zrušena nebo URL odkazu nemůže být prázdná.');
                return;
            }

            // Pokud jsou nové hodnoty stejné jako staré, nic nedělej
            if (newName.trim() === currentName.trim() && newUrl.trim() === currentUrl.trim()) {
                alert('Nebyly provedeny žádné změny.');
                return;
            }
            
            toggleSyncMessage(true); // Zobrazíme zprávu o synchronizaci
            const success = await window.updateLinkInFirestore(linkIdToEdit, newName.trim(), newUrl.trim());
            
            if (success) {
                alert('Odkaz byl úspěšně aktualizován!');
                await loadAndDisplayLinks(); // Znovu načteme a zobrazíme odkazy
            } else {
                alert('Chyba při aktualizaci odkazu. Zkuste to prosím znovu.');
            }
            toggleSyncMessage(false); // Skryjeme zprávu o synchronizaci
        });
    });
}

// Funkce: Přesun odkazu nahoru/dolů
async function moveLink(currentLink, direction, allLinks) {
    const currentIndex = allLinks.findIndex(link => link.id === currentLink.id);
    let targetIndex = -1;

    if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < allLinks.length - 1) {
        targetIndex = currentIndex + 1;
    }

    if (targetIndex !== -1) {
        const targetLink = allLinks[targetIndex];    

        toggleSyncMessage(true);
        const success = await window.updateLinkOrderInFirestore(
            currentLink.id, currentLink.orderIndex,
            targetLink.id, targetLink.orderIndex
        );

        if (success) {
            await loadAndDisplayLinks();    
        } else {
            alert(`Chyba při přesouvání odkazu ${direction === 'up' ? 'nahoru' : 'dolů'}. Zkuste to prosím znovu.`);
        }
        toggleSyncMessage(false);
    }
}


// Funkce: Jednorázový import počátečních odkazů do Firebase
async function importInitialLinksToFirebase() {
    console.log("links.js: Detekována prázdná databáze. Spouštím import počátečních odkazů.");
    toggleSyncMessage(true);
    let successCount = 0;
    for (let i = 0; i < initialLinks.length; i++) {
        const link = initialLinks[i];
        const success = await window.addLinkToFirestore(link.name, link.url, i);    
        if (success) {
            successCount++;
        } else {
            console.error(`links.js: Chyba při importu odkazu: ${link.name}`);
        }
    }
    console.log(`links.js: Import dokončen. Úspěšně importováno ${successCount} z ${initialLinks.length} odkazů.`);
    toggleSyncMessage(false);
    await loadAndDisplayLinks();    
}


// Funkce pro načtení a zobrazení odkazů
async function loadAndDisplayLinks() {
    toggleSyncMessage(true);    

    const firebaseInitialized = await window.initializeFirebaseLinksApp();
    if (!firebaseInitialized) {
        console.error("Chyba: Firebase pro odkazy nebylo inicializováno.");
        linksTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #dc3545;">Chyba: Nelze se připojit k databázi odkazů. Zkontrolujte připojení a Firebase konzoli.</td></tr>';
        toggleSyncMessage(false);    
        return;
    }

    let links = await window.getLinksFromFirestore();
    
    // Logika "POČÁTEČNÍHO OSIVA"
    if (links.length === 0 && initialLinks.length > 0) {
        console.log("links.js: Firebase databáze odkazů je prázdná, ale initialLinks obsahuje data.");
        await importInitialLinksToFirebase();
        links = await window.getLinksFromFirestore();
    }

    populateLinksTable(links);
    
    toggleSyncMessage(false);    
}

// Obsluha přidání odkazu
if (addLinkButton) {
    addLinkButton.addEventListener('click', async () => {
        const linkName = linkNameInput.value.trim();
        const linkUrl = linkUrlInput.value.trim();

        if (linkName && linkUrl) {
            toggleSyncMessage(true);    
            const currentLinks = await window.getLinksFromFirestore();
            const newOrderIndex = currentLinks.length > 0 ? Math.max(...currentLinks.map(l => l.orderIndex)) + 1 : 0;

            const success = await window.addLinkToFirestore(linkName, linkUrl, newOrderIndex);
            if (success) {
                linkNameInput.value = '';    
                linkUrlInput.value = '';
                await loadAndDisplayLinks();    
            } else {
                alert('Chyba při přidávání odkazu. Zkuste to prosím znovu.');
            }
            toggleSyncMessage(false);    
        } else {
            alert('Prosím, zadejte název i URL odkazu.');
        }
    });
}

// NOVÉ: Obsluha tlačítka pro smazání VŠECH odkazů (OPRAVENO!)
if (clearAllLinksButton) {
    clearAllLinksButton.addEventListener('click', async () => {
        console.log("clearAllLinksButton: Spuštěn proces mazání VŠECH odkazů.");
        if (confirm('⚠️ OPRAVDU chcete smazat VŠECHNY odkazy z Hvězdné databáze? Tato akce nelze vrátit zpět!')) {
            if (confirm('⚠️ JSTE SI ABSOLUTNĚ JISTI? Všechny odkazy budou nenávratně ztraceny!')) {
                toggleSyncMessage(true);
                
                try {
                    // Získáme všechny odkazy a postupně je smažeme
                    const allLinks = await window.getLinksFromFirestore();
                    let deleteCount = 0;
                    
                    for (const link of allLinks) {
                        const success = await window.deleteLinkFromFirestore(link.id);
                        if (success) {
                            deleteCount++;
                        }
                    }
                    
                    console.log(`Smazáno ${deleteCount} z ${allLinks.length} odkazů.`);
                    
                    if (deleteCount === allLinks.length) {
                        await loadAndDisplayLinks();
                        alert('Všechny odkazy byly úspěšně smazány a databáze resetována!');
                    } else {
                        alert(`Smazáno pouze ${deleteCount} z ${allLinks.length} odkazů. Zkuste to prosím znovu.`);
                    }
                    
                } catch (error) {
                    console.error("Chyba při mazání všech odkazů:", error);
                    alert('Chyba při mazání všech odkazů. Zkuste to prosím znovu.');
                }
                
                toggleSyncMessage(false);
            } else {
                console.log("clearAllLinksButton: Mazání všech odkazů zrušeno uživatelem (2. fáze).");
            }
        } else {
            console.log("clearAllLinksButton: Mazání všech odkazů zrušeno uživatelem (1. fáze).");
        }
    });
}


// Inicializace: Načtení a zobrazení odkazů při načtení stránky
document.addEventListener('DOMContentLoaded', loadAndDisplayLinks);
