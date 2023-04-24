import {onGetPlatesByCategory} from "./firebase.js"

const entrantes_table = document.getElementById('entrantes_table');
const primeros_table = document.getElementById('primeros_table');
const segundos_table = document.getElementById('segundos_table');
const postres_table = document.getElementById('postres_table');
const menu_primeros = document.getElementById('menu_primeros_container');
const menu_segundos = document.getElementById('menu_segundos_container');
const menu_postres = document.getElementById('menu_postres_container');


//Esto se ejecuta al arrancar la pagina
window.addEventListener('DOMContentLoaded', async () => { 

    onGetPlatesByCategory("Primer plato", (querySnapshot) => {
        if (querySnapshot.size === 0) {
            return; // No hay resultados, no hacemos nada
        }
        primeros_table.innerHTML = "";
      
          querySnapshot.forEach((doc) => {
    
            const plate = doc.data();
    
            primeros_table.innerHTML += `
            <tr>
                <td><h5>${plate.name}</h5></td>
                <td class="btn-cell"><button class="btn btn-default"><i class="fa-solid fa-plus btnadd" data-id="${plate.name}"></i></button></td>
                <td width="10%" class="btn-cell"><button class="btn btn-default"><i class="fa-solid fa-minus btntrash" data-id="${plate.name}"></i></button></td>
            </tr>`
            
        });

        //Botones añadir platos
        const btnAddPrimeros = primeros_table.querySelectorAll(".btnadd");

        btnAddPrimeros.forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const platename = e.target.dataset.id;

                const menuItem = document.createElement("div");
                menuItem.innerHTML = `
                    <p data-id="${platename}">${platename}</p>
                `;

                menu_primeros.appendChild(menuItem);

                //Desactivar boton añadir
                btn.disabled = true;

                //Activar boton eliminar

            });
        });

        //Botones eliminar platos 
        const btnTrashPrimeros = primeros_table.querySelectorAll(".btntrash");

        btnTrashPrimeros.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const plateName = e.target.dataset.id;
                const menuItem = menu_primeros.querySelector(`[data-id="${plateName}"]`);
                menuItem.remove();

                //Activar boton añadir

                //Desactivar boton eliminar
            });
        });
    }) 
    onGetPlatesByCategory("Segundo plato", (querySnapshot) => {
        if (querySnapshot.size === 0) {
            return; // No hay resultados, no hacemos nada
        }
        segundos_table.innerHTML = "";
      
          querySnapshot.forEach((doc) => {
    
            const plate = doc.data();
    
            segundos_table.innerHTML += `
            <tr>
                <td><h5>${plate.name}</h5></td>
                <td class="btn-cell"><button class="btn btn-default"><i class="fa-solid fa-plus btnadd" data-id="${plate.name}"></i></button></td>
                <td width="10%" class="btn-cell"><button class="btn btn-default"><i class="fa-solid fa-minus btntrash" data-id="${plate.name}"></i></button></td>
            </tr>`
            
        });

        //Botones añadir platos
        const btnAddSegundos = segundos_table.querySelectorAll(".btnadd");

        btnAddSegundos.forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const platename = e.target.dataset.id;

                const menuItem = document.createElement("div");
                menuItem.innerHTML = `
                    <p data-id="${platename}">${platename}</p>
                `;

                menu_segundos.appendChild(menuItem);

                //Desactivar boton añadir
                btn.disabled = true;
                console.log(btn);

                //Activar boton eliminar

            });
        });

        //Botones eliminar platos 
        const btnTrashSegundos = segundos_table.querySelectorAll(".btntrash");

        btnTrashSegundos.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const plateName = e.target.dataset.id;
                const menuItem = menu_segundos.querySelector(`[data-id="${plateName}"]`);
                menuItem.remove();

                //Activar boton añadir

                //Desactivar boton eliminar
            });
        });
    }) 
    onGetPlatesByCategory("Postre", (querySnapshot) => {
        if (querySnapshot.size === 0) {
            return; // No hay resultados, no hacemos nada
        }
        postres_table.innerHTML = "";
      
          querySnapshot.forEach((doc) => {
    
            const plate = doc.data();
    
            postres_table.innerHTML += `
            <tr>
                <td><h5>${plate.name}</h5></td>
                <td class="btn-cell"><button class="btn btn-default"><i class="fa-solid fa-plus btnadd" data-id="${plate.name}"></i></button></td>
                <td width="10%" class="btn-cell"><button class="btn btn-default"><i class="fa-solid fa-minus btntrash" data-id="${plate.name}"></i></button></td>
            </tr>`
            
        });

        //Botones añadir platos
        const btnAddPostres = postres_table.querySelectorAll(".btnadd");

        btnAddPostres.forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const platename = e.target.dataset.id;

                const menuItem = document.createElement("div");
                menuItem.innerHTML = `
                    <p data-id="${platename}">${platename}</p>
                `;

                menu_postres.appendChild(menuItem);

                //Desactivar boton añadir
                btn.disabled = true;
                console.log(btn);

                //Activar boton eliminar

            });
        });

        //Botones eliminar platos 
        const btnTrashPostres = postres_table.querySelectorAll(".btntrash");

        btnTrashPostres.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const plateName = e.target.dataset.id;
                const menuItem = menu_postres.querySelector(`[data-id="${plateName}"]`);
                menuItem.remove();

                //Activar boton añadir

                //Desactivar boton eliminar
            });
        });
    })    

    

})


