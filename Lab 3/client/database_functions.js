const apiHost = 'http://localhost:3000';

async function createDestination(destination) {
    return await fetch(`${apiHost}/api/destinations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(destination)
    });
}

async function getDestinations(sort) {
    const url = new URL(`${apiHost}/api/destinations`);
    if (sort) url.searchParams.append('sort', sort);

    return await fetch(url);
}

async function searchDestinations(search, limit, offset, sort) {
    const url = new URL(`${apiHost}/api/destinations/search`);
    if (search) url.searchParams.append('search', search);
    if (limit) url.searchParams.append('limit', limit);
    if (offset) url.searchParams.append('offset', offset);
    if (sort) url.searchParams.append('sort', sort);

    return await fetch(url);
}

async function getDestinationById(id) {
    return await fetch(`${apiHost}/api/destinations/${id}`);
}

async function updateDestination(destination) {
    return await fetch(`${apiHost}/api/destinations`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(destination)
    });
}

async function updateAllDestinations(destinations) {
    return await fetch(`${apiHost}/api/destinations`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(destinations)
    });
}

async function deleteDestination(id) {
    return await fetch(`${apiHost}/api/destinations/${id}`, {
        method: 'DELETE'
    });
}

async function createList(listName) {
    return await fetch(`${apiHost}/api/lists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: listName})
    });
}

async function getLists() {
    return await fetch(`${apiHost}/api/lists`);
}

async function getListById(id) {
    return await fetch(`${apiHost}/api/lists/${id}`);
}

async function updateList(list) {
    return await fetch(`${apiHost}/api/lists`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(list)
    });
}

async function addToList(listId, destinationId) {
    return await fetch(`${apiHost}/api/lists/${listId}/${destinationId}`, {
        method: 'POST'
    });
}

async function deleteList(id) {
    return await fetch(`${apiHost}/api/lists/${id}`, {
        method: 'DELETE'
    });
}

async function deleteFromList(listId, destinationId) {
    return await fetch(`${apiHost}/api/lists/${listId}/${destinationId}`, {
        method: 'DELETE'
    });
}
