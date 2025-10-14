import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://zanpecuhaoukjvjkvyxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnBlY3VoYW91a2p2amt2eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQ2NjcsImV4cCI6MjA3NDMzMDY2N30.vEu1tr9yYv-eAl6jB6oKHJmGVa70H-OBcTfGhfvcws0';

// Create client
const supabase = createClient(supabaseUrl, supabaseKey);

const { data: { user } } = await supabase.auth.getUser();
console.log("Current user: ", user)

const create = async (e) => {
    // Create just one
    e.preventDefault();
    
    const firstName = document.getElementById("first-name").value;
    const middleName = document.getElementById("middle-name").value;
    const lastName = document.getElementById("last-name").value;
    
    const { error } = await supabase
        .from("performer")
        .insert([
            {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                user_id: user.id
            }
        ])
    
    if (error) throw error;

    // Send them home
    window.location.href = "./home.html";
}

const createMore = async (e) => {
    // Create one and then submit
    e.preventDefault();
    
    const firstName = document.getElementById("first-name");
    const middleName = document.getElementById("middle-name");
    const lastName = document.getElementById("last-name");
    
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

    // Display a message so they know the last one went through
    document.getElementById("success-message").innerHTML = `Success! ${firstName.value ? firstName.value + ' ' : ''} ${middleName.value ? middleName.value + ' ' : ''} ${lastName.value ? lastName.value + ' ' : ''} can now be cast.`

    // Reset the form for the next
    firstName.value = "";
    middleName.value = "";
    lastName.value = "";
}

document.getElementById("create-btn").addEventListener("click", create);
document.getElementById("create-create-another").addEventListener("click", createMore)