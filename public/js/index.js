/* eslint-disable */
import '@babel/polyfill';
import { login, logout, signUp } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './bookTour';

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const userImgEl = document.querySelector('.form__user-photo');
const userImgInputEl = document.querySelector('#photo');
const signUpForm = document.querySelector('.form--signup');

if (signUpForm)
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    console.log(name, email, password, passwordConfirm);
    signUp(name, email, password, passwordConfirm);
  });

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const oldPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { oldPassword, password, passwordConfirm },
      'password',
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn) {
  const tourId = bookBtn.getAttribute('data-tour-id');
  const tourPrice = bookBtn.getAttribute('data-tour-price');
  bookBtn.addEventListener('click', (e) => {
    bookTour(tourId, tourPrice); // You can now use the price here
  });
}

// MAKE PROFILE PHOTO UPDATE AUTOMATICALLY WHEN UPLOADING IT

if (userImgInputEl) {
  const handleDisplayUserPhoto = (e) => {
    const imgFile = e.target.files?.[0];

    if (!imgFile?.type.startsWith('image/')) return;
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      userImgEl.setAttribute('src', reader.result);
    });

    reader.readAsDataURL(imgFile);
  };

  userImgInputEl.addEventListener('change', handleDisplayUserPhoto);
}
