// script.js - main frontend logic (site pages)
// Handles navbar update, services seed, booking access control, and modal summary.

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// Seed default services if missing
function seedServices() {
  if (!localStorage.getItem('pg_services')) {
    const services = [
      { id:'s1', name:'Basic Bath', price:250, duration:'30 mins' },
      { id:'s2', name:'Full Groom', price:700, duration:'90 mins' },
      { id:'s3', name:'Nail Trim', price:120, duration:'15 mins' },
      { id:'s4', name:'Ear Cleaning', price:100, duration:'10 mins' },
    ];
    localStorage.setItem('pg_services', JSON.stringify(services));
  }
}

// Check login status
function getCurrentUser(){
  return JSON.parse(localStorage.getItem('pg_current_user') || 'null');
}
function isLoggedIn(){ return !!getCurrentUser(); }

// Update navbar links (show login/logout)
function updateNavbar(){
  const user = getCurrentUser();
  // Find nav-links container
  const nav = document.querySelector('.nav-links');
  if(!nav) return;
  // remove dynamic area
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
  // If on booking page, redirect to login
  if(window.location.pathname.endsWith('booking.html')) window.location.href = 'login.html';
}

// Protect booking page
function protectBookingPage(){
  if(window.location.pathname.endsWith('booking.html') && !isLoggedIn()){
    // redirect to login and keep intended page
    localStorage.setItem('pg_after_login', window.location.pathname + window.location.search);
    window.location.href = 'login.html';
  }
}

// Populate services on pages
function populateServicesList(){
  const container = document.querySelector('.services-grid');
  if(!container) return;
  const services = JSON.parse(localStorage.getItem('pg_services')||'[]');
  container.innerHTML = '';
  services.forEach(s=>{
    const el = document.createElement('div');
    el.className = 'service card';
    el.innerHTML = '<div style="font-weight:700">'+s.name+'</div><div class="small">'+s.duration+'</div><div style="margin-top:12px;font-weight:700">₱'+s.price+'</div>';
    container.appendChild(el);
  });
}

// Populate services dropdown on booking page
function populateServicesDropdown(){
  const sel = document.querySelector('#service');
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

// Booking summary modal
function showSummaryModal(data){
  // create modal elements or reuse existing
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
      <div style="margin-bottom:8px"><strong>Owner:</strong> ${data.ownerName}</div>
      <div style="margin-bottom:8px"><strong>Pet:</strong> ${data.petName} (${data.petType})</div>
      <div style="margin-bottom:8px"><strong>Service:</strong> ${data.serviceName}</div>
      <div style="margin-bottom:8px"><strong>Date & Time:</strong> ${data.date} ${data.time}</div>
      <div style="margin-bottom:8px"><strong>Payment:</strong> ${data.paymentMethod}</div>
      <div style="margin-top:12px;display:flex;gap:10px;justify-content:flex-end">
        <button id="confirm-book" class="btn btn-primary">Confirm Booking</button>
        <button id="cancel-book" class="btn btn-outline">Cancel</button>
      </div>
    </div>
  `;
  backdrop.appendChild(modal);
  backdrop.classList.add('show');

  // handlers
  document.querySelector('#close-summary').addEventListener('click', ()=> backdrop.classList.remove('show'));
  document.querySelector('#cancel-book').addEventListener('click', ()=> backdrop.classList.remove('show'));
  document.querySelector('#confirm-book').addEventListener('click', ()=>{
    // save booking to localStorage
    const appts = JSON.parse(localStorage.getItem('pg_appointments')||'[]');
    appts.push({
      id: 'apt_'+Math.random().toString(36).slice(2,9),
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      petName: data.petName,
      petType: data.petType,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      date: data.date,
      time: data.time,
      paymentMethod: data.paymentMethod,
      notes: data.notes || '',
      status: 'Pending',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('pg_appointments', JSON.stringify(appts));
    localStorage.setItem('pg_last_booking', JSON.stringify({ownerName: data.ownerName, petName: data.petName, serviceName: data.serviceName, date: data.date, time: data.time}));
    // close modal and redirect
    backdrop.classList.remove('show');
    window.location.href = 'success.html';
  });
}

// Attach booking form handler
function attachBookingHandler(){
  const btn = document.querySelector('#btn-submit');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    const ownerName = document.querySelector('#ownerName').value.trim();
    const ownerEmail = document.querySelector('#ownerEmail').value.trim();
    const petName = document.querySelector('#petName').value.trim();
    const petType = document.querySelector('#petType').value;
    const serviceId = document.querySelector('#service').value;
    const date = document.querySelector('#date').value;
    const time = document.querySelector('#time').value;
    const notes = document.querySelector('#notes').value.trim();
    const payment = document.querySelector('input[name="payment"]:checked');
    if(!payment){
      alert('Please choose a payment method.');
      return;
    }
    const paymentMethod = payment.value;

    if(!ownerName || !ownerEmail || !petName || !serviceId || !date || !time){
      alert('Please fill in required fields.');
      return;
    }

    // get service name
    const services = JSON.parse(localStorage.getItem('pg_services')||'[]');
    const svc = services.find(s=>s.id===serviceId) || {name:'Service'};

    const data = { ownerName, ownerEmail, petName, petType, serviceId, serviceName: svc.name, date, time, paymentMethod, notes };
    showSummaryModal(data);
  });
}

// On DOM ready
document.addEventListener('DOMContentLoaded', ()=>{
  seedServices();
  updateNavbar();
  protectBookingPage();
  populateServicesList();
  populateServicesDropdown();
  attachBookingHandler();
});