const currentLocation = location.href;
const a = document.querySelectorAll('nav .ul-main ul li a');
const li = document.querySelectorAll('nav .ul-main ul li');
const a_length = a.length;

for(let i = 0; i < a_length; i++){
if(a[i].href === currentLocation){
    li[i].className = "active";
}
}

var lastScrollTop = 0;
var nav = document.querySelector("nav");

window.addEventListener("scroll", function(){
    
    var scrollUp = window.pageYOffset || document.documentElement.scrollUp;
    if(scrollUp > lastScrollTop){
        nav.style.top = "-80px";
    }else{
        nav.style.top = "0";
        nav.classList.add("show");
    }
    lastScrollTop = scrollUp;

    if(lastScrollTop == null){
        nav.classList.remove("show");
    }
})

var toggle = document.querySelector("header nav .ul-res .toggle-btn");
var header_reslinks = document.querySelector("header .res-links");

toggle.addEventListener("click", function(){
console.log("Rojhon");
header_reslinks.classList.toggle("active");
});

