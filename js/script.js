const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---------- Gallery ----------
// Auto-loads images from assets/gallery/ via the GitHub Contents API — just add
// image files to that folder in the repo and they'll show up here, no code changes.
(() => {
  const GALLERY_REPO = 'LucasPalomino/lucaspalomino.github.io';
  const GALLERY_PATH = 'assets/gallery';
  const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

  const track = document.getElementById('galleryTrack');
  const status = document.getElementById('galleryStatus');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  if (!track) return;

  let index = 0;
  let photos = [];

  const visibleCount = () => (window.matchMedia('(max-width: 640px)').matches ? 2 : 3);

  const maxIndex = () => Math.max(0, photos.length - visibleCount());

  const update = () => {
    const step = track.children[0]?.getBoundingClientRect().width ?? 0;
    const gap = 12;
    track.style.transform = `translateX(-${index * (step + gap)}px)`;
  };

  prevBtn.addEventListener('click', () => {
    index = index <= 0 ? maxIndex() : index - 1;
    update();
  });

  nextBtn.addEventListener('click', () => {
    index = index >= maxIndex() ? 0 : index + 1;
    update();
  });

  window.addEventListener('resize', () => {
    index = Math.min(index, maxIndex());
    update();
  });

  fetch(`https://api.github.com/repos/${GALLERY_REPO}/contents/${GALLERY_PATH}`)
    .then((res) => {
      if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
      return res.json();
    })
    .then((files) => {
      photos = files
        .filter((f) => f.type === 'file' && IMAGE_EXT.test(f.name))
        .sort((a, b) => a.name.localeCompare(b.name));

      if (!photos.length) {
        status.textContent = 'No photos yet — check back soon.';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
      }

      track.innerHTML = '';
      photos.forEach((file) => {
        const figure = document.createElement('div');
        figure.className = 'gallery-photo';
        const img = document.createElement('img');
        img.src = file.download_url;
        img.alt = 'Lucas Palomino presenting or working';
        img.loading = 'lazy';
        figure.appendChild(img);
        track.appendChild(figure);
      });
      update();
    })
    .catch(() => {
      status.textContent = 'Photos couldn’t be loaded right now.';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    });
})();
