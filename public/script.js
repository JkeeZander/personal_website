const menu = document.querySelector(".navbar__mobilemenu");
const menuLinks = document.querySelector(".navbar__menu");

const menuToggling = () => {
  menu.classList.toggle("is-active");
  menuLinks.classList.toggle("active");
};
menu.addEventListener("click", menuToggling);
