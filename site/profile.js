const printButton = document.querySelector('#print-profile');
if (printButton) {
  printButton.addEventListener('click', () => window.print());
  printButton.hidden = false;
}
