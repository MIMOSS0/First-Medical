/* ملف: script.js (لصفحة index.html) */
document.addEventListener("DOMContentLoaded", () => {
  // Common UI elements (from icu.js context, but applied to index.html's modal)
  const modal = document.getElementById("device-modal"); // Reused for product details
  const modalBody = modal.querySelector(".modal-body");
  const closeBtn = modal.querySelector(".close-modal");

  // Nav Menu elements
  const toggleBtn = document.getElementById('menuToggle');
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('overlay');
  const body = document.body;

  // Back to Top Button elements
  const backToTopBtn = document.getElementById("back-to-top");

  // Cart elements - IMPORTANT: These IDs must exist in index.html
  const cartIconContainer = document.getElementById("cartIconContainer");
  const cartItemCount = document.getElementById("cartItemCount");
  const sideCart = document.getElementById("sideCart");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartTotalPriceElem = document.getElementById("cartTotalPrice");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const toastContainer = document.getElementById("toastContainer");
  // Ensure this element exists as a direct child of cartItemsContainer in index.html
  const emptyCartMessage = cartItemsContainer.querySelector(".empty-cart-message");

  // Cart array to store items (will be loaded from localStorage)
  // IMPORTANT: Using 'icuCart' key to sync with icu.js
  let cart = [];

  // Detect RTL status once
  const isRTL = document.documentElement.dir === 'rtl';

  // Category Slider elements (re-declare to ensure scope and correct element selection)
  const categorySliderContainer = document.querySelector('.category-slider-container');
  const categorySlider = categorySliderContainer ? categorySliderContainer.querySelector('.category-slider') : null;
  const categoryLeftArrow = categorySliderContainer ? categorySliderContainer.querySelector('.left-arrow') : null;
  const categoryRightArrow = categorySliderContainer ? categorySliderContainer.querySelector('.right-arrow') : null;

  // --- Utility Functions (Copied directly from icu.js) ---
  // Show a toast message
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    void toast.offsetWidth; // Force reflow for animation
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 3000); // Hide after 3 seconds
  }

  // Save cart to localStorage - using 'icuCart'
  function saveCart() {
    localStorage.setItem('icuCart', JSON.stringify(cart));
  }

  // Load cart from localStorage - using 'icuCart'
  function loadCart() {
    const savedCart = localStorage.getItem('icuCart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
  }

  // Update cart UI (item count, total price, items list) - copied from icu.js
  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartItemCount.textContent = totalItems;
    cartItemCount.style.display = totalItems > 0 ? 'block' : 'none';

    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
      emptyCartMessage.style.display = 'block'; // Ensure it's visible
      cartItemsContainer.appendChild(emptyCartMessage); // Re-append it if it was removed
    } else {
      emptyCartMessage.style.display = 'none'; // Hide if there are items
      cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        // Changed `cart-item-actions` to `cart-item-controls` as per icu.css for consistency
        cartItemDiv.innerHTML = `
          <img src="${item.image || 'placeholder.jpg'}" alt="${item.name_ar}">
          <div class="cart-item-details">
            <h4>${isRTL ? item.name_ar : item.name_en}</h4>
            <p>${item.price}</p>
          </div>
          <div class="cart-item-controls">
            <div class="cart-item-actions">
              <button class="quantity-decrease" data-id="${item.id}">-</button>
              <span>${item.quantity}</span>
              <button class="quantity-increase" data-id="${item.id}">+</button>
            </div>
            <button class="remove-item-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
          </div>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
      });
    }

    const totalPrice = cart.reduce((sum, item) => {
      const priceValue = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
      return sum + (priceValue * item.quantity);
    }, 0);
    cartTotalPriceElem.textContent = `${totalPrice.toFixed(2)} جنيه مصري`;

    clearCartBtn.disabled = cart.length === 0;
    checkoutBtn.disabled = cart.length === 0;
    saveCart();
  }

  // Add item to cart - copied from icu.js, expecting a 'device' object with specific properties
  // The 'device' object for addItemToCart from index.html will be constructed from data-attributes
  function addItemToCart(device) {
    // Note: The original icu.js used device.id for originalId.
    // Ensure that data-product-id from index.html acts as the originalId.
    const existingItem = cart.find(item => item.originalId === device.id);

    if (existingItem) {
      existingItem.quantity++;
      showToast(isRTL ? "تم تحديث كمية المنتج في السلة." : "Product quantity updated in cart.", 'warning');
    } else {
      const itemId = device.id + '-' + Date.now(); // Unique ID for this specific cart item instance
      cart.push({
        id: itemId,
        originalId: device.id, // This needs to be the unique ID passed from the product card
        name_ar: device.name_ar,
        name_en: device.name_en,
        price: device.price,
        image: device.image || 'placeholder.jpg', // Assuming a single 'image' property for index products
        quantity: 1
      });
      showToast(isRTL ? "تمت إضافة المنتج إلى السلة." : "Product added to cart.", 'success');
    }
    updateCartUI();
  }

  // Remove item from cart - copied from icu.js
  function removeItemFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    showToast(isRTL ? "تم حذف المنتج من السلة." : "Product removed from cart.", 'danger');
    updateCartUI();
  }

  // Increase item quantity - copied from icu.js
  function increaseQuantity(itemId) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
      item.quantity++;
      updateCartUI();
    }
  }

  // Decrease item quantity - copied from icu.js
  function decreaseQuantity(itemId) {
    const item = cart.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      item.quantity--;
      updateCartUI();
    } else if (item && item.quantity === 1) {
      removeItemFromCart(itemId);
    }
  }

  // Clear all items from cart - copied from icu.js
  function clearCart() {
    cart = [];
    showToast(isRTL ? "تم إفراغ السلة." : "Cart cleared.", 'success');
    updateCartUI();
  }

  // Handle checkout - copied from icu.js
  function handleCheckout() {
    if (cart.length > 0) {
      const confirmationMessage = isRTL ? "هل أنت متأكد من تأكيد الطلب؟" : "Are you sure you want to confirm the order?";
      if (confirm(confirmationMessage)) {
        showToast(isRTL ? "تم تأكيد طلبك بنجاح! سيتم التواصل معك قريبًا." : "Your order has been confirmed successfully! We will contact you soon.", 'success');
        clearCart();
        sideCart.classList.remove('open');
        body.classList.remove("no-scroll");
      }
    } else {
      showToast(isRTL ? "سلتك فارغة، لا يمكن تأكيد الطلب." : "Your cart is empty, cannot confirm order.", 'warning');
    }
  }

  // --- Event Listeners (Common for Nav/Modal/BackToTop - from previous script.js) ---
  function toggleSideMenuAndOverlay() {
    sideMenu.classList.toggle("open");
    overlay.classList.toggle("open");
    body.classList.toggle("no-scroll");
    const icon = toggleBtn.querySelector('i');
    if (sideMenu.classList.contains('open')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
    } else {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  }

  toggleBtn.addEventListener("click", toggleSideMenuAndOverlay);
  overlay.addEventListener("click", toggleSideMenuAndOverlay);

  window.addEventListener("click", (e) => {
    if (window.innerWidth < 900 && sideMenu.classList.contains('open') && !sideMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggleSideMenuAndOverlay();
    }
  });

  const hasSubLinks = document.querySelectorAll('.side-menu .has-sub > a');
  hasSubLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      if (window.innerWidth < 900) {
        e.preventDefault();
        const parentLi = this.parentElement;
        parentLi.classList.toggle('active');
      }
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    modalBody.innerHTML = "";
    body.classList.remove("no-scroll");
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // Cart specific event listeners - copied from icu.js
  cartIconContainer.addEventListener("click", () => {
    sideCart.classList.add("open");
    body.classList.add("no-scroll");

    if (sideMenu.classList.contains("open")) {
        sideMenu.classList.remove("open");
        overlay.classList.remove("open");
        const navIcon = toggleBtn.querySelector('i');
        navIcon.classList.remove('fa-times');
        navIcon.classList.add('fa-bars');
    }
  });

  closeCartBtn.addEventListener("click", () => {
    sideCart.classList.remove("open");
    body.classList.remove("no-scroll");
  });

  cartItemsContainer.addEventListener('click', (e) => {
    const target = e.target;
    // Check if the clicked element or its closest parent is one of the quantity/remove buttons
    if (target.classList.contains('quantity-increase')) {
      increaseQuantity(target.dataset.id);
    } else if (target.classList.contains('quantity-decrease')) {
      decreaseQuantity(target.dataset.id);
    } else if (target.classList.contains('remove-item-btn') || target.closest('.remove-item-btn')) {
      const button = target.closest('.remove-item-btn');
      removeItemFromCart(button.dataset.id);
    }
  });


  clearCartBtn.addEventListener("click", clearCart);
  checkoutBtn.addEventListener("click", handleCheckout);

  // --- Specific to index.html (with adjustments for cart functionality) ---
  // Category Slider functionality
  // Check if slider elements exist before adding listeners
  if (categorySliderContainer && categorySlider && categoryLeftArrow && categoryRightArrow) {
    // Function to check screen width and toggle arrow visibility
    const checkSliderArrowsVisibility = () => {
      if (window.innerWidth > 900) {
        categoryLeftArrow.style.display = 'flex'; // Show arrow
        categoryRightArrow.style.display = 'flex'; // Show arrow
      } else {
        categoryLeftArrow.style.display = 'none'; // Hide arrow
        categoryRightArrow.style.display = 'none'; // Hide arrow
      }
    };

    // Initial check on load
    checkSliderArrowsVisibility();

    // Check on window resize
    window.addEventListener('resize', checkSliderArrowsVisibility);

    if (isRTL) {
      categoryRightArrow.addEventListener('click', () => {
          const scrollAmount = categorySlider.clientWidth / 2;
          categorySlider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
      categoryLeftArrow.addEventListener('click', () => {
          const scrollAmount = categorySlider.clientWidth / 2;
          categorySlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    } else {
      categoryLeftArrow.addEventListener('click', () => {
          const scrollAmount = categorySlider.clientWidth / 2;
          categorySlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
      categoryRightArrow.addEventListener('click', () => {
          const scrollAmount = categorySlider.clientWidth / 2;
          categorySlider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
  }


  // Event listener for "Add to Cart" buttons on index.html featured products
  // IMPORTANT: Ensure your HTML product cards have these data-attributes
  document.querySelectorAll(".featured-products-section .add-to-cart-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent card's click event from firing
      const productData = {
        id: button.dataset.productId, // This will be used as originalId in the cart
        name_ar: button.dataset.productNameAr,
        name_en: button.dataset.productNameEn,
        price: button.dataset.productPrice,
        image: button.dataset.productImage
        // Desc is not strictly needed for cart, but for modal
      };
      addItemToCart(productData);
    });
  });

  // Event listener for Product Cards on index.html to open modal
  document.querySelectorAll(".featured-products-section .product-card").forEach(card => {
    card.addEventListener("click", (e) => {
      // Prevent modal opening if "Add to Cart" button or its icon was clicked
      if (e.target.closest('.add-to-cart-btn')) {
        return;
      }

      // Get full product details from the add-to-cart button's data attributes
      const button = card.querySelector('.add-to-cart-btn');
      const productDetails = {
          name_ar: button.dataset.productNameAr,
          name_en: button.dataset.productNameEn,
          desc_ar: button.dataset.productDescAr,
          desc_en: button.dataset.productDescEn,
          price: button.dataset.productPrice,
          image: button.dataset.productImage // Use this as the main image for the modal
      };


      modalBody.innerHTML = `
        <h2>${isRTL ? productDetails.name_ar : productDetails.name_en}</h2>
        <div class="modal-image-gallery">
          <div class="gallery-main-image">
            <img src="${productDetails.image || 'placeholder.jpg'}" alt="${productDetails.name_ar}">
          </div>
        </div>
        <p>${isRTL ? productDetails.desc_ar : productDetails.desc_en || productDetails.desc_ar}</p>
        <div class="price">${productDetails.price}</div>
      `;

      modal.classList.remove("hidden");
      body.classList.add("no-scroll");

      // No dynamic image gallery for index.html products unless you add more data-attributes
    });
  });


  // Initial load of cart and UI update when the page loads
  loadCart();
  updateCartUI();
});



// في ملف script.js الخاص بك، أو داخل DOMContentLoaded listener

document.addEventListener("DOMContentLoaded", () => {
  // ... (كود الـ JavaScript الموجود لديك مسبقًا) ...

  // Floating Contact Button elements
  const mainContactBtn = document.getElementById('mainContactBtn');
  const floatingContactContainer = document.querySelector('.floating-contact-btn');

  // Event listener for the main contact button
  if (mainContactBtn && floatingContactContainer) {
      mainContactBtn.addEventListener('click', () => {
          floatingContactContainer.classList.toggle('open');
      });
  }

  // ... (بقية كود الـ JavaScript الخاص بك) ...
});