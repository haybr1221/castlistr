import { supabase } from './supabaseclient.js';

const { data: { user } } = await supabase.auth.getUser();
console.log("Current user: ", user)

async function fetchPerformers() {
    try {
        const response = await fetch("/performer");

        if (response.ok) {
            const data = await response.json();
            const tbody = document.getElementById("performer-list");

            // Clear it if there is data there
            tbody.innerHTML = "";
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

// Open the create new show modal
document.getElementById("new-performer-button").addEventListener("click", openModal)

function openModal() {
    document.getElementById("overlay").removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    document.getElementById("add-performer").removeAttribute("hidden");
}

function closeModal() {
    document.body.style.overflow = "auto";
    document.getElementById("overlay").setAttribute("hidden", true);

    document.getElementById("add-performer").setAttribute("hidden", true);
}

// Creating a new show
const create = async (e, isMultiple) => {
    e.preventDefault();
    
    const message = document.getElementById("message");
    const firstName = document.getElementById("first-name");
    const middleName = document.getElementById("middle-name");
    const lastName = document.getElementById("last-name");

    const { data: dupData, error: dupError } = await supabase
        .from("performer")
        .select("*")
        .eq("first_name", firstName.value)
        .eq("middle_name", middleName.value)
        .eq("last_name", lastName.value)

    if (dupError) throw dupError;

    if (dupData.length > 0) {
        message.innerHTML = "This performer likely already exists in the database! If you think this is an error, please contact support.";
        return;
    }
    
    const { error } = await supabase
        .from("performer")
        .insert([
            {
                first_name: firstName.value,
                middle_name: middleName.value,
                last_name: lastName.value,
                user_id: user.id
            }
        ])
    
    if (error) throw error;

    if (isMultiple)
    {
        // Display a message so they know the last one went through
        document.getElementById("message").innerHTML = `Success! ${firstName.value ? firstName.value + ' ' : ''} ${middleName.value ? middleName.value + ' ' : ''} ${lastName.value ? lastName.value + ' ' : ''} can now be cast.`

        // Reset the form for the next
        firstName.value = "";
        middleName.value = "";
        lastName.value = "";

        return;
    }

    // Refetch performers and close the modal
    // TODO: redirect to new performer page
    fetchPerformers();
    closeModal();

    // Reset success message in case they open it again
    document.getElementById("message").innerHTML = "";
}

document.getElementById("create-btn").addEventListener("click", (e) => create(e, false));
document.getElementById("create-create-another").addEventListener("click", (e) => create(e, true))

// Handle closing modal
document.querySelectorAll(".cancel").forEach(el => {
    el.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
});