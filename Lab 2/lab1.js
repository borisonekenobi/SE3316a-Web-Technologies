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
    {location: 'alberta', value: true},
    {location: 'british-columbia', value: true},
    {location: 'manitoba', value: true},
    {location: 'new-brunswick', value: true},
    {location: 'newfoundland', value: true},
    {location: 'nova-scotia', value: true},
    {location: 'ontario', value: true},
    {location: 'prince-edward-island', value: true},
    {location: 'quebec', value: true},
    {location: 'saskatchewan', value: true},
    {location: 'northwest-territories', value: true},
    {location: 'nunavut', value: true},
    {location: 'yukon', value: true},
]

let query = '';

function getOrchids() {
    if (query === '' && locations.every(l => l.value)) {
        const oldContainer = document.getElementById('new-container');
        if (oldContainer) oldContainer.remove();
        return;
    }

    fetch('./orchids.json')
        .then(response => response.json())
        .then(data => {
            let checkedLocations = locations.filter(l => l.value).map(l => l.location);
            let orchids = data
                .filter(o => o.name.toLowerCase().includes(query))
                .filter(o => o.locations.some(l => checkedLocations.includes(l)));

            let newContainer = document.createElement('div');
            newContainer.id = 'new-container';
            newContainer.className = 'container new-container';

            let ul = document.createElement('ul');
            ul.className = 'card-list';

            orchids.forEach(o => {
                let li = document.createElement('li');
                li.className = 'card';
                o.locations.forEach(l => li.classList.add(l))

                let imgDiv = document.createElement('div');
                imgDiv.className = 'card-img';

                let img = document.createElement('img');
                img.alt = o.name;
                img.src = o.img;

                let cardTitle = document.createElement('div');
                cardTitle.className = 'card-title';
                cardTitle.textContent = o.name;

                let locationTitle = document.createElement('h4');
                locationTitle.textContent = 'Locations';

                let locationsUl = document.createElement('ul');
                o.locations.forEach(l => {
                    let locationLi = document.createElement('li');
                    locationLi.textContent = getLocation(l);
                    locationLi.className = `location-chip ${l}`;
                    locationsUl.appendChild(locationLi);
                });

                let locationP = document.createElement('p');
                locationP.textContent = o.locationinfo;

                let otherNamesTitle = document.createElement('h4');
                otherNamesTitle.textContent = 'Other Names';

                let otherNamesUl = document.createElement('ul');
                o.othernames.forEach(n => {
                    let otherNamesLi = document.createElement('li');
                    otherNamesLi.className = 'card-other-title';
                    otherNamesLi.textContent = n;
                    otherNamesUl.appendChild(otherNamesLi);
                });

                let specificHabitatTitle = document.createElement('h4');
                specificHabitatTitle.textContent = 'Specific Habitat';

                let specificHabitatP = document.createElement('p');
                specificHabitatP.textContent = o.specific;

                let floweringSeasonTitle = document.createElement('h4');
                floweringSeasonTitle.textContent = 'Flowering Season';

                let floweringSeasonP = document.createElement('p');
                floweringSeasonP.textContent = o.flowering;

                let descriptionTitle = document.createElement('h4');
                descriptionTitle.textContent = 'Description';

                let descriptionP = document.createElement('p');
                descriptionP.textContent = o.description;

                let commentsTitle = document.createElement('h4');
                commentsTitle.textContent = 'Comments';

                let commentsP = document.createElement('p');
                commentsP.textContent = o.comments;

                let referencesTitle = document.createElement('h4');
                referencesTitle.textContent = 'References';

                let referencesP = document.createElement('p');
                referencesP.textContent = o.references;

                let wikiLink = document.createElement('a');
                wikiLink.href = o.wiki;
                wikiLink.textContent = 'Wikipedia';

                imgDiv.appendChild(img);

                li.appendChild(imgDiv);
                li.appendChild(cardTitle);
                li.appendChild(locationTitle);
                li.appendChild(locationsUl);
                li.appendChild(locationP);
                li.appendChild(otherNamesTitle);
                li.appendChild(otherNamesUl);
                li.appendChild(specificHabitatTitle);
                li.appendChild(specificHabitatP);
                li.appendChild(floweringSeasonTitle);
                li.appendChild(floweringSeasonP);
                li.appendChild(descriptionTitle);
                li.appendChild(descriptionP);
                li.appendChild(commentsTitle);
                li.appendChild(commentsP);
                li.appendChild(referencesTitle);
                li.appendChild(referencesP);
                li.appendChild(wikiLink);

                ul.appendChild(li);
            });

            newContainer.appendChild(ul);

            const container = document.getElementById('container');
            const oldContainer = document.getElementById('new-container');
            if (oldContainer) oldContainer.remove();
            document.body.insertBefore(newContainer, container);
        })
        .catch(error => console.error(error));
}

function getLocation(location) {
    return location.split('-').map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(' ');
}

function search() {
    let searchBox = document.getElementById('searchBox');
    let originalQuery = searchBox.value.toLowerCase();
    query = originalQuery.replace(/[^a-zA-Z]/g, '');
    if (originalQuery !== query) {
        document.getElementById('searchBox').value = query;
        alert('Please enter a valid search query');
        return;
    }
    getOrchids();
}

function checkBoxClicked(checkboxName, checked) {
    locations.find(l => l.location === checkboxName).value = checked;
    getOrchids();
}
