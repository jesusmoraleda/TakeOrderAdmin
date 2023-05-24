import { saveIngredient, onGetIngredients, deleteIngredient, getIngredient, updateIngredient, onGetIngredientsCategories, onGetIngredientsMeasures } from "./firebase.js"

const btnSaveNewIngredient = document.getElementById('btn-save-new-ingredient')
const btnAddNewIngredient = document.getElementById('btn-add-new-ingredient')
const btnDeleteIngredient = document.getElementById('btn-delete-ingredient')
const btnCancelEdit = document.getElementById('btn-cancel-edit')
const btnSaveEdit = document.getElementById('btn-save-edit')
const listaIngredientes = document.getElementById('listaIngredientes')

let id = ''; //Para la edicion

const categories = [];
const measures = [];
let ingredients = [];


//Esto se ejecuta al arrancar la pagina ¿?
window.addEventListener('DOMContentLoaded', () => {

    ingredients = [];

    onGetIngredientsCategories((querySnapshot) => {
        addIngredientsCategories(querySnapshot);
    })
    onGetIngredientsMeasures((querySnapshot) => {
        addIngredientsMeasures(querySnapshot);
    })

    onGetIngredients((querySnapshot) => {
        listaIngredientes.innerHTML = "";
    
        querySnapshot.forEach((doc) => {
          const ingredient = doc.data();
          const name = ingredient.name;
          const id = doc.id;
          ingredients.push({name, id});
          listaIngredientes.innerHTML += `
          <tr>
            <td><h5>${ingredient.name}</h5></td>
            <td><h5>${ingredient.category}</h5></td>
            <td><h5>${ingredient.quantity}</h5></td>
            <td><h5>${ingredient.measure}</h5></td>
            <td><h5>${ingredient.alert}</h5></td>
            <td align="center"><button class="btn btn-edit" data-bs-toggle="modal" data-bs-target="#editarModal"><i class="fa-solid fa-pencil btneditar" data-id="${doc.id}"></i></button></td>
            <td align="center"><button class="btn btn-delete" data-bs-toggle="modal" data-bs-target="#eliminarModal"><i class="fa-solid fa-trash btntrash" data-id="${doc.id}"></i></button></td>
          </tr>`
        });
        
        // Ordenar la tabla por nombre por defecto
        sortTable(0);
        

        //Botones eliminar ingrediente
        const btnsDelete = listaIngredientes.querySelectorAll(".btntrash");

        btnsDelete.forEach((btn) =>
            btn.addEventListener("click", async (e) => {
                id = e.target.dataset.id;
                Swal.fire({
                    title: 'ELIMINAR INGREDIENTE',
                    text: "¿Está seguro de eliminar el ingrediente?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Eliminar',
                    cancelButtonText: 'Cancelar'
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await deleteIngredient(id);
                            Swal.fire(
                                'ELIMINAR INGREDIENTE',
                                '¡Ingrediente eliminado con exito"',
                                'success'
                            )
                            id = "";
                        } catch (error) {
                            Swal.fire(
                                'ELIMINAR INGREDIENTE',
                                '¡Error al eliminar el ingrediente!',
                                'error'
                            )
                        }
                    }
                  })
            })
        );


        //Botones editar ingredientes
        const btnsEdit = listaIngredientes.querySelectorAll(".btneditar");

        btnsEdit.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            console.log("He clickado");
            try {
                const doc = await getIngredient(e.target.dataset.id);
                const ingredient = doc.data();

                rellenarDesplegablesEdit();

                document.getElementById('ingnameedit').value = ingredient.name;
                document.getElementById('ingcategoryedit').value = ingredient.category;
                document.getElementById('ingquantityedit').value = ingredient.quantity;
                document.getElementById('ingmeasureedit').value = ingredient.measure;
                document.getElementById('ingalertedit').value = ingredient.alert;

                id = doc.id;

            } catch (error) {
                console.log(error);
            }
        });
        });

    })
    
    añadirBuscador();
    
    añadirFiltro();

})

//Añadir nuevo ingrediente
btnAddNewIngredient.addEventListener("click", ()=>{
    rellenarDesplegables();

    document.getElementById('ingname').value = '';
    document.getElementById('ingquantity').value = '';
    document.getElementById('ingmeasure').selectedIndex = 0;
    document.getElementById('ingalert').value = '';
    document.getElementById('ingcategory').selectedIndex = 0;
})

//Guardar ingrediente
btnSaveNewIngredient.addEventListener("click", ()=>{
    const name = document.getElementById('ingname').value;
    const quantity = parseInt(document.getElementById('ingquantity').value);
    const measure = document.getElementById('ingmeasure').value;
    const alert = parseInt(document.getElementById('ingalert').value);
    const category = document.getElementById('ingcategory').value;

    resetIngredientModal();

    if (!name || quantity < 0 || alert < 0) {
        Swal.fire(
            'AÑADIR INGREDIENTE',
            '¡Por favor, completa todos los campos y asegúrate de que la cantidad y la alerta sean valores positivos!',
            'error'
        );
        return;
    }

    if (nombreExistente(name)) {
        Swal.fire(
            'AÑADIR INGREDIENTE',
            '¡No puede haber dos ingredientes con el mismo nombre!',
            'error'
        );
        return;
    }
    try{
        saveIngredient(name,category,quantity,measure,alert);
        Swal.fire(
            'AÑADIR INGREDIENTE',
            '¡Ingrediente añadido con éxito!',
            'success'
        )
    }catch (error) {
        Swal.fire(
            'AÑADIR INGREDIENTE',
            '¡Error al añadir el ingrediente!',
            'error'
        )
    }
})

//Cancelar edit de ingrediente
btnCancelEdit.addEventListener("click", ()=>{
    document.getElementById('ingnameedit').value = '';
    document.getElementById('ingmeasureedit').selectedIndex = 0;
    document.getElementById('ingquantityedit').value = '';
    document.getElementById('ingalertedit').value = '';
    document.getElementById('ingcategoryedit').selectedIndex = 0;
})

//Guardar edit de ingrediente
btnSaveEdit.addEventListener("click", async ()=>{
    const name = document.getElementById('ingnameedit').value;
    const quantity = parseInt(document.getElementById('ingquantityedit').value);
    const measure = document.getElementById('ingmeasureedit').value;
    const alert = parseInt(document.getElementById('ingalertedit').value);
    const category = document.getElementById('ingcategoryedit').value;

    if (!name || quantity < 0 || alert < 0) {
        Swal.fire(
            'AÑADIR INGREDIENTE',
            '¡Por favor, completa todos los campos y asegúrate de que la cantidad y la alerta sean valores positivos!',
            'error'
        );
        return;
    }

    if (nombreExistente(name, id)) {
        Swal.fire(
            'AÑADIR INGREDIENTE',
            '¡No puede haber dos ingredientes con el mismo nombre!',
            'error'
        );
        return;
    }

    try{
        await updateIngredient(id, {
            name: name,
            category: category,
            quantity: quantity,
            measure: measure,
            alert: alert,
        });
        id = "";
        Swal.fire(
            'EDITAR INGREDIENTE',
            '¡Ingrediente editado con éxito!',
            'success'
        )
    }catch (error) {
        Swal.fire(
            'EDITAR INGREDIENTE',
            '¡Error al editar el ingrediente!',
            'error'
        )
    }
})

function addIngredientsCategories(querySnapshot){
    if(categories.length < 1){
        querySnapshot.forEach((doc) => {
            const category = doc.data();
            categories.push(category.name);
        });

        document.getElementById('ingcategory').selectedIndex = 0;
        const select = document.querySelector('#ingcategory');

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

function addIngredientsMeasures(querySnapshot){
    if(measures.length < 1){
        querySnapshot.forEach((doc) => {
            const measure = doc.data();
            measures.push(measure.name);
        });

        document.getElementById('ingmeasure').selectedIndex = 0;

        const select = document.querySelector('#ingmeasure');

        measures.forEach(measure => {
            const option = document.createElement('option');
            option.textContent = measure;
            select.appendChild(option);
        });
    }
}

function nombreExistente(name, id = ""){
    // Recorrer la lista de ingredientes
    for (let i = 0; i < ingredients.length; i++) {
        if(ingredients[i].id != id){
            // Comparar el nombre del ingrediente actual con el nombre del nuevo ingrediente
            if (ingredients[i].name === name) {
                // Si encontramos un ingrediente con el mismo nombre, devolver true
                return true;
            }
        }
    }

    // Si no se encuentra un ingrediente con el mismo nombre, devolver false
    return false;
}

function rellenarDesplegablesEdit(){
    const select = document.querySelector('#ingcategoryedit');
    if(select.length <= 1){
        categories.forEach(category => {
            const option = document.createElement('option');
            option.textContent = category;
            select.appendChild(option);
        });
    }
    

    const selectmeasures = document.querySelector('#ingmeasureedit');
    if(selectmeasures.length <= 1){
        measures.forEach(measure => {
            const option = document.createElement('option');
            option.textContent = measure;
            selectmeasures.appendChild(option);
        });
    }
    
}

function rellenarDesplegables(){
    const select = document.querySelector('#ingcategory');
    if(select.length <= 1){
        categories.forEach(category => {
            const option = document.createElement('option');
            option.textContent = category;
            select.appendChild(option);
        });
    }
    
    const selectmeasures = document.querySelector('#ingmeasure');
    if(selectmeasures.length <= 1){
        measures.forEach(measure => {
            const option = document.createElement('option');
            option.textContent = measure;
            selectmeasures.appendChild(option);
        });
    }
}

function resetIngredientModal(){
    document.getElementById('ingname').value = '';
    document.getElementById('ingquantity').value = '';
    document.getElementById('ingmeasure').selectedIndex = 0;
    document.getElementById('ingalert').value = '';
    document.getElementById('ingcategory').selectedIndex = 0;
}

function añadirBuscador(){
    const buscarInput = document.getElementById('buscarInput');

    buscarInput.addEventListener('input', () => {
      const busqueda = buscarInput.value.toLowerCase();
      // Lógica de búsqueda...
      // Obtiene todas las filas de la tabla
      var filas = document.getElementById("ingredients-table").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    
      // Itera sobre cada fila de la tabla
      for (var i = 0; i < filas.length; i++) {
        var nombre = filas[i].getElementsByTagName("td")[0];
    
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
        const filas = document.getElementById("ingredients-table").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
      
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