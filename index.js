
const jutjuberi = [
    "Baka Prase", "Mudja", "Dex Rock", "SerbianGamesBL", "Choda", 
    "Yasserstain", "Janko", "Omco", "Nugato", "Mihajlo Mandic", 
    "Iggy Player", "HCL", "BloodMaster", "Marko KOFS", "Stuberi", 
    "Imperator FX", "DjotaFreestyle", "Braco Gajic", "Full Burazeri", 
    "AdnanBro", "Nixa Zizu", "Gasttozz", "Dnevnjak", "Cile ST", 
    "Anja Bla", "Jana Dacovic", "Momcadija", "Mario Vreco", "Bakistut", "BBT", "Lux"
];

const grid = document.getElementById('youtubersList');
const slots = document.querySelectorAll('.rank-slot');
const msgLabel = document.getElementById('msg');

// Inicijalizacija liste (Abecedno sortirano)
function initList() {
    grid.innerHTML = '';
    [...jutjuberi].sort((a, b) => a.localeCompare(b)).forEach(ime => {
        createCard(ime);
    });
}

function createCard(ime) {
    const card = document.createElement('div');
    card.className = 'yt-card';
    card.innerText = ime;
    card.draggable = true;
    card.id = "card-" + ime.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    card.ondragstart = (e) => {
        e.dataTransfer.setData("text", e.target.id);
        e.dataTransfer.setData("ime", ime);
    };
    
    grid.appendChild(card);
}

// Drag & Drop logika za slotove
slots.forEach(slot => {
    const dropArea = slot.querySelector('.drop-area');
    
    slot.ondragover = (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
    };

    slot.ondragleave = () => {
        slot.classList.remove('drag-over');
    };
    
    slot.ondrop = (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        
        const cardId = e.dataTransfer.getData("text");
        const ime = e.dataTransfer.getData("ime");
        const card = document.getElementById(cardId);

        if (dropArea.classList.contains('filled')) return;

        if (card) {
            dropArea.innerText = ime;
            dropArea.classList.add('filled');
            card.remove(); 
            
            // Vraćanje na klik
            dropArea.onclick = () => removeFromRank(slot, ime);
        }
    };
});

function removeFromRank(slot, ime) {
    const dropArea = slot.querySelector('.drop-area');
    dropArea.innerText = "Prazno";
    dropArea.classList.remove('filled');
    dropArea.onclick = null;
    
    // Vraćamo jutjubera na listu
    createCard(ime);
    
    // Ponovo sortiramo vizuelno celu listu
    const items = Array.from(grid.children);
    items.sort((a, b) => a.innerText.localeCompare(b.innerText));
    items.forEach(item => grid.appendChild(item));
}

// Slanje u Supabase
document.getElementById('submitVote').onclick = async () => {
    const finalRank = Array.from(slots).map(s => s.querySelector('.drop-area').innerText);
    
    if (finalRank.includes("Prazno")) {
        showStatus("Popuni svih 5 mesta pre glasanja!", "error");
        return;
    }

    // Provera da li je korisnik već glasao (opciono, koristi localStorage)
    if (localStorage.getItem('voted_yt')) {
        showStatus("Već ste glasali sa ovog uređaja!", "error");
        return;
    }

    const btn = document.getElementById('submitVote');
    btn.disabled = true;
    btn.innerText = "Slanje...";

    try {
        const { error } = await supabase
            .from('yt_glasanje') 
            .insert([
                { 
                    top1: finalRank[0], 
                    top2: finalRank[1], 
                    top3: finalRank[2], 
                    top4: finalRank[3], 
                    top5: finalRank[4] 
                }
            ]);

        if (error) throw error;

        showStatus("Glasanje uspešno! Hvala.", "success");
        btn.innerText = "Glasanje završeno";
        localStorage.setItem('voted_yt', 'true'); // Zapamti da je glasao
        
    } catch (err) {
        console.error(err);
        showStatus("Greška: " + err.message, "error");
        btn.disabled = false;
        btn.innerText = "Pokušaj ponovo";
    }
};

function showStatus(text, type) {
    msgLabel.innerText = text;
    msgLabel.style.color = type === "success" ? "#1db954" : "#ff4444";
}

initList();