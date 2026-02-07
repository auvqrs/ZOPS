const input = document.getElementById("lapsus");
const btn = document.getElementById("submit");
const msg = document.getElementById("msg");

btn.addEventListener("click", async () => {
  const value = input.value.trim();

  if (!value) {
    msg.textContent = "⚠️ Molimo unesite lapsus.";
    msg.style.color = "#ff4d4d";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Slanje...";

  const { error } = await supabase
    .from("lapsusi")
    .insert([{ text: value }]);

  if (error) {
    msg.textContent = "❌ Došlo je do greške. Pokušajte ponovo.";
    msg.style.color = "#ff4d4d";
    console.error(error);
  } else {
    msg.textContent = "✅ Hvala! Lapsus je uspešno poslat.";
    msg.style.color = "#1db954";
    input.value = "";
  }

  btn.disabled = false;
  btn.textContent = "Pošalji lapsus";
});
