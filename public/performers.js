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
                const { first_name, middle_name, last_name } = element;
                const row = document.createElement("tr");
                const full_name = `${first_name} ${middle_name ? middle_name + ' ' : ''}${last_name}`;
                row.innerHTML = `
                    <td>${element.id}</td>
                    <td>${full_name}</td>
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