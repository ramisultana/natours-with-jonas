/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './leaflet';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
const mapSection = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (mapSection) {
  const locations = JSON.parse(mapSection.dataset.location);

  displayMap(locations);
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (logOutBtn) logOutBtn.addEventListener('click', logout);
if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    //console.log(form);
    updateSettings(form, 'data');
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // updateSettings({ name, email }, 'data');
  });
}
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').innerHTML = 'Updateing...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    // here we use await just to wait it finish so we can use the lines under it , cuz updateSetting is async fun and it return a promise that we can await inside async fun (e)
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').innerHTML = 'Save Password';
    document.getElementById('password-current').value =
      document.getElementById('password').value =
      document.getElementById('password-confirm').value =
        '';
  });
}
if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'processing....';
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
