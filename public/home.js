import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://zanpecuhaoukjvjkvyxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnBlY3VoYW91a2p2amt2eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQ2NjcsImV4cCI6MjA3NDMzMDY2N30.vEu1tr9yYv-eAl6jB6oKHJmGVa70H-OBcTfGhfvcws0';

const supabase = createClient(supabaseUrl, supabaseKey);

const { data: { user } } = await supabase.auth.getUser();
console.log("User recognized:", user);

async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error(error);
    }
}

document.getElementById("sign-out").addEventListener("click", signOut);