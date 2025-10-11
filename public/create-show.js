import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://zanpecuhaoukjvjkvyxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnBlY3VoYW91a2p2amt2eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQ2NjcsImV4cCI6MjA3NDMzMDY2N30.vEu1tr9yYv-eAl6jB6oKHJmGVa70H-OBcTfGhfvcws0';

// Create client
const supabase = createClient(supabaseUrl, supabaseKey);

const { data: { user } } = await supabase.auth.getUser();
console.log("Current user: ", user)

function create() {
    // Create just one
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const title = document.getElementById("title-input").value;

    const { error } = await supabase
        .from("show")
        .insert([
            {
                title: title,
                user_id: user.id
            }
        ])

    if (error) throw error;

    console.log("Success!")
}

document.getElementById("create-btn").addEventListener("click", handleSubmit);
// document.getElementById("create-create-another").addEventListener("click", createMore)