import { saveIngredient, getIngredients, onGetIngredients, deleteIngredient, getIngredient, updateIngredient } from "./firebase.js"

const listaAlertas = document.getElementById('listaAlertas')

let id = '';


//Esto se ejecuta al arrancar la pagina ¿?
window.addEventListener('DOMContentLoaded', () => {
    onGetIngredients((querySnapshot) => {
        listaAlertas.innerHTML = "";
    
        querySnapshot.forEach((doc) => {
          const ingredient = doc.data();
          console.log(parseInt(ingredient.quantity));
          console.log(parseInt(ingredient.alert));
          if(parseInt(ingredient.quantity) < parseInt(ingredient.alert)){
            listaAlertas.innerHTML += `
            <tr>
              <td>${ingredient.name}</td>
              <td>${ingredient.quantity}</td>
              <td>${ingredient.measure}</td>
              <td>${ingredient.alert}</td>
            </tr>`
          }
          
        });

    })
    
})


