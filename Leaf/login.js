document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('#login-form');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Successful login, redirect to memberPage.html
                window.location.href = '/memberPage.html';
            } else {
                // Display error message
                alert(data.error);
            }
        } catch (error) {
            console.error('Error occurred:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    });
});
