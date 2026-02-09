// Example: alert when clicking a song
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('ul li a').forEach(link => {
    link.addEventListener('click', () => {
      console.log('Song clicked:', link.textContent);
    });
  });
});
