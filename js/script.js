// ===== ГЛОБАЛЬНЫЕ ДАННЫЕ =====
let portfolioProjects = [];

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 800, once: true });
    loadPortfolio();
    initThemeToggle();
    initDynamicHeader();
    initCalculator();
    initPhoneMask();
    initFormSubmit();
    initModal();
    initCounterAnimation();  
});

// ===== ПЕРЕКЛЮЧЕНИЕ КАТЕГОРИЙ ПРАЙСА =====
function showPriceCategory(category, btn) {
    // Убираем active у всех кнопок и категорий
    document.querySelectorAll('.price-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.price-category').forEach(c => c.classList.remove('active'));
    
    // Добавляем active нажатой кнопке и категории
    btn.classList.add('active');
    document.getElementById(category).classList.add('active');
}

// ===== МОБИЛЬНОЕ МЕНЮ =====
function toggleMobileMenu() {
    const nav = document.getElementById('nav-menu');
    nav.classList.toggle('active');
}

// ===== ЗАГРУЗКА ПОРТФОЛИО =====
async function loadPortfolio() {
    try {
        const response = await fetch('portfolio-data.json?' + new Date().getTime());
        const data = await response.json();
        portfolioProjects = data.projects;
        renderPortfolio(portfolioProjects);
        initPortfolioNav();
    } catch (error) {
        console.error('Ошибка загрузки портфолио:', error);
        document.getElementById('portfolio-grid').innerHTML = 
            '<p style="text-align:center;grid-column:1/-1;color:var(--text-secondary);">Ошибка загрузки портфолио</p>';
    }
}

// ===== ОТРИСОВКА ПОРТФОЛИО =====
function renderPortfolio(projects) {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    
    grid.innerHTML = projects.map(project => `
        <div class="portfolio-card" data-category="${project.category}" onclick="openPortfolioModal(${project.id})">
            <div class="portfolio-image">
                <img src="${project.image}" alt="${project.title}" onerror="this.style.display='none'">
                <div class="portfolio-overlay">
                    <button class="btn-view" onclick="event.stopPropagation(); openPortfolioModal(${project.id})">
                        <i class="fas fa-eye"></i> Смотреть
                    </button>
                </div>
            </div>
            <div class="portfolio-info">
                <h3>${project.title}</h3>
                <p>${project.shortDesc}</p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <span class="portfolio-tag">${project.price}</span>
                    <span class="portfolio-tag">${project.area}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== ТЕМНАЯ ТЕМА =====
function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const saved = localStorage.getItem('theme');
    
    if (saved) {
        html.setAttribute('data-theme', saved);
        toggle.checked = saved === 'dark';
    }
    
    toggle.addEventListener('change', () => {
        const theme = toggle.checked ? 'dark' : 'light';
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
}

// ===== ДИНАМИЧЕСКИЙ ХЕДЕР =====
function initDynamicHeader() {
    const header = document.getElementById('main-header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const current = window.pageYOffset;
        
        if (current > lastScroll && current > 100) {
            header.classList.add('header-hidden');
            header.classList.remove('header-visible');
        } else {
            header.classList.remove('header-hidden');
            header.classList.add('header-visible');
        }
        lastScroll = current;
    });
}

// ===== ФИЛЬТР ПОРТФОЛИО =====
function filterPortfolio(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filtered = category === 'all' 
        ? portfolioProjects 
        : portfolioProjects.filter(p => p.category === category);
    
    renderPortfolio(filtered);
    
    if (window.updatePortfolioNav) {
        setTimeout(window.updatePortfolioNav, 400);
    }
}

// ===== НАВИГАЦИЯ ПОРТФОЛИО =====
function initPortfolioNav() {
    const grid = document.querySelector('.portfolio-grid');
    const wrapper = document.querySelector('.portfolio-wrapper');
    if (!grid || !wrapper) return;
    
    // Создаем стрелки если их нет
    if (!document.querySelector('.portfolio-nav.prev')) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'portfolio-nav prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.setAttribute('aria-label', 'Предыдущие работы');
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'portfolio-nav next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.setAttribute('aria-label', 'Следующие работы');
        
        wrapper.appendChild(prevBtn);
        wrapper.appendChild(nextBtn);
    }
    
    const prevBtn = document.querySelector('.portfolio-nav.prev');
    const nextBtn = document.querySelector('.portfolio-nav.next');
    
    if (!prevBtn || !nextBtn) return;
    
    const scrollAmount = 400;
    
    prevBtn.addEventListener('click', () => {
        grid.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
        updateNavButtons();
    });
    
    nextBtn.addEventListener('click', () => {
        grid.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
        updateNavButtons();
    });
    
    function updateNavButtons() {
        const maxScroll = grid.scrollWidth - grid.clientWidth;
        prevBtn.disabled = grid.scrollLeft <= 0;
        nextBtn.disabled = grid.scrollLeft >= maxScroll - 10;
    }
    
    grid.addEventListener('scroll', () => {
        updateNavButtons();
    });
    
    window.updatePortfolioNav = updateNavButtons;
    updateNavButtons();
}

// ===== МОДАЛЬНОЕ ОКНО ПОРТФОЛИО =====
function openPortfolioModal(id) {
    const project = portfolioProjects.find(p => p.id === id);
    if (!project) return;
    
    document.getElementById('modal-img').src = project.image;
    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-desc').textContent = project.fullDesc;
    document.getElementById('modal-price').textContent = project.price;
    document.getElementById('modal-area').textContent = project.area;
    document.getElementById('portfolio-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closePortfolioModal() {
    const modal = document.getElementById('portfolio-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ===== МОДАЛЬНОЕ ОКНО ЗАЯВКИ =====
function initModal() {
    document.querySelectorAll('.btn-open-modal').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const modal = document.getElementById('modal');
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    const close = document.querySelector('.modal .close');
    if (close) {
        close.onclick = () => {
            const modal = document.getElementById('modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        };
    }
    
    window.onclick = (e) => {
        if (e.target.id === 'modal') {
            e.target.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (e.target.id === 'portfolio-modal') {
            e.target.style.display = 'none';
            document.body.style.overflow = '';
        }
    };
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modal');
            const portfolioModal = document.getElementById('portfolio-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
            if (portfolioModal) {
                portfolioModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    });
}

// ===== КАЛЬКУЛЯТОР =====
function initCalculator() {
    const calc = () => {
        const mult = +document.getElementById('calc-object').value;
        const area = +document.getElementById('calc-area').value || 50;
        const price = +document.getElementById('calc-type').value;
        document.getElementById('result-price').textContent = Math.round(area * price * mult).toLocaleString('ru-RU') + ' ₽';
    };
    
    document.getElementById('calc-btn').onclick = calc;
    ['calc-object', 'calc-area', 'calc-type'].forEach(id => {
        document.getElementById(id).addEventListener('change', calc);
    });
    calc();
}

// ===== МАСКА ТЕЛЕФОНА =====
function initPhoneMask() {
    const input = document.getElementById('phone');
    input.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.startsWith('8')) v = '7' + v.slice(1);
        if (!v.startsWith('7')) v = '7' + v;
        v = v.slice(0, 11);
        
        let f = '+7';
        if (v.length > 1) f += ' (' + v.slice(1, 4);
        if (v.length > 4) f += ') ' + v.slice(4, 7);
        else if (v.length > 1) f += ')';
        if (v.length > 7) f += '-' + v.slice(7, 9);
        if (v.length > 9) f += '-' + v.slice(9, 11);
        
        e.target.value = f;
    });
}

// ===== ОТПРАВКА ФОРМЫ =====
function initFormSubmit() {
    const form = document.getElementById('telegram-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const orig = btn.innerText;
            btn.innerText = '🔄 Отправка...';
            btn.disabled = true;
            
            try {
                const res = await fetch('http://localhost:8000/php/send.php', {
                    method: 'POST',
                    body: new FormData(e.target)
                });
                const data = await res.json();
                
                if (data.status === 'success') {
                    showSuccessNotification(); // ✅ Красивое уведомление
                    e.target.reset();
                    const modal = document.getElementById('modal');
                    if (modal) {
                        modal.style.display = 'none';
                        document.body.style.overflow = '';
                    }
                } else {
                    showErrorNotification(data.message || 'Ошибка отправки'); // ✅ Уведомление об ошибке
                }
            } catch (err) {
                console.error('Error:', err);
                showErrorNotification('Не удалось соединиться с сервером'); // ✅ Уведомление об ошибке
            }
            
            btn.innerText = orig;
            btn.disabled = false;
        });
    }
}

// ===== ПЛАВНЫЙ СКРОЛЛ =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== АНИМАЦИЯ СЧЕТЧИКОВ =====
function initCounterAnimation() {
    const statItems = document.querySelectorAll('.stat-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statItem = entry.target;
                const counter = statItem.querySelector('.stat-number');
                const target = +counter.getAttribute('data-count');
                const suffix = counter.getAttribute('data-suffix') || '';
                
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                
                const update = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(update);
                    } else {
                        counter.textContent = target + suffix;
                    }
                };
                update();
                observer.unobserve(statItem);
            }
        });
    }, { threshold: 0.5 });
    
    statItems.forEach(item => observer.observe(item));
}

// ===== КРАСИВОЕ УВЕДОМЛЕНИЕ ОБ УСПЕХЕ =====
function showSuccessNotification() {
    // Создаём уведомление
    const notice = document.createElement('div');
    notice.innerHTML = `
        <div style="display:flex;align-items:center;gap:15px;">
            <div style="width:50px;height:50px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;animation:scaleIn 0.5s ease;">
                ✅
            </div>
            <div>
                <b style="display:block;font-size:16px;margin-bottom:4px;animation:slideInRight 0.5s ease 0.1s both;">Заявка отправлена!</b>
                <span style="font-size:13px;opacity:0.9;animation:slideInRight 0.5s ease 0.2s both;">Роман перезвонит вам в ближайшее время</span>
            </div>
        </div>
    `;
    notice.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 20px 28px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(76, 175, 80, 0.4);
        z-index: 10000;
        font-family: 'Segoe UI', sans-serif;
        max-width: 400px;
        animation: slideInTop 0.5s ease;
    `;
    
    // Добавляем стили анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInTop {
            from { transform: translateY(-100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInRight {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes scaleIn {
            from { transform: scale(0); }
            50% { transform: scale(1.2); }
            to { transform: scale(1); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notice);
    
    // Удаляем через 4 секунды
    setTimeout(() => {
        notice.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => notice.remove(), 500);
    }, 4000);
}

// ===== УВЕДОМЛЕНИЕ ОБ ОШИБКЕ =====
function showErrorNotification(message = 'Произошла ошибка. Попробуйте позвонить напрямую.') {
    const notice = document.createElement('div');
    notice.innerHTML = `
        <div style="display:flex;align-items:center;gap:15px;">
            <div style="width:50px;height:50px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;animation:scaleIn 0.5s ease;">
                ⚠️
            </div>
            <div>
                <b style="display:block;font-size:16px;margin-bottom:4px;animation:slideInRight 0.5s ease 0.1s both;">Ошибка отправки</b>
                <span style="font-size:13px;opacity:0.9;animation:slideInRight 0.5s ease 0.2s both;">${message}</span>
            </div>
        </div>
    `;
    notice.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f44336, #d32f2f);
        color: white;
        padding: 20px 28px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(244, 67, 54, 0.4);
        z-index: 10000;
        font-family: 'Segoe UI', sans-serif;
        max-width: 400px;
        animation: slideInTop 0.5s ease;
    `;
    
    document.body.appendChild(notice);
    
    setTimeout(() => {
        notice.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => notice.remove(), 500);
    }, 5000);
}