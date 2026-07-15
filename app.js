// ============================================================
//  НАСТРОЙКИ SUPABASE (ЗАМЕНИ НА СВОИ!)
// ============================================================
const SUPABASE_URL = 'https://kfjknmlgiodghtgzbyfd.supabase.co';    // ← Твой Project URL
const SUPABASE_ANON_KEY = 'sb_publishable_6aBgxKYTS5euAUVq8ZAYpw_dxw6LKc3'; // ← Твой ключ

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
//  ЗАГРУЗКА ТОВАРОВ
// ============================================================
async function loadProducts(filter = 'all', limit = null) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary);">⏳ Загрузка товаров...</div>';

    let query = supabase.from('products').select('*');
    if (filter !== 'all') {
        query = query.eq('category', filter);
    }
    if (limit) {
        query = query.limit(limit);
    }
    const { data, error } = await query;

    if (error) {
        grid.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444;">❌ Ошибка: ${error.message}</div>`;
        return;
    }

    if (!data || data.length === 0) {
        grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary);">😕 Товаров пока нет. Добавьте их в Supabase.</div>';
        return;
    }

    grid.innerHTML = data.map(product => `
        <div class="product-card">
            <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x300/1a1a2e/ff6b35?text=Фото+не+найдено'">
            <div class="product-body">
                <span class="product-category">${product.category || 'Без категории'}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-footer">
                    <span class="product-price">${product.price ? product.price.toLocaleString() : '0'} ₽</span>
                    <a href="https://t.me/almazwatchbot?start=product_${product.id}" class="btn-order" target="_blank">Заказать →</a>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================================
//  ЗАГРУЗКА ОТЗЫВОВ
// ============================================================
async function loadReviews(limit = null) {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary);">⏳ Загрузка отзывов...</div>';

    let query = supabase.from('reviews').select('*').order('id', { ascending: false });
    if (limit) {
        query = query.limit(limit);
    }
    const { data, error } = await query;

    if (error) {
        grid.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444;">❌ Ошибка: ${error.message}</div>`;
        return;
    }

    if (!data || data.length === 0) {
        grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary);">😕 Отзывов пока нет.</div>';
        return;
    }

    grid.innerHTML = data.map(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const avatar = review.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=ff6b35&color=fff&size=48`;
        return `
            <div class="review-card">
                <div class="review-header">
                    <img class="review-avatar" src="${avatar}" alt="${review.name}">
                    <div>
                        <div class="review-name">${review.name}</div>
                        <div class="review-rating">${stars}</div>
                    </div>
                </div>
                <p class="review-text">${review.text}</p>
            </div>
        `;
    }).join('');
}

// ============================================================
//  ЗАГРУЗКА ВСЕХ ТОВАРОВ ДЛЯ КАТАЛОГА (без лимита)
// ============================================================
async function loadAllProducts() {
    await loadProducts('all', null);
}

// ============================================================
//  ЗАГРУЗКА ВСЕХ ОТЗЫВОВ (без лимита)
// ============================================================
async function loadAllReviews() {
    await loadReviews(null);
}

// ============================================================
//  ФИЛЬТРЫ (если есть на странице)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Бургер-меню
    const burger = document.getElementById('burger');
    const nav = document.querySelector('.nav');
    if (burger && nav) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }

    // Фильтры (только на странице catalog.html)
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadProducts(btn.dataset.filter);
            });
        });
    }

    // Определяем страницу и загружаем нужные данные
    const path = window.location.pathname;

    // Главная страница (index.html) — 4 товара и 3 отзыва
    if (path.endsWith('index.html') || path === '/' || path === '') {
        loadProducts('all', 4);
        loadReviews(3);
    }
    // Страница каталога (catalog.html) — все товары
    else if (path.includes('catalog.html')) {
        loadAllProducts();
    }
    // Страница отзывов (reviews.html) — все отзывы
    else if (path.includes('reviews.html')) {
        loadAllReviews();
    }
    // Другие страницы (about, contacts, product) — ничего не загружаем
});
