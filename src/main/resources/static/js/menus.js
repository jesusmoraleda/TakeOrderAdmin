import { onGetPlates, onGetIngredients, updatePlate} from "./firebase.js"

const listaPlatos = document.getElementById('listaPlatos');
const listaPlatosSelected = document.getElementById("listaPlatosSelected");
const btnSaveMenu = document.querySelector("#btn-save-menu");

const options = [];
const initialState = {};


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

  onGetPlates((querySnapshot) => {
    listaPlatos.innerHTML = "";
    listaPlatosSelected.innerHTML = "";
  
      querySnapshot.forEach((doc) => {

        const plate = doc.data();

        //En el menu solo van primeros segundos y postres
        if (plate.category == "Primer plato" || plate.category == "Segundo plato" || plate.category == "Postre") {

            let isChecked = plate.in_menu;
            initialState[doc.id] = plate.in_menu;
            
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
            </td>
            <td>
                <label class="btn btn-addtomenu custom-checkbox">
                    <input type="checkbox" class="checkbox-addtomenu" data-id="${doc.id}" ${isChecked ? 'checked' : ''}>
                    <span class="checkbox-icon"></span>
                </label>
                </td>
                <td><input type="number" class="small-input" min="0" value=${plate.quantity_menu} name="cantidad" data-id="${doc.id}"></td>
            </tr>`

            if(isChecked){
                listaPlatosSelected.innerHTML += `
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
                <div class="plato">
                <h7>${plate.quantity_menu}</h7>
                </div>
            </td>
            </tr>`
            }
        }   
      });

      // Ordenar la tabla por nombre por defecto
      sortTable(1);

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

      // Obtener todos los checkboxes
      const checkboxesAddToMenu = document.querySelectorAll('.checkbox-addtomenu');

      // Añadir un manejador de eventos a cada checkbox
      checkboxesAddToMenu.forEach((checkbox) => {
      checkbox.addEventListener('click', (event) => {
          const checkboxIcon = event.target.nextElementSibling;
          checkboxIcon.classList.toggle('checked');

          if (checkbox.checked) {
            console.log(checkbox.checked);
            // Obtener el nombre del plato y la cantidad desde la fila correspondiente en la tabla de la izquierda
            const parentRow = checkbox.closest('tr');
            const plateName = parentRow.querySelector('.plato h5').textContent;
            const plateCategory = parentRow.querySelector('.plato h7').textContent;
            const plateQty = parentRow.querySelector('input[name="cantidad"]').value;
            console.log(plateName);
            
            // Agregar una nueva fila a la tabla de la derecha con los datos del plato
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
              <td><h5>${plateName}</h5></td>
              <td>${plateCategory}</td>
              <td>${plateQty}</td>
            `;
            console.log(newRow);
            listaPlatosSelected.appendChild(newRow);
          } else {
            // El checkbox se ha desmarcado, eliminar el plato de la tabla de la derecha
            const parentRow = checkbox.closest('tr');
            const plateName = parentRow.querySelector('.plato h5').textContent;
            console.log(plateName);
            const plateRow = [...listaPlatosSelected.rows].find(row => row.cells[0].textContent.trim() === plateName).closest('tr');
            listaPlatosSelected.removeChild(plateRow);

            /*const menuItem = listaPlatosSelected.querySelector(`[data-id="${plateName}"]`);
            menuItem.remove();*/
          }
      });
      });

  }) 

  añadirBuscador();
    
  añadirFiltro();

})

btnSaveMenu.addEventListener("click", async () => {
    console.log("guardar menu");
    comprobarDisponibilidadIngredientes();
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(async (checkbox) => {
        let id = checkbox.dataset.id;
        if (checkbox.checked != initialState[id]) {
            // El valor del checkbox ha cambiado
            const cantidad = parseInt(document.querySelector(`[data-id="${id}"][name="cantidad"]`).value);
            // Actualizar el valor en la base de datos aquí
            await updatePlate(id, {
                in_menu: checkbox.checked,
                quantity_menu: cantidad,
            });
            Swal.fire(
            'GUARDAR MENU',
            'Menu guardado con éxito!',
            'success'
            );
        }
    });
});

function comprobarDisponibilidadIngredientes(){
    let ingredientesNecesarios = {};
  
    /*for (let i = 0; i < listaPlatos.length; i++) {
        if (listaPlatos[i].checkbox) {
        let cantidad = listaPlatos[i].cantidad;
        let ingredientes = listaPlatos[i].ingredientes;
        
        for (let j = 0; j < ingredientes.length; j++) {
            let ingrediente = ingredientes[j].nombre;
            let cantidadNecesaria = cantidad * ingredientes[j].cantidad;
            
            if (ingrediente in ingredientesNecesarios) {
            ingredientesNecesarios[ingrediente] += cantidadNecesaria;
            } else {
            ingredientesNecesarios[ingrediente] = cantidadNecesaria;
            }
        }
        }
    }*/
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