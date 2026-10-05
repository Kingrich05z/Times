const BAYERN_JERSEY_IMG = 'images/bayerner.png';

function normalizeImagePath(value) {
    if (!value) return BAYERN_JERSEY_IMG;

    const trimmed = value.trim();
    if (!trimmed) return BAYERN_JERSEY_IMG;
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
        return trimmed;
    }

    const cleaned = trimmed.replace(/^\.\//, '').replace(/^\//, '');
    return cleaned.startsWith('images/') ? cleaned : `images/${cleaned}`;
}

const initialProducts = [
    {
        id: '1',
        title: 'Maillots Bayern Munich',
        price: 6000,
        oldPrice: 8000,
        sizes: ['M', 'L', 'XL', 'XXL'],
        category: 'Clubs',
        image: BAYERN_JERSEY_IMG,
        description: 'Maillots Bayern Munich (Domicile & Extérieur) de qualité exceptionnelle. Tissu respirant haut de gamme, badges brodés, coupe sportive moderne.'
    }
];

let products = JSON.parse(localStorage.getItem('time_trend_products')) || initialProducts;
let cart = JSON.parse(localStorage.getItem('time_trend_cart')) || [];
let currentSelectedProduct = null;
let selectedSize = 'M';
let currentQuantity = 1;
let isAdminLoggedIn = false;

function saveProductsToStorage() {
    localStorage.setItem('time_trend_products', JSON.stringify(products));
    renderBestSeller();
    renderProducts();
    renderAdminTable();
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
}

function updateThemeIcons(isDark) {
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    if (isDark) {
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
    } else {
        darkIcon.classList.remove('hidden');
        lightIcon.classList.add('hidden');
    }
}

if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.remove('dark');
    updateThemeIcons(false);
} else {
    document.documentElement.classList.add('dark');
    updateThemeIcons(true);
}

function updateScrollTopButton() {
    const scrollTopButton = document.getElementById('scroll-top-button');
    if (!scrollTopButton) return;

    const shouldShow = window.scrollY > 300;
    scrollTopButton.classList.toggle('visible', shouldShow);
}

window.addEventListener('scroll', updateScrollTopButton, { passive: true });

function openBestSellerProduct() {
    const featured = products[0];
    if (!featured) return;
    openFullscreenModal(featured.id);
}

function renderBestSeller() {
    const titleEl = document.getElementById('best-seller-title');
    const priceEl = document.getElementById('best-seller-price');
    const sizesEl = document.getElementById('best-seller-sizes');

    if (!titleEl || !priceEl || !sizesEl) return;

    const featured = products[0];
    if (!featured) {
        titleEl.textContent = 'Aucun produit';
        priceEl.textContent = '0 FCFA';
        sizesEl.textContent = 'Tailles disponibles: -';
        return;
    }

    titleEl.textContent = featured.title;
    priceEl.textContent = `${Number(featured.price).toLocaleString()} FCFA`;
    sizesEl.textContent = `Tailles disponibles: ${featured.sizes.join(' • ')}`;
}

function renderProducts(filter = 'all') {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">Aucun maillot trouvé dans cette catégorie.</div>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'group bg-white dark:bg-darkcard border border-gray-200 dark:border-darkborder rounded-2xl overflow-hidden shadow-lg hover:border-gold transition-all duration-300 flex flex-col justify-between gold-border-glow';
        const hasDiscount = Number(product.oldPrice) > Number(product.price);

        card.innerHTML = `
            <div class="relative bg-gray-100 dark:bg-darkbg p-6 flex items-center justify-center overflow-hidden cursor-pointer h-72" onclick="openFullscreenModal('${product.id}')">
                <img src="${product.image}" alt="${product.title}"
                     onerror="this.src='https://placehold.co/500x600/0b0b0b/D4AF37?text=Maillot+Bayern'"
                     class="max-h-60 w-auto object-contain group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-gold border border-gold/40 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                    ${product.category}
                </span>
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span class="bg-gold text-black font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl">
                        <i class="fa-solid fa-expand"></i> Voir en plein écran
                    </span>
                </div>
            </div>

            <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <h3 class="font-bold text-xl text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-gold transition" onclick="openFullscreenModal('${product.id}')">
                        ${product.title}
                    </h3>
                    <div class="mb-2">
                        ${hasDiscount ? `<div class="text-sm text-gray-400 line-through mb-1">${Number(product.oldPrice).toLocaleString()} FCFA</div>` : ''}
                        <div class="text-2xl font-extrabold text-gold">
                            ${product.price.toLocaleString()} FCFA
                        </div>
                    </div>

                    <div class="mb-6">
                        <span class="text-xs text-gray-400 block mb-2 font-medium uppercase tracking-wider">Tailles disponibles :</span>
                        <div class="flex flex-wrap gap-1.5">
                            ${product.sizes.map(size => `
                                <span class="px-2.5 py-1 text-xs font-bold rounded-md bg-gray-100 dark:bg-darkbg text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-darkborder">
                                    ${size}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="pt-2 border-t border-gray-100 dark:border-darkborder">
                    <button onclick="openFullscreenModal('${product.id}')" class="w-full bg-gray-100 dark:bg-darkbg text-gray-800 dark:text-gray-200 hover:text-gold font-semibold py-3 rounded-xl text-sm transition">
                        Détails
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('bg-gold', 'text-black', 'border-gold', 'active');
        btn.classList.add('border-gray-300', 'dark:border-darkborder');
    });
    event.target.classList.add('bg-gold', 'text-black', 'border-gold', 'active');
    renderProducts(cat);
}

function openFullscreenModal(productId) {
    currentSelectedProduct = products.find(p => p.id === productId);
    if (!currentSelectedProduct) return;

    const oldPriceValue = Number(currentSelectedProduct.oldPrice) || 0;
    const oldPriceEl = document.getElementById('modal-old-price');
    if (oldPriceValue > Number(currentSelectedProduct.price)) {
        oldPriceEl.innerText = `${oldPriceValue.toLocaleString()} FCFA`;
        oldPriceEl.classList.remove('hidden');
    } else {
        oldPriceEl.innerText = '';
        oldPriceEl.classList.add('hidden');
    }

    document.getElementById('modal-img').src = currentSelectedProduct.image;
    document.getElementById('modal-img').onerror = function () {
        this.src = 'https://placehold.co/500x600/0b0b0b/D4AF37?text=Maillot+Bayern';
    };
    document.getElementById('modal-title').innerText = currentSelectedProduct.title;
    document.getElementById('modal-price').innerText = `${currentSelectedProduct.price.toLocaleString()} FCFA`;
    document.getElementById('modal-category').innerText = currentSelectedProduct.category;
    document.getElementById('modal-desc').innerText = currentSelectedProduct.description || 'Maillot officiel d\'excellente finition.';

    selectedSize = currentSelectedProduct.sizes[0] || 'M';
    const sizeContainer = document.getElementById('modal-sizes-container');
    sizeContainer.innerHTML = currentSelectedProduct.sizes.map(size => `
        <button onclick="selectModalSize('${size}')" id="size-btn-${size}" class="size-btn font-bold px-4 py-2 rounded-xl text-sm border ${size === selectedSize ? 'border-gold bg-gold text-black' : 'border-gray-300 dark:border-darkborder text-gray-300'} transition">
            ${size}
        </button>
    `).join('');

    currentQuantity = 1;
    document.getElementById('modal-quantity').innerText = currentQuantity;
    document.getElementById('fullscreen-modal').classList.remove('hidden');
}

function closeFullscreenModal() {
    document.getElementById('fullscreen-modal').classList.add('hidden');
}

function selectModalSize(size) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('border-gold', 'bg-gold', 'text-black');
        btn.classList.add('border-gray-300', 'dark:border-darkborder', 'text-gray-300');
    });
    const selectedBtn = document.getElementById(`size-btn-${size}`);
    if (selectedBtn) {
        selectedBtn.classList.add('border-gold', 'bg-gold', 'text-black');
    }
}

function changeQuantity(delta) {
    if (currentQuantity + delta >= 1) {
        currentQuantity += delta;
        document.getElementById('modal-quantity').innerText = currentQuantity;
    }
}

function orderOnWhatsApp() {
    if (!currentSelectedProduct) return;

    const phone = '221766840494';
    const totalPrice = currentSelectedProduct.price * currentQuantity;
    const message = `Bonjour *TIME & TREND SÉNÉGAL* 👋,\nJe souhaite commander le maillot suivant :\n\n` +
        `🏆 *Produit* : ${currentSelectedProduct.title}\n` +
        `📏 *Taille* : ${selectedSize}\n` +
        `🔢 *Quantité* : ${currentQuantity}\n` +
        `💰 *Prix Total* : ${totalPrice.toLocaleString()} FCFA\n\n` +
        `Merci de me confirmer la disponibilité et les modalités de livraison à Dakar !`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
}

function directWhatsAppOrder(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    currentSelectedProduct = product;
    selectedSize = product.sizes[0] || 'M';
    currentQuantity = 1;
    orderOnWhatsApp();
}

function addToCart() {
    if (!currentSelectedProduct) return;

    const existingItem = cart.find(item => item.id === currentSelectedProduct.id && item.size === selectedSize);

    if (existingItem) {
        existingItem.quantity += currentQuantity;
    } else {
        cart.push({
            id: currentSelectedProduct.id,
            title: currentSelectedProduct.title,
            price: currentSelectedProduct.price,
            size: selectedSize,
            quantity: currentQuantity,
            image: currentSelectedProduct.image
        });
    }

    localStorage.setItem('time_trend_cart', JSON.stringify(cart));
    renderCartModal();
    closeFullscreenModal();
    openCartModal();
}

function openCartModal() {
    renderCartModal();
    document.getElementById('cart-modal').classList.remove('hidden');
}

function closeCartModal() {
    document.getElementById('cart-modal').classList.add('hidden');
}

function renderCartModal() {
    const list = document.getElementById('cart-items-list');
    list.innerHTML = '';

    if (cart.length === 0) {
        list.innerHTML = '<p class="text-center text-gray-500 py-4">Votre panier est vide.</p>';
        document.getElementById('cart-total-price').innerText = '0 FCFA';
        document.getElementById('cart-badge').innerText = '0';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const itemEl = document.createElement('div');
        itemEl.className = 'flex justify-between items-center pt-2';
        itemEl.innerHTML = `
            <div>
                <p class="font-bold text-sm">${item.title}</p>
                <p class="text-xs text-gray-400">Taille: ${item.size} | Qte: ${item.quantity}</p>
                <p class="text-xs text-gold font-bold">${(item.price * item.quantity).toLocaleString()} FCFA</p>
            </div>
            <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700 text-xs font-bold">Supprimer</button>
        `;
        list.appendChild(itemEl);
    });

    document.getElementById('cart-total-price').innerText = `${total.toLocaleString()} FCFA`;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-badge').innerText = totalItems;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('time_trend_cart', JSON.stringify(cart));
    renderCartModal();
}

function sendCartToWhatsApp() {
    if (cart.length === 0) return;
    const phone = '221766840494';
    let message = `Bonjour *TIME & TREND SÉNÉGAL* 👋,\nVoici le récapitulatif de ma commande :\n\n`;
    let total = 0;

    cart.forEach((item, idx) => {
        const sum = item.price * item.quantity;
        total += sum;
        message += `${idx + 1}. *${item.title}* (Taille: ${item.size}) - x${item.quantity} = ${sum.toLocaleString()} FCFA\n`;
    });

    message += `\n💰 *TOTAL GLOBAL* : ${total.toLocaleString()} FCFA\n\nMerci de me contacter pour finaliser la livraison !`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

function updateImagePreview(imageSource = '') {
    const preview = document.getElementById('article-image-preview');
    const previewImg = document.getElementById('article-image-preview-img');
    if (!preview || !previewImg) return;

    if (!imageSource) {
        preview.classList.add('hidden');
        previewImg.src = '';
        return;
    }

    previewImg.src = imageSource;
    preview.classList.remove('hidden');
}

function handleImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
        const hiddenInput = document.getElementById('article-image');
        if (!hiddenInput) return;

        hiddenInput.value = reader.result;
        updateImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
}

function resetArticleImage() {
    const fileInput = document.getElementById('article-image-file');
    const hiddenInput = document.getElementById('article-image');
    if (fileInput) fileInput.value = '';
    if (hiddenInput) hiddenInput.value = '';
    updateImagePreview(BAYERN_JERSEY_IMG);
}

function openAdminModal() {
    if (isAdminLoggedIn) {
        showSection('admin');
    } else {
        document.getElementById('login-modal').classList.remove('hidden');
    }
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
    const error = document.getElementById('admin-login-error');
    if (error) {
        error.classList.add('hidden');
        error.textContent = 'Mot de passe incorrect.';
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('admin-pass-input').value.trim();
    const error = document.getElementById('admin-login-error');

    if (pass === '072005') {
        isAdminLoggedIn = true;
        closeLoginModal();
        showSection('admin');
        document.getElementById('admin-pass-input').value = '';
        if (error) {
            error.classList.add('hidden');
        }
    } else {
        if (error) {
            error.textContent = 'Mot de passe incorrect.';
            error.classList.remove('hidden');
        }
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    showSection('catalog');
}

function showSection(section) {
    const footer = document.getElementById('site-footer');

    if (section === 'admin') {
        document.getElementById('catalog-section').classList.add('hidden');
        document.getElementById('admin-section').classList.remove('hidden');
        if (footer) footer.classList.add('hidden');
        renderAdminTable();
    } else {
        document.getElementById('catalog-section').classList.remove('hidden');
        document.getElementById('admin-section').classList.add('hidden');
        if (footer) footer.classList.remove('hidden');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';
    document.getElementById('admin-item-count').innerText = products.length;

    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 dark:hover:bg-darkbg/50 transition';
        tr.innerHTML = `
            <td class="p-4">
                <img src="${product.image}" alt="" class="w-12 h-12 object-contain rounded-lg bg-black border border-darkborder"
                     onerror="this.src='https://placehold.co/100x100/0b0b0b/D4AF37?text=Maillot'">
            </td>
            <td class="p-4 font-bold">${product.title}</td>
            <td class="p-4 text-gold font-bold">${product.price.toLocaleString()} FCFA</td>
            <td class="p-4">${product.sizes.join(', ')}</td>
            <td class="p-4">${product.category}</td>
            <td class="p-4 text-center space-x-2">
                <button onclick="editArticle('${product.id}')" class="text-blue-500 hover:text-blue-400 p-2"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deleteArticle('${product.id}')" class="text-red-500 hover:text-red-400 p-2"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openArticleModal() {
    document.getElementById('article-modal-title').innerText = 'Ajouter un Maillot';
    document.getElementById('article-form').reset();
    document.getElementById('article-id').value = '';
    document.getElementById('article-image').value = '';
    document.getElementById('article-old-price').value = '';
    const fileInput = document.getElementById('article-image-file');
    if (fileInput) fileInput.value = '';
    updateImagePreview(BAYERN_JERSEY_IMG);
    document.getElementById('article-modal').classList.remove('hidden');
}

function closeArticleModal() {
    document.getElementById('article-modal').classList.add('hidden');
}

function editArticle(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('article-modal-title').innerText = 'Modifier le Maillot';
    document.getElementById('article-id').value = product.id;
    document.getElementById('article-title').value = product.title;
    document.getElementById('article-price').value = product.price;
    document.getElementById('article-old-price').value = product.oldPrice || '';
    document.getElementById('article-category').value = product.category;
    document.getElementById('article-sizes').value = product.sizes.join(', ');
    const selectedImage = product.image === BAYERN_JERSEY_IMG ? '' : normalizeImagePath(product.image);
    document.getElementById('article-image').value = selectedImage;
    const fileInput = document.getElementById('article-image-file');
    if (fileInput) fileInput.value = '';
    updateImagePreview(selectedImage || BAYERN_JERSEY_IMG);
    document.getElementById('article-desc').value = product.description;

    document.getElementById('article-modal').classList.remove('hidden');
}

function saveArticle(e) {
    e.preventDefault();
    const id = document.getElementById('article-id').value;
    const title = document.getElementById('article-title').value;
    const price = parseFloat(document.getElementById('article-price').value);
    const oldPriceValue = parseFloat(document.getElementById('article-old-price').value);
    const category = document.getElementById('article-category').value;
    const sizesInput = document.getElementById('article-sizes').value;
    const imageInput = document.getElementById('article-image').value.trim();
    const desc = document.getElementById('article-desc').value;

    const sizes = sizesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const image = imageInput !== '' ? normalizeImagePath(imageInput) : BAYERN_JERSEY_IMG;
    const oldPrice = Number.isFinite(oldPriceValue) && oldPriceValue > 0 ? oldPriceValue : null;

    if (id) {
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { id, title, price, oldPrice, category, sizes, image, description: desc };
        }
    } else {
        const newProduct = {
            id: Date.now().toString(),
            title,
            price,
            oldPrice,
            category,
            sizes: sizes.length ? sizes : ['M', 'L', 'XL', 'XXL'],
            image,
            description: desc
        };
        products.push(newProduct);
    }

    saveProductsToStorage();
    closeArticleModal();
}

function deleteArticle(id) {
    if (confirm('Voulez-vous vraiment supprimer ce maillot de la boutique ?')) {
        products = products.filter(p => p.id !== id);
        saveProductsToStorage();
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('article-image-file');
    if (fileInput) {
        fileInput.addEventListener('change', handleImageUpload);
    }

    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 1600);
    }

    updateImagePreview(BAYERN_JERSEY_IMG);
    renderBestSeller();
    renderProducts();
    renderCartModal();
});
