document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("/show");
    const data = await response.json();

    console.log(data);
    const parent = document.getElementById("show-dropdown");
    data.forEach(element => {
        const item = document.createElement("option");
        console.log(element.title);
        item.innerHTML = element.title;
        parent.appendChild(item);
    });
});