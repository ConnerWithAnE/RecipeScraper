
const fs = require('fs');

let allData = []

fs.readFile('OldData/recipeData-Failed.txt', 'utf8', (err, data) => {
    if (err) reject(err);


    allData = data.split('\n')

    allData.forEach(e => {
        console.log(e.split('|')[14])
    });
    
})


