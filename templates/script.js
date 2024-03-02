document.addEventListener('DOMContentLoaded', function () {
    const toggleInputs = document.querySelectorAll('.toggle-input');
    const toggleBar = document.querySelector('.toggle-bar');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const card = document.querySelector('.card');
  
    toggleInputs.forEach(input => {
      input.addEventListener('change', function () {
        const percent = this.id === 'login' ? 0 : -100;
        toggleBar.style.transform = `translateX(${percent}%)`;
        card.style.transform = `rotateY(${percent}deg)`;
        loginForm.style.display = this.id === 'login' ? 'block' : 'none';
        registerForm.style.display = this.id === 'register' ? 'block' : 'none';
      });
    });
  });
  