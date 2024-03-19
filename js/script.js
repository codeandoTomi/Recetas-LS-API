
function inicarApp(){

    const resultado = document.querySelector('#resultado');
    const btnGuardar = document.querySelector('.btnGuardar');
    const btnCerrar = document.querySelector('.btnCerrar');
    const selectCategorias = document.querySelector('#categorias');
    if(selectCategorias){
        selectCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias();
    }

    const favoritosDiv = document.querySelector('.favoritos');
    if(favoritosDiv){
        obtenerFavoritos();
    }


    

    const modal = document.querySelector('#modal');

    // obtenerCategorias();
    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then( respuesta => {
                return respuesta.json()
            })
            .then( resultado => {
                mostrarCategorias(resultado.categories)
            })
    }
    ///////////////////////////////////////////////////////////////////////////////////
    function mostrarCategorias( categorias = [] ){
        // console.log(categorias)
        categorias.forEach( categoria => {
            // console.log(categoria.strCategory)
            const option = document.createElement('OPTION');
            option.value = categoria.strCategory;
            option.textContent = categoria.strCategory;

            selectCategorias.appendChild(option)
        })
    }
    //////////////////////////////////////////////////////////////////////////////////////////
    function seleccionarCategoria(e){
        // console.log(e.target.value); // SELECCIONA LO QUE HAY EN EL SELEC.
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        // console.log(url)
        fetch(url)
            .then( respuesta => {
                return respuesta.json();
            })
            .then( resultado => mostrarRecetas(resultado.meals))
    }
    /////////////////////////////////////////////////////////////////////////////////////////////
    function mostrarRecetas( recetas = [] ){
        limpiarHTML(resultado)

        // console.log(recetas)
        recetas.forEach( receta =>{
            const { idMeal, strMeal, strMealThumb } = receta;

            /////////////// CREAMOS TARJETA/CARD QUE SE VA A MOSTRAR EN EL HTML...... >/()/&%&/////////////
            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('card');

            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('recetaCard');

            const recetaImagen = document.createElement('IMG');
            recetaImagen.classList.add('imgJS');
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`
            recetaImagen.src = strMealThumb ?? receta.img;
            // console.log(recetaImagen)

            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('cardBody');

            const recetaHeading = document.createElement('H5')
            recetaHeading.classList.add('cardH3');
            recetaHeading.textContent = strMeal ?? receta.titulo;
            // console.log(recetaHeading);

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btnJS')
            recetaButton.textContent = 'Ver Receta'
            recetaButton.onclick = function(){ 
                
                recetaSeleccionada(idMeal ?? receta.id);
                const btnModal = document.querySelector('.modal')
                btnModal.classList.add('modal2');

                
                btnCerrar.onclick = () => {
                    btnModal.classList.remove('modal2');
                }
            }
            

            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);
        })
    }
    ///////////////////////////////////////////////////////////////////////////////
    function recetaSeleccionada(id){
        // console.log(id)
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then( respuesta => respuesta.json())
            .then( resultado => mostrarRecetaModal(resultado.meals[0]))
    }
    /////////////////////////////////////////////////////////////////////////////
    function mostrarRecetaModal(receta){
        // console.log(receta);
        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;
        // console.log(receta)
        const contenedorH1 = document.querySelector('.contenedorH1');
        const modalbody = document.querySelector('.modalbody')
        
        contenedorH1.textContent = strMeal;
        modalbody.innerHTML = `
            <img class="imgModal" src="${strMealThumb}" alt="receta-${strMeal}">
            <h3 class="">Instrucciones </h3>
            <p> ${strInstructions} </p>
            <h3 class="">Ingredientes y Cantidades </h3>
        `;
        

        const listUL = document.createElement('UL');
        listUL.classList.add('listULJS');
        for(let i = 1; i <= 20; i++){
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];
                // console.log(`${ ingrediente } - ${ cantidad }`)
                const ingredientesLI = document.createElement('LI');
                ingredientesLI.classList.add('listJS');
                ingredientesLI.textContent = `${ingrediente} - ${cantidad}`

                listUL.appendChild(ingredientesLI);
            }
        }
        modalbody.appendChild(listUL);

        btnGuardar.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';
        btnGuardar.onclick = function(){

            if(existeStorage(idMeal)){
                eliminarFavorito(idMeal);
                btnGuardar.textContent = 'Guardar Favorito'
                mostrarMensaje('Eliminado correctamente..')
                return;
            }

            agregarFavorito({
                id: idMeal,
                titutlo: strMeal,
                img: strMealThumb
            });
            mostrarMensaje('Agregado correctamente..')
            btnGuardar.textContent = 'Eliminar Favorito'
        }

    }
    ////////////////////////////////////////////////////////////////////////////////////////////////
    ////// LOCAL STORAGE /////////////////
    function agregarFavorito(receta){
        // console.log('agregando...')
        // console.log(receta)
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));

    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    function eliminarFavorito(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevoFavorito = favoritos.filter( favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevoFavorito));

    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    function existeStorage(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some( favorito => favorito.id === id);
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////
function obtenerFavoritos(){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    console.log(favoritos);
    if(favoritos.length){
        mostrarRecetas(favoritos)

        return;
    }
    
    const noFavP = document.createElement('P');
    noFavP.classList.add('nofavJS');
    noFavP.textContent = 'No hay favoritos Aun..'
    resultado.appendChild(noFavP)

}

    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function limpiarHTML(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild)
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    function mostrarMensaje(mensaje){
        alert(mensaje)
    }
    
}

document.addEventListener('DOMContentLoaded', inicarApp);