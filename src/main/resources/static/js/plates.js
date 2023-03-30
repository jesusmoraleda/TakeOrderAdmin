import { getPlates, onGetPlates, deletePlate, getPlate, updatePlate, onGetIngredients, savePlate } from "./firebase.js"

// Modal añadir plato

//Boton añadir plato
const addPlateBtn = document.querySelector("#btn-add-new-plate");
// Botón "Añadir ingrediente"
const addIngredientBtn = document.querySelector("#add-ingredient");

// Lista de ingredientes
const ingredientList = document.querySelector("#ingredient-list");

//Boton guardar plato
const btnSaveNewPlate = document.querySelector("#btn-save-new-plate");

const options = [];

const listaPlatos = document.getElementById('listaPlatos')
//Esto se ejecuta al arrancar la pagina
window.addEventListener('DOMContentLoaded', async () => {

    onGetPlates((querySnapshot) => {
      listaPlatos.innerHTML = "";
    
        querySnapshot.forEach((doc) => {

          const plate = doc.data();
          console.log(plate);

          let ingredientesHtml = "";
          for (let i = 0; i < plate.ingredients.length; i++) {
            const ingrediente = plate.ingredients[i].name;
            const cantidad = plate.ingredients[i].quantity;
            ingredientesHtml += `<li>${ingrediente} - ${cantidad}</li>`;
          }

          listaPlatos.innerHTML += `
          <tr>
            <td>
              <div class="plato">
                <h5>${plate.name}</h5>
              </div>
            </td>
            <td>
              <button class="mostrar-ingredientes">${"Mostrar ingredientes"}</button>
                <div class="ingredientes oculto">
                  <ul>
                  ${ingredientesHtml}
                  </ul>
                </div>
            </td>
          </tr>`
        });

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

    onGetIngredients((querySnapshot) => {
      let i = 1;
      querySnapshot.forEach((doc) => {
        const ingredient = doc.data();

        options.push({ value: i, text: ingredient.name });
        i++;
      });
    })
    

    // Añadir un evento click al botón "Añadir ingrediente"
    addIngredientBtn.addEventListener("click", () => {
      añadirIngredientes();

    });

    //Boton añadir nuevo plato
    addPlateBtn.addEventListener("click", () => {
      resetPlateModal();
      añadirIngredientes();
      
    });

    // #endregion

})

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
    newOption.text = option.text;
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
}

function resetPlateModal() {
  document.getElementById('platename').value = '';
  while (ingredientList.firstChild) {
    ingredientList.removeChild(ingredientList.firstChild);
  }
}

btnSaveNewPlate.addEventListener("click", async () => {
  const name = document.getElementById('platename').value;
  const available = Boolean(document.getElementById('plateavailable').value);

  const ingredientSelects = ingredientList.querySelectorAll('select');
  const ingredientInputs = ingredientList.querySelectorAll('input');

  const ingredients = [];

  for (let i = 0; i < ingredientSelects.length; i++) {
    const name = ingredientSelects[i].options[ingredientSelects[i].selectedIndex].text;
    const quantity = parseFloat(ingredientInputs[i].value);
    if(name && quantity){
      ingredients.push({name, quantity});
    }
    
  }

  try {
    await savePlate(name, available, ingredients);
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

const checkbox = document.getElementById('plateavailable');
  checkbox.addEventListener('change', function() {
    if (checkbox.checked) {
      checkbox.value = 'true';
    } else {
      checkbox.value = 'false';
    }
  });