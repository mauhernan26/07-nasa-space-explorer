
// NOTE: You do not need to edit this file.

// NASA's APOD API only has images from June 16, 1995 onwards
const earliestDate = '1995-06-16';

// Get today's date in YYYY-MM-DD format (required by date inputs)
const today = new Date().toISOString().split('T')[0];

function setupDateInputs(startInput, endInput) {
  // Restrict date selection range from NASA's first image to today
  startInput.min = earliestDate;
  startInput.max = today;
  endInput.min = earliestDate;
  endInput.max = today;

  // Default: Show the most recent 9 published days of space images
  const latestEndDate = new Date();
  latestEndDate.setDate(latestEndDate.getDate() - 1); // use yesterday so the API has a published image
  const latestEndDateIso = latestEndDate.toISOString().split('T')[0];

  const lastWeek = new Date(latestEndDate);
  lastWeek.setDate(lastWeek.getDate() - 8); // last 9 published days
  startInput.value = lastWeek.toISOString().split('T')[0];
  endInput.value = latestEndDateIso;

  // Automatically adjust end date to show exactly 9 days of images
  startInput.addEventListener('change', () => {
    const startDate = new Date(startInput.value);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 8);
    endInput.value = endDate > latestEndDate ? latestEndDateIso : endDate.toISOString().split('T')[0];
  });
}
