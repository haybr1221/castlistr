console.log("performers.js");
async function fetchPerformers() {
    console.log("fetching")
    try {
        console.log("trying");
        const response = await fetch("/performer");
    

        if (response.ok) {
            const data = await response.json();
            console.log("Fetched performers:", data);
            const tbody = document.getElementById("performer-list");
            data.forEach(element => {
                console.log("Element:", element);
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${element.id}</td>
                    <td>${element.first_name}</td>
                `;
                tbody.appendChild(row);
            });
        }


    }
    catch (err) {
        console.error("Error fetching performers:", err);
    }
}

fetchPerformers();