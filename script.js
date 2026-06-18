// --- Scroll Reveal Animation ---
function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 20;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

window.addEventListener("scroll", reveal);
window.addEventListener("load", reveal);
setTimeout(reveal, 500); // Failsafe
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



// --- Dynamic Codeforces Rating & Graph Fetch ---
async function fetchCodeforcesData() {
    try {
        // Fetch Basic User Info for Rating
        const infoResponse = await fetch('https://codeforces.com/api/user.info?handles=bansiwalbhavesh');
        const infoData = await infoResponse.json();
        if (infoData.status === 'OK') {
            const user = infoData.result[0];
            const rating = user.rating || 'Unrated';
            const rank = user.rank || 'Beginner';
            document.getElementById('cf-rating').innerHTML = `${rating} (${rank})`;
        } else {
            document.getElementById('cf-rating').innerText = 'Unavailable';
        }

        // Fetch Rating History for Graph
        const ratingResponse = await fetch('https://codeforces.com/api/user.rating?handle=bansiwalbhavesh');
        const ratingData = await ratingResponse.json();
        
        if (ratingData.status === 'OK' && ratingData.result.length > 0) {
            const history = ratingData.result;
            const labels = history.map(item => {
                const date = new Date(item.ratingUpdateTimeSeconds * 1000);
                return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            });
            const dataPoints = history.map(item => item.newRating);
            
            const ctx = document.getElementById('cfChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Rating',
                            data: dataPoints,
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.2)',
                            borderWidth: 2,
                            tension: 0.3,
                            fill: true,
                            pointBackgroundColor: '#8b5cf6',
                            pointRadius: 3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: {
                                ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            },
                            y: {
                                ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        document.getElementById('cf-rating').innerText = 'Unavailable';
        console.error('Error fetching CF data:', error);
    }
}
fetchCodeforcesData();

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
            const response = await fetch('https://api.github.com/users/bhaveshbanshiwal/repos?sort=updated&per_page=20');
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
                        'ollama-python',
                        'CardProbbs'
                    ];
                    repos = fallbackRepos.filter(r => !r.fork && !excludeList.includes(r.name)).slice(0, 9);
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

// --- Dynamic Open Source Contributions Fetch ---
async function fetchOpenSource() {
    const container = document.getElementById('opensource-container');
    try {
        const response = await fetch('https://api.github.com/search/issues?q=is:pr+author:bhaveshbanshiwal+is:public');
        if (response.ok) {
            const data = await response.json();
            const items = data.items || [];
            
            // Limit to 4 PRs for display
            items.slice(0, 4).forEach(pr => {
                // Extract repo name from repository_url
                const repoUrlParts = pr.repository_url.split('/');
                const repoName = repoUrlParts[repoUrlParts.length - 1];
                const repoOwner = repoUrlParts[repoUrlParts.length - 2];
                const stateIcon = pr.state === 'closed' ? '<i class="fas fa-code-merge" style="color: #8b5cf6;"></i>' : '<i class="fas fa-code-branch" style="color: #10b981;"></i>';
                
                const card = document.createElement('div');
                card.className = 'project-card glass-card reveal active';
                
                card.innerHTML = `
                    <div class="project-content">
                        <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${repoOwner}/${repoName}</h3>
                        <p style="font-size: 0.95rem; margin-bottom: 1rem;">${stateIcon} ${pr.title}</p>
                        <div class="project-tags">
                            <span class="tag-small">Pull Request</span>
                            <span class="tag-small">${pr.state}</span>
                        </div>
                        <a href="${pr.html_url}" target="_blank" class="project-link" style="margin-top: 1rem;"><i class="fab fa-github"></i> View PR</a>
                    </div>
                `;
                container.appendChild(card);
            });
            if (typeof reveal === 'function') reveal();
        }
    } catch (error) {
        console.error('Error fetching Open Source PRs:', error);
    }
}
fetchOpenSource();
