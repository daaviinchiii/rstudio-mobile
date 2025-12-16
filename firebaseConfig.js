
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase config - projeto restaurante
const firebaseConfig = {
  apiKey: "AIzaSyBUgi4b5PPsKPZR0DNIJ0Kb4vy6YLnQtDo",
  authDomain: "restaurante-77a63.firebaseapp.com",
  databaseURL: "https://restaurante-77a63-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "restaurante-77a63",
  storageBucket: "restaurante-77a63.appspot.com",
  messagingSenderId: "1037928877356",
  appId: "1:1037928877356:web:22711758beddae4e9bb089",
  measurementId: "G-DZ2G0L7HWT"
};

console.log("Firebase config loaded:", firebaseConfig);

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export const uploadImage = async (uri) => {
  try {
    console.log("Starting upload for URI:", uri);
    console.log("Storage bucket:", firebaseConfig.storageBucket);
    
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        console.log("Blob created, size:", xhr.response.size);
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log("XHR error:", e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const filename = "uploads/" + new Date().getTime() + ".jpg";
    const storageRef = ref(storage, filename);
    
    console.log("Uploading to:", filename);
    const result = await uploadBytes(storageRef, blob);
    console.log("Upload successful:", result.metadata.fullPath);
    
    // We're done with the blob, close it
    if (blob.close) blob.close();

    const downloadURL = await getDownloadURL(storageRef);
    console.log("Download URL:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Upload error details:", {
      code: error.code,
      message: error.message,
      serverResponse: error.serverResponse,
      customData: error.customData
    });
    throw error;
  }
};
