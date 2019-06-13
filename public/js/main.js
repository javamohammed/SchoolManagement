var toggleButton = document.querySelector(".menu--button");
var mobileNav = document.querySelector(".menu--list--mobile");
var is_open = 0;
toggleButton.addEventListener("click", function () {
    if(is_open == 0 ){
        mobileNav.classList.add("open");
        is_open = 1;
    }else{
         mobileNav.classList.remove("open");
        is_open = 0;
    }
});