// links.js - ÚPLNÝ KÓD PRO MODERNÍ DESIGN S KARTAMI

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
];

const linksContainer = document.getElementById('linksContainer');
const addLinkButton = document.getElementById('addLinkButton');
const linkNameInput = document.getElementById('linkName');
const linkUrlInput = document.getElementById('linkUrl');
const syncStatusMessageElement = document.getElementById('syncStatusMessage');
const clearAllLinksButton = document.getElementById('clearAllLinksButton');

const editLinkModal = document.getElementById('editLinkModal');
const modalLinkId = document.getElementById('modalLinkId');
const modalLinkName = document.getElementById('modalLinkName');
const modalLinkUrl = document.getElementById('modalLinkUrl');
const saveEditButton = document.getElementById('saveEditButton');
const cancelEditButton = document.getElementById('cancelEditButton');

let syncMessageTimeout;

// Funkce pro zobrazení/skrytí zprávy o synchronizaci
function toggleSyncMessage(show, message = "Probíhá synchronizace dat...", isError = false) {
    if (!syncStatusMessageElement) return;

    clearTimeout(syncMessageTimeout);

    syncStatusMessageElement.textContent = message;
    syncStatusMessageElement.classList.toggle('error', isError);

    if (show) {
        syncStatusMessageElement.style.display = 'block';
        syncStatusMessageElement.style.opacity = '1';
        syncMessageTimeout = setTimeout(() => {
            syncStatusMessageElement.style.opacity = '0';
            setTimeout(() => {
                syncStatusMessageElement.style.display = 'none';
            }, 300);
        }, isError ? 4000 : 2000);
    } else {
        syncStatusMessageElement.style.opacity = '0';
        setTimeout(() => {
            syncStatusMessageElement.style.display = 'none';
        }, 300);
    }
}

// Funkce pro zobrazení modalu
function showEditModal(id, name, url) {
    modalLinkId.value = id;
    modalLinkName.value = name;
    modalLinkUrl.value = url;
    editLinkModal.classList.add('active');
    modalLinkName.focus();
}

// Funkce pro skrytí modalu
function hideEditModal() {
    editLinkModal.classList.remove('active');
    modalLinkId.value = '';
    modalLinkName.value = '';
    modalLinkUrl.value = '';
}

// Vytváří karty místo tabulky
function populateLinksCards(links) {
    linksContainer.innerHTML = '';

    if (links.length === 0) {
        linksContainer.innerHTML = `
            <div class="empty-state">
                <div>🌌 Žádné odkazy v Hvězdné databázi</div>
                <div style="margin-top: 10px; font-size: 0.9em; opacity: 0.6;">Přidej první odkaz pomocí formuláře výše</div>
            </div>
        `;
        return;
    }

    links.forEach((link, index) => {
        const card = document.createElement('div');
        card.className = 'link-card';
        card.innerHTML = `
            <div class="link-card-number">#${index + 1}</div>
            <div class="link-card-name">${link.name}</div>
            <div class="link-card-url">
                <a href="${link.url}" target="_blank" class="card-link" title="Otevřít v novém okně">
                    🔗 ${link.url.length > 50 ? link.url.substring(0, 47) + '...' : link.url}
                </a>
            </div>
            <div class="card-actions">
                <button class="move-up-button" data-id="${link.id}" data-order="${link.orderIndex}" ${index === 0 ? 'disabled' : ''}>⬆️ Nahoru</button>
                <button class="move-down-button" data-id="${link.id}" data-order="${link.orderIndex}" ${index === links.length - 1 ? 'disabled' : ''}>⬇️ Dolů</button>
                <button class="edit-link-button" data-id="${link.id}" data-name="${link.name}" data-url="${link.url}">✏️ Upravit</button>
                <button class="delete-link-button" data-id="${link.id}">🗑️ Smazat</button>
            </div>
        `;

        linksContainer.appendChild(card);

        // Smazání odkazu
        card.querySelector('.delete-link-button').addEventListener('click', async (e) => {
            const linkIdToDelete = e.target.dataset.id;
            if (confirm('Opravdu chcete smazat tento odkaz? Tato akce je nevratná.')) {
                toggleSyncMessage(true);
                const success = await window.deleteLinkFromFirestore(linkIdToDelete);
                if (success) {
                    await loadAndDisplayLinks();
                } else {
                    toggleSyncMessage(true, 'Chyba při mazání odkazu.', true);
                }
                toggleSyncMessage(false);
            }
        });

        // Přesun nahoru
        card.querySelector('.move-up-button').addEventListener('click', async (e) => {
            const currentLink = { id: e.target.dataset.id, orderIndex: parseInt(e.target.dataset.order) };
            await moveLink(currentLink, 'up', links);
        });

        // Přesun dolů
        card.querySelector('.move-down-button').addEventListener('click', async (e) => {
            const currentLink = { id: e.target.dataset.id, orderIndex: parseInt(e.target.dataset.order) };
            await moveLink(currentLink, 'down', links);
        });

        // Editace
        card.querySelector('.edit-link-button').addEventListener('click', (e) => {
            const linkId = e.target.dataset.id;
            const linkName = e.target.dataset.name;
            const linkUrl = e.target.dataset.url;
            showEditModal(linkId, linkName, linkUrl);
        });
    });
}

// Přesun odkazu
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
            toggleSyncMessage(true, 'Chyba při přesouvání odkazu.', true);
        }
        toggleSyncMessage(false);
    }
}

// Import počátečních odkazů
async function importInitialLinksToFirebase() {
    console.log("Importuji počáteční odkazy do Firebase...");
    toggleSyncMessage(true);
    let successCount = 0;
    
    for (let i = 0; i < initialLinks.length; i++) {
        const link = initialLinks[i];
        const success = await window.addLinkToFirestore(link.name, link.url, i);
        if (success) {
            successCount++;
        }
    }
    
    console.log(`Import dokončen: ${successCount}/${initialLinks.length}`);
    toggleSyncMessage(false);
    await loadAndDisplayLinks();
}

// Načtení a zobrazení odkazů
async function loadAndDisplayLinks() {
    toggleSyncMessage(true);

    const firebaseInitialized = await window.initializeFirebaseLinksApp();
    if (!firebaseInitialized) {
        linksContainer.innerHTML = '<div class="empty-state" style="color: #ff3333;">❌ Chyba: Nelze se připojit k Firebase databázi</div>';
        toggleSyncMessage(false);
        return;
    }

    let links = await window.getLinksFromFirestore();

    if (links.length === 0 && initialLinks.length > 0) {
        await importInitialLinksToFirebase();
        links = await window.getLinksFromFirestore();
    }

    populateLinksCards(links);
    toggleSyncMessage(false);
}

// Přidání nového odkazu
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
                toggleSyncMessage(true, 'Chyba při přidávání odkazu.', true);
            }
            toggleSyncMessage(false);
        } else {
            toggleSyncMessage(true, 'Vyplň název i URL adresu!', true);
        }
    });
}

// Smazání všech odkazů
if (clearAllLinksButton) {
    clearAllLinksButton.addEventListener('click', async () => {
        if (confirm('⚠️ OPRAVDU chcete smazat VŠECHNY odkazy?')) {
            if (confirm('⚠️ JSTE SI ABSOLUTNĚ JISTI? Toto nelze vrátit!')) {
                toggleSyncMessage(true);

                try {
                    const allLinks = await window.getLinksFromFirestore();
                    let deleteCount = 0;

                    for (const link of allLinks) {
                        const success = await window.deleteLinkFromFirestore(link.id);
                        if (success) deleteCount++;
                    }

                    if (deleteCount === allLinks.length) {
                        await loadAndDisplayLinks();
                        toggleSyncMessage(true, '✅ Všechny odkazy smazány!');
                    } else {
                        toggleSyncMessage(true, `Smazáno ${deleteCount}/${allLinks.length}.`, true);
                    }
                } catch (error) {
                    console.error("Chyba:", error);
                    toggleSyncMessage(true, 'Chyba při mazání.', true);
                }

                toggleSyncMessage(false);
            }
        }
    });
}

// Uložení úprav v modalu
if (saveEditButton) {
    saveEditButton.addEventListener('click', async () => {
        const id = modalLinkId.value;
        const newName = modalLinkName.value.trim();
        const newUrl = modalLinkUrl.value.trim();

        if (!newName || !newUrl) {
            toggleSyncMessage(true, 'Vyplň název i URL!', true);
            return;
        }

        toggleSyncMessage(true);
        const success = await window.updateLinkInFirestore(id, newName, newUrl);

        if (success) {
            toggleSyncMessage(true, '✅ Odkaz aktualizován!');
            hideEditModal();
            await loadAndDisplayLinks();
        } else {
            toggleSyncMessage(true, 'Chyba při aktualizaci.', true);
        }
        toggleSyncMessage(false);
    });
}

// Zrušení editace
if (cancelEditButton) {
    cancelEditButton.addEventListener('click', hideEditModal);
}

// Zavření modalu klikem mimo
editLinkModal.addEventListener('click', (e) => {
    if (e.target === editLinkModal) {
        hideEditModal();
    }
});

// Inicializace při načtení stránky
document.addEventListener('DOMContentLoaded', loadAndDisplayLinks);
