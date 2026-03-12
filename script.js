document.addEventListener('DOMContentLoaded', () => {
  const subjectInput = document.getElementById('subject_input');
  const reasonInput = document.getElementById('reason_input');
  const submitBtn = document.getElementById('submit');
  const msg = document.getElementById('msg');

  submitBtn.addEventListener('click', async () => {
    const subject = subjectInput.value.trim();
    const reason = reasonInput.value.trim();

    // Provera da li su polja popunjena
    if (!subject || !reason) {
      msg.textContent = '❌ Molimo popunite oba polja.';
      msg.style.color = 'orange';
      return;
    }

    // Slanje podataka u tabelu "anketa_predmeti"
    const { error } = await supabase
      .from('anketa_predmeti')
      .insert([
        { 
          subject_name: subject, 
          reason_text: reason 
        }
      ]);

    if (!error) {
      msg.textContent = '✅ Vaš odgovor je uspešno sačuvan!';
      msg.style.color = 'green';
      
      // Resetovanje polja
      subjectInput.value = '';
      reasonInput.value = '';
    } else {
      msg.textContent = '❌ Greška: ' + error.message;
      msg.style.color = 'red';
      console.error(error);
    }
  });
});