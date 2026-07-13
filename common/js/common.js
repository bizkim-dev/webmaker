const menuButton = document.getElementById("menuButton");
const navigation = document.getElementById("navigation");
const topButton = document.getElementById("topButton");

if (menuButton && navigation) {
    const navigationLinks = navigation.querySelectorAll("a");

    menuButton.addEventListener("click", function () {
        navigation.classList.toggle("open");
        document.body.classList.toggle("menu-open");
    });

    navigationLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            navigation.classList.remove("open");
            document.body.classList.remove("menu-open");
        });
    });
}

if (topButton) {
    window.addEventListener("scroll", function () {
        if (window.scrollY > 500) {
            topButton.classList.add("show");
        } else {
            topButton.classList.remove("show");
        }
    });

    topButton.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}
