


const addPhotoButton = document.getElementById('addPhoto');
const photoModal = document.getElementById('photoModal');
const uploadButton = document.getElementById('uploadBtn');
const photoInput = document.getElementById('photoInput');
const photoDescription = document.getElementById('photoDescription');
const postsContainer = document.getElementById('postSection');
const closeModal = document.getElementById('closeModal'); // X button to close modal

// Open modal
addPhotoButton.addEventListener('click', () => {
    photoModal.style.display = 'block'; // Show the photo modal
});

// Close modal
closeModal.addEventListener('click', () => {
    photoModal.style.display = 'none'; // Hide the photo modal
});

// Upload photo
uploadButton.addEventListener('click', () => {
    const file = photoInput.files[0];
    const description = photoDescription.value.trim();
    const time = new Date().toISOString();

    if (!file || !description) {
        alert('Please provide a photo and description.');
        return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('description', description);
    formData.append('time', time);

    fetch('/api/upload', {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                console.error(data.error);
                return;
            }

            // Create UI element for the uploaded photo
            createPost(data.post);
        })
        .catch((error) => console.error('Error uploading photo:', error));
});

// Create a post element in the UI
function createPost(post) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    const imgElement = document.createElement('img');
    imgElement.src = post.image; // Use file path from the backend
    imgElement.alt = 'Uploaded Photo';

    const descElement = document.createElement('p');
    descElement.textContent = post.comment;

    const timeElement = document.createElement('small');
    timeElement.textContent = `Uploaded at: ${new Date(post.createdAt).toLocaleString()}`;

    postElement.appendChild(imgElement);
    postElement.appendChild(descElement);
    postElement.appendChild(timeElement);

    postsContainer.appendChild(postElement);
}
