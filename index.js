const toggler = document.querySelector(".toggler");
const navMenu = document.querySelector("#navMenu");

toggler.addEventListener('click', function () {
    navMenu.classList.toggle("active")
});

const scroll = document.getElementById("scroll");

scroll.addEventListener('click', () => {
    document.querySelector(".get-started").scrollIntoView({ behavior: 'smooth' });
})

// Selecciona el corazón y el contador de likes por sus IDs
const likeHeart = document.getElementById("likeHeart");
const likesCounter = document.getElementById("likesCounter");

// Añade un evento de clic al corazón
likeHeart.addEventListener("click", function() {
  // Incrementa el contador de likes
  let currentLikes = parseInt(likesCounter.innerText);
  likesCounter.innerText = currentLikes + 1;
});
