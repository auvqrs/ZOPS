// 1. Inicijalizacija
const jutjuberi = [
    "AdnanBro", "Anja Bla", "Baka Prase", "Bakistut", "BBT", "BloodMaster", 
    "Braco Gajic", "Choda", "Cile ST", "Dex Rock", "DjotaFreestyle", 
    "Dnevnjak", "Full Burazeri", "Gasttozz", "HCL", "Iggy Player", 
    "Imperator FX", "Jana Dacovic", "Janko", "Mario Vreco", "Marko KOFS", 
    "Mihajlo Mandic", "Momcadija", "Mudja", "Nixa Zizu", "Nugato", "Omco", 
    "SerbianGamesBL", "Stuberi", "Yasserstain", "Lux"
];

const grid = document.getElementById('youtubersList');
const slots = document.querySelectorAll('.rank-slot');
const msgLabel = document.getElementById('msg');

// Promenljive za "Click-to-Select" (Mobilni fiks)
let selectedIme = null;
let selectedCardId = null;

// 2. Funkcija za kreiranje kartice
function createCard(ime) {
    const card = document.createElement('div');
    card.className = 'yt-card';
    card.innerText = ime;
    card.draggable = true;
    card.id = "card-" + ime.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    // DRAG START (Za kompjuter)
    card.ondragstart = (e) => {
        e.dataTransfer.setData("text", e.target.id);
        e.dataTransfer.setData("ime", ime);
    };

    // KLIK / DODIR (Za telefon - KLJUČNA POPRAVKA)
    card.onclick = () => {
        // Deselektuj sve ostale
        document.querySelectorAll('.yt-card').forEach(c => c.classList.remove('selected'));
        
        // Selektuj ovu karticu
        selectedIme = ime;
        selectedCardId = card.id;
        card.classList.add('selected');
        
        showStatus("Izabrano: " + ime + ". Sada dodirni jedan od slotova.", "success");
    };
    
    grid.appendChild(card);
}

// 3. Inicijalizacija liste
function initList() {
    grid.innerHTML = '';
    [...jutjuberi].sort((a, b) => a.localeCompare(b)).forEach(ime => createCard(ime));
}

// 4. Logika za Slotove (Mobilni + PC)
slots.forEach(slot => {
    const dropArea = slot.querySelector('.drop-area');

    // KLIK NA SLOT (Mobilni fiks)
    slot.onclick = () => {
        if (selectedIme && !dropArea.classList.contains('filled')) {
            const card = document.getElementById(selectedCardId);
            if (card) {
                fillSlot(slot, selectedIme);
                card.remove(); // Skloni ga sa liste
                // Resetuj selekciju
                selectedIme = null;
                selectedCardId = null;
            }
        }
    };

    // DROP (Za kompjuter)
    slot.ondragover = (e) => e.preventDefault();
    slot.ondrop = (e) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData("text");
        const ime = e.dataTransfer.getData("ime");
        if (ime && !dropArea.classList.contains('filled')) {
            fillSlot(slot, ime);
            document.getElementById(cardId)?.remove();
        }
    };
});

// Pomoćna funkcija za popunjavanje slota
function fillSlot(slot, ime) {
    const dropArea = slot.querySelector('.drop-area');
    dropArea.innerText = ime;
    dropArea.classList.add('filled');
    
    // Klik na popunjen slot vraća nazad na listu
    dropArea.onclick = (e) => {
        e.stopPropagation(); // Bitno da se ne aktivira slot.onclick
        removeFromRank(slot, ime);
    };
}

function removeFromRank(slot, ime) {
    const dropArea = slot.querySelector('.drop-area');
    dropArea.innerText = "Prazno";
    dropArea.classList.remove('filled');
    dropArea.onclick = null;
    
    createCard(ime);
    // Sortiranje liste nakon vraćanja
    const cards = Array.from(grid.children);
    cards.sort((a, b) => a.innerText.localeCompare(b.innerText));
    grid.innerHTML = '';
    cards.forEach(c => grid.appendChild(c));
}

// 5. Slanje glasova u Supabase
document.getElementById('submitVote').onclick = async () => {
    const finalRank = Array.from(slots).map(s => s.querySelector('.drop-area').innerText);
    
    if (finalRank.includes("Prazno")) {
        showStatus("Moraš popuniti svih 5 mesta!", "error");
        return;
    }

    if (localStorage.getItem('voted_yt')) {
        showStatus("Već si glasao!", "error");
        return;
    }

    const btn = document.getElementById('submitVote');
    btn.disabled = true;
    btn.innerText = "Slanje...";

    try {
        const { error } = await window.supabase
            .from('yt_glasanje') 
            .insert([{ 
                top1: finalRank[0], top2: finalRank[1], top3: finalRank[2], 
                top4: finalRank[3], top5: finalRank[4] 
            }]);

        if (error) throw error;
        showStatus("Uspešno! Hvala na glasanju.", "success");
        localStorage.setItem('voted_yt', 'true');
        btn.innerText = "Završeno";
    } catch (err) {
        showStatus("Greška: " + err.message, "error");
        btn.disabled = false;
        btn.innerText = "Pokušaj ponovo";
    }
};

function showStatus(text, type) {
    msgLabel.innerText = text;
    msgLabel.style.color = type === "success" ? "#1db954" : "#ff4444";
}

// Pokretanje aplikacije
window.onload = initList;
