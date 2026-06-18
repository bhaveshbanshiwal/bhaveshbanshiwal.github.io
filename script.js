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
        document.getElementById('cf-rating').innerText = 'Unavailable';
        console.error('Error fetching CF rating:', error);
    }
}
fetchCodeforcesRating();

// --- Dynamic GitHub Projects Fetch ---
async function fetchGitHubProjects() {
    const container = document.getElementById('projects-container');
    try {
        // Fetch repositories sorted by updated time
        const response = await fetch('https://api.github.com/users/bhaveshbanshiwal/repos?sort=updated&per_page=6');
        const repos = await response.json();
        
        if (Array.isArray(repos)) {
            repos.forEach(repo => {
                // Skip forks if desired
                if (repo.fork) return;
                
                const card = document.createElement('div');
                card.className = 'project-card glass-card reveal active';
                
                // Determine language tag
                const langHtml = repo.language ? `<span class="tag-small">${repo.language}</span>` : '';
                
                // Determine stars
                const starHtml = repo.stargazers_count > 0 ? `<span class="tag-small">⭐ ${repo.stargazers_count}</span>` : '';
                
                card.innerHTML = `
                    <div class="project-content">
                        <h3>${repo.name.replace(/-/g, ' ').replace(/_/g, ' ')}</h3>
                        <p>${repo.description || 'No description provided.'}</p>
                        <div class="project-tags">
                            ${langHtml}
                            ${starHtml}
                        </div>
                        <a href="${repo.html_url}" target="_blank" class="project-link"><i class="fab fa-github"></i> View Repo</a>
                    </div>
                `;
                container.appendChild(card);
            });
            // Trigger reveal animation for newly added elements
            if (typeof reveal === 'function') reveal();
        }
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
    }
}
fetchGitHubProjects();
