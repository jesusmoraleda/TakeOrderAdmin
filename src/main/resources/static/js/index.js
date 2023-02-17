import { saveIngredient, getIngredients, onGetIngredients, deleteIngredient, getIngredient, updateIngredient } from "./firebase.js"

const ingredientForm = document.getElementById('ingredient-form')
const ingredientsContainer = document.getElementById('ingredients-container')

let editStatus = false;
let id = '';

//Esto se ejecuta al arrancar la pagina ¿?
window.addEventListener('DOMContentLoaded', async () => {

    onGetIngredients((querySnapshot) => {
        ingredientsContainer.innerHTML = "";
    
        querySnapshot.forEach((doc) => {
          const ingredient = doc.data();
    
          ingredientsContainer.innerHTML += `
            <div class="card card-body mt-2 border-primary">
                <h3 class="h5">${ingredient.title}</h3>
                <p>cantidad: ${ingredient.quantity}</p>
                <p>medida: ${ingredient.measure}</p>
                <p>alerta: ${ingredient.alert}</p>
                <div>
                <button class="btn btn-primary btn-delete" data-id="${doc.id}">
                    🗑 Delete
                </button>
                <button class="btn btn-secondary btn-edit" data-id="${doc.id}">
                    🖉 Edit
                </button>
                </div>
            </div>`;
        });

        const btnsDelete = ingredientsContainer.querySelectorAll(".btn-delete");

        btnsDelete.forEach((btn) =>
            btn.addEventListener("click", async ({ target: { dataset } }) => {
                try {
                    await deleteIngredient(dataset.id);
                } catch (error) {
                    console.log(error);
                }
            })
        );

        const btnsEdit = ingredientsContainer.querySelectorAll(".btn-edit");

        btnsEdit.forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                try {
                    const doc = await getIngredient(e.target.dataset.id);
                    const ingredient = doc.data();
                    ingredientForm["ingredient-title"].value = ingredient.title;
                    ingredientForm["ingredient-quantity"].value = ingredient.quantity;
                    ingredientForm["ingredient-measure"].value = ingredient.measure;
                    ingredientForm["ingredient-alert"].value = ingredient.alert;

                    editStatus = true;
                    id = doc.id;
                    ingredientForm["btn-ingredient-form"].innerText = "Actualizar";
                } catch (error) {
                    console.log(error);
                }
            });
        });

    })

    

})

ingredientForm.addEventListener('submit', async (e) =>{
    e.preventDefault()

    const title = ingredientForm['ingredient-title']
    const quantity = ingredientForm['ingredient-quantity']
    const measure = ingredientForm['ingredient-measure']
    const alert = ingredientForm['ingredient-alert']

    try {
        if (!editStatus) {
          await saveIngredient(title.value, quantity.value, measure.value, alert.value);
        } else {
          await updateIngredient(id, {
            title: title.value,
            quantity: quantity.value,
            measure: measure.value,
            alert: alert.value,
          });
    
          editStatus = false;
          id = "";
          ingredientForm["btn-ingredient-form"].innerText = "Guardar";
        }
    
        ingredientForm.reset();
        title.focus();
    } catch (error) {
        console.log(error);
    }

    ingredientForm.reset()
})