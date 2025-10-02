async function fetchShows() {
    try {
        const response = await fetch("/show");

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            const tbody = document.getElementById("show-list");
            data.forEach(element => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${element.id}</td>
                    <td>${element.title}</td>
                `;
                tbody.appendChild(row);
            });
        }


    }
    catch (err) {
        console.error("Error fetching shows:", err);
    }
}

function router() {
    const path = window.location.pathname;
    
}

fetchShows();