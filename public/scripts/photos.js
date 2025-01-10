// Get elements from the DOM
const addPhotoButton = document.getElementById('addPhoto');
const photoModal = document.getElementById('photoModal');
const closeModalButton = document.getElementById('closeModal');
const uploadButton = document.getElementById('uploadBtn');
const photoInput = document.getElementById('photoInput');
const photoDescription = document.getElementById('photoDescription');
const postsContainer = document.getElementById('postSection');

// Open Modal when the 'Add Photo' button is clicked
addPhotoButton.addEventListener('click', () => {
    photoModal.style.display = 'flex'; // Show the photo modal
});

// Close Modal when the 'Close' button is clicked
closeModalButton.addEventListener('click', resetModal);

// Upload Photo and log to console
uploadButton.addEventListener('click', () => {
    // Validate that both a photo and description are provided
    if (!photoInput.files.length || !photoDescription.value.trim()) {
        alert('Please provide a photo and description.'); // Show alert if validation fails
        return;
    }

    const file = photoInput.files[0]; // Get the selected file
    const reader = new FileReader();

    // On file read, create a post and log the data to the console
    reader.onload = (e) => {
        const post = {
            image: e.target.result, // The image data URL
            description: photoDescription.value.trim(), // The description
            time: new Date().toLocaleString(), // Current timestamp
        };

        // Log the photo data to the console (this will be visible in the browser's Developer Tools Console)
        console.log('Photo Data:', post);

        // Create a post element on the frontend (UI) with the uploaded data
        createPost(post);

        // Reset the modal (clear the input fields)
        resetModal();
    };

    // Read the photo file as a Data URL (to display it as an image)
    reader.readAsDataURL(file);
});

// Helper Function to Reset Modal
function resetModal() {
    photoModal.style.display = 'none'; // Hide the modal
    photoInput.value = ''; // Clear the photo input
    photoDescription.value = ''; // Clear the description input
}

// Helper Function to Create Post in the Frontend (UI)
function createPost(post) {
    const postElement = document.createElement('div'); // Create a new div for the post
    postElement.classList.add('post'); // Add the 'post' class for styling

    const imgElement = document.createElement('img'); // Create an image element
    imgElement.src = post.image; // Set the image source to the data URL

    const descElement = document.createElement('p'); // Create a paragraph element for the description
    descElement.textContent = post.description; // Set the description text

    const timeElement = document.createElement('small'); // Create a small element for the timestamp
    timeElement.textContent = `Uploaded at: ${post.time}`; // Set the timestamp text

    const deleteButton = document.createElement('button'); // Create a delete button
    deleteButton.textContent = 'Delete'; // Set the button text
    deleteButton.classList.add('delete-btn'); // Add a class for styling
    deleteButton.addEventListener('click', () => postElement.remove()); // Add click event to delete the post

    // Append the image, description, timestamp, and delete button to the post element
    postElement.appendChild(imgElement);
    postElement.appendChild(descElement);
    postElement.appendChild(timeElement);
    postElement.appendChild(deleteButton);

    // Append the post element to the posts container (frontend)
    postsContainer.appendChild(postElement);
}


