/* ملف: icu.js */
document.addEventListener("DOMContentLoaded", () => {
  const icuContainer = document.getElementById("icu-sections");
  const modal = document.getElementById("device-modal");
  const modalBody = modal.querySelector(".modal-body");
  const closeBtn = modal.querySelector(".close-modal");

  // Nav Menu elements
  const toggleBtn = document.getElementById('menuToggle');
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('overlay');
  const body = document.body;

  // Device Navigation Links Container
  const deviceNavLinksContainer = document.getElementById("device-nav-links-container");

  // Back to Top Button elements
  const backToTopBtn = document.getElementById("back-to-top");

  // Cart elements
  const cartIconContainer = document.getElementById("cartIconContainer");
  const cartItemCount = document.getElementById("cartItemCount");
  const sideCart = document.getElementById("sideCart");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartTotalPriceElem = document.getElementById("cartTotalPrice");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const toastContainer = document.getElementById("toastContainer");
  const emptyCartMessage = cartItemsContainer.querySelector(".empty-cart-message");

  // Cart array to store items (will be loaded from localStorage)
  let cart = [];

  // Detect RTL status once
  const isRTL = document.documentElement.dir === 'rtl';

  // --- Utility Functions ---
  // Show a toast message
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    // Force reflow for animation
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 3000); // Hide after 3 seconds
  }

  // Save cart to localStorage
  function saveCart() {
    localStorage.setItem('icuCart', JSON.stringify(cart));
  }

  // Load cart from localStorage
  function loadCart() {
    const savedCart = localStorage.getItem('icuCart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
  }

  // Update cart UI (item count, total price, items list)
  function updateCartUI() {
    // Update item count in cart icon
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartItemCount.textContent = totalItems;
    cartItemCount.style.display = totalItems > 0 ? 'block' : 'none'; // Hide if 0 items

    // Update items list in side cart
    cartItemsContainer.innerHTML = ''; // Clear existing items
    if (cart.length === 0) {
      emptyCartMessage.style.display = 'block'; // Show empty message
      cartItemsContainer.appendChild(emptyCartMessage);
    } else {
      emptyCartMessage.style.display = 'none'; // Hide empty message
      cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
          <img src="${item.image || 'placeholder.jpg'}" alt="${item.name_ar}">
          <div class="cart-item-details">
            <h4>${isRTL ? item.name_ar : item.name_en}</h4>
            <p>${item.price}</p>
          </div>
          <div class="cart-item-actions">
            <button class="quantity-decrease" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-increase" data-id="${item.id}">+</button>
            <button class="remove-item-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
          </div>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
      });
    }

    // Update total price
    const totalPrice = cart.reduce((sum, item) => {
      // Improved price parsing: remove non-numeric characters except decimal point
      const priceValue = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0; // Ensure it defaults to 0 if parsing fails
      return sum + (priceValue * item.quantity);
    }, 0);
    cartTotalPriceElem.textContent = `${totalPrice.toFixed(2)} جنيه مصري`; // Format to 2 decimal places

    // Disable/enable buttons if cart is empty
    clearCartBtn.disabled = cart.length === 0;
    checkoutBtn.disabled = cart.length === 0;
    saveCart(); // Save changes after every UI update
  }

  // Add item to cart
  function addItemToCart(device) {
    const existingItem = cart.find(item => item.originalId === device.id); // Check if device already in cart using originalId
    if (existingItem) {
      existingItem.quantity++;
      showToast(isRTL ? "تم تحديث كمية المنتج في السلة." : "Product quantity updated in cart.", 'warning');
    } else {
      // Generate a unique ID for the product in cart (e.g., based on title + timestamp)
      // This ensures each cart item has a truly unique ID, even if multiple devices have similar names
      const itemId = device.id + '-' + Date.now();
      cart.push({
        id: itemId, // Unique ID for this specific cart item instance
        originalId: device.id, // Keep a reference to the original device ID from JSON
        name_ar: device.name_ar,
        name_en: device.name_en,
        price: device.price,
        image: device.images && device.images.length > 0 ? device.images[0] : 'placeholder.jpg',
        quantity: 1
      });
      showToast(isRTL ? "تمت إضافة المنتج إلى السلة." : "Product added to cart.", 'success');
    }
    updateCartUI();
  }

  // Remove item from cart
  function removeItemFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    showToast(isRTL ? "تم حذف المنتج من السلة." : "Product removed from cart.", 'danger');
    updateCartUI();
  }

  // Increase item quantity
  function increaseQuantity(itemId) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
      item.quantity++;
      updateCartUI();
    }
  }

  // Decrease item quantity
  function decreaseQuantity(itemId) {
    const item = cart.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      item.quantity--;
      updateCartUI();
    } else if (item && item.quantity === 1) {
      removeItemFromCart(itemId); // Remove if quantity becomes 0
    }
  }

  // Clear all items from cart
  function clearCart() {
    cart = [];
    showToast(isRTL ? "تم إفراغ السلة." : "Cart cleared.", 'success');
    updateCartUI();
  }

  // Handle checkout
  function handleCheckout() {
    if (cart.length > 0) {
      const confirmationMessage = isRTL ? "هل أنت متأكد من تأكيد الطلب؟" : "Are you sure you want to confirm the order?";
      if (confirm(confirmationMessage)) {
        showToast(isRTL ? "تم تأكيد طلبك بنجاح! سيتم التواصل معك قريبًا." : "Your order has been confirmed successfully! We will contact you soon.", 'success');
        clearCart();
        sideCart.classList.remove('open'); // Close cart after checkout
        body.classList.remove("no-scroll"); // Allow scrolling again
      }
    } else {
      showToast(isRTL ? "سلتك فارغة، لا يمكن تأكيد الطلب." : "Your cart is empty, cannot confirm order.", 'warning');
    }
  }

  // --- Event Listeners ---
  // General toggle for side menu and overlay
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

  // Close side menu if click outside (only on smaller screens)
  window.addEventListener("click", (e) => {
    // Check if the side menu is open, the screen is smaller than desktop breakpoint,
    // and the click is not inside the side menu itself or the toggle button or the overlay
    if (window.innerWidth < 900 && sideMenu.classList.contains('open') && !sideMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggleSideMenuAndOverlay();
    }

    // --- REMOVED: Close Side Cart if click outside ---
    // The user explicitly requested to remove this functionality.
    // So, this block is commented out/removed:
    /*
    if (sideCart.classList.contains('open') && !sideCart.contains(e.target) && !cartIconContainer.contains(e.target)) {
        sideCart.classList.remove('open');
        body.classList.remove("no-scroll");
    }
    */
    // --- END REMOVED ---
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

  // Cart specific event listeners
  cartIconContainer.addEventListener("click", () => {
    sideCart.classList.add("open");
    body.classList.add("no-scroll"); // Prevent scrolling when cart is open

    // If cart is opened, close the main nav menu if it's open
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
    body.classList.remove("no-scroll"); // Allow scrolling again
  });

  // Delegate events for quantity buttons and remove button within cart
  cartItemsContainer.addEventListener('click', (e) => {
    const target = e.target;
    // Check if the clicked element or its closest parent is a button with the specific class
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

  // Fetch JSON data for ICU sections and dynamically add "Add to Cart" buttons
  fetch("radio.json")
    .then(res => res.json())
    .then(data => {
      // Clear container to prevent re-rendering on subsequent fetches (if any)
      icuContainer.innerHTML = '';
      deviceNavLinksContainer.innerHTML = ''; // Clear nav links too

      const navLinks = [];
      data.forEach(section => {
        const sectionId = section.title_ar.replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]+/g, '').toLowerCase();

        const sectionDiv = document.createElement("section");
        sectionDiv.className = "device-section";
        sectionDiv.id = sectionId;

        // Updated innerHTML to place English title below Arabic
        sectionDiv.innerHTML = `
          <h3>
            ${section.title_ar}
            <br>
            <span class="section-title-en">(${section.title_en})</span>
          </h3>
          <div class="device-slider-container">
            <button class="slider-arrow left-arrow"><i class="fas fa-chevron-left"></i></button>
            <div class="device-slider">
              ${section.devices.map(device => {
                // Generate a unique ID for the device itself based on its name (for cart lookup)
                // Using a simpler ID for devices, assuming name is unique enough for device-card data
                const deviceUniqueId = device.name_ar.replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]+/g, '').toLowerCase();
                return `
                  <div class="device-card" data-device='${JSON.stringify({ ...device, id: deviceUniqueId })}'>
                    <div class="device-image-slider" dir="ltr">
                      <img src="${device.images && device.images.length > 0 ? device.images[0] : 'placeholder.jpg'}" alt="${device.name_ar}">
                    </div>
                    <div class="content">
                      <h4>${isRTL ? device.name_ar : device.name_en}</h4>
                      <p class="device-price-on-card">${device.price}</p>
                      <button class="add-to-cart-btn" data-device-original-id="${deviceUniqueId}">
                          <i class="fas fa-cart-plus"></i> ${isRTL ? '' : ''}
                      </button>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
            <button class="slider-arrow right-arrow"><i class="fas fa-chevron-right"></i></button>
          </div>
        `;
        icuContainer.appendChild(sectionDiv);

        navLinks.push({
            id: sectionId,
            title: isRTL ? section.title_ar : section.title_en
        });

        // Initialize sliders
        const sliderContainer = sectionDiv.querySelector('.device-slider-container');
        const deviceSlider = sliderContainer.querySelector('.device-slider');
        const leftArrow = sliderContainer.querySelector('.left-arrow');
        const rightArrow = sliderContainer.querySelector('.right-arrow');

        if (isRTL) {
            // In RTL, visual "left arrow" moves content right, visual "right arrow" moves content left
            rightArrow.innerHTML = '<i class="fas fa-chevron-left"></i>'; // Visual left arrow for RTL layout
            rightArrow.innerHTML = '<i class="fas fa-chevron-left"></i>'; // Visual right arrow for RTL layout

 leftArrow.addEventListener('click', () => { // "Left" button moves to right
                const scrollAmount = deviceSlider.clientWidth / 3;
                deviceSlider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
            
            rightArrow.addEventListener('click', () => { // "Right" button moves to left
                const scrollAmount = deviceSlider.clientWidth / 3;
                deviceSlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });

           

        } else { // LTR logic (default)
            rightArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
            leftArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';

            rightArrow.addEventListener('click', () => {
                const scrollAmount = deviceSlider.clientWidth / 3;
                deviceSlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });

            leftArrow.addEventListener('click', () => {
                const scrollAmount = deviceSlider.clientWidth / 3;
                deviceSlider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }
      });

      // Populate navigation links
      navLinks.forEach(linkInfo => {
        const anchor = document.createElement("a");
        anchor.href = `#${linkInfo.id}`;
        anchor.textContent = linkInfo.title;
        anchor.classList.add("nav-link-item");
        deviceNavLinksContainer.appendChild(anchor);
      });

      // Attach modal click listener to each device card
      document.querySelectorAll(".device-card").forEach(card => {
        card.addEventListener("click", (e) => {
          // Prevent modal opening if "Add to Cart" button or its icon was clicked
          if (e.target.closest('.add-to-cart-btn')) {
            return;
          }

          const device = JSON.parse(card.dataset.device);
          let imagesHtml = '';

          if (device.images && device.images.length > 0) {
            imagesHtml = `
              <div class="modal-image-gallery">
                <div class="gallery-main-image">
                  <img src="${device.images[0]}" alt="${device.name_ar}">
                </div>
                ${device.images.length > 1 ? `
                <div class="gallery-thumbnails">
                  ${device.images.map((img, index) => `
                    <img src="${img}" alt="Thumbnail ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                  `).join('')}
                </div>
                ` : ''}
              </div>
            `;
          } else {
            imagesHtml = `<img src="${device.image || 'placeholder.jpg'}" alt="صورة الجهاز" class="modal-main-img">`;
          }

          modalBody.innerHTML = `
            <h2>${isRTL ? device.name_ar : device.name_en}</h2>
            ${imagesHtml}
            <p>${isRTL ? device.desc : device.desc_en || device.desc}</p>
            <div class="price">${device.price}</div>
          `;

          modal.classList.remove("hidden");
          body.classList.add("no-scroll");

          if (device.images && device.images.length > 1) {
            const galleryMainImage = modalBody.querySelector('.gallery-main-image img');
            const thumbnails = modalBody.querySelectorAll('.gallery-thumbnails .thumbnail');
            thumbnails.forEach(thumbnail => {
              thumbnail.addEventListener('click', function() {
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');
                galleryMainImage.src = this.src;
              });
            });
          }
        });
      });

      // Attach Add to Cart button listeners after all cards are rendered
      // We are using data-device-original-id to pass the original unique ID
      document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", (e) => {
          const card = e.target.closest('.device-card');
          if (card) {
            const device = JSON.parse(card.dataset.device);
            addItemToCart(device);
          }
        });
      });

      // Load cart and update UI initially
      loadCart();
      updateCartUI();
    })
    .catch(error => console.error("Error fetching device data:", error)); // Handle fetch errors
});