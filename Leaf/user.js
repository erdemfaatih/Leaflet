// user.js

document.addEventListener('DOMContentLoaded', function() {
    const userInfoContainer = document.querySelector('#user-info-container');
    const userInfoContent = document.querySelector('#user-info-content');

    const userInfoBtn = document.querySelector('.user-info-btn');
    userInfoBtn.addEventListener('click', showUserInfo);

    async function showUserInfo() {
        try {
            const response = await fetch('/get_user_info', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Body does not need to be sent for GET requests.
            });

            const data = await response.json();

            if (response.ok) {
                const user = data.user;
                userInfoContent.innerHTML = `
                    <p><strong>Kullanıcı Adı:</strong> ${user.username}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                `;
                userInfoContainer.style.display = 'block';
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error occurred:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }

    function closeUserInfo() {
        userInfoContainer.style.display = 'none';
    }
});
