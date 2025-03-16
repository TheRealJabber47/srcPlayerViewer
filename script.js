let gameId = ''; // Store the game ID globally

// Fetch game data and update dropdowns instantly when typing
document.getElementById('gameInput').addEventListener('input', async function () {
    const gameAbbreviation = this.value.trim();
    if (gameAbbreviation.length === 0) {
        // Clear dropdowns if the input is empty
        clearDropdowns();
        return;
    }

    const response = await fetch(`https://www.speedrun.com/api/v1/games?abbreviation=${gameAbbreviation}`);
    const data = await response.json();
    if (data.data.length > 0) {
        gameId = data.data[0].id; // Store the game ID
    } else {
        // Clear dropdowns if no game is found
        clearDropdowns();
        alert('Game not found!');
    }
});

// Fetch levels or categories based on the selected run type (Full Game or Level)
document.getElementById('runTypeSelect').addEventListener('change', async function () {
    const runType = this.value;
    if (!runType || !gameId) return;

    let url;
    if (runType === 'full-game') {
        // Fetch all categories for full game
        url = `https://www.speedrun.com/api/v1/games/${gameId}/categories`;
    } else if (runType === 'level') {
        // Fetch all levels for levels
        url = `https://www.speedrun.com/api/v1/games/${gameId}/levels`;
    }

    const response = await fetch(url);
    const data = await response.json();
    const levelOrCategorySelect = document.getElementById('levelOrCategorySelect');
    levelOrCategorySelect.innerHTML = '<option value="">Select a level or category</option>';
    document.getElementById('variableValues').innerHTML = '<option value="">Select variable value</option>'
    // Populate the second dropdown with levels or categories
    data.data.forEach(item => {
        if (runType === 'full-game') {
            // For full game, only include categories with type 'per-game'
            if (item.type === 'per-game') {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.name;
                levelOrCategorySelect.appendChild(option);
            }
        } else if (runType === 'level') {
            // For levels, include all levels
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            levelOrCategorySelect.appendChild(option);
        }
    });

    // Clear the third and fourth dropdowns when the second dropdown is updated
    document.getElementById('categoryOrSubcategorySelect').innerHTML = '<option value="">Select a category or subcategory</option>';
    document.getElementById('variableSelect').innerHTML = '<option value="">Select a variable</option>';
    document.getElementById('variableValueSelect').innerHTML = '<option value="">Select a variable value</option>';
});

// Fetch categories or subcategories based on the selected level or category
document.getElementById('levelOrCategorySelect').addEventListener('change', async function () {
    const runType = document.getElementById('runTypeSelect').value;
    const levelOrCategoryId = this.value;
    if (!runType || !levelOrCategoryId) {
        document.getElementById('categoryOrSubcategorySelect').innerHTML = '<option value="">Select a category or subcategory</option>';
        document.getElementById('variableValues').innerHTML = '<option value="">Select variable value</option>'

        return;
    }
    document.getElementById('variableValues').innerHTML = '<option value="">Select variable value</option>'
    let url;
    if (runType === 'full-game') {
        // Fetch subcategories for the selected category
        url = `https://www.speedrun.com/api/v1/categories/${levelOrCategoryId}/variables`;
    } else if (runType === 'level') {
        // Fetch categories for the selected level
        url = `https://www.speedrun.com/api/v1/levels/${levelOrCategoryId}/categories`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
        // Handle 404 or other errors
        console.error('Error fetching data:', response.statusText);
        document.getElementById('categoryOrSubcategorySelect').innerHTML = '<option value="">Select a category or subcategory</option>';
        document.getElementById('variableSelect').innerHTML = '<option value="">No variables available</option>';
        document.getElementById('variableValueSelect').innerHTML = '<option value="">Select a variable value</option>';
        return;
    }

    const data = await response.json();
    const categoryOrSubcategorySelect = document.getElementById('categoryOrSubcategorySelect');
    categoryOrSubcategorySelect.innerHTML = '<option value="">Select a category or subcategory</option>';
    
    // Populate the third dropdown with categories or subcategories
    data.data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        categoryOrSubcategorySelect.appendChild(option);
    });
    //clear variable list if it is updated
    // document.getElementById('variableValues').innerHTML = '<option value="">Select variable value</option>'    
});

document.getElementById('categoryOrSubcategorySelect').addEventListener('change', async function () {
    //when variable not selected, clear?
    const categoryOrSubcategoryId = document.getElementById('categoryOrSubcategorySelect').value;
    const levelOrCategoryId = document.getElementById('levelOrCategorySelect').value;
    const runType = document.getElementById('runTypeSelect').value;
    const variableValues = document.getElementById('variableValues');
    if (!levelOrCategoryId || !runType || !categoryOrSubcategoryId) {
        document.getElementById('variableValues').innerHTML = '<option value="">Select variable value</option>'
        return;
    } 
    // document.getElementById('variableValues').innerHTML = '<option value="">Select variable value</option>'

    let url;
    if (runType === 'full-game') {
        url = `https://www.speedrun.com/api/v1/categories/${levelOrCategoryId}/variables`
        const response = await fetch(url);
        const data = await response.json();
        data.data.forEach(item => {
            if (item.id === categoryOrSubcategoryId) {
                for (const [key, value] of Object.entries(item.values.values)) {
                    const option = document.createElement('option');
                    console.log(value.label, key)
                    option.value = key;
                    option.textContent = value.label;
                    variableValues.appendChild(option);
                };
            }
        });
            
    };



});

// Fetch and display the leaderboard when the "Search" button is clicked
async function fetchLeaderboard() {
    const runType = document.getElementById('runTypeSelect').value;
    const levelOrCategoryId = document.getElementById('levelOrCategorySelect').value;
    const categoryOrSubcategoryId = document.getElementById('categoryOrSubcategorySelect').value;
    const variableValue = document.getElementById('variableValues').value;
    if (!runType || !levelOrCategoryId) {
        alert('Please select a run type and level/category!');
        return;
    }

    let url;
    if (runType === 'full-game') {
        // Fetch full game leaderboard
        if (variableValue) {
        url = `https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${levelOrCategoryId}?top=100&var-${categoryOrSubcategoryId}=${variableValue}`;
        console.log(url)
        } else 
            url = `https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${levelOrCategoryId}?top=100`
        if (categoryOrSubcategoryId) {
            url += `&-${categoryOrSubcategoryId}=${categoryOrSubcategoryId}`; // Add subcategory filter
        }
        if (variableId && variableValueId) {
            url += `&-${variableId}=${variableValueId}`; // Add variable value filter
        }
    } else if (runType === 'level') {
        // Fetch level leaderboard
        if (!categoryOrSubcategoryId) {
            alert('Please select a category for the level!');
            return;
        }
        url = `https://www.speedrun.com/api/v1/leaderboards/${gameId}/level/${levelOrCategoryId}/category/${categoryOrSubcategoryId}?top=100&embed=players`;
        if (variableId && variableValueId) {
            url += `&-${variableId}=${variableValueId}`; // Add variable value filter
        }
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        displayLeaderboard(data.data.runs, runType);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        alert('Failed to fetch leaderboard. Please check your selections and try again.');
    }
}

// Helper function to format time from PT55.450S to 0:55.450
function formatTime(isoDuration) {
    // const seconds = parseFloat(isoDuration.replace('PT', '').replace('S', ''));
    // const minutes = Math.floor(seconds / 60);
    // const remainingSeconds = (seconds % 60).toFixed(3); // Keep 3 decimal places for milliseconds
    // return `${minutes}:${remainingSeconds}`;
    const time = (isoDuration.replace('PT', '').replace('S', ' secs').replace('M', ' mins '))
    return time
}

// Display the leaderboard
function displayLeaderboard(runs, runType) {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';
    runs.forEach((run, index) => {
        const runDiv = document.createElement('div');
        runDiv.innerHTML = `
            <span>Position: ${index + 1}</span>
            <span>User: ${run.run.players[0].name}</span>
            <span>Time: ${formatTime(run.run.times.primary)}</span>
            <span>Type: ${runType === 'full-game' ? 'Full Game' : 'Level'}</span>
        `;
        leaderboard.appendChild(runDiv);
    });
}

// Helper function to clear all dropdowns
function clearDropdowns() {
    document.getElementById('runTypeSelect').innerHTML = `
        <option value="">Select run type</option>
        <option value="full-game">Full Game</option>
        <option value="level">Level</option>
    `;
    document.getElementById('levelOrCategorySelect').innerHTML = '<option value="">Select a level or category</option>';
    document.getElementById('categoryOrSubcategorySelect').innerHTML = '<option value="">Select a category or subcategory</option>';
    document.getElementById('variableSelect').innerHTML = '<option value="">Select a variable</option>';
    document.getElementById('variableValueSelect').innerHTML = '<option value="">Select a variable value</option>';
}

// Dark mode toggle
document.getElementById('darkModeToggle').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
});