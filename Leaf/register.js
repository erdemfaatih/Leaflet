document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the default form submission

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/submit_registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, confirmPassword }),
            });
        
            if (!response.ok) {
                throw new Error('Failed to register user');
            }
        
            const result = await response.json();
            alert('User registered successfully');
            window.location.href = '/memberPage.html';
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
        
    });
});
