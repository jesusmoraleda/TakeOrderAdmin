import { onGetPlates, deletePlate, getPlate, updatePlate, onGetIngredients, onGetPlatesCategories, savePlate } from "./firebase.js"

// Modal añadir plato

//Boton añadir plato
const addPlateBtn = document.querySelector("#btn-add-new-plate");

// Botón "Añadir ingrediente"
const addIngredientBtn = document.querySelector("#add-ingredient");
const addIngredientBtnEdit = document.querySelector("#add-ingredient-edit");

// Lista de ingredientes
const ingredientList = document.querySelector("#ingredient-list");
const ingredientListEdit = document.querySelector("#ingredient-list-edit");

//Modal nuevo plato
const btnSaveNewPlate = document.querySelector("#btn-save-new-plate");
const btnCancelNewPlate = document.querySelector("#btn-cancel-new-plate");

//Modal editar plato
const btnSaveEditPlate = document.querySelector("#btn-save-edit");
const btnCancelEditPlate = document.querySelector("#btn-cancel-edit");

const checkbox = document.getElementById('plateavailable');
const listaPlatos = document.getElementById('listaPlatos');

const options = [];
const measures = [];
const categories = [];
const plates = [];

let id = ''; //para editar ?


//Esto se ejecuta al arrancar la pagina
window.addEventListener('DOMContentLoaded', async () => {

  onGetIngredients((querySnapshot) => {
    let i = 1;
    querySnapshot.forEach((doc) => {
      const ingredient = doc.data();
      options.push({ value: i, text: ingredient.name, measure: ingredient.measure, id: doc.id});
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
        plates.push(plate.name);
        
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
              <h7>${plate.category}</h7>
            </div>
          </td>
          <td>
            <button class="btn btn-info mostrar-ingredientes">${"Ingredientes"}</button>
            <div class="ingredientes oculto">
              <ul>
              ${ingredientesHtml}
              </ul>
            </div>
            <td><button class="btn btn-edit" data-bs-toggle="modal" data-bs-target="#editarPlato"><i class="fa-solid fa-pencil btneditar" data-id="${doc.id}"></i></button></td>
            <td><button class="btn btn-delete" data-bs-toggle="modal" data-bs-target="#eliminarPlato"><i class="fa-solid fa-trash btntrash" data-id="${doc.id}"></i></button></td>
          </td>
        </tr>`
      });

      // Ordenar la tabla por nombre por defecto
      sortTable(0);
      sortTable(0);

      //Botones mostrar ingredientes
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

      //Botones editar platos
      const btnsEdit = listaPlatos.querySelectorAll(".btneditar");

      btnsEdit.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            try {
                //resetPlateModalEdit();
                const doc = await getPlate(e.target.dataset.id);
                const plate = doc.data();

                rellenarDesplegablesEdit();

                document.getElementById('platenameedit').value = plate.name;
                document.getElementById('platecategoryedit').value = plate.category;
                //mostrar los ingredientes de ese plato
                for(let i = 0; i < plate.ingredients.length; i++){
                  const ingrediente = plate.ingredients[i].name;
                  const cantidad = plate.ingredients[i].quantity;
                  const optionIndex = options.find(option => option.text === ingrediente);
                  añadirIngredientes(optionIndex.value, cantidad, true);
                }

                id = doc.id;

            } catch (error) {
                console.log(error);
            }
        });
      });

      //Botones eliminar plato
      const btnsDelete = listaPlatos.querySelectorAll(".btntrash");

      btnsDelete.forEach((btn) =>
          btn.addEventListener("click", async (e) => {
              id = e.target.dataset.id;
              Swal.fire({
                  title: 'ELIMINAR PLATO',
                  text: "¿Está seguro de eliminar el plato?",
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Eliminar',
                  cancelButtonText: 'Cancelar'
                }).then(async (result) => {
                  if (result.isConfirmed) {
                      try {
                          await deletePlate(id);
                          Swal.fire(
                              'ELIMINAR PLATO',
                              '¡Plato eliminado con exito"',
                              'success'
                          )
                          id = "";
                      } catch (error) {
                          Swal.fire(
                              'ELIMINAR PLATO',
                              '¡Error al eliminar el plato!',
                              'error'
                          )
                      }
                  }
                })
          })
      );
  }) 

  añadirBuscador();
    
  añadirFiltro();

  // Añadir un evento click al botón "Añadir ingrediente"
  addIngredientBtn.addEventListener("click", () => {
    añadirIngredientes();
  });

  addIngredientBtnEdit.addEventListener("click", () => {
    añadirIngredientes(undefined, undefined,true);
  });

  //Boton añadir nuevo plato
  addPlateBtn.addEventListener("click", () => {
    resetPlateModal();
    rellenarDesplegables();
    añadirIngredientes();
  });

})

//Boton cancelar añadir plato
btnCancelNewPlate.addEventListener("click", async () => {
  resetPlateModal();
})

//Boton guardar nuevo plato
btnSaveNewPlate.addEventListener("click", async () => {
  const name = document.getElementById('platename').value;
  //const available = Boolean(document.getElementById('plateavailable').value);
  const category = document.getElementById('platecategory').value;
  console.log(category);

  //Seleccionar todos los ingredientes del plato
  const ingredientSelects = ingredientList.querySelectorAll('select');
  const ingredientInputs = ingredientList.querySelectorAll('input');

  const ingredients = [];

  for (let i = 0; i < ingredientSelects.length; i++) {
    const ingredient = ingredientSelects[i].options[ingredientSelects[i].selectedIndex].text;

    const quantity = parseFloat(ingredientInputs[i].value);
    //Me quedo solo con el nombre del ingrediente, sin la medida
    const split = ingredient.split(' (');
    const name = split[0];

    const option = options.find(option => option.text === name);
    const id = option ? option.id : "";

    if(name && quantity){
      ingredients.push({name, quantity, id});
    }
    
  }

  if (!name || ingredients.length < 1) {
    Swal.fire(
        'AÑADIR PLATO',
        '¡Por favor, completa todos los campos (debe tener al menos un ingrediente)!',
        'error'
    );
    return;
  }

  try {
    await savePlate(name, category, ingredients, false, 0);
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

//Boton cancelar editar plato
btnCancelEditPlate.addEventListener("click", async () => {
  resetPlateModalEdit();
})

//Boton guardar edit plato
btnSaveEditPlate.addEventListener("click", async () => {
  const name = document.getElementById('platenameedit').value;
  //const available = Boolean(document.getElementById('plateavailableedit').value);
  const category = document.getElementById('platecategoryedit').value;

  //Seleccionar todos los ingredientes del plato
  const ingredientSelects = ingredientListEdit.querySelectorAll('select');
  const ingredientInputs = ingredientListEdit.querySelectorAll('input');

  const ingredients = [];

  for (let i = 0; i < ingredientSelects.length; i++) {
    const ingredient = ingredientSelects[i].options[ingredientSelects[i].selectedIndex].text;
    const quantity = parseFloat(ingredientInputs[i].value);
    //Me quedo solo con el nombre del ingrediente, sin la medida
    const split = ingredient.split(' (');
    const name = split[0];
    if(name && quantity){
      ingredients.push({name, quantity});
    }
    
  }

  if (!name || ingredients.length < 1) {
    Swal.fire(
        'AÑADIR PLATO',
        '¡Por favor, completa todos los campos (debe tener al menos un ingrediente)!',
        'error'
    );
    return;
  }
  
  try {
    await updatePlate(id, {
      name: name,
      category: category,
      ingredients: ingredients,
    });
    id = "";
    Swal.fire(
      'EDITAR PLATO',
      'Plato editado con éxito!',
      'success'
    );
    resetPlateModal();
  } catch (error) {
    Swal.fire(
      'EDITAR PLATO',
      'Error al editar plato',
      'error'
    );
  }
});

/*checkbox.addEventListener('change', function() {
  if (checkbox.checked) {
    checkbox.value = 'true';
  } else {
    checkbox.value = 'false';
  }
});*/

function añadirIngredientes(optionIndex = undefined, cantidad = null, editarPlato = false) {
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
  inputElement.setAttribute("type", "float");
  inputElement.setAttribute("placeholder", "Cantidad");

  if(editarPlato && optionIndex != undefined && optionIndex >= 0 && optionIndex < filteredOptions.length && cantidad != undefined && cantidad !== null){
    selectElement.selectedIndex = optionIndex;
    inputElement.value = cantidad;
  }

  // Añadir el elemento de selección y el campo de entrada a la nueva fila
  newIngredientRow.appendChild(selectElement);
  newIngredientRow.appendChild(inputElement);

  // Añadir la nueva fila a la lista de ingredientes
  if(editarPlato) ingredientListEdit.appendChild(newIngredientRow);
  else ingredientList.appendChild(newIngredientRow);
  

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

function resetPlateModalEdit() {
  document.getElementById('platenameedit').value = '';
  document.getElementById('platecategoryedit').selectedIndex = 0;
  while (ingredientListEdit.firstChild) {
    ingredientListEdit.removeChild(ingredientListEdit.firstChild);
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

    document.getElementById('filter-categories').selectedIndex = 0;
    const filter = document.querySelector('#filter-categories');

    categories.forEach(category => {
        const option = document.createElement('option');
        option.textContent = category;
        select.appendChild(option);
        filter.appendChild(option);
    });
  }
    
}

function nombreExistente(name){
  // Recorrer la lista de ingredientes
  for (let i = 0; i < plates.length; i++) {
      // Comparar el nombre del ingrediente actual con el nombre del nuevo ingrediente
      if (plates[i].toLowerCase() === name.toLowerCase()) {
          // Si encontramos un ingrediente con el mismo nombre, devolver true
          return true;
      }
  }

  // Si no se encuentra un ingrediente con el mismo nombre, devolver false
  return false;
}

function rellenarDesplegablesEdit(){
                  
  const select = document.querySelector('#platecategoryedit');
  if(select.length <= 1){
    categories.forEach(category => {
      const option = document.createElement('option');
      option.textContent = category;
      select.appendChild(option);
    });
  }
  

  //Añadir ingredientes del modal editar
  /*addIngredientBtnEdit.addEventListener("click", () => {
    añadirIngredientes(undefined, undefined,true);
  });*/

}

function rellenarDesplegables(){
                  
  const select = document.querySelector('#platecategory');
  if(select.length <= 1){
    categories.forEach(category => {
      const option = document.createElement('option');
      option.textContent = category;
      select.appendChild(option);
    });
  }
  

  //Añadir ingredientes del modal editar
  /*addIngredientBtn.addEventListener("click", () => {
    añadirIngredientes(undefined, undefined,false);
  });*/

}

function añadirBuscador(){
  const buscarInput = document.getElementById('buscarInput');

  buscarInput.addEventListener('input', () => {
    const busqueda = buscarInput.value.toLowerCase();
    // Lógica de búsqueda...
    // Obtiene todas las filas de la tabla
    var filas = document.getElementById("plates-table").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
  
    // Itera sobre cada fila de la tabla
    for (var i = 0; i < filas.length; i++) {
      var nombre = filas[i].getElementsByTagName("td")[0];
      var categoria = filas[i].getElementsByTagName("td")[1];
  
      // Comprueba si alguna fila contiene la búsqueda
      if (busqueda.length === 0 || nombre.innerHTML.toLowerCase().indexOf(busqueda) > -1) {
        // Si la fila contiene la búsqueda, muestra la fila y resáltala
        filas[i].style.display = "";
        if (busqueda.length > 0) {
          filas[i].classList.add("resaltado");
        } else {
          filas[i].classList.remove("resaltado");
        }
      } else {
        // Si la fila no contiene la búsqueda, ocúltala y elimina el resaltado
        filas[i].style.display = "none";
        filas[i].classList.remove("resaltado");
      }
    }
  });
}

function añadirFiltro(){
  const categoriaSelect = document.getElementById('filter-categories');

  categoriaSelect.addEventListener('change', () => {
      const categoriaSeleccionada = categoriaSelect.value.toLowerCase();
    
      // Obtiene todas las filas de la tabla
      const filas = document.getElementById("plates-table").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    
      // Itera sobre cada fila de la tabla
      for (let i = 0; i < filas.length; i++) {
        const categoria = filas[i].getElementsByTagName("td")[1].textContent.toLowerCase();
    
        // Comprueba si la categoría de la fila coincide con la categoría seleccionada o si se seleccionó "Todas"
        if (categoria === categoriaSeleccionada || categoriaSeleccionada === '') {
          // Si la fila coincide con la categoría seleccionada o se seleccionó "Todas", muestra la fila
          filas[i].style.display = "";
        } else {
          // Si la fila no coincide con la categoría seleccionada, ocúltala
          filas[i].style.display = "none";
        }
      }
  });
}