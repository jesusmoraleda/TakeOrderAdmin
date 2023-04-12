import { getPlates, onGetPlates, deletePlate, getPlate, updatePlate, onGetIngredients, onGetPlatesCategories, savePlate } from "./firebase.js"

// Modal añadir plato

//Boton añadir plato
const addPlateBtn = document.querySelector("#btn-add-new-plate");
// Botón "Añadir ingrediente"
const addIngredientBtn = document.querySelector("#add-ingredient");

// Lista de ingredientes
const ingredientList = document.querySelector("#ingredient-list");

//Boton guardar plato
const btnSaveNewPlate = document.querySelector("#btn-save-new-plate");

const checkbox = document.getElementById('plateavailable');
const listaPlatos = document.getElementById('listaPlatos')

const options = [];
const measures = [];
const categories = [];


//Esto se ejecuta al arrancar la pagina
window.addEventListener('DOMContentLoaded', async () => {

  onGetIngredients((querySnapshot) => {
    let i = 1;
    querySnapshot.forEach((doc) => {
      const ingredient = doc.data();
      options.push({ value: i, text: ingredient.name, measure: ingredient.measure});
      i++;
    });
  })

  onGetPlatesCategories((querySnapshot) => {
    añadirPlatesCategories(querySnapshot);
  })

  

  onGetPlates((querySnapshot) => {
    listaPlatos.innerHTML = "";
  
      querySnapshot.forEach((doc) => {

        const plate = doc.data();
        
        let ingredientesHtml = "";
        for (let i = 0; i < plate.ingredients.length; i++) {
          const ingrediente = plate.ingredients[i].name;
          const cantidad = plate.ingredients[i].quantity;
          const option = options.find(option => option.text === ingrediente);
          const measure = option ? option.measure : "";
          ingredientesHtml += `<li>${ingrediente} - ${cantidad} ${measure}</li>`;
        }

        listaPlatos.innerHTML += `
        <tr>
          <td>
            <div class="plato">
              <h5>${plate.name}</h5>
            </div>
          </td>
          <td>
            <div class="plato">
              <h7>${"Primer plato"}</h7>
            </div>
          </td>
          <td>
            <button class="btn btn-info mostrar-ingredientes">${"Ingredientes"}</button>
            <div class="ingredientes oculto">
              <ul>
              ${ingredientesHtml}
              </ul>
            </div>
            <td><button class="btn btn-edit" data-bs-toggle="modal" data-bs-target="#editarModal"><i class="fa-solid fa-pencil btneditar" data-id="${doc.id}"></i></button></td>
            <td><button class="btn btn-delete" data-bs-toggle="modal" data-bs-target="#eliminarModal"><i class="fa-solid fa-trash btntrash" data-id="${doc.id}"></i></button></td>
          </td>
        </tr>`
      });

      // Ordenar la tabla por nombre por defecto
      sortTable(0);

      const botonesIngredientes = document.querySelectorAll(".mostrar-ingredientes");

      botonesIngredientes.forEach((boton) => {
        boton.addEventListener("click", () => {
          const ingredientes = boton.nextElementSibling;
          if (ingredientes.classList.contains("oculto")) {
            ingredientes.classList.remove("oculto");
          } else {
            ingredientes.classList.add("oculto");
          }
        });
      });
  }) 
  
  

  // #region Modal añadir plato

  // Añadir un evento click al botón "Añadir ingrediente"
  addIngredientBtn.addEventListener("click", () => {
    añadirIngredientes();
  });

  //Boton añadir nuevo plato
  addPlateBtn.addEventListener("click", () => {
    resetPlateModal();
    añadirIngredientes();
    añadirPlatesCategories();
  });

  // #endregion

})



btnSaveNewPlate.addEventListener("click", async () => {
  const name = document.getElementById('platename').value;
  const available = Boolean(document.getElementById('plateavailable').value);
  const category = document.getElementById('platecategory').value;

  //Seleccionar todos los ingredientes del plato
  const ingredientSelects = ingredientList.querySelectorAll('select');
  const ingredientInputs = ingredientList.querySelectorAll('input');

  const ingredients = [];

  for (let i = 0; i < ingredientSelects.length; i++) {
    const ingredient = ingredientSelects[i].options[ingredientSelects[i].selectedIndex].text;
    const quantity = parseFloat(ingredientInputs[i].value);
    //Me quedo solo con el nombre del ingrediente, sin la medida
    const split = ingredient.split(' ');
    const name = split[0];
    if(name && quantity){
      ingredients.push({name, quantity});
    }
    
  }

  try {
    await savePlate(name, available, category, ingredients);
    Swal.fire(
      'AÑADIR PLATO',
      'Plato añadido con éxito!',
      'success'
    );
    resetPlateModal();
  } catch (error) {
    Swal.fire(
      'AÑADIR PLATO',
      'Error al añadir plato',
      'error'
    );
  }
});


checkbox.addEventListener('change', function() {
  if (checkbox.checked) {
    checkbox.value = 'true';
  } else {
    checkbox.value = 'false';
  }
});

  function añadirIngredientes() {
    // Obtener la lista de opciones disponibles
    const availableOptions = options.slice(); // Copiar la lista de opciones
  
    // Obtener la lista de opciones seleccionadas
    const selectedOptions = [...ingredientList.querySelectorAll("select")].map(
      (select) => select.value
    );
  
    // Eliminar las opciones ya seleccionadas de la lista de opciones disponibles
    const filteredOptions = availableOptions.filter(
      (option) => !selectedOptions.includes(option.value.toString())
    );
  
    // Crear una nueva fila de ingredientes
    const newIngredientRow = document.createElement("div");
    newIngredientRow.className = "input-group mb-3";
  
    // Crear un nuevo elemento de selección
    const selectElement = document.createElement("select");
    selectElement.className = "form-select";
    selectElement.setAttribute("aria-label", "Selecciona un ingrediente");
  
    // Crear una opción predeterminada
    const defaultOption = document.createElement("option");
    defaultOption.selected = true;
    defaultOption.text = "Selecciona un ingrediente";
  
    // Añadir la opción predeterminada al elemento de selección
    selectElement.appendChild(defaultOption);
  
    // Crear y añadir las opciones filtradas al elemento de selección
    filteredOptions.forEach((option) => {
      const newOption = document.createElement("option");
      newOption.value = option.value;
      newOption.text = option.text + " (" + option.measure + ")";
      selectElement.appendChild(newOption);
    });
  
    // Crear un nuevo campo de entrada para la cantidad
    const inputElement = document.createElement("input");
    inputElement.className = "form-control";
    inputElement.setAttribute("type", "number");
    inputElement.setAttribute("placeholder", "Cantidad");
  
  
    // Añadir el elemento de selección y el campo de entrada a la nueva fila
    newIngredientRow.appendChild(selectElement);
    newIngredientRow.appendChild(inputElement);
  
    // Añadir la nueva fila a la lista de ingredientes
    ingredientList.appendChild(newIngredientRow);
  
    // Agregar la medida al valor de la cantidad ingresada
    inputElement.addEventListener("input", function () {
    this.value = this.value /*+ " " + option.measure*/;
    });
  }
  
function resetPlateModal() {
  document.getElementById('platename').value = '';
  document.getElementById('platecategory').selectedIndex = 0;
  while (ingredientList.firstChild) {
    ingredientList.removeChild(ingredientList.firstChild);
  }
}

function añadirPlatesCategories(querySnapshot) {

  if(categories.length < 1){
    querySnapshot.forEach((doc) => {
      const category = doc.data();
      categories.push(category.name);
    });

    document.getElementById('platecategory').selectedIndex = 0;
    const select = document.querySelector('#platecategory');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.textContent = category;
        select.appendChild(option);
    });
  }
    
}