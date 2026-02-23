document.addEventListener('DOMContentLoaded', () => {
  const songs = document.querySelectorAll('.song');
  const customInput = document.getElementById('custom');
  const submitBtn = document.getElementById('submit');
  const msg = document.getElementById('msg');

  // -------------------- CLIENT ID --------------------
  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem('clientId', clientId);
  }

  // -------------------- CUSTOM SONG SUBMISSION --------------------
  submitBtn.addEventListener('click', async () => {
    const songName = customInput.value.trim();
    if (!songName) return;

    const { error } = await supabase.from('custom_songs').insert({ song_name: songName });
    if (!error) {
      msg.textContent = '🎵 Your suggestion has been submitted!';
      msg.style.color = 'green';
      customInput.value = '';
    } else {
      msg.textContent = '❌ Failed to submit. Try again.';
      msg.style.color = 'red';
      console.error(error);
    }
  });

});
