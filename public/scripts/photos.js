const addPhotoButton = document.getElementById('addPhoto');
const photoModal = document.getElementById('photoModal');
const closeModalButton = document.getElementById('closeModal');
const uploadButton = document.getElementById('uploadBtn');
const photoInput = document.getElementById('photoInput');
const photoDescription = document.getElementById('photoDescription');
const postsContainer = document.getElementById('postSection');

// Open Modal
addPhotoButton.addEventListener('click', () => {
    photoModal.style.display = 'flex';
});

// Close Modal
closeModalButton.addEventListener('click', resetModal);

// Upload Photo
uploadButton.addEventListener('click', () => {
    if (!photoInput.files.length || !photoDescription.value.trim()) {
        alert('Please provide a photo and description.');
        return;
    }

    const file = photoInput.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const post = {
            image: e.target.result,
            description: photoDescription.value.trim(),
        };

        createPost(post);
        resetModal();
    };

    reader.readAsDataURL(file);
});

// Reset Modal
function resetModal() {
    photoModal.style.display = 'none';
    photoInput.value = '';
    photoDescription.value = '';
}

// Create Post
function createPost(post) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    const imgElement = document.createElement('img');
    imgElement.src = post.image;

    const descElement = document.createElement('p');
    descElement.textContent = post.description;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', () => postElement.remove());

    postElement.appendChild(imgElement);
    postElement.appendChild(descElement);
    postElement.appendChild(deleteButton);

    postsContainer.appendChild(postElement);
}


