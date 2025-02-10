const names = [
    'Amerorchis rotundifolia',
    'Aplectrum hyemale',
    'Arethusa bulbosa',
    'Calopogon tuberosus',
    'Calypso bulbosa',
    'Cephalanthera austinae',
    'Coeloglossum viride var. virescens',
    'Corallorhiza maculata',
    'Corallorhiza mertensiana',
    'Corallorhiza odontorhiza',
    'Corallorhiza striata',
    'Corallorhiza trifida',
    'Cypripedium acaule',
    'Cypripedium arietinum',
    'Cypripedium candidum'
]

const locations = [
    'Newfoundland',
    'New Brunswick',
    'Quebec',
    'Ontario',
    'Manitoba',
    'Saskatchewan',
    'Alberta',
    'British Columbia',
    'Yukon',
    'Northwest Territories',
    'Nova Scotia',
    'Prince Edward Island'
]

function keyClicked(e) {
    if (e.key === 'Enter') search()
}

function searchClicked() {
    search();
}

function search() {
    let query = document.getElementById('searchBox').value.replace(/[^a-zA-Z]/g, '');

    let n = names.filter(n => n.toLowerCase().includes(query.toLowerCase())).slice(0, 5).join(', ');
    if (n.length !== 0)
        alert(`Found: ${n}`);
    else
        alert(`Found no orchids`);
}

function selectFilter(filterBtn) {
    let label = document.querySelector(`label[for=${filterBtn.id}]`);

    let cards = Array.from(document.getElementsByClassName(`card ${filterBtn.id}`)).map(el => el.id).join(', ');
    if (cards.length !== 0)
        alert(`Found ${cards} in ${label.innerText}`);
    else
        alert(`Found no orchids in ${label.innerText}`);
}

function filterBtnClick(e) {
    const container = document.getElementById("filter-container");
    e.stopPropagation();
    if (container.classList.contains("filters-active")) {
        container.classList.remove("filters-active");
    } else {
        container.classList.add("filters-active");
    }
}

function containerClick(e) {
    e.stopPropagation();
}

window.onclick = function () {
    const container = document.getElementById("filter-container");
    container.classList.remove("filters-active");
};
