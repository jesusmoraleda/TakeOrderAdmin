import { onGetIngredients, onGetDrinks, updateIngredient, updateDrink } from "./firebase.js"

const listaAlertasIngredientes = document.getElementById('listaAlertasIngredientes');
const listaAlertasBebidas = document.getElementById('listaAlertasBebidas');

const listaIngredientes = document.getElementById('listaIngredientes');
const listaBebidas = document.getElementById('listaBebidas');

const btnSaveNewStockIngredients = document.getElementById('btn-save-new-stock-ingredients');
const btnSaveNewStockDrinks = document.getElementById('btn-save-new-stock-drinks');

let id = '';
let alertaIngredientes = 0;
let alertaBebidas = 0;
let isFirstLaunch = 0;


//Esto se ejecuta al arrancar la pagina ¿?
window.addEventListener('DOMContentLoaded', () => {
    onGetIngredients((querySnapshot) => {
      listaIngredientes.innerHTML = "";
      listaAlertasIngredientes.innerHTML = "";
    
      querySnapshot.forEach((doc) => {
        const ingredient = doc.data();

        if(parseFloat(ingredient.quantity) < parseFloat(ingredient.alert)){
          alertaIngredientes = 1;
          console.log(alertaIngredientes);
          listaAlertasIngredientes.innerHTML += `
          <tr>
            <td><h5 style="color: red;">${ingredient.name}</h5></td>
            <td><h5 style="color: red;">${ingredient.quantity}</h5></td>
            <td><h5 style="color: red;">${ingredient.alert}</h5></td>
          </tr>`
          listaIngredientes.innerHTML += `
          <tr>
            <td><h5 style="color: red;">${ingredient.name}</h5></td>
            <td><h5 style="color: red;">${ingredient.category}</h5></td>
            <td><h5 style="color: red;">${ingredient.quantity}</h5></td>
            <td><h5 style="color: red;">${ingredient.measure}</h5></td>
            <td><h5 style="color: red;">${ingredient.alert}</h5></td>
            <td><input type="number" class="small-input" min="0" value=0 name="cantidad" data-id="${doc.id}"></td>
          </tr>`
        }
        else{
          listaIngredientes.innerHTML += `
          <tr>
            <td><h5>${ingredient.name}</h5></td>
            <td><h5>${ingredient.category}</h5></td>
            <td><h5>${ingredient.quantity}</h5></td>
            <td><h5>${ingredient.measure}</h5></td>
            <td><h5>${ingredient.alert}</h5></td>
            <td><input type="number" class="small-input" min="0" value=0 name="cantidad" data-id="${doc.id}"></td>
          </tr>`
        }
      });
      if (isFirstLaunch < 2) {
        añadirAlertas();
        isFirstLaunch = isFirstLaunch + 1;
      }
    })

    onGetDrinks((querySnapshot) => {
      listaBebidas.innerHTML = "";
      listaAlertasBebidas.innerHTML = "";
    
        querySnapshot.forEach((doc) => {
          const bebida = doc.data();
          if(parseFloat(bebida.amount) < parseFloat(bebida.alert)){
            alertaBebidas = 1;
            listaAlertasBebidas.innerHTML += `
            <tr>
              <td><h5 style="color: red;">${bebida.name}</h5></td>
              <td><h5 style="color: red;">${bebida.amount}</h5></td>
              <td><h5 style="color: red;">${bebida.alert}</h5></td>
            </tr>`
            listaBebidas.innerHTML += `
            <tr>
              <td><h5 style="color: red;">${bebida.name}</h5></td>
              <td><h5 style="color: red;">${bebida.amount}</h5></td>
              <td><h5 style="color: red;">${bebida.alert}</h5></td>
              <td><input type="number" class="small-input" min="0" value=0 name="cantidad" data-id="${doc.id}"></td>
            </tr>`
          }
          else{
            listaBebidas.innerHTML += `
            <tr>
              <td><h5>${bebida.name}</h5></td>
              <td><h5>${bebida.amount}</h5></td>
              <td><h5>${bebida.alert}</h5></td>
              <td><input type="number" class="small-input" min="0" value=0 name="cantidad" data-id="${doc.id}"></td>
            </tr>`
          }
        });
        if (isFirstLaunch < 2) {
          añadirAlertas();
          isFirstLaunch = isFirstLaunch + 1;
        }
    })

    
})

//Guardar ingredientes
btnSaveNewStockIngredients.addEventListener("click", () => {
  // Obtener todos los campos de cantidad en la tabla
  const cantidadInputs = document.querySelectorAll("#ingredients-table input[name='cantidad']");

  // Recorrer los campos de cantidad y actualizar los valores en la base de datos
  cantidadInputs.forEach(async (input) => {
    const ingredientId = input.getAttribute("data-id");
    const newQuantity = parseFloat(input.value);
    // Obtener el valor actual de quantity desde el campo de cantidad
    const currentQuantity = parseFloat(input.parentNode.previousElementSibling.previousElementSibling.previousElementSibling.textContent);


    const updatedQuantity = currentQuantity + newQuantity;

    try{
      //Actualizar platos (checkboxes y cantidad)
      await updateIngredient(ingredientId, {
        quantity: parseFloat(updatedQuantity.toFixed(2)),
      });
    } catch(error){
      Swal.fire(
        'ACTUALIZAR STOCK',
        'Error al actualizar el stock',
        'error'
      )
    } 
  });
  Swal.fire(
    'ACTUALIZAR STOCK',
    'Stock actualizado con exito!',
    'success'
  );
});

//Guardar bebidas
btnSaveNewStockDrinks.addEventListener("click", () => {
  // Obtener todos los campos de cantidad en la tabla
  const cantidadInputs = document.querySelectorAll("#drinks-table input[name='cantidad']");

  // Recorrer los campos de cantidad y actualizar los valores en la base de datos
  cantidadInputs.forEach(async (input) => {
    const drinkId = input.getAttribute("data-id");
    const newQuantity = parseFloat(input.value);
    // Obtener el valor actual de quantity desde el campo de cantidad
    const currentQuantity = parseFloat(input.parentNode.previousElementSibling.previousElementSibling.textContent);

    const updatedQuantity = currentQuantity + newQuantity;

    try{
      //Actualizar platos (checkboxes y cantidad)
      await updateDrink(drinkId, {
        amount: parseFloat(updatedQuantity.toFixed(2)),
      });
    } catch(error){
      Swal.fire(
        'ACTUALIZAR STOCK',
        'Error al actualizar el stock',
        'error'
      )
    } 
  });
  Swal.fire(
    'ACTUALIZAR STOCK',
    'Stock actualizado con exito!',
    'success'
  );
});

function añadirAlertas(){

  if(alertaIngredientes > 0 || alertaBebidas > 0){
    Swal.fire({
      title: 'Hay ingredientes y/o bebidas en alerta',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    })
  }
  else{
    Swal.fire({
      title: 'No hay ingredientes ni bebidas en alerta',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    })
  }
}
