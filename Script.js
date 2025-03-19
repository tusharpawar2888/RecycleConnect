$(document).ready(function() {
    // Handle form submission for donate/sell
    $('#donate-sell-form').on('submit', function(e) {
        e.preventDefault();

        const itemName = $('#item-name').val();
        const itemDescription = $('#item-description').val();
        const itemCategory = $('#item-category').val();
        const itemCondition = $('#item-condition').val();
        const itemPrice = $('#item-price').val();
        const itemAction = $('#item-action').val();
        const itemImage = $('#item-image')[0].files[0];

    // Basic form validation
    if (!itemName || !itemDescription || !itemCategory || !itemCondition) {
        alert('Please fill in all required fields');
        return;
    }

    if (itemAction === 'sell' && (!itemPrice || parseFloat(itemPrice) <= 0)) {
        alert('Please enter a valid price for items you want to sell');
        return;
    }

    // Create a new item card
    const imageUrl = itemImage ? URL.createObjectURL(itemImage) : 'https://via.placeholder.com/300x200';

    const newItemCard = $('<div>').addClass('item-card').html(`
        <div class="item-image">
            <img src="${imageUrl}" alt="${itemName}">
        </div>
        <div class="item-details">
            <h3>${itemName}</h3>
            <p>${itemDescription}</p>
            <p><strong>Category:</strong> ${itemCategory}</p>
            <p><strong>Condition:</strong> ${itemCondition}</p>
            ${itemAction === 'sell' ? `<p><strong>Price: ₹${itemPrice}</strong></p>` : ''}
            <button class="purchase-btn">Purchase</button>
            <button class="donate-btn">Donate</button>
        </div>
    `);

    // Add the new item to the grid with a fade effect
    $('.items-grid').prepend(newItemCard.hide().fadeIn(500));

    // Show success message
    alert('Item has been successfully added to the marketplace!');

    // Clear form after submission
    document.getElementById('donate-sell-form').reset();
});

// Handle Purchase and Donate buttons using jQuery event delegation
$(document).on('click', '.purchase-btn', function() {
    const $itemCard = $(this).closest('.item-card');
    const itemName = $itemCard.find('h3').text();
    const itemPrice = $itemCard.find('p strong').text() || 'Free';

    if (confirm(`Would you like to purchase "${itemName}" for ${itemPrice}?`)) {
        $(this).prop('disabled', true).text('Processing...');
        setTimeout(() => {
            alert('Thank you for your purchase! We will contact you shortly with payment details.');
            $(this).prop('disabled', false).text('Purchase');
        }, 1000);
    }
});

$(document).on('click', '.donate-btn', function() {
    const $itemCard = $(this).closest('.item-card');
    const itemName = $itemCard.find('h3').text();

    if (confirm(`Would you like to donate "${itemName}"?`)) {
        $(this).prop('disabled', true).text('Processing...');
        setTimeout(() => {
            alert('Thank you for your interest in donating! We will contact you shortly with donation details.');
            $(this).prop('disabled', false).text('Donate');
        }, 1000);
    }
});

// Handle Newsletter Form with jQuery
$('.newsletter-form').on('submit', function(e) {
    e.preventDefault();
    const $emailInput = $(this).find('input[type="email"]');
    const email = $emailInput.val();

    if (!email) {
        alert('Please enter your email address');
        return;
    }

    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Show success message with animation
    const $successMsg = $('<div>')
        .addClass('success-message')
        .text('Thank you for subscribing!')
        .hide()
        .insertAfter(this)
        .fadeIn(500);

    setTimeout(() => {
        $successMsg.fadeOut(500, function() {
            $(this).remove();
        });
    }, 3000);

    $emailInput.val('');
});

// Email validation helper function
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Back to Top Button Functionality with jQuery
const $backToTop = $('#backToTop');

// When the user scrolls down 20px from the top of the document, show/hide the button
$(window).scroll(function() {
    if ($(this).scrollTop() > 20) {
        $backToTop.fadeIn();
    } else {
        $backToTop.fadeOut();
    }
});

// Smooth scroll to top when button is clicked
$backToTop.click(function() {
    $('html, body').animate({scrollTop: 0}, 800);
    return false;
});

// Login Form Handling with jQuery
$('#login-form').on('submit', function(e) {
    e.preventDefault();

    const email = $('#email').val();
    const password = $('#password').val();

    if (!isValidEmail(email)) {
        showFormError($(this), 'Please enter a valid email address');
        return;
    }

    if (password.length < 6) {
        showFormError($(this), 'Password must be at least 6 characters long');
        return;
    }

    // Here you would typically send the data to a server
    console.log('Login attempt:', { email, password });

    // Show success message and redirect
    const $successMsg = $('<div>')
        .addClass('success-message')
        .text('Login successful! Redirecting...')
        .hide()
        .insertBefore(this)
        .fadeIn(500);

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
});

// Signup Form Handling with jQuery
$('#signup-form').on('submit', function(e) {
    e.preventDefault();

    const fullname = $('#fullname').val();
    const email = $('#email').val();
    const password = $('#password').val();
    const confirmPassword = $('#confirm-password').val();

    if (!fullname || fullname.length < 3) {
        showFormError($(this), 'Please enter your full name (minimum 3 characters)');
        return;
    }

    if (!isValidEmail(email)) {
        showFormError($(this), 'Please enter a valid email address');
        return;
    }

    if (password.length < 6) {
        showFormError($(this), 'Password must be at least 6 characters long');
        return;
    }

    if (password !== confirmPassword) {
        showFormError($(this), 'Passwords do not match');
        return;
    }

    // Here you would typically send the data to a server
    console.log('Signup attempt:', { fullname, email, password });

    // Show success message and redirect
    const $successMsg = $('<div>')
        .addClass('success-message')
        .text('Account created successfully! Redirecting to login...')
        .hide()
        .insertBefore(this)
        .fadeIn(500);

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
});

// Helper function to show form errors with animation
function showFormError($form, message) {
    const $errorMsg = $('<div>')
        .addClass('error-message')
        .text(message)
        .hide()
        .insertBefore($form)
        .fadeIn(500);

    setTimeout(() => {
        $errorMsg.fadeOut(500, function() {
            $(this).remove();
        });
    }, 3000);
}

// Contact Form Handling with jQuery
$('#contact-form').on('submit', function(e) {
    e.preventDefault();

    const name = $('#name').val();
    const email = $('#email').val();
    const subject = $('#subject').val();
    const message = $('#message').val();

    if (!name || name.length < 3) {
        showFormError($(this), 'Please enter your name (minimum 3 characters)');
        return;
    }

    if (!isValidEmail(email)) {
        showFormError($(this), 'Please enter a valid email address');
        return;
    }

    if (!subject || subject.length < 5) {
        showFormError($(this), 'Please enter a subject (minimum 5 characters)');
        return;
    }

    if (!message || message.length < 20) {
        showFormError($(this), 'Please enter a message (minimum 20 characters)');
        return;
    }

    // Here you would typically send the data to a server
    console.log('Contact form submission:', { name, email, subject, message });

    // Show success message with animation
    const $successMsg = $('<div>')
        .addClass('success-message')
        .text('Thank you for your message! We will get back to you soon.')
        .hide()
        .insertBefore(this)
        .fadeIn(500);

    setTimeout(() => {
        $successMsg.fadeOut(500, function() {
            $(this).remove();
        });
    }, 3000);

    this.reset();
});

// Live Chat Button with jQuery
$('.chat-btn').on('click', function() {
    const $chatMsg = $('<div>')
        .addClass('chat-message')
        .text('Live chat feature coming soon!')
        .hide()
        .insertAfter(this)
        .fadeIn(500);

    setTimeout(() => {
        $chatMsg.fadeOut(500, function() {
            $(this).remove();
        });
    }, 2000);
});

// Update navigation active states based on current page with jQuery
function updateActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    $('.nav-menu a').each(function() {
        const href = $(this).attr('href').split('#')[0] || 'index.html';
        $(this).toggleClass('active', href === currentPage);
    });
}

// Call the function when the page loads using jQuery
$(document).ready(updateActiveNavigation);

// Add smooth scrolling to all internal links
$('a[href*="#"]:not([href="#"])').on('click', function(e) {
    if (
        location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
        && 
        location.hostname == this.hostname
    ) {
        e.preventDefault();
        const target = $(this.hash);
        const targetName = this.hash.slice(1); // Remove the # from the hash
        const $target = target.length ? target : $('[name=' + targetName + ']');
        
        if ($target.length) {
            $('html, body').animate({
                scrollTop: $target.offset().top - 100
            }, 800, function() {
                // Add focus for accessibility
                $target.focus();
                if ($target.is(":focus")) { 
                    return false;
                } else {
                    $target.attr('tabindex','-1');
                    $target.focus();
                }
            });
        }
    }
});
});

