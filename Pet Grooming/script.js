// script.js - main frontend logic (site pages)

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// Seed default services if missing or empty
function seedServices() {
  let services = [];
  try {
    services = JSON.parse(localStorage.getItem('pg_services')) || [];
  } catch (e) {
    services = [];
  }

  if (!Array.isArray(services) || services.length === 0) {
    services = [
      { id: 's1', name: 'Basic Bath', price: 250, duration: '30 mins' },
      { id: 's2', name: 'Full Groom', price: 700, duration: '90 mins' },
      { id: 's3', name: 'Nail Trim', price: 120, duration: '15 mins' },
      { id: 's4', name: 'Ear Cleaning', price: 100, duration: '10 mins' },
    ];
    localStorage.setItem('pg_services', JSON.stringify(services));
  }
}

// Check login
function getCurrentUser(){ return JSON.parse(localStorage.getItem('pg_current_user') || 'null'); }
function isLoggedIn(){ return !!getCurrentUser(); }

// Navbar update
function updateNavbar(){
  const user = getCurrentUser();
  const nav = document.querySelector('.nav-links');
  if(!nav) return;
  const existing = document.querySelector('.nav-user');
  if(existing) existing.remove();

  const div = document.createElement('div');
  div.className = 'nav-user';
  if(user){
    const span = document.createElement('span');
    span.textContent = 'Hi, ' + (user.name || user.email);
    span.style.color = 'var(--muted)';
    span.style.marginRight = '8px';
    const logout = document.createElement('a');
    logout.href = '#';
    logout.textContent = 'Logout';
    logout.addEventListener('click',(e)=>{ e.preventDefault(); logoutUser(); });
    div.appendChild(span);
    div.appendChild(logout);
  } else {
    const login = document.createElement('a');
    login.href = 'login.html';
    login.textContent = 'Login';
    div.appendChild(login);
  }
  nav.appendChild(div);
}

// Logout
function logoutUser(){
  localStorage.removeItem('pg_current_user');
  updateNavbar();
  if(window.location.pathname.endsWith('booking.html')) window.location.href = 'login.html';
}

// Protect booking page
function protectBookingPage(){
  if(window.location.pathname.endsWith('booking.html') && !isLoggedIn()){
    localStorage.setItem('pg_after_login', window.location.pathname + window.location.search);
    window.location.href = 'login.html';
  }
}

// Populate services dropdown on booking page
function populateServicesDropdown(){
  const sel = $('#service');
  if(!sel) return;
  const services = JSON.parse(localStorage.getItem('pg_services')||'[]');
  sel.innerHTML = '';
  services.forEach(s=>{
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name + ' — ₱' + s.price;
    sel.appendChild(opt);
  });
}

// Populate services grid on services.html
function populateServicesList(){
  const container = document.querySelector('.services-grid');
  if(!container) return;
  const services = JSON.parse(localStorage.getItem('pg_services')||'[]');
  container.innerHTML = '';
  services.forEach(s=>{
    const el = document.createElement('div');
    el.className = 'service card';
    el.innerHTML = `
      <div style="font-weight:700">${s.name}</div>
      <div class="small">${s.duration}</div>
      <div style="margin-top:12px;font-weight:700">₱${s.price}</div>
    `;
    container.appendChild(el);
  });
}

// Payment method handler - show/hide payment details
function setupPaymentHandler(){
  const paymentRadios = $$('input[name="payment"]');
  const paymentDetailsSection = $('#payment-details');
  const gcashSection = $('#gcash-details');
  const cardSection = $('#card-details');
  
  if(!paymentDetailsSection) return;
  
  paymentRadios.forEach(radio=>{
    radio.addEventListener('change', ()=>{
      const value = radio.value;
      
      // Hide all sections first
      gcashSection.style.display = 'none';
      cardSection.style.display = 'none';
      
      // Clear required attributes from all payment fields
      clearPaymentFieldsRequired();
      
      if(value === 'Cash'){
        paymentDetailsSection.style.display = 'none';
      } else if(value === 'GCash'){
        paymentDetailsSection.style.display = 'block';
        gcashSection.style.display = 'block';
        setGCashFieldsRequired(true);
      } else if(value === 'Card'){
        paymentDetailsSection.style.display = 'block';
        cardSection.style.display = 'block';
        setCardFieldsRequired(true);
      }
    });
  });
}

// Clear all payment field requirements
function clearPaymentFieldsRequired(){
  const fields = ['gcashNumber','gcashName','cardNumber','cardExpiry','cardCVV','cardName'];
  fields.forEach(id=>{
    const field = $('#'+id);
    if(field){
      field.removeAttribute('required');
      field.value = '';
    }
  });
}

// Set GCash fields as required
function setGCashFieldsRequired(required){
  const fields = ['gcashNumber','gcashName'];
  fields.forEach(id=>{
    const field = $('#'+id);
    if(field && required) field.setAttribute('required','required');
  });
}

// Set Card fields as required
function setCardFieldsRequired(required){
  const fields = ['cardNumber','cardExpiry','cardCVV','cardName'];
  fields.forEach(id=>{
    const field = $('#'+id);
    if(field && required) field.setAttribute('required','required');
  });
}

// Format card number input (add spaces)
function formatCardNumber(input){
  let value = input.value.replace(/\s/g,'').replace(/\D/g,'');
  let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
  input.value = formatted;
}

// Format expiry date (MM/YY)
function formatExpiry(input){
  let value = input.value.replace(/\D/g,'');
  if(value.length >= 2){
    value = value.substring(0,2) + '/' + value.substring(2,4);
  }
  input.value = value;
}

// Setup input formatters
function setupInputFormatters(){
  const cardNumberInput = $('#cardNumber');
  const expiryInput = $('#cardExpiry');
  const cvvInput = $('#cardCVV');
  const gcashInput = $('#gcashNumber');
  const phoneInput = $('#ownerPhone');
  
  if(cardNumberInput){
    cardNumberInput.addEventListener('input', ()=> formatCardNumber(cardNumberInput));
  }
  
  if(expiryInput){
    expiryInput.addEventListener('input', ()=> formatExpiry(expiryInput));
  }
  
  if(cvvInput){
    cvvInput.addEventListener('input', ()=>{
      cvvInput.value = cvvInput.value.replace(/\D/g,'').substring(0,3);
    });
  }
  
  if(gcashInput){
    gcashInput.addEventListener('input', ()=>{
      gcashInput.value = gcashInput.value.replace(/\D/g,'').substring(0,11);
    });
  }
  
  if(phoneInput){
    phoneInput.addEventListener('input', ()=>{
      phoneInput.value = phoneInput.value.replace(/\D/g,'').substring(0,11);
    });
  }
}

// Validate payment details
function validatePaymentDetails(paymentMethod){
  if(paymentMethod === 'GCash'){
    const number = $('#gcashNumber').value.trim();
    const name = $('#gcashName').value.trim();
    
    if(!number || number.length !== 11){
      alert('⚠️ Please enter a valid 11-digit GCash number.');
      return false;
    }
    if(!name){
      alert('⚠️ Please enter your GCash account name.');
      return false;
    }
    return {gcashNumber: number, gcashName: name};
    
  } else if(paymentMethod === 'Card'){
    const cardNum = $('#cardNumber').value.replace(/\s/g,'');
    const expiry = $('#cardExpiry').value;
    const cvv = $('#cardCVV').value;
    const name = $('#cardName').value.trim();
    
    if(!cardNum || cardNum.length < 15){
      alert('⚠️ Please enter a valid card number.');
      return false;
    }
    if(!expiry || !expiry.match(/^\d{2}\/\d{2}$/)){
      alert('⚠️ Please enter expiry date in MM/YY format.');
      return false;
    }
    if(!cvv || cvv.length !== 3){
      alert('⚠️ Please enter a valid 3-digit CVV.');
      return false;
    }
    if(!name){
      alert('⚠️ Please enter cardholder name.');
      return false;
    }
    
    // Mask card number for security (show only last 4 digits)
    const maskedCard = '****' + cardNum.slice(-4);
    return {cardNumber: maskedCard, cardExpiry: expiry, cardName: name};
  }
  
  return true; // Cash payment
}

// Helper: validate date & time
function validateBookingDateTime(dateVal, timeVal) {
  const now = new Date();
  const chosenDate = new Date(dateVal + 'T' + timeVal);

  if (isNaN(chosenDate.getTime())) {
    alert('⚠️ Please choose a valid date and time.');
    return false;
  }

  if (chosenDate < now) {
    alert('⚠️ You cannot choose a past date or time.');
    return false;
  }

  const day = chosenDate.getDay();
  if (day === 0) {
    alert('⚠️ We are closed on Sundays.');
    return false;
  }

  const hours = chosenDate.getHours();
  if (hours < 8 || hours >= 18) {
    alert('⚠️ We are open from 8:00 AM to 6:00 PM, Monday to Saturday.');
    return false;
  }

  return true;
}

// Booking summary modal
function showSummaryModal(data){
  let backdrop = $('#summary-modal');
  if(!backdrop){
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'summary-modal';
    document.body.appendChild(backdrop);
  }
  backdrop.innerHTML = '';
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const services = JSON.parse(localStorage.getItem('pg_services')||'[]');
  const svc = services.find(s=>s.id===data.serviceId) || {name:'Service',price:0};
  
  // Payment details display
  let paymentDetails = data.paymentMethod;
  if(data.paymentDetails){
    if(data.paymentMethod === 'GCash'){
      paymentDetails = `GCash - ${data.paymentDetails.gcashNumber} (${data.paymentDetails.gcashName})`;
    } else if(data.paymentMethod === 'Card'){
      paymentDetails = `Card ending in ${data.paymentDetails.cardNumber} (${data.paymentDetails.cardName})`;
    }
  }
  
  modal.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div>
        <div style="font-weight:700;font-size:18px">Confirm Booking</div>
        <div class="small">Review your booking details before confirming</div>
      </div>
      <button id="close-summary" class="btn btn-outline btn-sm">✕ Close</button>
    </div>
    <hr style="margin:16px 0;border:none;border-top:1px solid #f1f5f6"/>
    <div style="display:grid;gap:12px">
      <div class="detail-item">
        <div class="detail-label">Owner Information</div>
        <div class="detail-value">${data.ownerName}</div>
        <div class="small">${data.ownerEmail} • ${data.ownerPhone}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Pet Details</div>
        <div class="detail-value">${data.petName} (${data.petType})</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Service</div>
        <div class="detail-value">${data.serviceName} - ₱${svc.price}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Appointment Date & Time</div>
        <div class="detail-value">${formatDate(data.date)} at ${formatTime(data.time)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Payment Method</div>
        <div class="detail-value">${paymentDetails}</div>
      </div>
      ${data.notes ? `
        <div class="detail-item">
          <div class="detail-label">Additional Notes</div>
          <div class="detail-value">${data.notes}</div>
        </div>
      ` : ''}
      ${data.paymentMethod === 'GCash' ? `
        <div class="info-box">
          <strong>Next Steps:</strong> After confirmation, you'll receive our GCash merchant number via email. Please complete the payment and keep your reference number.
        </div>
      ` : ''}
      <div style="margin-top:16px;display:flex;gap:10px;justify-content:flex-end">
        <button id="cancel-book" class="btn btn-outline">Cancel</button>
        <button id="confirm-book" class="btn btn-primary">✓ Confirm Booking</button>
      </div>
    </div>
  `;
  backdrop.appendChild(modal);
  backdrop.classList.add('show');

  $('#close-summary').onclick = () => backdrop.classList.remove('show');
  $('#cancel-book').onclick = () => backdrop.classList.remove('show');
  $('#confirm-book').onclick = () => {
    const user = getCurrentUser();
    const appts = JSON.parse(localStorage.getItem('pg_appointments')||'[]');
    const booking = { 
      ...data, 
      id:'apt_'+Math.random().toString(36).slice(2,9), 
      userId: user ? user.id : 'guest',
      status:'Pending', 
      createdAt:new Date().toISOString() 
    };
    appts.push(booking);
    localStorage.setItem('pg_appointments', JSON.stringify(appts));

    // Show success message
    const successMsg = data.paymentMethod === 'GCash' 
      ? 'Please check your email for GCash payment instructions.'
      : data.paymentMethod === 'Card'
      ? 'Your card will be charged upon appointment confirmation.'
      : 'Please prepare cash payment when you arrive.';
    
    backdrop.innerHTML = `
      <div class="modal" style="text-align:center;padding:40px">
        <div style="font-size:48px;margin-bottom:16px">🎉</div>
        <h2 style="color:var(--success);margin-bottom:12px">Booking Successful!</h2>
        <p>Your appointment has been submitted and is now <strong>Pending</strong>.</p>
        <p class="small" style="margin-top:8px">${successMsg}</p>
        <p class="small" style="margin-top:8px">You will be notified once it's confirmed by our team.</p>
        <button id="view-appointments" class="btn btn-primary" style="margin-top:20px">View My Appointments</button>
      </div>
    `;
    
    $('#view-appointments').onclick = () => {
      backdrop.classList.remove('show');
      switchToAppointmentsTab();
      $('#booking-form').reset();
      clearPaymentFieldsRequired();
      $('#payment-details').style.display = 'none';
    };
  };
}

// Format date helper
function formatDate(dateStr){
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}

// Format time helper
function formatTime(timeStr){
  const [h,m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

// Booking form handler
function attachBookingHandler(){
  const btn = $('#btn-submit');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    const ownerName = $('#ownerName').value.trim();
    const ownerEmail = $('#ownerEmail').value.trim();
    const ownerPhone = $('#ownerPhone').value.trim();
    const petName = $('#petName').value.trim();
    const petType = $('#petType').value;
    const serviceId = $('#service').value;
    const date = $('#date').value;
    const time = $('#time').value;
    const notes = $('#notes').value.trim();
    const payment = document.querySelector('input[name="payment"]:checked');

    if(!payment){
      alert('⚠️ Please choose a payment method.');
      return;
    }

    if(!ownerName || !ownerEmail || !ownerPhone || !petName || !serviceId || !date || !time){
      alert('⚠️ Please fill in all required fields.');
      return;
    }
    
    if(ownerPhone.length !== 11){
      alert('⚠️ Please enter a valid 11-digit phone number.');
      return;
    }

    if (!validateBookingDateTime(date, time)) return;
    
    // Validate payment details
    const paymentDetails = validatePaymentDetails(payment.value);
    if(!paymentDetails) return;

    const services = JSON.parse(localStorage.getItem('pg_services')||'[]');
    const svc = services.find(s=>s.id===serviceId) || {name:'Service'};

    const data = { 
      ownerName, 
      ownerEmail,
      ownerPhone,
      petName, 
      petType, 
      serviceId, 
      serviceName:svc.name, 
      date, 
      time, 
      paymentMethod:payment.value,
      paymentDetails: paymentDetails !== true ? paymentDetails : null,
      notes 
    };
    showSummaryModal(data);
  });
}

// Tab switching
function setupTabs(){
  const tabBtns = $$('.tab-btn');
  const tabContents = $$('.tab-content');
  
  tabBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const targetTab = btn.dataset.tab;
      
      tabBtns.forEach(b=>b.classList.remove('active'));
      tabContents.forEach(c=>c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetContent = $('#tab-'+targetTab);
      if(targetContent) targetContent.classList.add('active');
      
      if(targetTab === 'appointments'){
        loadAppointments();
      }
    });
  });
}

// Switch to appointments tab programmatically
function switchToAppointmentsTab(){
  const appointmentsBtn = document.querySelector('.tab-btn[data-tab="appointments"]');
  if(appointmentsBtn) appointmentsBtn.click();
}

// Load and display user appointments
function loadAppointments(){
  const container = $('#appointments-list');
  if(!container) return;
  
  const user = getCurrentUser();
  if(!user){
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔒</div>
        <p>Please log in to view your appointments.</p>
      </div>
    `;
    return;
  }
  
  const allAppts = JSON.parse(localStorage.getItem('pg_appointments')||'[]');
  const userAppts = allAppts.filter(a=> a.userId === user.id || a.ownerEmail === user.email);
  
  if(userAppts.length === 0){
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" role="img" aria-label="No appointment icon">
  <!-- Calendar outline -->
  <rect x="5" y="7" width="22" height="20" rx="2.5" fill="none" stroke="#000" stroke-width="2"/>
  <!-- Top bar -->
  <line x1="5" y1="12" x2="27" y2="12" stroke="#000" stroke-width="2"/>
  <!-- Calendar rings -->
  <line x1="11" y1="5" x2="11" y2="9" stroke="#000" stroke-width="2" stroke-linecap="round"/>
  <line x1="21" y1="5" x2="21" y2="9" stroke="#000" stroke-width="2" stroke-linecap="round"/>
  <!-- X mark (no appointment) -->
  <line x1="11" y1="17" x2="21" y2="23" stroke="#000" stroke-width="2" stroke-linecap="round"/>
  <line x1="21" y1="17" x2="11" y2="23" stroke="#000" stroke-width="2" stroke-linecap="round"/>
</svg></div>
        <p style="margin-bottom:8px">No appointments yet</p>
        <p class="small">Book your first grooming session to get started!</p>
        <button class="btn btn-primary" style="margin-top:16px" onclick="document.querySelector('.tab-btn[data-tab=\\'booking\\']').click()">
          Book Now
        </button>
      </div>
    `;
    return;
  }
  
  // Sort by date (newest first)
  userAppts.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  
  container.innerHTML = userAppts.map(apt=>renderAppointmentCard(apt)).join('');
}

// Render single appointment card
function renderAppointmentCard(apt){
  const statusClass = 'status-' + apt.status.toLowerCase().replace(/\s/g,'-');
  const services = JSON.parse(localStorage.getItem('pg_services')||'[]');
  const svc = services.find(s=>s.id===apt.serviceId) || {price:0};
  
  // Payment info display
  let paymentInfo = apt.paymentMethod;
  if(apt.paymentDetails){
    if(apt.paymentMethod === 'GCash'){
      paymentInfo = `GCash (${apt.paymentDetails.gcashNumber})`;
    } else if(apt.paymentMethod === 'Card'){
      paymentInfo = `Card ${apt.paymentDetails.cardNumber}`;
    }
  }
  
  return `
    <div class="appointment-card">
      <div class="appointment-header">
        <div>
          <div style="font-weight:700;font-size:16px;margin-bottom:4px">${apt.serviceName}</div>
          <div class="small">Booking ID: ${apt.id}</div>
        </div>
        <span class="status-badge ${statusClass}">${apt.status}</span>
      </div>
      
      <div class="appointment-details">
        <div class="detail-item">
          <div class="detail-label">Pet</div>
          <div class="detail-value">${apt.petName} (${apt.petType})</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Date & Time</div>
          <div class="detail-value">${formatDate(apt.date)}</div>
          <div class="small">${formatTime(apt.time)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Payment</div>
          <div class="detail-value">${paymentInfo}</div>
          <div class="small">₱${svc.price}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Contact</div>
          <div class="detail-value">${apt.ownerPhone}</div>
          <div class="small">${apt.ownerEmail}</div>
        </div>
      </div>
      
      ${apt.notes ? `
        <div style="margin-top:12px;padding:10px;background:#f8f9fa;border-radius:8px">
          <div class="detail-label" style="margin-bottom:4px">Notes</div>
          <div class="small">${apt.notes}</div>
        </div>
      ` : ''}
      
      <div class="appointment-actions">
        ${apt.status === 'Pending' ? `
          <button class="btn btn-outline btn-sm" onclick="cancelAppointment('${apt.id}')">
            Cancel Booking
          </button>
        ` : ''}
        ${apt.status === 'Confirmed' ? `
          <div class="small" style="color:var(--success);margin-right:auto">
            ✓ Your appointment is confirmed! See you soon!
          </div>
        ` : ''}
        ${apt.status === 'Rejected' ? `
          <div class="small" style="color:var(--danger);margin-right:auto">
            ✕ This appointment was declined. Please book another time.
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Cancel appointment
function cancelAppointment(aptId){
  if(!confirm('Are you sure you want to cancel this appointment?')) return;
  
  const appts = JSON.parse(localStorage.getItem('pg_appointments')||'[]');
  const index = appts.findIndex(a=>a.id===aptId);
  
  if(index !== -1){
    appts.splice(index,1);
    localStorage.setItem('pg_appointments',JSON.stringify(appts));
    loadAppointments();
    alert('✓ Appointment cancelled successfully.');
  }
}

// Refresh appointments button
function attachRefreshHandler(){
  const refreshBtn = $('#refresh-appointments');
  if(refreshBtn){
    refreshBtn.addEventListener('click',()=>{
      refreshBtn.textContent = '🔄 Refreshing...';
      refreshBtn.disabled = true;
      setTimeout(()=>{
        loadAppointments();
        refreshBtn.textContent = '🔄 Refresh';
        refreshBtn.disabled = false;
      },500);
    });
  }
}

// DOM Ready
document.addEventListener('DOMContentLoaded', ()=>{
  seedServices();
  updateNavbar();
  protectBookingPage();
  populateServicesDropdown();
  populateServicesList();
  setupPaymentHandler();
  setupInputFormatters();
  attachBookingHandler();
  setupTabs();
  attachRefreshHandler();
  
  // Load appointments if on booking page
  if(window.location.pathname.endsWith('booking.html')){
    loadAppointments();
  }
});
