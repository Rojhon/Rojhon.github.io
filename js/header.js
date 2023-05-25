console.log("Header")
// const homeLink = document.querySelector("#home-link");
// const servicesLink = document.querySelector("#services-link");

// const links = document.querySelectorAll(".link");

// links.forEach((link) => {
//     link.addEventListener("click", (event) => {
//         event.preventDefault();

//         const clickedLinkId = event.target.id;
//         const currentLink = document.querySelector(`#${clickedLinkId}`)

//         const nextState = { additionalInformation: 'Updated the URL with JS' };
//         const nextURL = `file:///C:/Users/Rojhon/Desktop/App/js/test1/${currentLink.name}.html`;
//         window.history.pushState(nextState, currentLink.name, nextURL);
//     });
// });

// homeLink.addEventListener("click", (event) => {
//     event.preventDefault();

//     const nextState = { additionalInformation: 'Updated the URL with JS' };
//     const nextURL = `file:///C:/Users/Rojhon/Desktop/App/js/test1/index.html`;
//     window.history.pushState(nextState, "Home", nextURL);
// });

// servicesLink.addEventListener("click", (event) => {
//     event.preventDefault();

//     const nextState = { additionalInformation: 'Updated the URL with JS' };
//     const nextURL = `file:///C:/Users/Rojhon/Desktop/App/js/test1/services.html`;
//     window.history.pushState(nextState, "Services", nextURL);
// });