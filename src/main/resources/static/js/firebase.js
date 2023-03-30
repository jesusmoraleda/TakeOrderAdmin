// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8ysZz1QATfHliikZ_l6L67GAve1dVmtI",
  authDomain: "takeorderfirebase.firebaseapp.com",
  databaseURL: "https://takeorderfirebase-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "takeorderfirebase",
  storageBucket: "takeorderfirebase.appspot.com",
  messagingSenderId: "684239127229",
  appId: "1:684239127229:web:1fc520716fb87381c26dd4",
  measurementId: "G-5M6Y4TF9CD"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

export const db = getFirestore();

//Ingredients
export const saveIngredient = (name, quantity, measure, grams, alert, category) =>
  addDoc(collection(db, "ingredients"), { name, quantity, measure, grams, alert, category});

export const getIngredients = () => getDocs(collection(db, 'ingredients'))

export const onGetIngredients = (callback) => 
  onSnapshot(collection(db, "ingredients"), callback);

export const deleteIngredient = (id) => 
  deleteDoc(doc(db, "ingredients", id));

export const getIngredient = id => getDoc(doc(db, "ingredients", id));

export const updateIngredient = (id, newFields) =>
  updateDoc(doc(db, "ingredients", id), newFields);


//Plates
export const savePlate = (name, available, ingredients) => {
  const ingredientsData = ingredients.map(ingredient => ({
    name: ingredient.name,
    quantity: ingredient.quantity
  }));
  addDoc(collection(db, "plates"), { name, available, ingredients: ingredientsData});
}

export const getPlates = () => getDocs(collection(db, 'plates'))

export const onGetPlates = (callback) => 
  onSnapshot(collection(db, "plates"), callback);

export const deletePlate = (id) => 
  deleteDoc(doc(db, "plates", id));

export const getPlate = id => getDoc(doc(db, "plates", id));

export const updatePlate = (id, newFields) =>
  updateDoc(doc(db, "plates", id), newFields);