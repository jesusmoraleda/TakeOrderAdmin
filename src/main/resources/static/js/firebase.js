// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
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
export const saveIngredient = (name,category,quantity,measure,alert) =>
  addDoc(collection(db, "ingredients"), { name,category,quantity,measure,alert});

export const onGetIngredients = (callback) => 
onSnapshot(query(collection(db, "ingredients"), orderBy("name")), callback);

export const deleteIngredient = (id) => 
  deleteDoc(doc(db, "ingredients", id));

export const getIngredient = id => getDoc(doc(db, "ingredients", id));

export const updateIngredient = (id, newFields) =>
  updateDoc(doc(db, "ingredients", id), newFields);

export const onGetIngredientsCategories = (callback) => 
  onSnapshot(query(collection(db, "ingredient_categories"), orderBy("name")), callback);

export const onGetIngredientsMeasures = (callback) => 
onSnapshot(query(collection(db, "ingredient_measures"), orderBy("name")), callback);

//Drinks
export const saveDrink = (name,amount,alert) =>
  addDoc(collection(db, "all_drinks"), { name,amount,alert});

export const onGetDrinks = (callback) => 
onSnapshot(query(collection(db, "all_drinks"), orderBy("name")), callback);

export const deleteDrink = (id) => 
  deleteDoc(doc(db, "all_drinks", id));

export const getDrink = id => getDoc(doc(db, "all_drinks", id));

export const updateDrink = (id, newFields) =>
  updateDoc(doc(db, "all_drinks", id), newFields);

//Plates
export const savePlate = (name, category, ingredients, in_menu, quantity_menu) => {
  const ingredientsData = ingredients.map(ingredient => ({
    name: ingredient.name,
    quantity: ingredient.quantity,
  }));
  addDoc(collection(db, "plates"), { name, category, ingredients: ingredientsData, in_menu, quantity_menu});
}

export const onGetPlates = (callback) => 
onSnapshot(query(collection(db, "plates"), orderBy("name")), callback);

export const onGetPlatesByCategory = (category, callback) =>
  onSnapshot(query(collection(db, "plates"), where("category", "==", category)), callback);

export const deletePlate = (id) => 
  deleteDoc(doc(db, "plates", id));

export const getPlate = id => getDoc(doc(db, "plates", id));

export const updatePlate = (id, newFields) =>
  updateDoc(doc(db, "plates", id), newFields);

export const onGetPlatesCategories = (callback) => 
  onSnapshot(query(collection(db, "plates_categories"), orderBy("name")), callback);