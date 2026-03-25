// 1. Inicijalizacija - koristimo window.supabase definisan u HTML-u
const supabase = window.supabase;

const jutjuberi = [
    "Baka Prase", "Mudja", "Dex Rock", "SerbianGamesBL", "Choda", 
    "Yasserstain", "Janko", "Omco", "Nugato", "Mihajlo Mandic", 
    "Iggy Player", "HCL", "BloodMaster", "Marko KOFS", "Stuberi", 
    "Imperator FX", "DjotaFreestyle", "Braco Gajic", "Full Burazeri", 
    "AdnanBro", "Nixa Zizu", "Gasttozz", "Dnevnjak", "Cile ST", 
    "Anja Bla", "Jana Dacovic", "Momcadija", "Mario Vreco", "Bakistut", "Lux"
];

const grid = document.getElementById('youtubersList');
const slots = document.querySelectorAll('.rank-slot');
const msgLabel = document.getElementById('msg');

// Pomocne promenljive za mobilni (Click-to-Select)
let selectedIme = null;
let selectedCardId = null;

// 2. Funkcija za pravljenje kartica
function createCard(ime) {
    const card = document.createElement('div');
    card.className = 'yt-card';
    card.innerText = ime;
    card.draggable = true;
    // Pravimo unikatan ID bez razmaka
    card.id = "card-" + ime.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    // DRAG LOGIKA (PC)
    card.ondragstart = (e) => {
        e.dataTransfer.setData("text", e.target.id);
        e.dataTransfer.setData("ime", ime);
        card.classList.add('dragging');
    };

    card.ondragend = () => card.classList.remove('dragging');

    // CLICK LOGIKA (Mobilni)
    card.onclick = () => {
        // Resetuj prethodno selektovanu karticu
        document.querySelectorAll('.yt-card').forEach(c => c.classList.remove('selected'));
        
        // Selektuj novu
        selectedIme = ime;
        selectedCardId = card.id;
        card.classList.add('selected');
        
        showStatus("Izabrano: " + ime + ". Klikni na prazan slot ispod.", "success");
    };
    
    grid.appendChild(card);
}

// 3. Inicijalizacija liste (Abecedno)
function initList() {
    grid.innerHTML = '';
    [...jutjuberi].sort((a, b) => a.localeCompare(b)).forEach(ime => {
        createCard(ime);
    });
}

// 4. Logika za Slotove
slots.forEach(slot => {
    const dropArea = slot.querySelector('.drop-area');
    
    // DRAG OVER efekti
    slot.ondragover = (e) => {
        e.preventDefault();
        if (!dropArea.classList.contains('filled')) {
            slot.classList.add('drag-over');
        }
    };

    slot.ondragleave = () => slot.classList.remove('drag-over');
    
    // DROP LOGIKA (PC)
    slot.ondrop = (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        
        const cardId = e.dataTransfer.getData("text");
        const ime = e.dataTransfer.getData("ime");
        
        if (ime && !dropArea.classList.contains('filled')) {
            fillSlot(slot, ime);
            document.getElementById(cardId)?.remove();
        }
    };

    // CLICK LOGIKA NA SLOT (Mobilni)
    slot.onclick = () => {
        if (selectedIme && !dropArea.classList.contains('filled')) {
            const card = document.getElementById(selectedCardId);
            if (card) {
                fillSlot(slot, selectedIme);
                card.remove();
                // Resetuj selekciju
                selectedIme = null;
                selectedCardId = null;
            }
        }
    };
});

// Funkcija koja popunjava slot podacima
function fillSlot(slot, ime) {
    const dropArea = slot.querySelector('.drop-area');
    dropArea.innerText = ime;
    dropArea.classList.add('filled');
    
    // Klik na popunjen slot vraca jutjubera nazad
    dropArea.onclick = (e) => {
        e.stopPropagation(); // Spreci okidanje onclick-a samog slota
        removeFromRank(slot, ime);
    };
}

function removeFromRank(slot, ime) {
    const dropArea = slot.querySelector('.drop-area');
    dropArea.innerText = "Prazno";
    dropArea.classList.remove('filled');
    dropArea.onclick = null;
    
    // Vrati na listu i ponovo sortiraj abecedno
    createCard(ime);
    const cards = Array.from(grid.children);
    cards.sort((a, b) => a.innerText.localeCompare(b.innerText));
    grid.innerHTML = '';
    cards.forEach(c => grid.appendChild(c));
}

// 5. Slanje u Supabase
document.getElementById('submitVote').onclick = async () => {
    const finalRank = Array.from(slots).map(s => s.querySelector('.drop-area').innerText);
    
    if (finalRank.includes("Prazno")) {
        showStatus("Popuni svih 5 mesta pre glasanja!", "error");
        return;
    }

    if (localStorage.getItem('voted_yt')) {
        showStatus("Već si glasao sa ovog uređaja!", "error");
        return;
    }

    const btn = document.getElementById('submitVote');
    btn.disabled = true;
    btn.innerText = "Slanje...";

    try {
        const { error } = await supabase
            .from('yt_glasanje') 
            .insert([{ 
                top1: finalRank[0], 
                top2: finalRank[1], 
                top3: finalRank[2], 
                top4: finalRank[3], 
                top5: finalRank[4] 
            }]);

        if (error) throw error;

        showStatus("Glasanje uspešno poslato!", "success");
        btn.innerText = "Glasanje završeno";
        localStorage.setItem('voted_yt', 'true');
        
    } catch (err) {
        console.error(err);
        showStatus("Greška: " + err.message, "error");
        btn.disabled = false;
        btn.innerText = "Pokušaj ponovo";
    }
};

// 6. Dugme za rezultate
const resBtn = document.getElementById('viewResults');
if (resBtn) {
    resBtn.addEventListener('click', () => {
        window.location.href = 'rezultati.html';
    });
}

function showStatus(text, type) {
    msgLabel.innerText = text;
    msgLabel.style.color = type === "success" ? "#1db954" : "#ff4444";
}

// Pokreni listu
initList();
