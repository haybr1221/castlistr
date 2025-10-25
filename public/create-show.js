import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://zanpecuhaoukjvjkvyxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnBlY3VoYW91a2p2amt2eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQ2NjcsImV4cCI6MjA3NDMzMDY2N30.vEu1tr9yYv-eAl6jB6oKHJmGVa70H-OBcTfGhfvcws0';

// Create client
const supabase = createClient(supabaseUrl, supabaseKey);

const { data: { user } } = await supabase.auth.getUser();
console.log("Current user: ", user)

const create = async (e, isMultiple) => {
    e.preventDefault();
    const title = document.getElementById("title-input");

    const { data, error } = await supabase
        .from("show")
        .insert([
            {
                title: title.value,
                user_id: user.id
            }
        ]).select()
    
    if (error) throw error;

    if (isMultiple)
    {
        // Display a message so they know the last one went through
        document.getElementById("success-message").innerHTML = `Success! ${title.value} can now have lists.`

        // Reset the form for the next
        title.value = "";
    }

    console.log(data);
    const showId = data[0].id;

    console.log(showId)

    // Send them to the newly created show page
    window.location.href = `./show.html?id=${showId}`;
}


document.getElementById("create-btn").addEventListener("click", (e) => create(e, false));
document.getElementById("create-create-another").addEventListener("click", (e) => create(e, true))