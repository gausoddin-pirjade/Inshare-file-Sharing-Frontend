const dropZone = document.querySelector('.drop-zone');
const browseBtn = document.querySelector('.browse-btn');
const fileInput = document.querySelector('#file-input');
const bgProgress = document.querySelector('.bg-progress');
const copyBtn = document.querySelector('#copy-btn');
const percentSpan = document.querySelector('#percent');
const progressContainer = document.querySelector('.progress-container');
const sharingContainer = document.querySelector('.sharing-container');
const emailForm = document.querySelector('#email-form');
const toast = document.querySelector('.toast');

const fileURLInput = document.querySelector('#fileURL');
const host = 'https://in-share-file-sharing.onrender.com'
const uploadURL = `${host}/api/files`; //from backend
const emailURL = `${host}/api/files/send`; //from backend

const maxAllowedSize = 100 * 1024 * 1024;  //100MB

dropZone.addEventListener("dragover", (e)=>{
    e.preventDefault();
    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
    }
});           //source----------mdn drag events

dropZone.addEventListener('dragleave', ()=>{
    dropZone.classList.remove('dragged');
})

dropZone.addEventListener('drop', (e)=>{
    e.preventDefault();
    dropZone.classList.remove('dragged');
    const files = e.dataTransfer.files;
    console.log('files', files)
    if(files.length){
        fileInput.files = files 
    }
    uploadFile();
})

fileInput.addEventListener("change", (e)=>{
    uploadFile();
})

browseBtn.addEventListener('click', (e) =>{
    fileInput.click();
})

copyBtn.addEventListener('click', ()=>{
    fileURLInput.select();
    document.execCommand('copy');
    showToast("Link Copied")
})


let url;

const uploadFile = () => {
    const file = fileInput.files[0];

    if (!file) {
        showToast("No file selected");
        return;
    }

    // File size validation
    if (file.size > maxAllowedSize) {
        showToast("Can't upload more than 100MB");
        resetFileInput();
        return;
    }

    // Show progress container
    progressContainer.style.display = 'block';

    const formData = new FormData();
    formData.append('myfile', file);

    // Use fetch to upload the file
    fetch(uploadURL, {
        method: 'POST',
        body: formData,
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Failed to upload file');
        }
        return response.json(); // Assuming the server returns JSON with file URL
    })
    .then((data) => {
        const {file:url1}  = data; // Get the file URL from the response
        url = url1;
        onUploadSuccess(url); // Call the success handler with the valid URL
    })
    .catch((error) => {
        showToast(`Error: ${error.message}`);
        resetFileInput();
    });
};

const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    percentSpan.innerText = `${percent}%`;
    bgProgress.style.width = `${percent}%`;
};

const onUploadSuccess = (url) => {
    console.log("File uploaded successfully:", url);

    // Hide the progress container and reset the progress bar
    resetFileInput();
    progressContainer.style.display = 'none';
    // bgProgress.style.width = '0%';
    
    // Show the valid URL in the input field
    fileURLInput.value = url;

    // Show the sharing container with the link
    sharingContainer.style.display = 'block';
    // sharingContainer.style.opacity = '1';
};

const resetFileInput = () => {
    fileInput.value = ''; // Reset the file input
    percentSpan.innerText = ''; // Reset the progress text
    progressContainer.style.display = 'none'; // Hide the progress bar
    bgProgress.style.width = '0%'; // Reset the progress bar width
    sharingContainer.style.display = 'none'; // Hide the sharing container
};


emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = emailForm.querySelector("button[type=submit]");
    submitBtn.setAttribute("disabled", true);
    submitBtn.innerText = "Sending";
    
    const url = fileURLInput.value;
    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    };
    
    fetch(emailURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then((data) => {
        console.log(data);
        if (data.success) {
            sharingContainer.style.display = "none";
            showToast("Email Sent");
        } else {
            throw new Error("Email send failed");
        }
    })
    .catch(error => {
        console.error("Error sending email:", error.message);
        showToast("Error sending email");
    });
});


const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = " translate(-50%,0)";
    let toastTimer;
    clearTimeout(toastTimer);
    toastTimer  = setTimeout(() =>{
        toast.style.transform = " translate(-50%,100px)";
    }, 3000)
}

// const resetFileInput = () => {
//     fileInput.value = '';
// }
