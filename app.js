let tg = window.Telegram.WebApp;
tg.expand();

tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#31B545';

// Pagination settings
// let currentCategory = 'all';
// let currentAnime = 'all';
const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let totalItems = 0;
let allItems = [];

let filteredItems = [];

// Заменим старые переменные на этот объект
let filters = {
    type: 'all',
    anime: 'all',
    search: '',
    sort: 'none' // 'none', 'price-asc', 'price-desc', 'alphabetical'
};


// Function to apply sorting
function applySorting() {
    if (filters.sort === 'none') {
        return;
    }

    filteredItems.sort((a, b) => {
        const aBtn = a.querySelector(".btn");
        const bBtn = b.querySelector(".btn");

        if (!aBtn || !bBtn) {
            return 0;
        }

        const aLabel = aBtn.getAttribute("data-label") || "";
        const bLabel = bBtn.getAttribute("data-label") || "";
        const aPrice = parseFloat(aBtn.getAttribute("data-price")) || 0;
        const bPrice = parseFloat(bBtn.getAttribute("data-price")) || 0;

        switch (filters.sort) {
            case 'price-asc':
                return aPrice - bPrice;
            case 'price-desc':
                return bPrice - aPrice;
            case 'alphabetical':
                return aLabel.localeCompare(bLabel);
            default:
                return 0;
        }
    });

    currentPage = 1;
    showPage(currentPage);
    updatePaginationControls();
}



// Initialize pagination
function initializePagination() {
    const container = document.querySelector(".inner");
    allItems = Array.from(container.querySelectorAll(".item"));
    
    // Добавляем атрибуты по умолчанию
    allItems.forEach(item => {
        const btn = item.querySelector(".btn");
        if (!btn.hasAttribute('data-tags')) {
            btn.setAttribute('data-tags', 'all');
        }
        if (!btn.hasAttribute('data-anime')) {
            btn.setAttribute('data-anime', 'all');
        }
    });
    
    filteredItems = [...allItems];
    totalItems = filteredItems.length;
    
    allItems.forEach(item => item.style.display = "none");
    showPage(currentPage);
    addPaginationControls();
}


function showPage(page) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    const container = document.querySelector(".inner");
    if (!container) return;

    // Очищаем контейнер
    container.innerHTML = '';

    // Получаем элементы для текущей страницы
    const itemsToShow = filteredItems.slice(start, end);

    // Добавляем элементы на страницу
    itemsToShow.forEach(item => {
        item.style.display = "";
        container.appendChild(item);
    });

    currentPage = page;
    updatePaginationControls();
}

async function loadPageItems(page) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    // Если товары уже загружены, возвращаем их
    if (filteredItems.slice(start, end).every(item => item.dataset.loaded === "true")) {
        return filteredItems.slice(start, end);
    }

    // Имитация загрузки с сервера (замените на реальный fetch)
    return new Promise(resolve => {
        setTimeout(() => {
            const itemsToShow = filteredItems.slice(start, end);
            itemsToShow.forEach(item => item.dataset.loaded = "true");
            resolve(itemsToShow);
        }, 300); // Задержка для демонстрации
    });
}


function addPaginationControls() {
    const paginationDiv = document.querySelector(".pagination");
    if (!paginationDiv) return;

    paginationDiv.innerHTML = `
        <div class="pagination-content">
            <button id="prevPage" class="pagination-btn">⬅️</button>
            <div class="page-numbers"></div>
            <button id="nextPage" class="pagination-btn">➡️</button>
        </div>
    `;

    document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) showPage(currentPage - 1);
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        if (currentPage < Math.ceil(totalItems / ITEMS_PER_PAGE)) showPage(currentPage + 1);
    });

    updatePageNumbers();
}

function updatePaginationControls() {
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");
    const pageNumbers = document.querySelector(".page-numbers");
    
    if (!prevBtn || !nextBtn || !pageNumbers) return;
    
    // Обновляем состояние кнопок
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    // Обновляем номера страниц
    updatePageNumbers();
}

function updatePageNumbers() {
    const pageNumbers = document.querySelector(".page-numbers");
    if (!pageNumbers) return;
    
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    pageNumbers.innerHTML = "";
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    if (startPage > 1) {
        addPageButton(1, pageNumbers);
        if (startPage > 2) {
            pageNumbers.appendChild(createEllipsis());
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i, pageNumbers);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageNumbers.appendChild(createEllipsis());
        }
        addPageButton(totalPages, pageNumbers);
    }
}

function createEllipsis() {
    const ellipsis = document.createElement("span");
    ellipsis.className = "page-ellipsis";
    ellipsis.textContent = "...";
    return ellipsis;
}

function addPageButton(pageNum, container) {
    const button = document.createElement("button");
    button.className = "page-number-btn";
    if (pageNum === currentPage) button.classList.add("active");
    button.textContent = pageNum;
    button.addEventListener("click", () => showPage(pageNum));
    container.appendChild(button);
}

// Search functionality
const searchInput = document.getElementById("searchInput");
searchInput?.addEventListener("input", () => {
    const searchText = searchInput.value.toLowerCase();

    filteredItems = allItems.filter(itemElement => {
        const captionElement = itemElement.querySelector(".caption");
        if (!captionElement) return false;
        const caption = captionElement.textContent.trim().toLowerCase();
        return caption.includes(searchText);
    });

    currentPage = 1;
    showPage(currentPage); // обновляем страницу с учётом фильтра
});


// Cart functionality
let cart = [];
const cartIcon = document.getElementById("cartIcon");
const cartCount = document.getElementById("cartCount");
const cartModal = document.getElementById("cartModal");
const cartItems = document.getElementById("cartItems");
const totalPriceEl = document.getElementById("totalPrice");
const checkoutBtn = document.getElementById("checkoutBtn");

checkoutBtn.style.display = "none";

function updateCartDisplay() {
    cartCount.textContent = cart.length;
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${item.label} - ${item.price} ⭐️ 
            <span style="cursor: pointer; color: red; margin-left: 10px;" data-index="${index}">❌</span>`;
        cartItems.appendChild(li);
        total += item.price;
    });

    totalPriceEl.textContent = total;
    checkoutBtn.style.display = total > 0 ? "block" : "none";

    cartItems.querySelectorAll("span[data-index]").forEach(span => {
        span.addEventListener("click", (e) => {
            cart.splice(parseInt(e.target.getAttribute("data-index")), 1);
            updateCartDisplay();
        });
    });
}

cartIcon?.addEventListener("click", () => {
    cartModal.classList.toggle("show");
    updateCartDisplay();
});

document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const label = btn.getAttribute("data-label");
        const price = parseInt(btn.getAttribute("data-price"));
        const id = btn.getAttribute("data-id");

        if (!label || isNaN(price) || !id) return;

        cart.push({ id, label, price });
        updateCartDisplay();

        Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        cartIcon.classList.add("shake");
        setTimeout(() => cartIcon.classList.remove("shake"), 600);
    });
});


// Layout adjustments
function adjustLayout() {
    const topBar = document.querySelector('.top-bar');
    const container = document.querySelector('.container');

    if (topBar && container) {
        container.style.paddingTop = topBar.offsetHeight + 'px';
    }
}

// Initialize everything
document.addEventListener("DOMContentLoaded", function() {
    initializePagination();
    adjustLayout();
    initTypeFilter();
    initAnimeFilter();
    initSortFilter();
    
    // Remove the 'hidden' class from cartModal here as it's now controlled by .show
    const cartModalElement = document.getElementById("cartModal");
    if (cartModalElement) {
        cartModalElement.classList.remove("hidden"); // Ensure it's not permanently hidden by this class
    }

    document.getElementById("closeCartModal")?.addEventListener("click", () => {
        cartModal.classList.remove("show");
    });

    checkoutBtn?.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Корзина пуста!");
            return;
        }
        
        const user = tg.initDataUnsafe?.user;
        const payload = {
            items: cart,
            totalPrice: cart.reduce((sum, item) => sum + item.price, 0),
            user_id: user?.id,
            username: user?.username
        };
        
        console.log("Отправляемые данные:", payload);
        tg.sendData(JSON.stringify(payload));
        tg.close();
    });
});

// Новая функция инициализации с ленивой загрузкой
function initializeLazyPagination() {
    const container = document.querySelector(".inner");
    // Получаем только структуру элементов без полной загрузки
    allItems = Array.from(container.querySelectorAll(".item"));
    
    // Инициализируем базовые атрибуты
    allItems.forEach(item => {
        item.style.display = "none"; // Скрываем все элементы изначально
        const btn = item.querySelector(".btn");
        if (!btn.hasAttribute('data-tags')) {
            btn.setAttribute('data-tags', 'all');
        }
        if (!btn.hasAttribute('data-anime')) {
            btn.setAttribute('data-anime', 'all');
        }
    });
    
    filteredItems = [...allItems];
    totalItems = filteredItems.length;
    
    // Загружаем и показываем первую страницу
    loadPage(1);
    addPaginationControls();
}

// Модифицированная функция загрузки страницы
async function loadPage(page) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    // Скрываем все элементы
    allItems.forEach(item => item.style.display = "none");
    
    // Загружаем элементы для текущей страницы
    const itemsToShow = await getPageItems(page);
    itemsToShow.forEach(item => item.style.display = "");
    
    currentPage = page;
    updatePaginationControls();
    
    // Предзагружаем следующую страницу
    if (page < Math.ceil(totalItems / ITEMS_PER_PAGE)) {
        preloadPage(page + 1);
    }
}

// Функция получения элементов страницы
async function getPageItems(page) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    // В реальном приложении здесь может быть fetch-запрос
    // Для демонстрации просто возвращаем элементы из filteredItems
    return filteredItems.slice(start, end);
}

// Функция предзагрузки страницы
async function preloadPage(page) {
    await getPageItems(page);
    // В реальном приложении можно предварительно загружать контент
}

// // Обновляем функцию showPage
// function showPage(page) {
//     loadPage(page);
// }




/////////////////////////////////////////////////////////////////
// Функция для фильтрации по категории
function filterByCategory(category) {
    currentCategory = category;
    
    // Обновляем текст кнопки
    const toggleBtn = document.getElementById('categoryToggleBtn');
    if (toggleBtn) {
        const categoryText = category === 'all' ? 'All Items' : 
                        //    category === 'default' ? 'Default' :
                           category === 'legs' ? 'Legs' :
                           category === 'milf' ? 'Milf' :
                           category === 'asian' ? 'Asian' : category;
        toggleBtn.textContent = `Category: ${categoryText} ▼`;
    }
    
    // Применяем фильтр
    filteredItems = allItems.filter(itemElement => {
        if (category === 'all') return true;
        const btn = itemElement.querySelector(".btn");
        const tags = btn.getAttribute("data-tags");
        return tags && tags.includes(category);
    });
    
    currentPage = 1;
    showPage(currentPage);
    hideCategoryDropdown();
}

// Функции для показа/скрытия dropdown
function toggleCategoryDropdown() {
    const dropdown = document.getElementById('categoryDropdown');
    dropdown.classList.toggle('show');
}

function hideCategoryDropdown() {
    const dropdown = document.getElementById('categoryDropdown');
    dropdown.classList.remove('show');
}

// Инициализация категорий
function initCategorySelector() {
    // Обработчик для основной кнопки
    document.getElementById('categoryToggleBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCategoryDropdown();
    });
    
    // Обработчики для вариантов выбора
    document.querySelectorAll('.category-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const category = e.target.getAttribute('data-category');
            filterByCategory(category);
        });
    });
    
    // Закрытие dropdown при клике вне его
    document.addEventListener('click', hideCategoryDropdown);
}

// Обновим функцию initializePagination
function initializePagination() {
    const container = document.querySelector(".inner");
    allItems = Array.from(container.querySelectorAll(".item"));
    
    // Инициализация атрибутов
    allItems.forEach(item => {
        const btn = item.querySelector(".btn");
        if (!btn.hasAttribute('data-tags')) btn.setAttribute('data-tags', 'all');
        if (!btn.hasAttribute('data-anime')) btn.setAttribute('data-anime', 'all');
    });
    
    // Первичная фильтрация
    filteredItems = [...allItems];
    totalItems = filteredItems.length;
    
    // Показываем первую страницу
    showPage(1);
    addPaginationControls();
}

// Обновим функцию searchInput
searchInput?.addEventListener("input", () => {
    const searchText = searchInput.value.toLowerCase();

    filteredItems = allItems.filter(itemElement => {
        // Проверяем фильтр по категории
        if (currentCategory !== 'all') {
            const btn = itemElement.querySelector(".btn");
            const tags = btn.getAttribute("data-tags");
            if (!tags || !tags.includes(currentCategory)) return false;
        }
        
        // Проверяем поисковый запрос
        const captionElement = itemElement.querySelector(".caption");
        if (!captionElement) return false;
        const caption = captionElement.textContent.trim().toLowerCase();
        return caption.includes(searchText);
    });

    currentPage = 1;
    showPage(currentPage);
});









// Функция для применения всех фильтров
function applyAllFilters() {
    const searchText = searchInput.value.toLowerCase();
    filters.search = searchText;

    filteredItems = allItems.filter(itemElement => {
        const btn = itemElement.querySelector(".btn");
        if (!btn) return false;

        // Filter by type
        if (filters.type !== 'all') {
            const tags = btn.getAttribute("data-tags");
            if (!tags) return false;
            const tagArray = tags.split(',').map(tag => tag.trim());
            if (!tagArray.includes(filters.type)) return false;
        }

        // Filter by anime
        if (filters.anime !== 'all') {
            const animeTag = btn.getAttribute("data-anime");
            if (!animeTag || animeTag !== filters.anime) return false;
        }

        // Filter by search
        if (filters.search) {
            const captionElement = itemElement.querySelector(".caption");
            if (!captionElement) return false;
            const caption = captionElement.textContent.trim().toLowerCase();
            if (!caption.includes(filters.search)) return false;
        }

        return true;
    });

    // Apply sorting AFTER filtering
    applySorting();

    totalItems = filteredItems.length;
    currentPage = 1; // Always go to the first page after applying filters/sort
    updatePaginationControls();
    showPage(currentPage);
}


// Initialize Sorting Filter
function initSortFilter() {
    const sortToggleBtn = document.getElementById('sortToggleBtn'); // Renamed ID
    const sortDropdown = document.getElementById('sortDropdown');   // Renamed ID

    sortToggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        sortDropdown.classList.toggle('show');
    });

    document.querySelectorAll('#sortDropdown .filter-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            filters.sort = e.target.getAttribute('data-sort');
            sortToggleBtn.textContent = `Sort By: ${e.target.textContent} ▼`; // Update button text
            applyAllFilters(); // Reapply filters which now includes sorting
            sortDropdown.classList.remove('show');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!sortDropdown.contains(e.target) && !sortToggleBtn.contains(e.target)) {
            sortDropdown.classList.remove('show');
        }
    });
}



// Инициализация фильтра по типу
function initTypeFilter() {
    const typeToggleBtn = document.getElementById('typeToggleBtn');
    const typeDropdown = document.getElementById('typeDropdown');
    
    typeToggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        typeDropdown.classList.toggle('show');
    });
    
    document.querySelectorAll('#typeDropdown .filter-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            filters.type = e.target.getAttribute('data-type');
            typeToggleBtn.textContent = `Type: ${e.target.textContent} ▼`;
            applyAllFilters();
            typeDropdown.classList.remove('show');
        });
    });
}

// Инициализация фильтра по аниме
function initAnimeFilter() {
    const animeToggleBtn = document.getElementById('animeToggleBtn');
    const animeDropdown = document.getElementById('animeDropdown');
    
    animeToggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        animeDropdown.classList.toggle('show');
    });
    
    document.querySelectorAll('#animeDropdown .filter-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            filters.anime = e.target.getAttribute('data-anime');
            animeToggleBtn.textContent = `Anime: ${e.target.textContent} ▼`;
            applyAllFilters();
            animeDropdown.classList.remove('show');
        });
    });
}

// Обновленный поиск
let searchTimeout;
searchInput?.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyAllFilters();
    }, 300);
});

// Предзагрузка следующих страниц
function preloadNextPages(currentPage) {
    // Предзагружаем следующую страницу
    const nextPage = currentPage + 1;
    if (nextPage <= Math.ceil(totalItems / ITEMS_PER_PAGE)) {
        loadPageItems(nextPage);
    }
}

function cleanupHiddenItems() {
    const hiddenItems = document.querySelectorAll('.item[style="display: none;"]');
    hiddenItems.forEach(item => {
        if (!item.dataset.keepInDom) {
            item.remove();
        }
    });
}

// Переменные для отслеживания прокрутки
let lastScrollTop = 0;
const filtersWrapper = document.querySelector('.filters-wrapper'); // Получаем элемент-обертку для фильтров

window.addEventListener('scroll', () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > 0) {
        // Если прокрутка не на самом верху, скрываем фильтры
        filtersWrapper.classList.add('hidden-on-scroll');
    } else {
        // Если прокрутка на самом верху (currentScroll === 0), показываем фильтры
        filtersWrapper.classList.remove('hidden-on-scroll');
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Это можно оставить, хотя в данном случае оно не влияет на логику показа/скрытия
});