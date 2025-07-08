// Sample property data
const properties = [
  {
    id: 1,
    title: "Modern Family Home",
    location: "Beverly Hills, CA",
    price: "$850,000",
    type: "house",
    bedrooms: 4,
    bathrooms: 3,
    area: "2,500 sq ft",
    image: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Beautiful modern family home with spacious rooms, updated kitchen, and large backyard. Perfect for families looking for comfort and style.",
    features: ["Swimming Pool", "Garage", "Garden", "Modern Kitchen", "Fireplace", "Air Conditioning"]
  },
  {
    id: 2,
    title: "Luxury Downtown Apartment",
    location: "Manhattan, NY",
    price: "$1,200,000",
    type: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,200 sq ft",
    image: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Stunning luxury apartment in the heart of Manhattan with panoramic city views and premium finishes throughout.",
    features: ["City View", "Concierge", "Gym", "Rooftop Terrace", "Modern Appliances", "Hardwood Floors"]
  },
  {
    id: 3,
    title: "Cozy Suburban Condo",
    location: "Austin, TX",
    price: "$320,000",
    type: "condo",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,100 sq ft",
    image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Charming condo in a quiet suburban neighborhood with modern amenities and easy access to downtown Austin.",
    features: ["Balcony", "Parking", "Storage", "Laundry", "Security", "Pet Friendly"]
  },
  {
    id: 4,
    title: "Oceanfront Villa",
    location: "Malibu, CA",
    price: "$2,500,000",
    type: "villa",
    bedrooms: 5,
    bathrooms: 4,
    area: "4,200 sq ft",
    image: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Spectacular oceanfront villa with breathtaking views, private beach access, and luxurious amenities throughout.",
    features: ["Ocean View", "Private Beach", "Wine Cellar", "Home Theater", "Infinity Pool", "Guest House"]
  },
  {
    id: 5,
    title: "Historic Townhouse",
    location: "Boston, MA",
    price: "$750,000",
    type: "house",
    bedrooms: 3,
    bathrooms: 2,
    area: "1,800 sq ft",
    image: "https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Beautifully restored historic townhouse with original architectural details and modern updates.",
    features: ["Historic Character", "Brick Facade", "Updated Kitchen", "Hardwood Floors", "Basement", "Parking"]
  },
  {
    id: 6,
    title: "Modern Loft Apartment",
    location: "Chicago, IL",
    price: "$450,000",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    area: "900 sq ft",
    image: "https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Stylish loft apartment with high ceilings, exposed brick walls, and industrial-chic design elements.",
    features: ["High Ceilings", "Exposed Brick", "Open Floor Plan", "Modern Fixtures", "Downtown Location", "Elevator"]
  }
];

// Global variables
let filteredProperties = [...properties];
let currentFilter = 'all';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeWebsite();
});

// Initialize website functionality
function initializeWebsite() {
  setupMobileNavigation();
  setupSmoothScrolling();
  setupPropertyFilters();
  setupScrollEffects();
  loadProperties();
  setupSearchFunctionality();
}

// Mobile Navigation
function setupMobileNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
}

// Smooth Scrolling
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = target.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Property Filters
function setupPropertyFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Get filter value
      const filter = this.getAttribute('data-filter');
      currentFilter = filter;
      
      // Filter and display properties
      filterProperties(filter);
    });
  });
}

// Filter Properties
function filterProperties(filter) {
  const propertiesGrid = document.getElementById('properties-grid');
  
  if (filter === 'all') {
    filteredProperties = [...properties];
  } else {
    filteredProperties = properties.filter(property => property.type === filter);
  }
  
  displayProperties(filteredProperties);
}

// Load and Display Properties
function loadProperties() {
  displayProperties(properties);
}

function displayProperties(propertiesToShow) {
  const propertiesGrid = document.getElementById('properties-grid');
  
  if (!propertiesGrid) return;
  
  // Add loading animation
  propertiesGrid.innerHTML = '<div class="loading-container"><div class="loading"></div></div>';
  
  // Simulate loading delay for better UX
  setTimeout(() => {
    if (propertiesToShow.length === 0) {
      propertiesGrid.innerHTML = `
        <div class="no-properties">
          <i class="fas fa-home" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
          <p style="color: #666; font-size: 1.1rem;">No properties found matching your criteria.</p>
        </div>
      `;
      return;
    }
    
    propertiesGrid.innerHTML = propertiesToShow.map(property => `
      <div class="property-card fade-in" data-property-id="${property.id}">
        <div class="property-image">
          <img src="${property.image}" alt="${property.title}" onerror="this.src='https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600'">
          <div class="property-badge">${property.type}</div>
          <div class="property-price">${property.price}</div>
        </div>
        <div class="property-info">
          <h3 class="property-title">${property.title}</h3>
          <div class="property-location">
            <i class="fas fa-map-marker-alt"></i>
            ${property.location}
          </div>
          <div class="property-features">
            <div class="feature">
              <i class="fas fa-bed"></i>
              ${property.bedrooms} Beds
            </div>
            <div class="feature">
              <i class="fas fa-bath"></i>
              ${property.bathrooms} Baths
            </div>
            <div class="feature">
              <i class="fas fa-ruler-combined"></i>
              ${property.area}
            </div>
          </div>
          <p class="property-description">${property.description.substring(0, 100)}...</p>
          <button class="view-details-btn" onclick="openPropertyModal(${property.id})">
            View Details
          </button>
        </div>
      </div>
    `).join('');
    
    // Add click event to property cards
    document.querySelectorAll('.property-card').forEach(card => {
      card.addEventListener('click', function(e) {
        if (!e.target.classList.contains('view-details-btn')) {
          const propertyId = parseInt(this.getAttribute('data-property-id'));
          openPropertyModal(propertyId);
        }
      });
    });
  }, 500);
}

// Property Modal
function openPropertyModal(propertyId) {
  const property = properties.find(p => p.id === propertyId);
  if (!property) return;

  const modal = document.getElementById('property-modal');
  const modalBody = document.getElementById('modal-body');

  modalBody.innerHTML = `
    <img src="${property.image}" alt="${property.title}" class="modal-property-image" onerror="this.src='https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600'">
    <div class="modal-property-info">
      <h2 class="modal-property-title">${property.title}</h2>
      <div class="modal-property-price">${property.price}</div>
      <div class="modal-property-location">
        <i class="fas fa-map-marker-alt"></i>
        ${property.location}
      </div>
      <div class="modal-property-features">
        <div class="modal-feature">
          <i class="fas fa-bed"></i>
          ${property.bedrooms} Bedrooms
        </div>
        <div class="modal-feature">
          <i class="fas fa-bath"></i>
          ${property.bathrooms} Bathrooms
        </div>
        <div class="modal-feature">
          <i class="fas fa-ruler-combined"></i>
          ${property.area}
        </div>
        ${property.features.map(feature => `
          <div class="modal-feature">
            <i class="fas fa-check"></i>
            ${feature}
          </div>
        `).join('')}
      </div>
      <div class="modal-property-description">
        <h4>Description</h4>
        <p>${property.description}</p>
      </div>
      <button class="modal-contact-agent" onclick="contactAgent('${property.title}')">
        <i class="fas fa-phone"></i> Contact Agent
      </button>
    </div>
  `;

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('property-modal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
  const modal = document.getElementById('property-modal');
  if (event.target === modal) {
    closeModal();
  }
});

// Search Functionality
function setupSearchFunctionality() {
  const locationSearch = document.getElementById('location-search');
  const propertyType = document.getElementById('property-type');
  const priceRange = document.getElementById('price-range');

  if (locationSearch) {
    locationSearch.addEventListener('input', debounce(performSearch, 300));
  }
  if (propertyType) {
    propertyType.addEventListener('change', performSearch);
  }
  if (priceRange) {
    priceRange.addEventListener('change', performSearch);
  }
}

function searchProperties() {
  performSearch();
  
  // Scroll to properties section
  const propertiesSection = document.getElementById('properties');
  if (propertiesSection) {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = propertiesSection.offsetTop - headerHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

function performSearch() {
  const location = document.getElementById('location-search').value.toLowerCase();
  const type = document.getElementById('property-type').value;
  const priceRange = document.getElementById('price-range').value;

  let filtered = [...properties];

  // Filter by location
  if (location) {
    filtered = filtered.filter(property => 
      property.location.toLowerCase().includes(location) ||
      property.title.toLowerCase().includes(location)
    );
  }

  // Filter by type
  if (type) {
    filtered = filtered.filter(property => property.type === type);
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-filter') === type) {
        btn.classList.add('active');
      }
    });
    currentFilter = type;
  }

  // Filter by price range
  if (priceRange) {
    filtered = filtered.filter(property => {
      const price = parseInt(property.price.replace(/[$,]/g, ''));
      
      switch(priceRange) {
        case '0-200000':
          return price <= 200000;
        case '200000-500000':
          return price > 200000 && price <= 500000;
        case '500000-1000000':
          return price > 500000 && price <= 1000000;
        case '1000000+':
          return price > 1000000;
        default:
          return true;
      }
    });
  }

  filteredProperties = filtered;
  displayProperties(filtered);
}

// Scroll Effects
function setupScrollEffects() {
  window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const scrolled = window.pageYOffset;
    
    if (scrolled > 100) {
      header.style.background = 'rgba(255, 255, 255, 0.98)';
      header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }

    // Animate elements on scroll
    animateOnScroll();
  });
}

function animateOnScroll() {
  const elements = document.querySelectorAll('.service-card, .stat, .contact-item');
  
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;
    
    if (elementTop < window.innerHeight - elementVisible) {
      element.classList.add('fade-in');
    }
  });
}

// Contact Agent
function contactAgent(propertyTitle) {
  alert(`Thank you for your interest in "${propertyTitle}"! Our agent will contact you shortly.`);
  closeModal();
  
  // Scroll to contact section
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = contactSection.offsetTop - headerHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

// Form Submissions
function submitForm(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  
  // Simulate form submission
  const submitBtn = event.target.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;
  
  setTimeout(() => {
    alert('Thank you for your message! We will get back to you soon.');
    event.target.reset();
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }, 2000);
}

function subscribeNewsletter(event) {
  event.preventDefault();
  
  const email = event.target.querySelector('input[type="email"]').value;
  const button = event.target.querySelector('button');
  const originalHTML = button.innerHTML;
  
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  button.disabled = true;
  
  setTimeout(() => {
    alert(`Thank you for subscribing with ${email}!`);
    event.target.reset();
    button.innerHTML = originalHTML;
    button.disabled = false;
  }, 1500);
}

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize animations
function initializeAnimations() {
  // Add intersection observer for better performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  });

  // Observe elements for animation
  document.querySelectorAll('.service-card, .stat, .contact-item').forEach(el => {
    observer.observe(el);
  });
}

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAnimations);

// Function to scroll to specific service and highlight it
function scrollToService(serviceType) {
  // First scroll to services section
  const servicesSection = document.getElementById('services');
  if (servicesSection) {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = servicesSection.offsetTop - headerHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // After scrolling, highlight the specific service
    setTimeout(() => {
      highlightService(serviceType);
    }, 800);
  }
}

// Function to highlight specific service card
function highlightService(serviceType) {
  // Remove any existing highlights
  document.querySelectorAll('.service-card').forEach(card => {
    card.classList.remove('highlighted');
  });
  
  // Map service types to card indices (0-based)
  const serviceMap = {
    'property-sales': 0,
    'property-rentals': 1,
    'property-valuation': 2,
    'investment-consulting': 3,
    'property-management': 4
  };
  
  const serviceCards = document.querySelectorAll('.service-card');
  const targetIndex = serviceMap[serviceType];
  
  if (targetIndex !== undefined && serviceCards[targetIndex]) {
    serviceCards[targetIndex].classList.add('highlighted');
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      serviceCards[targetIndex].classList.remove('highlighted');
    }, 5000);
  }
}
