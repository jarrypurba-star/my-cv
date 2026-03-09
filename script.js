document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initNavigation();
    initGame();
    loadPortfolioItems();
    checkPortfolioLoginStatus();
    initSearchAndSort();
    initPortfolioFilters();
    
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showSection(hash);
    }
});

// mobile menu
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('nav');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
}

// navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
            history.pushState(null, null, '#' + sectionId);
            
            // close mobile menu
            document.getElementById('nav').classList.remove('active');
        });
    });
}

window.navigateToSection = function(sectionId) {
    showSection(sectionId);
    history.pushState(null, null, '#' + sectionId);
    
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    sections.forEach(section => {
        section.classList.remove('active-section');
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    const targetLink = document.querySelector(`[href="#${sectionId}"]`);
    
    if (targetSection) {
        targetSection.classList.add('active-section');
    }
    
    if (targetLink) {
        targetLink.classList.add('active');
    }
}

// toast
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast-mini';
    toast.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ========== PORTFOLIO ==========
const PORTFOLIO_ADMIN_USERNAME = "jarry";
const PORTFOLIO_ADMIN_PASSWORD = "purba";
let isPortfolioLoggedIn = false;
let portfolioItems = [];
let currentPage = 1;
let itemsPerPage = 6;
let deleteId = null;
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'newest';

function loadPortfolioItems() {
    showSkeleton(true);
    
    setTimeout(() => {
        const saved = localStorage.getItem('portfolioItems');
        if (saved) {
            portfolioItems = JSON.parse(saved);
        } else {
            portfolioItems = [
                {
                    id: '1',
                    category: 'individu',
                    title: 'eksplorasi AI & keamanan siber',
                    description: 'belajar dasar neural network dan ethical hacking',
                    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format',
                    link: '#',
                    createdAt: Date.now() - 3000000
                },
                {
                    id: '2',
                    category: 'individu',
                    title: 'riset teori konspirasi',
                    description: 'mengumpulkan dan menganalisis berbagai teori alternatif',
                    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format',
                    link: '#',
                    createdAt: Date.now() - 2000000
                },
                {
                    id: '3',
                    category: 'individu',
                    title: 'eksperimen musik digital',
                    description: 'produksi musik lo-fi dan eksplorasi sound design',
                    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format',
                    link: '#',
                    createdAt: Date.now() - 1000000
                },
                {
                    id: '4',
                    category: 'organisasi',
                    title: 'diskusi cybersecurity',
                    description: 'forum rutin tentang keamanan jaringan',
                    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&auto=format',
                    link: '',
                    createdAt: Date.now() - 4000000
                },
                {
                    id: '5',
                    category: 'organisasi',
                    title: 'komunitas teknologi LP3I',
                    description: 'sharing session tentang AI dan machine learning',
                    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format',
                    link: '',
                    createdAt: Date.now() - 3500000
                }
            ];
            savePortfolioItems();
        }
        showSkeleton(false);
        renderPortfolioItems();
    }, 500);
}

function showSkeleton(show) {
    const skeleton = document.getElementById('portfolioSkeleton');
    const grid = document.getElementById('portfolioGrid');
    if (skeleton && grid) {
        if (show) {
            skeleton.classList.remove('hidden');
            grid.innerHTML = '';
        } else {
            skeleton.classList.add('hidden');
        }
    }
}

function savePortfolioItems() {
    localStorage.setItem('portfolioItems', JSON.stringify(portfolioItems));
}

function filterAndSortItems() {
    let filtered = [...portfolioItems];
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(item => item.category === currentFilter);
    }
    
    if (currentSearch) {
        filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
            item.description.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }
    
    switch(currentSort) {
        case 'newest':
            filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            break;
        case 'oldest':
            filtered.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            break;
        case 'az':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'za':
            filtered.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
    
    return filtered;
}

function renderPortfolioItems() {
    const grid = document.getElementById('portfolioGrid');
    const stats = document.getElementById('portfolioStats');
    const pagination = document.getElementById('portfolioPagination');
    if (!grid) return;
    
    const filtered = filterAndSortItems();
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filtered.slice(start, end);
    
    if (stats) {
        stats.innerHTML = `menampilkan ${paginatedItems.length} dari ${totalItems} karya`;
    }
    
    if (totalItems === 0) {
        grid.innerHTML = `
            <div class="empty-state-mini">
                <p>belum ada karya</p>
            </div>
        `;
        if (pagination) pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    paginatedItems.forEach(item => {
        const adminActions = isPortfolioLoggedIn ? `
            <div class="portfolio-actions-mini">
                <button onclick="editPortfolioItem('${item.id}')" class="btn-edit-mini" title="edit">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button onclick="showDeleteConfirm('${item.id}')" class="btn-delete-mini" title="hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        ` : '';
        
        html += `
            <div class="portfolio-item-mini" data-id="${item.id}">
                ${adminActions}
                <div class="portfolio-image-mini">
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format'">
                </div>
                <div class="portfolio-info-mini">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                    <span class="portfolio-category">${item.category}</span>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    if (pagination) {
        renderPagination(totalPages);
    }
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('portfolioPagination');
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<button disabled>...</button>`;
        }
    }
    
    html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
    
    pagination.innerHTML = html;
}

window.changePage = function(page) {
    const filtered = filterAndSortItems();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderPortfolioItems();
    window.scrollTo({ top: document.getElementById('portfolioGrid').offsetTop - 100, behavior: 'smooth' });
}

function initSearchAndSort() {
    const searchInput = document.getElementById('searchPortfolio');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            currentSearch = e.target.value;
            currentPage = 1;
            renderPortfolioItems();
        });
    }
}

function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-chip');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.getAttribute('data-filter');
            currentPage = 1;
            renderPortfolioItems();
        });
    });
}

// admin login
window.openPortfolioLoginModal = function() {
    if (isPortfolioLoggedIn) {
        showPortfolioAdminPanel();
    } else {
        const modal = document.getElementById('portfolioLoginModal');
        modal.style.display = 'flex';
        
        document.getElementById('portfolioUsername').value = '';
        document.getElementById('portfolioPassword').value = '';
        document.getElementById('portfolioLoginError').style.display = 'none';
    }
}

window.closePortfolioLoginModal = function() {
    const modal = document.getElementById('portfolioLoginModal');
    modal.style.display = 'none';
}

window.handlePortfolioLogin = function() {
    const username = document.getElementById('portfolioUsername').value;
    const password = document.getElementById('portfolioPassword').value;
    const errorElement = document.getElementById('portfolioLoginError');
    
    if (username === PORTFOLIO_ADMIN_USERNAME && password === PORTFOLIO_ADMIN_PASSWORD) {
        isPortfolioLoggedIn = true;
        localStorage.setItem('portfolioAdminLoggedIn', 'true');
        closePortfolioLoginModal();
        showPortfolioAdminPanel();
        updatePortfolioAdminButton();
        renderPortfolioItems();
        showToast('login berhasil');
    } else {
        errorElement.style.display = 'block';
    }
}

function showPortfolioAdminPanel() {
    const panel = document.getElementById('portfolioAdminPanel');
    panel.style.display = 'block';
    
    document.getElementById('portfolioTitle').value = '';
    document.getElementById('portfolioDescription').value = '';
    document.getElementById('portfolioImage').value = '';
    document.getElementById('portfolioLink').value = '';
    document.getElementById('portfolioImagePreview').innerHTML = '';
    
    const saveBtn = document.getElementById('portfolioSaveBtn');
    saveBtn.innerHTML = 'tambah';
    saveBtn.onclick = addPortfolioItem;
}

window.closePortfolioAdminPanel = function() {
    const panel = document.getElementById('portfolioAdminPanel');
    panel.style.display = 'none';
}

window.logoutPortfolioAdmin = function() {
    isPortfolioLoggedIn = false;
    localStorage.removeItem('portfolioAdminLoggedIn');
    closePortfolioAdminPanel();
    updatePortfolioAdminButton();
    renderPortfolioItems();
    showToast('logout berhasil');
}

function updatePortfolioAdminButton() {
    const adminBtn = document.getElementById('portfolioAdminLoginBtn');
    const adminStatus = document.getElementById('portfolioAdminStatus');
    
    if (isPortfolioLoggedIn) {
        adminBtn.innerHTML = '<i class="fas fa-user-shield"></i> admin active';
        if (adminStatus) adminStatus.innerHTML = 'anda sudah login';
    } else {
        adminBtn.innerHTML = '<i class="fas fa-lock"></i> admin';
        if (adminStatus) adminStatus.innerHTML = '';
    }
}

function checkPortfolioLoginStatus() {
    const savedStatus = localStorage.getItem('portfolioAdminLoggedIn');
    if (savedStatus === 'true') {
        isPortfolioLoggedIn = true;
        showPortfolioAdminPanel();
        updatePortfolioAdminButton();
    }
}

window.previewPortfolioImage = function(url) {
    const preview = document.getElementById('portfolioImagePreview');
    if (url) {
        preview.innerHTML = `<img src="${url}" alt="preview">`;
    } else {
        preview.innerHTML = '';
    }
}

window.addPortfolioItem = function() {
    if (!isPortfolioLoggedIn) {
        showToast('login dulu!', 'error');
        openPortfolioLoginModal();
        return;
    }
    
    const category = document.getElementById('portfolioCategory').value;
    const title = document.getElementById('portfolioTitle').value.trim();
    const description = document.getElementById('portfolioDescription').value.trim();
    const image = document.getElementById('portfolioImage').value.trim();
    const link = document.getElementById('portfolioLink').value.trim();
    
    if (!title || !description || !image) {
        showToast('isi semua field!', 'error');
        return;
    }
    
    const newItem = {
        id: Date.now().toString(),
        category,
        title,
        description,
        image,
        link: link || '',
        createdAt: Date.now()
    };
    
    portfolioItems.push(newItem);
    savePortfolioItems();
    currentPage = 1;
    renderPortfolioItems();
    
    document.getElementById('portfolioTitle').value = '';
    document.getElementById('portfolioDescription').value = '';
    document.getElementById('portfolioImage').value = '';
    document.getElementById('portfolioLink').value = '';
    document.getElementById('portfolioImagePreview').innerHTML = '';
    
    showToast('karya ditambahkan');
}

window.showDeleteConfirm = function(id) {
    deleteId = id;
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmMessage').innerText = 'yakin mau hapus?';
    modal.style.display = 'flex';
}

window.closeConfirmModal = function() {
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'none';
    deleteId = null;
}

window.confirmAction = function() {
    if (deleteId) {
        portfolioItems = portfolioItems.filter(item => item.id !== deleteId);
        savePortfolioItems();
        renderPortfolioItems();
        showToast('karya dihapus');
        closeConfirmModal();
    }
}

window.editPortfolioItem = function(id) {
    const item = portfolioItems.find(item => item.id === id);
    if (!item) return;
    
    document.getElementById('portfolioCategory').value = item.category;
    document.getElementById('portfolioTitle').value = item.title;
    document.getElementById('portfolioDescription').value = item.description;
    document.getElementById('portfolioImage').value = item.image;
    document.getElementById('portfolioLink').value = item.link || '';
    
    if (item.image) {
        document.getElementById('portfolioImagePreview').innerHTML = `<img src="${item.image}" alt="preview">`;
    }
    
    const saveBtn = document.getElementById('portfolioSaveBtn');
    saveBtn.innerHTML = 'update';
    saveBtn.onclick = function() { updatePortfolioItem(id); };
    
    showPortfolioAdminPanel();
}

window.updatePortfolioItem = function(id) {
    const category = document.getElementById('portfolioCategory').value;
    const title = document.getElementById('portfolioTitle').value.trim();
    const description = document.getElementById('portfolioDescription').value.trim();
    const image = document.getElementById('portfolioImage').value.trim();
    const link = document.getElementById('portfolioLink').value.trim();
    
    if (!title || !description || !image) {
        showToast('isi semua field!', 'error');
        return;
    }
    
    const index = portfolioItems.findIndex(item => item.id === id);
    if (index !== -1) {
        portfolioItems[index] = {
            ...portfolioItems[index],
            category,
            title,
            description,
            image,
            link: link || ''
        };
        
        savePortfolioItems();
        renderPortfolioItems();
        
        document.getElementById('portfolioTitle').value = '';
        document.getElementById('portfolioDescription').value = '';
        document.getElementById('portfolioImage').value = '';
        document.getElementById('portfolioLink').value = '';
        document.getElementById('portfolioImagePreview').innerHTML = '';
        
        const saveBtn = document.getElementById('portfolioSaveBtn');
        saveBtn.innerHTML = 'tambah';
        saveBtn.onclick = addPortfolioItem;
        
        showToast('karya diupdate');
    }
}

// ========== GAME ==========
let currentQuestion = 0;
let score = 0;
let timeLeft = 10;
let timerInterval;
let gameData = [];
let currentAnswer = 0;
let playerName = "";

function initGame() {
    const startScreen = document.getElementById("start-screen");
    const loadingScreen = document.getElementById("loading-screen");
    const playScreen = document.getElementById("play-screen");
    const resultScreen = document.getElementById("result-screen");
    const inputField = document.getElementById("answer-input");
    const progress = document.getElementById("progress");
    const questNumber = document.getElementById("quest-number");
    const displayQuestion = document.getElementById("display-question");
    const loadingPercentage = document.getElementById("loadingPercentage");
    const playerNameInput = document.getElementById("player-name-input");
    const nameError = document.getElementById("name-error");
    const loadingPlayerName = document.getElementById("loading-player-name");
    const playPlayerName = document.getElementById("play-player-name");
    const resultPlayerName = document.getElementById("result-player-name");
    const finalScore = document.getElementById("final-score");
    const resultMessage = document.getElementById("result-message");
    const resultTitle = document.getElementById("result-title");

    if (!startScreen || !loadingScreen || !playScreen || !resultScreen) return;

    if (inputField) {
        inputField.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                processAnswer();
            }
        });
    }

    window.validateAndShowLoading = function() {
        const name = playerNameInput.value.trim();
        if (name === "") {
            nameError.style.display = "block";
            return;
        }
        nameError.style.display = "none";
        playerName = name;
        showLoading();
    };

    window.showStartScreen = function() {
        startScreen.classList.remove("hidden");
        loadingScreen.classList.add("hidden");
        playScreen.classList.add("hidden");
        resultScreen.classList.add("hidden");
        if (playerNameInput) playerNameInput.value = "";
        playerName = "";
    };

    function showLoading() {
        startScreen.classList.add("hidden");
        playScreen.classList.add("hidden");
        resultScreen.classList.add("hidden");
        loadingScreen.classList.remove("hidden");
        
        if (loadingPlayerName) {
            loadingPlayerName.innerText = "👤 " + playerName;
        }
        
        const startButton = document.getElementById("startButton");
        if (startButton) startButton.disabled = true;
        
        let percentage = 0;
        const interval = setInterval(() => {
            percentage += Math.random() * 15;
            if (percentage >= 100) {
                percentage = 100;
                clearInterval(interval);
                
                setTimeout(() => {
                    loadingScreen.classList.add("hidden");
                    startGame();
                    if (startButton) startButton.disabled = false;
                }, 500);
            }
            
            if (loadingPercentage) {
                loadingPercentage.innerText = Math.floor(percentage) + "%";
            }
            
            const loadingBar = document.getElementById('loadingBar');
            if (loadingBar) {
                loadingBar.style.width = percentage + '%';
            }
        }, 200);
    }

    function startGame() {
        currentQuestion = 0;
        score = 0;
        gameData = [];
        playScreen.classList.remove("hidden");
        if (playPlayerName) {
            playPlayerName.innerText = "👤 " + playerName;
        }
        nextQuestion();
    }

    function generateQuestion() {
        const ops = ["+", "-", "*", "/"];
        let a = Math.floor(Math.random() * 10) + 1;
        let b = Math.floor(Math.random() * 10) + 1;
        let op = ops[Math.floor(Math.random() * 4)];

        if (op === "/") {
            a = a * b;
        }

        let opDisplay = op;
        if (op === "*") opDisplay = "×";
        if (op === "/") opDisplay = "÷";

        let qText = a + " " + opDisplay + " " + b;
        let ans = 0;
        if (op === "+") ans = a + b;
        else if (op === "-") ans = a - b;
        else if (op === "*") ans = a * b;
        else if (op === "/") ans = a / b;

        return { qText, ans };
    }

    function nextQuestion() {
        if (currentQuestion >= 10) {
            endGame();
            return;
        }

        currentQuestion++;
        if (questNumber) {
            questNumber.innerText = 'soal ' + currentQuestion + '/10';
        }
        const q = generateQuestion();
        if (displayQuestion) {
            displayQuestion.innerText = q.qText;
        }
        currentAnswer = q.ans;

        if (inputField) {
            inputField.value = "";
            inputField.focus();
        }

        startTimer();
    }

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = 10;
        if (progress) {
            progress.style.width = "100%";
            progress.style.transition = "none";
            progress.offsetHeight;
            progress.style.transition = "width 10s linear";
            progress.style.width = "0%";
        }

        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft < 0) {
                processAnswer(null);
            }
        }, 1000);
    }

    function processAnswer(userValue = undefined) {
        clearInterval(timerInterval);

        let jawaban;
        if (userValue === null) {
            jawaban = null;
        } else {
            jawaban = parseFloat(inputField ? inputField.value : 0);
            if (isNaN(jawaban)) jawaban = null;
        }

        const benar = (jawaban === currentAnswer);
        if (benar) score++;

        gameData.push({
            soal: displayQuestion ? displayQuestion.innerText : "",
            jawabanUser: jawaban !== null ? jawaban : "-",
            jawabanBenar: currentAnswer,
            status: benar ? "benar" : "salah"
        });

        if (currentQuestion < 10) {
            nextQuestion();
        } else {
            endGame();
        }
    }

    function endGame() {
        playScreen.classList.add("hidden");
        resultScreen.classList.remove("hidden");
        
        if (resultPlayerName) {
            resultPlayerName.innerText = "👤 " + playerName;
        }
        
        const totalScore = score;
        if (finalScore) {
            finalScore.innerText = "skor: " + totalScore + "/10";
        }
        
        if (resultTitle) {
            resultTitle.innerText = totalScore >= 8 ? "✨ selamat! ✨" : "😢 yahh...";
        }
        
        if (resultMessage) {
            if (totalScore >= 8) {
                resultMessage.innerText = "kamu menang!";
                resultMessage.style.color = "#b5987a";
            } else {
                resultMessage.innerText = "coba lagi ya!";
                resultMessage.style.color = "#d9957a";
            }
        }

        const tbody = document.getElementById("result-body");
        if (tbody) {
            tbody.innerHTML = "";
            gameData.forEach((data, index) => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${data.jawabanUser}</td>
                    <td>${data.jawabanBenar}</td>
                `;
                tbody.appendChild(row);
            });
        }
    }
}

window.addEventListener('popstate', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showSection(hash);
    } else {
        showSection('home');
    }
});