// Message display duration in milliseconds
const MESSAGE_DURATION = 8000; // Increased to 8 seconds for better visibility

class ContactFormHandler {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        // Contact form elements
        this.contactForm = document.getElementById('contactForm');
        this.messageDisplay = this.createMessageDisplay('contact-message');

        // Newsletter elements
        this.newsletterForm = document.querySelector('.newsletter-form');
        this.newsletterMessage = this.createMessageDisplay('newsletter-message');

        // Back to top button
        this.backToTopButton = document.getElementById('backToTop');

        // Insert message displays
        if (this.contactForm) {
            this.contactForm.insertBefore(this.messageDisplay, this.contactForm.firstChild);
        }
        if (this.newsletterForm) {
            this.newsletterForm.appendChild(this.newsletterMessage);
        }
    }

    createMessageDisplay(className) {
        const display = document.createElement('div');
        display.className = `message-display ${className}`;
        display.style.display = 'none';
        return display;
    }

    setupEventListeners() {
        // Contact form submission
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', this.handleContactSubmit.bind(this));
        }

        // Newsletter subscription
        if (this.newsletterForm) {
            this.newsletterForm.addEventListener('submit', this.handleNewsletterSubmit.bind(this));
        }

        // Back to top button
        if (this.backToTopButton) {
            window.addEventListener('scroll', this.handleScroll.bind(this));
            this.backToTopButton.addEventListener('click', this.scrollToTop.bind(this));
        }
    }

    handleContactSubmit(event) {
        event.preventDefault();
        this.resetMessage(this.messageDisplay);

        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        // Validate form data
        if (!this.validateContactForm(formData)) {
            return;
        }

        // Show success message and reset form
        this.showMessage(this.messageDisplay, 'Thank you for your message! We will get back to you soon.', 'success');
        this.contactForm.reset();
    }

    handleNewsletterSubmit(event) {
        event.preventDefault();
        this.resetMessage(this.newsletterMessage);

        const email = this.newsletterForm.querySelector('input[type="email"]').value.trim();

        // Validate email
        if (!this.validateEmail(email)) {
            this.showMessage(this.newsletterMessage, 'Please enter a valid email address.', 'error');
            return;
        }

        // Show success message and reset form
        this.showMessage(this.newsletterMessage, 'Thank you for subscribing to our newsletter!', 'success');
        this.newsletterForm.reset();
    }

    validateContactForm(formData) {
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            this.showMessage(this.messageDisplay, 'Please fill in all required fields.', 'error');
            return false;
        }

        if (!this.validateEmail(formData.email)) {
            this.showMessage(this.messageDisplay, 'Please enter a valid email address.', 'error');
            return false;
        }

        return true;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Removed API calls as we're just showing success messages

    showMessage(element, message, type) {
        element.textContent = message;
        element.className = `message-display ${type}`;
        element.style.display = 'block';

        setTimeout(() => {
            this.resetMessage(element);
        }, MESSAGE_DURATION);
    }

    resetMessage(element) {
        element.textContent = '';
        element.className = 'message-display';
        element.style.display = 'none';
    }

    handleScroll() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            this.backToTopButton.style.display = 'block';
        } else {
            this.backToTopButton.style.display = 'none';
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Initialize the contact form handler when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormHandler();
});