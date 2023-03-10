import { saveIngredient, getIngredients, onGetIngredients, deleteIngredient, getIngredient, updateIngredient } from "./firebase.js"

const btnSaveNewIngredient = document.getElementById('btn-save-new-ingredient')
const btnAddNewIngredient = document.getElementById('btn-add-new-ingredient')
const btnDeleteIngredient = document.getElementById('btn-delete-ingredient')
const btnCancelEdit = document.getElementById('btn-cancel-edit')
const btnSaveEdit = document.getElementById('btn-save-edit')
const listaRegistros = document.getElementById('listaRegistros')

let id = '';


//Esto se ejecuta al arrancar la pagina ¿?
window.addEventListener('DOMContentLoaded', () => {
    onGetIngredients((querySnapshot) => {
        listaRegistros.innerHTML = "";
    
        querySnapshot.forEach((doc) => {
          const ingredient = doc.data();
          listaRegistros.innerHTML += `
          <tr>
            <td>${ingredient.name}</td>
            <td>${ingredient.quantity}</td>
            <td>${ingredient.measure}</td>
            <td>${ingredient.grams}</td>
            <td>${ingredient.alert}</td>
            <td>${ingredient.category}</td>
            <td align="center"><button class="btn btn-edit" data-bs-toggle="modal" data-bs-target="#editarModal"><i class="fa-solid fa-pencil btneditar" data-id="${doc.id}"></i></button></td>
            <td align="center"><button class="btn btn-delete" data-bs-toggle="modal" data-bs-target="#eliminarModal"><i class="fa-solid fa-trash btntrash" data-id="${doc.id}"></i></button></td>
          </tr>`
        });

        const btnsDelete = listaRegistros.querySelectorAll(".btntrash");

        btnsDelete.forEach((btn) =>
            btn.addEventListener("click", async (e) => {
                id = e.target.dataset.id;
                Swal.fire({
                    title: 'ELIMINAR REGISTRO',
                    text: "¿Está seguro de eliminar el producto?",
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

        const btnsEdit = listaRegistros.querySelectorAll(".btneditar");

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
                document.getElementById('ingcategoryedit').value = ingredient.category;

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
    document.getElementById('ingcategory').value = '';
})

btnSaveNewIngredient.addEventListener("click", ()=>{
    const name = document.getElementById('ingname').value;
    const quantity = document.getElementById('ingquantity').value;
    const measure = document.getElementById('ingmeasure').value;
    const grams = document.getElementById('inggrams').value;
    const alert = document.getElementById('ingalert').value;
    const category = document.getElementById('ingcategory').value;

    try{
        saveIngredient(name,quantity,measure,grams,alert,category);
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
    document.getElementById('ingcategoryedit').value = '';
})

btnSaveEdit.addEventListener("click", async ()=>{
    const name = document.getElementById('ingnameedit');
    const quantity = document.getElementById('ingquantityedit');
    const measure = document.getElementById('ingmeasureedit');
    const grams = document.getElementById('inggramsedit');
    const alert = document.getElementById('ingalertedit');
    const category = document.getElementById('ingcategoryedit');

    try{
        console.log("lets save edit" + id);
        await updateIngredient(id, {
            name: name.value,
            quantity: quantity.value,
            measure: measure.value,
            grams: grams.value,
            alert: alert.value,
            category: category.value,
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

//Eliminar ingrediente old
/*btnDeleteIngredient.addEventListener("click", async () => {
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
    
})*/

