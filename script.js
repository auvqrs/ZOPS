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

  // -------------------- UPDATE VOTES --------------------
  async function updateVotes() {
    for (let songDiv of songs) {
      const song = songDiv.dataset.song;

      const { count: likesCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('song', song)
        .eq('vote_type', 'like');

      const { count: dislikesCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('song', song)
        .eq('vote_type', 'dislike');

      const likeEl = songDiv.querySelector('.count-like');
      const dislikeEl = songDiv.querySelector('.count-dislike');

      if (likeEl) likeEl.textContent = likesCount ?? 0;
      if (dislikeEl) dislikeEl.textContent = dislikesCount ?? 0;
    }
  }

  updateVotes();

  // -------------------- LIKE / DISLIKE --------------------
  songs.forEach(songDiv => {
    const song = songDiv.dataset.song;
    const likeBtn = songDiv.querySelector('.like');
    const dislikeBtn = songDiv.querySelector('.dislike');

    // Load previous vote from localStorage
    const voted = JSON.parse(localStorage.getItem('votedSongs') || '{}');
    if (voted[song]) {
      if (voted[song] === 'like') {
        likeBtn.classList.add('selected');
        likeBtn.textContent = '👍 You voted';
      } else {
        dislikeBtn.classList.add('selected');
        dislikeBtn.textContent = '👎 You voted';
      }
      likeBtn.disabled = true;
      dislikeBtn.disabled = true;
    }

    async function vote(type) {
      if (voted[song]) return; // Already voted for this song

      const { error } = await supabase
        .from('votes')
        .insert({ song, vote_type: type, client_id: clientId });

      if (error) {
        console.error('Vote failed:', error);
        return;
      }

      // Mark voted locally
      voted[song] = type;
      localStorage.setItem('votedSongs', JSON.stringify(voted));

      // Update button visuals & disable
      if (type === 'like') {
        likeBtn.classList.add('selected');
        likeBtn.textContent = '👍 You voted';
      } else {
        dislikeBtn.classList.add('selected');
        dislikeBtn.textContent = '👎 You voted';
      }
      likeBtn.disabled = true;
      dislikeBtn.disabled = true;

      updateVotes();
    }

    likeBtn.addEventListener('click', () => vote('like'));
    dislikeBtn.addEventListener('click', () => vote('dislike'));
  });

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

  // -------------------- AUDIO PLAYBACK --------------------
  songs.forEach(songDiv => {
    const audio = songDiv.querySelector('audio');
    const playBtn = songDiv.querySelector('.play');
    const progress = songDiv.querySelector('.progress');
    const currentTimeEl = songDiv.querySelector('.current');
    const durationEl = songDiv.querySelector('.duration');

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playBtn.textContent = '⏸';
      } else {
        audio.pause();
        playBtn.textContent = '▶';
      }
    });

    audio.addEventListener('ended', () => {
      playBtn.textContent = '▶';
    });

    audio.addEventListener('timeupdate', () => {
      if (progress) progress.value = (audio.currentTime / audio.duration) * 100 || 0;
      if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      if (durationEl) durationEl.textContent = formatTime(audio.duration);
    });

    progress.addEventListener('input', () => {
      audio.currentTime = (progress.value / 100) * audio.duration;
    });

    function formatTime(t) {
      if (!t || isNaN(t)) return '0:00';
      const min = Math.floor(t / 60);
      const sec = Math.floor(t % 60).toString().padStart(2, '0');
      return `${min}:${sec}`;
    }
  });
});
