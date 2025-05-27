document.addEventListener("DOMContentLoaded", () => {
    renderFeaturedManga();
    renderHistory();
  });
  
  function navigate(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
  }
  
  function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    alert(`Logging in with email: ${email}`);
  }
  
  function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    alert(`Signed up as ${name} with email: ${email}`);
  }
  
  function renderFeaturedManga() {
    const featured = document.getElementById("featuredManga");
    featured.innerHTML = mangaList.map(manga => `
      <div class="manga-card">
        <img src="${manga.image}" alt="${manga.title}" />
        <p>${manga.title}</p>
      </div>
    `).join("");
  }
  
  function renderHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = historyData.map(entry => `
      <div class="history-entry">
        <img src="${entry.image}" alt="${entry.title}" />
        <div>
          <p><strong>${entry.title}</strong></p>
          <p>${entry.time}</p>
        </div>
      </div>
    `).join("");
  }
  