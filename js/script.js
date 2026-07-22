// Find our date picker inputs and the gallery on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const fetchButton = document.querySelector('button');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalCloseButton = document.getElementById('modalClose');
const modalOverlay = document.getElementById('modalOverlay');
const apiKey = 'EucIGfjtAY5kF3md1b2RhnbGSGC6pv8cOHop7ghw';
const spaceFacts = [
  'A day on Venus is longer than a year on Venus.',
  'Neptune has the fastest winds in the solar system.',
  'The Sun contains more than 99% of the mass in our solar system.',
  'A teaspoon of neutron star material would weigh about a billion tons on Earth.',
  'Jupiter has a storm larger than Earth that has lasted for hundreds of years.'
];

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Show a loading message while NASA data is being fetched
function showLoadingMessage() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔭</div>
      <p>Loading space photos…</p>
    </div>
  `;
}

function getIsoDate(date) {
  return date.toISOString().split('T')[0];
}

function addDaysToIso(isoDate, amount) {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + amount);
  return getIsoDate(date);
}

function getRangeDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function fetchApodData(startDate, endDate) {
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;

  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unable to fetch NASA images.');
      }
      return response.json();
    })
    .then((data) => (Array.isArray(data) ? data : [data]));
}

function showRandomSpaceFact() {
  const factElement = document.getElementById('spaceFact');

  if (!factElement) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  factElement.textContent = spaceFacts[randomIndex];
}

function openModal(item) {
  const imageUrl = item.url || item.thumbnail_url;

  modalImage.src = imageUrl;
  modalImage.alt = item.title;
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

// Create a gallery card for each APOD item
function createGalleryCard(item) {
  const card = document.createElement('div');
  card.className = 'gallery-item';
  card.tabIndex = 0;

  const imageUrl = item.url || item.thumbnail_url;
  const image = document.createElement('img');
  image.src = imageUrl;
  image.alt = item.title;

  const title = document.createElement('h3');
  title.textContent = item.title;

  const date = document.createElement('p');
  date.textContent = item.date;

  const explanation = document.createElement('p');
  explanation.textContent = item.explanation;

  card.appendChild(image);
  card.appendChild(title);
  card.appendChild(date);
  card.appendChild(explanation);

  card.addEventListener('click', () => {
    openModal(item);
  });

  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal(item);
    }
  });

  return card;
}

// Display the NASA data in the gallery
function displayGallery(items) {
  gallery.innerHTML = '';

  if (!items.length) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>No space images were found for that date range.</p>
      </div>
    `;
    return;
  }

  items.forEach((item) => {
    const card = createGalleryCard(item);
    gallery.appendChild(card);
  });
}

// Fetch APOD images from NASA using the selected date range
function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;
  const requestedCount = getRangeDays(startDate, endDate);

  if (!startDate || !endDate) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>Please choose both a start and end date.</p>
      </div>
    `;
    return;
  }

  showLoadingMessage();

  function displayResults(items) {
    if (items.length > requestedCount) {
      items = items.slice(-requestedCount);
    }
    displayGallery(items);
  }

  function fetchAndExtend(start, end) {
    return fetchApodData(start, end).then((data) => {
      if (data.length === requestedCount) {
        return data;
      }

      const missing = requestedCount - data.length;
      if (missing <= 0) {
        return data;
      }

      const extendedStart = addDaysToIso(start, -missing);
      if (new Date(extendedStart) < new Date(earliestDate)) {
        return data;
      }

      return fetchApodData(extendedStart, end).catch(() => data);
    });
  }

  fetchAndExtend(startDate, endDate)
    .then(displayResults)
    .catch((error) => {
      gallery.innerHTML = `
        <div class="placeholder">
          <div class="placeholder-icon">⚠️</div>
          <p>${error.message}</p>
        </div>
      `;
    });
}

// Load images when the button is clicked
fetchButton.addEventListener('click', getSpaceImages);

modalCloseButton.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});

// Load the default image range as soon as the page opens
showRandomSpaceFact();
getSpaceImages();
