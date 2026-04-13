document.addEventListener("DOMContentLoaded", function () {

    window.openSidebar = function () {
        document.getElementById("sidebar").style.left = "0";
    }

    window.closeSidebar = function () {
        document.getElementById("sidebar").style.left = "-280px";
        document.body.focus();
    }

});
function openCartFromMenu() {
    closeSidebar();
    openCart();
}

function openProfileFromMenu() {
    closeSidebar();
    openProfile();
}

function openOrdersFromMenu() {
    closeSidebar();
    openOrders();
}
function scrollToNew() {
    document.getElementById("new-collection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}
function filterCategory(id) {
    let sections = document.querySelectorAll('.cat-section');

    sections.forEach(section => {
        if (section.id === id) {
            section.style.display = "block";
        } else {
            section.style.display = "none";
        }
    });

    closeSidebar(); // menu close after click
}
function searchItems() {

    let input = document.getElementById('searchInput').value.toLowerCase().trim();

    let cards = document.querySelectorAll('.card');
    let sections = document.querySelectorAll('.cat-section');

    sections.forEach(section => {

        let cardsInSection = section.querySelectorAll('.card');
        let hasVisible = false;
        if (input === "") {
            document.querySelectorAll('.card').forEach(c => c.style.display = "block");
            document.querySelectorAll('.cat-section').forEach(s => s.style.display = "block");
            return;
        }

        cardsInSection.forEach(card => {

            let text = card.getAttribute('data-name').toLowerCase();

            if (text.includes(input)) {
                card.style.display = "block";
                hasVisible = true;
            } else {
                card.style.display = "none";
            }

        });

        section.style.display = hasVisible ? "block" : "none";

    });

}
let currentProduct = "";
let currentPrice = 0;
let isCheckoutFlow = false;
/* ================= PROFILE ================= */
function openProfile() {
    document.getElementById("profileModal").style.display = "flex";

    let user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        document.getElementById("p_name").value = user.name;
        document.getElementById("p_phone").value = user.phone;
        document.getElementById("p_address").value = user.address;
    }
}
function editProfileFromCheckout() {

    // first checkout close
    closeCheckout();

    // small delay (smooth feel)
    setTimeout(() => {
        openProfile();
    }, 200);
}
function saveProfile() {

    let user = {
        name: document.getElementById("p_name").value,
        phone: document.getElementById("p_phone").value,
        address: document.getElementById("p_address").value
    };

    localStorage.setItem("user", JSON.stringify(user));

    alert("Profile Saved ✔️");

    closeProfile();

    document.getElementById("userInfo").innerText =
        user.name + " | " + user.phone + " | " + user.address;

    // ✅ ONLY if coming from checkout
    if (isCheckoutFlow) {
        setTimeout(() => {
            document.getElementById("checkoutModal").style.display = "flex";
        }, 200);

        isCheckoutFlow = false; // reset
    }
}
function closeProfile() {
    document.getElementById("profileModal").style.display = "none";
}

/* ================= BUY NOW ================= */
function buyNow(product, price) {

    let user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Please create profile first 👤");
        isCheckoutFlow = true; 
        openProfile();
        return;
    }
 isCheckoutFlow = true; 
    currentProduct = product;
    currentPrice = price;

    document.getElementById("productTitle").innerText =
        product + " - ₹" + price;

    document.getElementById("userInfo").innerText =
        user.name + " | " + user.phone + " | " + user.address;

    document.getElementById("qty").value = 1;

    updateTotal();

    document.getElementById("checkoutModal").style.display = "flex";
}
function updateTotal() {

    let qty = Number(document.getElementById("qty").value);

    let total = currentPrice * qty;

    document.getElementById("totalPrice").innerText = total;
}
function closeCheckout() {
    document.getElementById("checkoutModal").style.display = "none";
}

/* ================= ADD TO CART ================= */
function addToCart(product, price) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({ product, price });

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    alert(product + " added ₹" + price + " 🛒");
}

/* ================= CART COUNT ================= */
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    document.getElementById("cartCount").innerText = cart.length;
}

updateCartCount();

/* ================= OPEN CART ================= */
function openCart() {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let html = "";

    cart.forEach((item, index) => {
        html += `
        <div style="border:1px solid #ddd;padding:10px;margin:10px;">
            <b>${item.product}</b><br>
            💰 Price: ₹${item.price}<br>

            <button onclick="removeItem(${index})"
                style="background:red;color:white;padding:5px;">
                Remove
            </button>
        </div>
        `;
    });

    document.getElementById("cartItems").innerHTML = html;
    document.getElementById("cartModal").style.display = "flex";
}

/* ================= REMOVE ITEM ================= */
function removeItem(index) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();
    openCart();
}

function closeCart() {
    document.getElementById("cartModal").style.display = "none";
}

/* ================= PLACE ORDER ================= */
let isPlacingOrder = false;
function placeOrder() {
    if (isPlacingOrder) return;
    isPlacingOrder = true;
    setTimeout(() => {
    isPlacingOrder = false;   
}, 1000);
    let user = JSON.parse(localStorage.getItem("user"));

    let qty = Number(document.getElementById("qty").value);

    let order = {
        product: currentProduct,
        price: currentPrice,
        qty: qty,
        total: currentPrice * qty,
        size: document.getElementById("size").value,
        payment: document.getElementById("payment").value,
        user: user,
        status: "Order Placed ✔️",
        step: 1
    };

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);

    localStorage.setItem("orders", JSON.stringify(orders));

    showToast("Order Placed Successfully 🎉");
    closeCheckout();
}
/* ================= MY ORDERS ================= */
function openOrders() {

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    let html = "";

orders.forEach((o, index) => {

    let buttons = "";

    if (o.step === 4) {
        // ✅ Delivered case
        buttons = `
            <span style="color:green;font-weight:bold;">Delivered ✅</span>
            <button onclick="removeOrder(${index})"
                style="background:black;color:white;padding:5px;border:none;margin-left:10px;">
                Remove
            </button>
        `;
    } else {
        buttons = `
            <button onclick="trackOrder(${index})">Track 🚚</button>
            <button onclick="cancelOrder(${index})"
                style="background:red;color:white;padding:5px;border:none;">
                Cancel 
            </button>
        `;
    }

    html += `
<div style="border:1px solid #ccc;padding:10px;margin:10px;">
    <b>${o.product}</b><br>
    💰 ₹${o.total}<br>
    Status: ${o.status}<br><br>

    ${buttons}
</div>
`;
});

    document.getElementById("ordersList").innerHTML = html;
    document.getElementById("ordersModal").style.display = "flex";
}
function cancelOrder(index) {

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders.splice(index, 1); // remove order

    localStorage.setItem("orders", JSON.stringify(orders));

    alert("Order Cancelled ❌");

    openOrders(); // refresh list
}

function closeOrders() {
    document.getElementById("ordersModal").style.display = "none";
}
function filterSub(category) {

    let input = document.getElementById('searchInput').value.toLowerCase();

    let cards = document.querySelectorAll('.card');
    let sections = document.querySelectorAll('.cat-section');

    sections.forEach(section => {

        let cardsInSection = section.querySelectorAll('.card');
        let hasVisible = false;

        cardsInSection.forEach(card => {

            let cat = card.getAttribute('data-category');
            let name = card.getAttribute('data-name').toLowerCase();

            if (cat === category && name.includes(input)) {
                card.style.display = "block";
                hasVisible = true;
            } else {
                card.style.display = "none";
            }

        });

        section.style.display = hasVisible ? "block" : "none";

    });

}

// 🔄 SHOW ALL
function showAll() {

    let sections = document.querySelectorAll('.cat-section');

    sections.forEach(section => {
        section.style.display = "block";

        let grid = section.querySelector('.grid');
        if (grid) {
            grid.style.display = "grid"; // 🔥 IMPORTANT
        }

        let cards = section.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.display = "block";
        });
    });
}
function showAllFromMenu() {

    let sections = document.querySelectorAll('.cat-section');

    sections.forEach(section => {
        section.style.display = "block";

        let grid = section.querySelector('.grid');
        if (grid) {
            grid.style.display = "grid"; // 🔥 IMPORTANT FIX
        }

        let cards = section.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.display = "block";
        });
    });

    closeSidebar();
}
function showToast(message) {
    let toast = document.getElementById("toast");

    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}
function trackOrder(index) {

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let order = orders[index];

    if (order.step < 4) {
        order.step++;
    }

    orders[index] = order;
    localStorage.setItem("orders", JSON.stringify(orders));

    // reset steps UI
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove("active");
    });

    for (let i = 1; i <= order.step; i++) {
        document.getElementById("step" + i).classList.add("active");
    }

    document.getElementById("trackModal").style.display = "flex";

    openOrders();   
}
function closeTrack() {
    document.getElementById("trackModal").style.display = "none";
}
function removeOrder(index) {

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders.splice(index, 1);

    localStorage.setItem("orders", JSON.stringify(orders));

    alert("Order Removed ..");

    openOrders();
}