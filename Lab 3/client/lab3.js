const showAllBtn = document.getElementById('show-all');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const results = document.getElementById('results');
const destinationsUl = document.getElementById('destinations');
const sort = document.getElementById('sort');
let resultPage = 0;

function addInfoElement(text, value, parent) {
    const element = document.createElement('p');
    element.innerText = `${text}: ${value}`;
    parent.appendChild(element);
}

function loadInfo(destination, lists) {
    document.getElementById('map').lastChild?.remove();
    const infoDiv = document.getElementById('info');

    new ol.Map({
        target: 'map', layers: [new ol.layer.Tile({
            source: new ol.source.OSM()
        })], view: new ol.View({
            center: ol.proj.fromLonLat([destination.longitude, destination.latitude]), zoom: 10
        })
    });

    while (infoDiv.firstChild) {
        infoDiv.removeChild(infoDiv.firstChild);
    }
    addInfoElement('Destination', destination.destination, infoDiv);
    addInfoElement('Region', destination.region, infoDiv);
    addInfoElement('Country', destination.country, infoDiv);
    addInfoElement('Category', destination.category, infoDiv);
    addInfoElement('Latitude', destination.latitude, infoDiv);
    addInfoElement('Longitude', destination.longitude, infoDiv);
    addInfoElement('Approximate Annual Tourists', destination.annual_tourists, infoDiv);
    addInfoElement('Currency', destination.currency, infoDiv);
    addInfoElement('Majority Religion', destination.religion, infoDiv);
    addInfoElement('Famous Foods', destination.foods, infoDiv);
    addInfoElement('Language', destination.language, infoDiv);
    addInfoElement('Best Time to Visit', destination.best_time_visit, infoDiv);
    addInfoElement('Cost of Living', destination.cost_of_living, infoDiv);
    addInfoElement('Safety', destination.safety, infoDiv);
    addInfoElement('Cultural Significance', destination.cultural_significance, infoDiv);
    addInfoElement('Description', destination.description, infoDiv);

    const selectList = document.createElement('select');
    const addToListBtn = document.createElement('button');

    for (const list of lists) {
        const option = document.createElement('option');
        option.value = list.id;
        option.textContent = list.name;
        selectList.appendChild(option);
    }
    addToListBtn.textContent = 'Add to List';

    addToListBtn.onclick = async () => {
        addToList(selectList.value, destination.id)
            .then(r => {
                if (r.status === 404) alert('List not found');
                else if (r.status === 409) alert('Already in list');
                else alert('Added to list');
            });
    }

    infoDiv.appendChild(selectList);
    infoDiv.appendChild(addToListBtn);
}

async function loadList(listId) {
    const list = await (await getListById(listId)).json();
    showAllBtn.disabled = false;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    results.innerText = `Destinations in "${list.name}" List`;
    sort.disabled = true;
    showDestinations(list.destinations);
}

function showDestinations(destinations) {
    const ul = destinationsUl;
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
    destinations.forEach(destination => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = `${destination.destination}, ${destination.region}, ${destination.country}`;
        button.onclick = async () => loadInfo(destination, (await (await getLists()).json()).lists);
        li.appendChild(button);
        ul.appendChild(li);
    });
}

function showAllDestinations() {
    showAllBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    results.innerText = '';
    sort.disabled = false;
    document.getElementById('search').value = '';
    getDestinations(sort.value).then(async r => showDestinations((await r.json()).destinations));
}

async function createNewList() {
    const name = prompt('Enter list name');
    if (name === null) {
        return;
    }
    const status = (await createList(name)).status;
    if (status === 409) {
        alert('List already exists');
    } else {
        alert('List created');
        getLists().then(async r => showAllLists((await r.json()).lists));
    }
}

function showAllLists(lists) {
    const ul = document.getElementById('lists');
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }

    const li = document.createElement('li');
    const button = document.createElement('button');

    button.textContent = '+ Create New List';
    button.onclick = () => createNewList();

    li.appendChild(button);
    ul.appendChild(li);

    lists.forEach(list => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        const deleteBtn = document.createElement('button');

        button.textContent = list.name;
        button.onclick = async () => {
            await loadList(list.id);
        };
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async () => {
            const status = (await deleteList(list.id)).status;
            if (status === 404) {
                alert('List not found');
            } else {
                alert('List deleted');
                getLists().then(async r => showAllLists((await r.json()).lists));
            }
        }

        li.appendChild(button);
        li.appendChild(deleteBtn);
        ul.appendChild(li);
    });
}

function search() {
    const search = document.getElementById('search');
    const limit = document.getElementById('limit');

    if (search.value === '' && limit.value === 'undefined') {
        showAllDestinations();
        return;
    }

    showAllBtn.disabled = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    results.innerText = '';
    sort.disabled = false;
    const getResults = limit.value === 'undefined' ? undefined : + limit.value + 1;
    searchDestinations(search.value, getResults, resultPage * limit.value, sort.value)
        .then(async r => {
            const destinations = (await r.json()).destinations;
            if (destinations.length > limit.value) {
                nextBtn.disabled = false;
                destinations.pop();
            } else {
                nextBtn.disabled = true;
            }
            showDestinations(destinations);
            const currentResults = destinationsUl.children.length;
            if (resultPage === 0) prevBtn.disabled = true;
            results.innerText = limit.value === 'undefined' ? 'Showing All Results' : `Showing Results: ${resultPage * limit.value + 1} - ${resultPage * limit.value + currentResults}`;
            if (destinations.length === 0) {
                results.innerText = 'No Results Found';
            }
        });
}

async function replaceData(fileData, inputElement) {
    const replace = confirm('Do you want to replace all destination data? This action cannot be undone.');
    if (replace) {
        await updateAllDestinations({data: fileData});
        showAllDestinations();
    }
    inputElement.value = '';
    inputElement.files = null;
}

function readFile(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const reader = new FileReader()
    reader.onload = async (e) => {
        const textContent = e.target.result;
        await replaceData(textContent, inputElement);
    }
    reader.onerror = (e) => {
        const error = e.target.error;
        console.error(`Error occurred while reading ${file.name}`, error);
    }
    reader.readAsText(file);
}

function prevResults() {
    resultPage--;
    search();
}

function nextResults() {
    resultPage++;
    search();
}

function resetResults() {
    resultPage = 0;
    search();
}

showAllDestinations();
getLists().then(async r => showAllLists((await r.json()).lists));
