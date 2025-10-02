document.addEventListener("click", (e) => {
    const {target} = e;

    if (!target.matches("nav a")) {
        return;
    }

    e.preventDefault();

    urlRoute();
})

const urlRoutes = {
    404: {
        templates: "/templates/404.html",
        title: "404 | Page Not Found",
        description: "Page Not Found"
    }
    
}

const urlRoute = (event) => {
    event = event || window.event;
    event.preventDefault();

    window.history.pushState({}, "", event.target.href);

    urlLocationHandler();
};

const urlLocationHandler = async () => {
    
};