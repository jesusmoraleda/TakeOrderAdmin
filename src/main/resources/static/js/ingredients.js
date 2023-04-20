import { saveIngredient, getIngredients, onGetIngredients, deleteIngredient, getIngredient, updateIngredient, onGetIngredientsCategories, onGetIngredientsMeasures } from "./firebase.js"

const btnSaveNewIngredient = document.getElementById('btn-save-new-ingredient')
const btnAddNewIngredient = document.getElementById('btn-add-new-ingredient')
const btnDeleteIngredient = document.getElementById('btn-delete-ingredient')
const btnCancelEdit = document.getElementById('btn-cancel-edit')
const btnSaveEdit = document.getElementById('btn-save-edit')
const listaIngredientes = document.getElementById('listaIngredientes')

let id = '';

const categories = [];
const measures = [];


//Esto se ejecuta al arrancar la pagina ¿?
window.addEventListener('DOMContentLoaded', () => {

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
          listaIngredientes.innerHTML += `
          <tr>
            <td>${ingredient.name}</td>
            <td>${ingredient.category}</td>
            <td>${ingredient.quantity}</td>
            <td>${ingredient.grams}</td>
            <td>${ingredient.measure}</td>
            <td>${ingredient.alert}</td>
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
            try {
                const doc = await getIngredient(e.target.dataset.id);
                const ingredient = doc.data();
                console.log(ingredient);
                document.getElementById('ingnameedit').value = ingredient.name;
                document.getElementById('ingquantityedit').value = ingredient.quantity;
                document.getElementById('ingmeasureedit').value = ingredient.measure;
                document.getElementById('inggramsedit').value = ingredient.grams;
                document.getElementById('ingalertedit').value = ingredient.alert;
                document.getElementById('category-select-edit').value = ingredient.category;

                
                const select = document.querySelector('#category-select-edit');
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.textContent = category;
                    select.appendChild(option);
                });

                id = doc.id;
                console.log(id);

            } catch (error) {
                console.log(error);
            }
        });
        });

    })
    
})

//Añadir nuevo ingrediente
btnAddNewIngredient.addEventListener("click", ()=>{
    document.getElementById('ingname').value = '';
    document.getElementById('ingquantity').value = '';
    document.getElementById('ingmeasure').value = '';
    document.getElementById('inggrams').value = '';
    document.getElementById('ingalert').value = '';
    document.getElementById('category-select').selectedIndex = 0;

    /*const select = document.querySelector('#category-select');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.textContent = category;
        select.appendChild(option);
    });*/


})

//Guardar ingrediente
btnSaveNewIngredient.addEventListener("click", ()=>{
    const name = document.getElementById('ingname').value;
    const quantity = parseInt(document.getElementById('ingquantity').value);
    const measure = document.getElementById('ingmeasure').value;
    const grams = parseInt(document.getElementById('inggrams').value);
    const alert = parseInt(document.getElementById('ingalert').value);
    const category = document.getElementById('category-select').value;

    try{
        saveIngredient(name,category,quantity,grams,measure,alert);
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

//Editar ingrediente
btnCancelEdit.addEventListener("click", ()=>{
    console.log("close edit");
    document.getElementById('ingnameedit').value = '';
    document.getElementById('ingquantityedit').value = '';
    document.getElementById('ingmeasureedit').value = '';
    document.getElementById('inggramsedit').value = '';
    document.getElementById('ingalertedit').value = '';
    document.getElementById('category-select-edit').selectedIndex = 0;
})

//Guardar edit de ingrediente
btnSaveEdit.addEventListener("click", async ()=>{
    const name = document.getElementById('ingnameedit');
    const quantity = document.getElementById('ingquantityedit');
    const measure = document.getElementById('ingmeasureedit');
    const grams = document.getElementById('inggramsedit');
    const alert = document.getElementById('ingalertedit');
    const category = document.getElementById('category-select-edit');

    try{
        console.log("lets save edit" + id);
        await updateIngredient(id, {
            name: name.value,
            category: category.value,
            quantity: quantity.value,
            grams: grams.value,
            measure: measure.value,
            alert: alert.value,
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

        document.getElementById('category-select').selectedIndex = 0;

        const select = document.querySelector('#category-select');

        categories.forEach(category => {
            const option = document.createElement('option');
            option.textContent = category;
            select.appendChild(option);
        });
    }
}

function addIngredientsMeasures(querySnapshot){
    if(measures.length < 1){
        querySnapshot.forEach((doc) => {
            const measure = doc.data();
            measures.push(measure.name);
        });

        document.getElementById('measure-select').selectedIndex = 0;

        const select = document.querySelector('#measure-select');

        measures.forEach(measure => {
            const option = document.createElement('option');
            option.textContent = measure;
            select.appendChild(option);
        });
    }
}


