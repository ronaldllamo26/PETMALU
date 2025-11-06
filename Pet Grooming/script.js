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
  let backdrop = document.querySelector('.modal-backdrop');
  if(!backdrop){
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
  }
  backdrop.innerHTML = '';
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-weight:700">Confirm Booking</div>
        <div class="small">Review your booking details before confirming</div>
      </div>
      <button id="close-summary" class="btn btn-outline">Close</button>
    </div>
    <hr style="margin:12px 0;border:none;border-top:1px solid #f1f5f6"/>
    <div>
      <div><strong>Owner:</strong> ${data.ownerName}</div>
      <div><strong>Pet:</strong> ${data.petName} (${data.petType})</div>
      <div><strong>Service:</strong> ${data.serviceName}</div>
      <div><strong>Date & Time:</strong> ${data.date} ${data.time}</div>
      <div><strong>Payment:</strong> ${data.paymentMethod}</div>
      <div style="margin-top:12px;display:flex;gap:10px;justify-content:flex-end">
        <button id="confirm-book" class="btn btn-primary">Confirm Booking</button>
        <button id="cancel-book" class="btn btn-outline">Cancel</button>
      </div>
    </div>
  `;
  backdrop.appendChild(modal);
  backdrop.classList.add('show');

  $('#close-summary').onclick = () => backdrop.classList.remove('show');
  $('#cancel-book').onclick = () => backdrop.classList.remove('show');
  $('#confirm-book').onclick = () => {
    const appts = JSON.parse(localStorage.getItem('pg_appointments')||'[]');
    const booking = { 
      ...data, 
      id:'apt_'+Math.random().toString(36).slice(2,9), 
      status:'Pending', 
      createdAt:new Date().toISOString() 
    };
    appts.push(booking);
    localStorage.setItem('pg_appointments', JSON.stringify(appts));
    localStorage.setItem('pg_last_booking', JSON.stringify(booking));

    // Show success before redirect
    backdrop.innerHTML = `
      <div class="modal" style="text-align:center;padding:30px">
        <h2 style="color:#28a745;margin-bottom:10px;">🎉 Booking Successful!</h2>
        <p>Your appointment has been saved successfully.</p>
        <p class="small">Redirecting to confirmation page...</p>
      </div>
    `;
    setTimeout(() => {
      window.location.href = 'success.html';
    }, 2000);
  };
}

// Booking form handler
function attachBookingHandler(){
  const btn = $('#btn-submit');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    const ownerName = $('#ownerName').value.trim();
    const ownerEmail = $('#ownerEmail').value.trim();
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

    if(!ownerName || !ownerEmail || !petName || !serviceId || !date || !time){
      alert('⚠️ Please fill in all required fields.');
      return;
    }

    if (!validateBookingDateTime(date, time)) return;

    const services = JSON.parse(localStorage.getItem('pg_services')||'[]');
    const svc = services.find(s=>s.id===serviceId) || {name:'Service'};

    const data = { 
      ownerName, 
      ownerEmail, 
      petName, 
      petType, 
      serviceId, 
      serviceName:svc.name, 
      date, 
      time, 
      paymentMethod:payment.value, 
      notes 
    };
    showSummaryModal(data);
  });
}

// DOM Ready
document.addEventListener('DOMContentLoaded', ()=>{
  seedServices();
  updateNavbar();
  protectBookingPage();
  populateServicesDropdown();
  populateServicesList(); // ✅ Add this back to show services on services.html
  attachBookingHandler();
});
