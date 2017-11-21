$(document).ready(function() {
  console.log('configuring tabs');
  document.querySelectorAll('.code-tabs a[role=tab]').forEach(function(tab) {
    tab.addEventListener('click', codeTabClickHandler);
  });
});

function codeTabClickHandler(event) {
  event.preventDefault();
  showLanguage(event.currentTarget.getAttribute('aria-controls'));
}

function showLanguage(lang) {
  $('.code-tabs a[aria-controls="' + lang + '"]').tab('show');
}
