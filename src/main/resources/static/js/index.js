import { onGetIngredients, onGetDrinks } from "./firebase.js"

const listaAlertasIngredientes = document.getElementById('listaAlertasIngredientes');
const listaAlertasBebidas = document.getElementById('listaAlertasBebidas');

let id = '';


//Esto se ejecuta al arrancar la pagina ¿?
window.addEventListener('DOMContentLoaded', () => {
    onGetIngredients((querySnapshot) => {
      listaAlertasIngredientes.innerHTML = "";
    
        querySnapshot.forEach((doc) => {
          const ingredient = doc.data();
          if(parseInt(ingredient.quantity) < parseInt(ingredient.alert)){
            listaAlertasIngredientes.innerHTML += `
            <tr>
              <td><h5 style="color: red;">${ingredient.name}</h5></td>
              <td><h5 style="color: red;">${ingredient.quantity}</h5></td>
              <td><h5 style="color: red;">${ingredient.alert}</h5></td>
            </tr>`
          }
          
        });

    })

    onGetDrinks((querySnapshot) => {
      listaAlertasBebidas.innerHTML = "";
    
        querySnapshot.forEach((doc) => {
          const bebida = doc.data();
          if(parseInt(bebida.amount) < parseInt(bebida.alert)){
            listaAlertasBebidas.innerHTML += `
            <tr>
              <td><h5 style="color: red;">${bebida.name}</h5></td>
              <td><h5 style="color: red;">${bebida.amount}</h5></td>
              <td><h5 style="color: red;">${bebida.alert}</h5></td>
            </tr>`
          }
          
        });

    })
    
})


