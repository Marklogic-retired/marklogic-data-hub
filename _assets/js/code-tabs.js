$(document).ready(function() {
  console.log('configuring tabs');
  document.querySelectorAll('.code-tabs a[role=tab]').forEach(function(tab) {
    tab.addEventListener('click', codeTabClickHandler);
  });
  document.getElementById("defaultOpen").click();
});

function codeTabClickHandler(event) {
  event.preventDefault();
  showLanguage(event.currentTarget.getAttribute('aria-controls'));
}

function showLanguage(lang) {
  $('.code-tabs a[aria-controls="' + lang + '"]').tab('show');
}


/* Source: https://www.w3schools.com/howto/howto_js_tabs.asp */
/* This function generates tabs and can handle any length of content. */
function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}
