let darkBtn = document.querySelector("#darkmode")

let documento = document.querySelector("html")

function alternarmodooscuro(params) {
    documento.classList.toggle("dark")
}

darkBtn.addEventListener("click", alternarmodooscuro)



