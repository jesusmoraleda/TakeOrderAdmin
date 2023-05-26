import { saveDrink, onGetDrinks, deleteDrink, getDrink, updateDrink } from "./firebase.js"

const btnSaveNewDrink = document.getElementById('btn-save-new-drink')
const btnAddNewDrink = document.getElementById('btn-add-new-drink')
const btnDeleteDrink = document.getElementById('btn-delete-drink')
const btnCancelEdit = document.getElementById('btn-cancel-edit')
const btnSaveEdit = document.getElementById('btn-save-edit')
const listaBebidas = document.getElementById('listaBebidas')

let id = ''; //Para la edicion
const drinks = [];

//Esto se ejecuta al arrancar la pagina ¿?
window.addEventListener('DOMContentLoaded', () => {

    onGetDrinks((querySnapshot) => {
        listaBebidas.innerHTML = "";
    
        querySnapshot.forEach((doc) => {
          const drink = doc.data();
          drinks.push(drink.name);
          listaBebidas.innerHTML += `
          <tr>
            <td><h5>${drink.name}</h5></td>
            <td><h5>${drink.amount}</h5></td>
            <td><h5>${drink.alert}</h5></td>
            <td align="center"><button class="btn btn-edit" data-bs-toggle="modal" data-bs-target="#editarModal"><i class="fa-solid fa-pencil btneditar" data-id="${doc.id}"></i></button></td>
            <td align="center"><button class="btn btn-delete" data-bs-toggle="modal" data-bs-target="#eliminarModal"><i class="fa-solid fa-trash btntrash" data-id="${doc.id}"></i></button></td>
          </tr>`
        });
        
        // Ordenar la tabla por nombre por defecto
        sortTable(0);
        sortTable(0);
        

        //Botones eliminar bebida
        const btnsDelete = listaBebidas.querySelectorAll(".btntrash");

        btnsDelete.forEach((btn) =>
            btn.addEventListener("click", async (e) => {
                id = e.target.dataset.id;
                Swal.fire({
                    title: 'ELIMINAR BEBIDA',
                    text: "¿Está seguro de eliminar el bebida?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Eliminar',
                    cancelButtonText: 'Cancelar'
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await deleteDrink(id);
                            Swal.fire(
                                'ELIMINAR BEBIDA',
                                'Bebida eliminada con exito"',
                                'success'
                            )
                            id = "";
                        } catch (error) {
                            Swal.fire(
                                'ELIMINAR BEBIDA',
                                '¡Error al eliminar la bebida!',
                                'error'
                            )
                        }
                    }
                  })
            })
        );


        //Botones editar bebidas
        const btnsEdit = listaBebidas.querySelectorAll(".btneditar");

        btnsEdit.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            console.log("He clickado");
            try {
                const doc = await getDrink(e.target.dataset.id);
                const drink = doc.data();

                document.getElementById('drinknameedit').value = drink.name;
                document.getElementById('drinkamountedit').value = drink.amount;
                document.getElementById('drinkalertedit').value = drink.alert;

                id = doc.id;

            } catch (error) {
                console.log(error);
            }
        });
        });

    })
    
    añadirBuscador();

})

//Añadir nueva bebida
btnAddNewDrink.addEventListener("click", ()=>{
    document.getElementById('drinkname').value = '';
    document.getElementById('drinkamount').value = '';
    document.getElementById('drinkalert').value = '';
})

//Guardar bebida
btnSaveNewDrink.addEventListener("click", ()=>{
    const name = document.getElementById('drinkname').value;
    const amount = parseFloat(document.getElementById('drinkamount').value);
    const alert = parseFloat(document.getElementById('drinkalert').value);

    if (!name || amount < 0 || alert < 0) {
        Swal.fire(
            'AÑADIR BEBIDA',
            '¡Por favor, completa todos los campos y asegúrate de que la cantidad y la alerta sean valores positivos!',
            'error'
        );
        return;
    }

    if (nombreExistente(name)) {
        Swal.fire(
            'AÑADIR BEBIDA',
            '¡No puede haber dos bebidas con el mismo nombre!',
            'error'
        );
        return;
    }
    try{
        saveDrink(name,amount,alert);
        Swal.fire(
            'AÑADIR BEBIDA',
            'Bebida añadida con éxito!',
            'success'
        )
    }catch (error) {
        Swal.fire(
            'AÑADIR BEBIDA',
            '¡Error al añadir la bebida!',
            'error'
        )
    }
})

//Cancelar edit de bebida
btnCancelEdit.addEventListener("click", ()=>{
    document.getElementById('drinknameedit').value = '';
    document.getElementById('drinkamountedit').value = '';
    document.getElementById('drinkalertedit').value = '';
})

//Guardar edit de bebida
btnSaveEdit.addEventListener("click", async ()=>{
    const name = document.getElementById('drinknameedit');
    const amount = document.getElementById('drinkamountedit');
    const alert = document.getElementById('drinkalertedit');

    if (!name || amount < 0 || alert < 0) {
        Swal.fire(
            'AÑADIR BEBIDA',
            '¡Por favor, completa todos los campos y asegúrate de que la cantidad y la alerta sean valores positivos!',
            'error'
        );
        return;
    }

    try{
        await updateDrink(id, {
            name: name.value,
            amount: amount.value,
            alert: alert.value,
        });
        id = "";
        Swal.fire(
            'EDITAR BEBIDA',
            '¡Bebida editada con éxito!',
            'success'
        )
    }catch (error) {
        Swal.fire(
            'EDITAR BEBIDA',
            '¡Error al editar la bebida!',
            'error'
        )
    }
})

function nombreExistente(name){
    // Recorrer la lista de bebidas
    for (let i = 0; i < drinks.length; i++) {
        // Comparar el nombre del bebida actual con el nombre del nuevo bebida
        if (drinks[i].toLowerCase() === name.toLowerCase()) {
            // Si encontramos un bebida con el mismo nombre, devolver true
            return true;
        }
    }

    // Si no se encuentra un bebida con el mismo nombre, devolver false
    return false;
}

function añadirBuscador(){
    const buscarInput = document.getElementById('buscarInput');

    buscarInput.addEventListener('input', () => {
      const busqueda = buscarInput.value.toLowerCase();
      // Lógica de búsqueda...
      // Obtiene todas las filas de la tabla
      var filas = document.getElementById("drinks-table").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    
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