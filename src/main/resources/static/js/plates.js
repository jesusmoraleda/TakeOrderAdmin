import { savePlate, getPlates, onGetPlates, deletePlate, getPlate, updatePlate, onGetIngredients, getIngredients } from "./firebase.js"

const plateForm = document.getElementById('plates-form')
const platesContainer = document.getElementById('plates-container')

let editStatus = false;
let id = '';

//Esto se ejecuta al arrancar la pagina
window.addEventListener('DOMContentLoaded', async () => {

    onGetPlates((querySnapshot) => {
        platesContainer.innerHTML = "";
    
        querySnapshot.forEach((doc) => {
          const plate = doc.data();
    
          platesContainer.innerHTML += `
            <div class="card card-body mt-2 border-primary">
                <h3 class="h5">${plate.title}</h3>
                <p>ingredientes: ${plate.ingredients}</p>
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

        const btnsDelete = platesContainer.querySelectorAll(".btn-delete");

        btnsDelete.forEach((btn) =>
            btn.addEventListener("click", async ({ target: { dataset } }) => {
                try {
                    await deletePlate(dataset.id);
                } catch (error) {
                    console.log(error);
                }
            })
        );

        const btnsEdit = platesContainer.querySelectorAll(".btn-edit");

        btnsEdit.forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                try {
                    const doc = await getPlate(e.target.dataset.id);
                    const plate = doc.data();
                    plateForm["plate-title"].value = plate.title;
                    plateForm["plate-ingredients"].value = plate.ingredients;

                    editStatus = true;
                    id = doc.id;
                    plateForm["btn-plate-form"].innerText = "Actualizar";
                } catch (error) {
                    console.log(error);
                }
            });
        });

    })

    

})

plateForm.addEventListener('submit', async (e) =>{
    e.preventDefault()

    const title = plateForm['plate-title']
    const ingredients = plateForm['plate-ingredients']

    try {
        if (!editStatus) {
          await savePlate(title.value, ingredients.value);
        } else {
          await updatePlate(id, {
            title: title.value,
            ingredients: ingredients.value,
          });
    
          editStatus = false;
          id = "";
          plateForm["btn-plate-form"].innerText = "Guardar";
        }
    
        plateForm.reset();
        title.focus();
    } catch (error) {
        console.log(error);
    }

    plateForm.reset()
})

  
// Carga la lista de ingredientes desde la base de datos
const ingredienteSelect = plateForm["ingrediente"];

onGetIngredients((querySnapshot) => {

    querySnapshot.forEach((doc) => {
        const ingrediente = doc.data().title;
        const option = document.createElement("option");
        option.text = ingrediente;
        option.value = ingrediente;
        ingredienteSelect.add(option);
        
    });

})


// Obtener el menú desplegable de ingredientes y el campo de entrada de cantidad
const ingrediente = document.getElementById("ingrediente");
const cantidad = document.getElementById("cantidad");

// Agregar un controlador de eventos para el cambio en el menú desplegable de ingredientes
ingrediente.addEventListener("change", () => {
  if (ingrediente.value !== "") {
    cantidad.style.display = "block";
  } else {
    cantidad.style.display = "none";
  }
});