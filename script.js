// --- Scroll Reveal Animation ---
function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

window.addEventListener("scroll", reveal);
reveal(); // Trigger on load

// --- Navbar Scroll Effect ---
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- Dynamic Canvas Background (Subtle Particles) ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function initCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Create particles based on screen size
    const particleCount = Math.floor((width * height) / 15000);
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.1
        });
    }
}

function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(p => {
        // Move
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Wrap around screen
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        
        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`; // Indigo color
        ctx.fill();
    });
    
    requestAnimationFrame(animateCanvas);
}

window.addEventListener('resize', initCanvas);
initCanvas();
animateCanvas();



// --- Dynamic Codeforces Rating Fetch ---
async function fetchCodeforcesRating() {
    try {
        const response = await fetch('https://codeforces.com/api/user.info?handles=bansiwalbhavesh');
        const data = await response.json();
        if (data.status === 'OK') {
            const user = data.result[0];
            const rating = user.rating || 'Unrated';
            const rank = user.rank || 'Beginner';
            document.getElementById('cf-rating').innerHTML = `${rating} (${rank})`;
        } else {
            document.getElementById('cf-rating').innerText = 'Unavailable';
        }
    } catch (error) {



// --- Dynamic Codeforces Rating Fetch ---
async function fetchCodeforcesRating() {
    try {
        const response = await fetch('https://codeforces.com/api/user.info?handles=bansiwalbhavesh');
        const data = await response.json();
        if (data.status === 'OK') {
            const user = data.result[0];
            const rating = user.rating || 'Unrated';
            const rank = user.rank || 'Beginner';
            document.getElementById('cf-rating').innerHTML = `${rating} (${rank})`;
        } else {
            document.getElementById('cf-rating').innerText = 'Unavailable';
        }
    } catch (error) {
        document.getElementById('cf-rating').innerText = 'Unavailable';
        console.error('Error fetching CF rating:', error);
    }
}
fetchCodeforcesRating();

// --- Dynamic GitHub Projects Fetch ---
async function fetchGitHubProjects() {
    const container = document.getElementById('projects-container');
    try {
        let repos = [];
        
        // 1. Try fetching pinned repos
        try {
            const pinnedResponse = await fetch('https://gh-pinned-repos.egoist.dev/?username=bhaveshbanshiwal');
            if (pinnedResponse.ok) {
                const pinnedData = await pinnedResponse.json();
                if (Array.isArray(pinnedData) && pinnedData.length > 0) {
                    repos = pinnedData;
                }
            }
        } catch (e) {
            console.warn("Could not fetch pinned repos, falling back to recent repos...", e);
        }

        // 2. Fallback if pinned repos fail, are empty, or throw an error
        if (repos.length === 0) {
            const response = await fetch('https://api.github.com/users/bhaveshbanshiwal/repos?sort=updated&per_page=15');
            if (response.ok) {
                const fallbackRepos = await response.json();
                if (Array.isArray(fallbackRepos)) {
                    // Repos to NEVER show in the fallback list (not projects)
                    const excludeList = [
                        'bhaveshbanshiwal.github.io', 
                        'first-contributions',
                        'cp',
                        'cpp',
                        'tkinter',
                        'ollama-python' // Assuming this is just a fork/library test
                    ];
                    repos = fallbackRepos.filter(r => !r.fork && !excludeList.includes(r.name)).slice(0, 6);
                }
            }
        }
        
        // 3. Render
        if (Array.isArray(repos) && repos.length > 0) {
            repos.forEach(repo => {
                const card = document.createElement('div');
                card.className = 'project-card glass-card reveal active';
                
                const langHtml = repo.language ? `<span class="tag-small">${repo.language}</span>` : '';
                const stars = repo.stars || repo.stargazers_count || 0;
                const starHtml = stars > 0 ? `<span class="tag-small">⭐ ${stars}</span>` : '';
                
                const url = repo.link || repo.html_url;
                const name = (repo.repo || repo.name).replace(/-/g, ' ').replace(/_/g, ' ');
                
                card.innerHTML = `
                    <div class="project-content">
                        <h3>${name}</h3>
                        <p>${repo.description || 'No description provided.'}</p>
                        <div class="project-tags">
                            ${langHtml}
                            ${starHtml}
                        </div>
                        <a href="${url}" target="_blank" class="project-link"><i class="fab fa-github"></i> View Repo</a>
                    </div>
                `;
                container.appendChild(card);
            });
            if (typeof reveal === 'function') reveal();
        } else {
            // Render a fallback message if API limits hit
            const card = document.createElement('div');
            card.className = 'project-card glass-card reveal active';
            card.innerHTML = `<div class="project-content"><p>Unable to load GitHub repositories (API limit may be reached). Please check my GitHub profile directly!</p></div>`;
            container.appendChild(card);
        }
    } catch (error) {
        console.error('Fatal error fetching GitHub repos:', error);
    }
}
fetchGitHubProjects();
