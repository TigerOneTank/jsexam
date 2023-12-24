async function getBooks(books) {
    let apikey = `AIzaSyACQhp3RGtJQkzgDCo_avedrC_ijgZ3vXY`
    let url = `https://www.googleapis.com/books/v1/volumes?q=${books}&key=${apikey}`

    try {
        const response = await fetch(url)
        const data = await response.json()

        return data.items
    } catch (error) {
        console.log("Error, Terminated")
    }
}

function displaybooks(data) {



    let items = data

    const bookWrapper = document.querySelector(".book-list")
    bookWrapper.innerHTML = `
    
    `

    for (let i = 0; i < 7; i++ ) {

        let currentItems = items[i]
        //console.log(i,currentItems.volumeInfo.imageLinks)



        bookWrapper.innerHTML += `
        <div class="book">
            <div class="thumbnail">
                <img src="${currentItems.volumeInfo.imageLinks.thumbnail}" alt="Book Thumbnail">
            </div>
            <div class="book-info">
                <h3>${currentItems.volumeInfo.title}</h3>
                <p>Author: ${currentItems.volumeInfo.authors}</p>
                <p>Description: ${currentItems.volumeInfo.description}</p>
            </div>
        </div>
        `
    }



}

window.addEventListener("DOMContentLoaded" , async () => {

    let data = await getBooks("can't hurt me")
    displaybooks(data)

    const searchForm = document.querySelector('#searchForm')
    searchForm.addEventListener('submit' ,async (e) => {
        e.preventDefault()
        const formResults = document.querySelector('#searchTerm')
        let books = formResults.value
        console.log(books)
        let data = await getBooks(books)
        displaybooks(data)

        formResults.value = ``
    })

})



