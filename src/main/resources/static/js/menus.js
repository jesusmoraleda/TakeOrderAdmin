import { onGetPlates, onGetIngredients, updatePlate, updateIngredient} from "./firebase.js"

const listaPlatos = document.getElementById('listaPlatos');
const listaPlatosSelected = document.getElementById("listaPlatosSelected");
const btnSaveMenu = document.querySelector("#btn-save-menu");
const btnDeleteMenu = document.querySelector("#btn-clean-menu");

const ingredientes = [];
const initialState = {};
let plates = [];


//Esto se ejecuta al arrancar la pagina
window.addEventListener('DOMContentLoaded', async () => {
  
  onGetIngredients((querySnapshot) => {
    let i = 1;
    querySnapshot.forEach((doc) => {
      const ingredient = doc.data();
      ingredientes.push({ value: i, text: ingredient.name, measure: ingredient.measure, quantity: ingredient.quantity, id: doc.id});
      i++;
    });
  })

  onGetPlates((querySnapshot) => {
    plates = [];
    listaPlatos.innerHTML = "";
    listaPlatosSelected.innerHTML = "";
  
      querySnapshot.forEach((doc) => {

        const plate = doc.data();
        //console.log(plate);

        //En el menu solo van primeros segundos y postres
        if (plate.category == "Primer plato" || plate.category == "Segundo plato" || plate.category == "Postre") {

            let isChecked = plate.in_menu;
            initialState[doc.id] = plate.in_menu;
            
            let ingredientesHtml = "";
            for (let i = 0; i < plate.ingredients.length; i++) {
              const ingrediente = plate.ingredients[i].name;
              let cantidad = plate.ingredients[i].quantity;
              const option = ingredientes.find(option => option.text === ingrediente);
              let measure = option ? option.measure : "";
              if (measure == "Kilos") {
                cantidad = cantidad * 1000;
                measure = "gramos";
              }
              ingredientesHtml += `<li>${ingrediente} - ${cantidad} ${measure}</li>`;
            }
            //console.log(plates);
            plates.push({name: plate.name, inmenu: plate.in_menu, cantidad: plate.quantity_menu, ingredientes: plate.ingredients});

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

          // Obtener el nombre del plato y la cantidad desde la fila correspondiente en la tabla de la izquierda
          const parentRow = checkbox.closest('tr');
          const plateName = parentRow.querySelector('.plato h5').textContent;
          const plateCategory = parentRow.querySelector('.plato h7').textContent;
          const plateQty = parentRow.querySelector('input[name="cantidad"]').value;

          // Encontrar el plato en el arreglo plates por su ID
          const plato = plates.find((plate) => plate.name === plateName);

          // Actualizar el valor inmenu del plato
          plato.inmenu = checkbox.checked;
          plato.cantidad = plateQty;

          if (checkbox.checked) {
            // Agregar una nueva fila a la tabla de la derecha con los datos del plato
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
              <td><h5>${plateName}</h5></td>
              <td>${plateCategory}</td>
              <td>${plateQty}</td>
            `;
            listaPlatosSelected.appendChild(newRow);
          } else {
            // El checkbox se ha desmarcado, eliminar el plato de la tabla de la derecha
            const parentRow = checkbox.closest('tr');
            const plateName = parentRow.querySelector('.plato h5').textContent;
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
btnDeleteMenu.addEventListener("click", () => {
  Swal.fire({
    title: 'Estás seguro de eliminar este menú?',
    icon: 'warning',
    showCancelButton: true,
    cancelButtonText: 'No, cancelar',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, eliminar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      listaPlatosSelected.innerHTML = "";

      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
      checkboxes.forEach(async (checkbox) => {
          if(checkbox.checked == true){
            let id = checkbox.dataset.id;
            checkbox.checked = false;
            const checkboxIcon = checkbox.nextElementSibling;
            checkboxIcon.classList.remove('checked');
            const inputField = document.querySelector(`[data-id="${id}"][name="cantidad"]`);
            inputField.value = 0;
            try{
              await updatePlate(id, {
                in_menu: checkbox.checked,
                quantity_menu: inputField.value,
              });
              console.log("updated plato");
            } catch(error){
              Swal.fire(
                'ELIMINAR MENU',
                'Error al eliminar los platos del menú',
                'error'
              )
            } 
          }
      });
      Swal.fire(
        'ELIMINAR MENU',
        'Menu eliminado con éxito!',
        'success'
      );
    }

  })
});

btnSaveMenu.addEventListener("click", async () => {
  Swal.fire({
    title: 'Estás seguro de guardar este menú?',
    text: "Si guardas se eliminará el stock correspondiente de los ingredientes necesarios",
    icon: 'warning',
    showCancelButton: true,
    cancelButtonText: 'No, cancelar',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, guardar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      if(await comprobarDisponibilidadIngredientes() == true){
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
        checkboxes.forEach(async (checkbox) => {
            let id = checkbox.dataset.id;
            console.log(checkbox.checked);
            if (checkbox.checked != initialState[id]) {
                // El valor del checkbox ha cambiado. Si se ha quitado pongo cantidad a 0
                let cantidad = 0;
                if(checkbox.checked){ cantidad = parseFloat(document.querySelector(`[data-id="${id}"][name="cantidad"]`).value);}
                // Actualizar el valor en la base de datos aquí
                try{
                  //Actualizar platos (checkboxes y cantidad)
                  await updatePlate(id, {
                    in_menu: checkbox.checked,
                    quantity_menu: cantidad,
                  });
                  console.log("updated plato");
                } catch(error){
                  Swal.fire(
                    'GUARDAR MENU',
                    'Error al actualizar los platos del menú',
                    'error'
                  )
                } 
            }
        });
        Swal.fire(
          'GUARDAR MENU',
          'Menu guardado con éxito!',
          'success'
        );
      } 
    }
    
  })
  
});

async function comprobarDisponibilidadIngredientes() {
  const ingredientesNecesarios = {};
  const ingredientesInsuficientes = [];

  // Recorrer el arreglo de platos
  plates.forEach((plato) => {
    if (plato.inmenu) {
      // El plato está en el menú
      const ingredientesPlato = plato.ingredientes;
      const raciones = plato.cantidad;

      // Recorrer los ingredientes del plato
      ingredientesPlato.forEach((ingrediente) => {
        const nombreIngrediente = ingrediente.name;
        const cantidadIngrediente = ingrediente.quantity * raciones;

        // Verificar si el ingrediente ya está en la lista de ingredientes necesarios
        if (ingredientesNecesarios.hasOwnProperty(nombreIngrediente)) {
          // El ingrediente ya existe, sumar la cantidad requerida
          ingredientesNecesarios[nombreIngrediente] += cantidadIngrediente;
        } else {
          // El ingrediente no existe, agregarlo a la lista
          ingredientesNecesarios[nombreIngrediente] = cantidadIngrediente;
        }
      });
    }
  });

  // Verificar disponibilidad de ingredientes
  for (const ingrediente in ingredientesNecesarios) {
    const cantidadNecesaria = ingredientesNecesarios[ingrediente];

    // Buscar el ingrediente en el arreglo de ingredientes disponibles
    const ingredienteDisponible = ingredientes.find((item) => item.text == ingrediente);

    if (!ingredienteDisponible || ingredienteDisponible.quantity < cantidadNecesaria) {
      // No hay suficiente cantidad del ingrediente disponible
      ingredientesInsuficientes.push(ingrediente);
    }
  }

  if (ingredientesInsuficientes.length > 0) {
    const mensaje = `Error al guardar el menú, no hay suficiente cantidad de los siguientes ingredientes: <br>${ingredientesInsuficientes.join(', ')}`;
    Swal.fire({
      title: 'GUARDAR MENU',
      html: mensaje,
      icon: 'error'
    });
    return false;
  }
  else{
    // Actualizar la cantidad de ingredientes en la base de datos
    for (const ingrediente in ingredientesNecesarios) {
      const cantidadNecesaria = ingredientesNecesarios[ingrediente];

      // Buscar el ingrediente en el arreglo de ingredientes disponibles
      const ingredienteDisponible = ingredientes.find((item) => item.text == ingrediente);

      if (ingredienteDisponible) {
        const nuevaCantidad = ingredienteDisponible.quantity - cantidadNecesaria;
        console.log(nuevaCantidad);
        try{
          //Actualizar platos (checkboxes y cantidad)
          await updateIngredient(ingredienteDisponible.id, {
            quantity: nuevaCantidad.toFixed(2),
          });
        } catch(error){
          Swal.fire(
            'GUARDAR MENU',
            'Error al reducir la cantidad',
            'error'
          )
        } 
      }
    }
    
    return true;
  }
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
        console.log(categoria);
        console.log(categoriaSeleccionada);
        // Comprueba si la categoría de la fila coincide con la categoría seleccionada o si se seleccionó "Todas"
        if (categoria.trim() === categoriaSeleccionada || categoriaSeleccionada === '') {
          // Si la fila coincide con la categoría seleccionada o se seleccionó "Todas", muestra la fila
          filas[i].style.display = "";
        } else {
          // Si la fila no coincide con la categoría seleccionada, ocúltala
          filas[i].style.display = "none";
        }
      }
  });
}