const puppeteer = require('puppeteer');

const fs = require('fs');
const { rejects } = require('assert');
const { createConnection } = require('net');
const { resolve } = require('path');
const { O_CREAT } = require('constants');
const { resourceUsage } = require('process');


function getTime(startTime, timestamp) {
    const SECOND = 1000
    const MINUTE = 1000 * 60
    const HOUR = 1000 * 60 * 60
    const DAY = 1000 * 60 * 60 * 24
    const MONTH = 1000 * 60 * 60 * 24 * 30
    const YEAR = 1000 * 60 * 60 * 24 * 30 * 12

    let elapsed = timestamp - startTime
    let returnt = ``;
    /*
    if (elapsed >= MONTH) {
        let t = Math.floor(elapsed / MONTH)
        elapsed - (t * MONTH)
        returnt += `${t}mo `;
    }
    if (elapsed >= DAY) {
        let t = Math.floor(elapsed / DAY)
        elapsed - (t * DAY)
        returnt += `${t}d `;
    }
    */
    if (elapsed >= HOUR) {
        let t = Math.floor(elapsed / HOUR)
        elapsed -= (t * HOUR)
        returnt += `${t}h `;
    }
    if (elapsed >= MINUTE) {
        let t = Math.floor(elapsed / MINUTE)
        elapsed -= (t * MINUTE)
        returnt += `${t}m `;
    }
    if (elapsed >= SECOND) {
        let t = Math.floor(elapsed / SECOND)
        elapsed -= (t * SECOND)
        returnt += `${t}s `;
    }
   
    return returnt
}

async function getRecipeDataNode(recipeList, nodeNum, browser) {

    //const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

            
    

    for (let i = 0;  i < recipeList.length; i++) {

        console.log(`\n\nNode: ${nodeNum}`)
        console.log(`\n\nLast Recipe: ${lastRecipe}`)
        console.log(`Time Elapsed: ${getTime(startTime, Date.now())}`)
        console.log(`Recipes Logged: ${recipesCollected}\n\n`)

        await page.goto(recipeList[i], {waitUntil: "networkidle2"});

    //await new Promise(r => setTimeout(r, 200));

        await new Promise( async (resolve, reject) => {

            // ID | Name | Serving | Skill | Cost | 5-a-day | Preptime | Cooktime | Makes# | Calories | Fat | SatFat | Carbs | SugarCarbs | Salt | Diet (Sep by ',') | Ingredients (Sep by '$' ) | Instructions[ Sep by '$' ], smallDesc

            let line = ``

            // Recipe ID - Start

            const id = recipeId
            recipeId++
            line += `${id}|`

            // Recipe ID - End
            /*--------------------*/
            // Recipe Name - Start

            const name = await page.evaluate( () => document.querySelector('.title-primary').innerText)
            line += `${name}|`

            // Recipe Name - End
            /*--------------------*/
            // Card Item - Start

            let cardItem = {}

            const recipe__card_item = await page.evaluate(
                () => {
                    return Array.from(
                    document.querySelectorAll('.recipe__card-item'),
                    a => a.querySelector('td:nth-child(2)') != null ? a.querySelector('td:nth-child(2)').innerText : "")
                    .map((obj, index) => {
                        let myobj = {};
                        myobj[Array.from(
                            document.querySelectorAll('.recipe__card-item'),
                            a => a.querySelector('td:nth-child(1)') != null ? a.querySelector('td:nth-child(1)').innerText : "")[index]] = obj;
                    return myobj})
            });

            recipe__card_item.forEach(e => {
                if (Object.values(e)[0] != "") {
                    cardItem[Object.keys(e)[0]] = Object.values(e)[0]
                }
            })

            line += (`${cardItem["Serves:"] != null ? cardItem["Serves:"] : "N/A"}` +
                    `|${cardItem["Skill:"] != null ? cardItem["Skill:"] : "N/A"}` +
                    `|${cardItem["Cost:"] != null ? cardItem["Cost:"] : "N/A"}` +
                    `|${cardItem["5-A-Day:"] != null ? cardItem["5-A-Day:"] : "N/A"}` +
                    `|${cardItem["Prep:"] != null ? cardItem["Prep:"] : "N/A"}` +
                    `|${cardItem["Cooking:"] != null ? cardItem["Cooking:"] : "N/A"}` +
                    `|${cardItem["Makes:"] != null ? cardItem["Makes:"] : "N/A"}|`)

            // Card Item - End
            /*--------------------*/
            // Recipe Nutrition - Start
            
            let nutritionItem = {}

            const recipe__nutrition_item = await page.evaluate(
                () => {
                    return Array.from(
                    document.querySelectorAll('.recipe__nutrition table tbody tr'),
                    a => a.querySelector('td:nth-child(2)') != null ? a.querySelector('td:nth-child(2)').innerText : "")
                    .map((obj, index) => {
                        let myobj = {};
                        myobj[Array.from(
                            document.querySelectorAll('.recipe__nutrition table tbody tr'),
                            a => a.querySelector('td:nth-child(1)') != null ? `${a.querySelector('td:nth-child(1)').innerText}` : "")[index]] = obj;
                    return myobj})
            });

            recipe__nutrition_item.forEach(e => {
                if (Object.values(e)[0] != "") {
                    nutritionItem[Object.keys(e)[0]] = Object.values(e)[0]
                }
            })
        


            line += (`${nutritionItem['Calories'] != null ? nutritionItem['Calories'] : "N/A"}` +
            `|${nutritionItem['Fat'] != null ? nutritionItem['Fat'] : "N/A"}` +
            `|${nutritionItem['  -  Saturates'] != null ? nutritionItem['  -  Saturates'] : "N/A"}` +
            `|${nutritionItem['Carbohydrates'] != null ? nutritionItem['Carbohydrates'] : "N/A"}` +
            `|${nutritionItem['  -  of which Sugars'] != null ? nutritionItem['  -  of which Sugars'] : "N/A"}` +
            `|${nutritionItem['Protein'] != null ? nutritionItem['Protein'] : "N/A"}` +
            `|${nutritionItem['Salt'] != null ? nutritionItem['Salt'] : "N/A"}|`)

            // Recipe Nutrition - End
            /*--------------------*/        
            // Recipe Dietary - Start

            const recipe__dietary_item = await page.evaluate(
                () => {
                    return Array.from(
                    document.querySelectorAll('.recipe__dietary li'),
                    a => a.innerText != null ? a.innerText : "")
            });

            line += `${recipe__dietary_item}|`

            // Recipe Dietary - End
            /*--------------------*/
            // Ingredients - Start

            const recipe__ingredients_item = await page.evaluate(
                () => {
                    return Array.from(
                    document.querySelectorAll('.recipe__ingredients-list li'),
                    a => a.innerText != null ? a.innerText : "")
            });

            for (let i = 0; i < recipe__ingredients_item.length-1; i++) {
                line += `${recipe__ingredients_item[i]}$`
            }
            line += `${recipe__ingredients_item[recipe__ingredients_item.length-1]}|`

            // Ingredients - Start
            /*--------------------*/
            // Instructions - Start

            const recipe__method_item = await page.evaluate(
                () => {
                    return Array.from(
                    document.querySelectorAll('.recipe__method-list li'),
                    a => a.querySelector('p') != null ? a.querySelector('p').innerText : "")
            });

            
            for (let i = 0; i < recipe__method_item.length-1; i++) {
                line += `${recipe__method_item[i]}$`
            }
            line += `${recipe__method_item[recipe__method_item.length-1]}|`

            // Instructions - End
            /*--------------------*/
            // Small Desc - Start

            const recipe__snippet_item = await page.evaluate(
                () => {
                    return Array.from(
                    document.querySelectorAll('.articleBody'),
                    a => a.querySelector('p') != null ? a.querySelector('p').innerText : "")
            });


            line += `${recipe__snippet_item[0] != null ? recipe__snippet_item[0].match(/^.*?[\.!\n]|$/)[0] : "N/A"}`

            // Small Desc - End
            /*--------------------*/

            resolve(line)

            }).then((result) => {
                fs.writeFile('recipeDataPTest.txt', 
                        `${result}\n`, {flag:'a'},
                    (err) => {
                        if (err) throw console.error(err);
                    }
                )
                
        })
        lastRecipe = recipeList[i]
    }
}

let startTime = Date.now()
let recipesCollected = 0
let lastRecipe = ""
let lastNode

let recipeId = 0


function getRecipeDataNodeRun(chunk_size) {


    new Promise((resolve, reject) => {
        fs.readFile('recipeLinks.txt', 'utf8', (err, data) => {
            if (err) reject(err);

            let index = 0
            let myArray = data.split('\n');
            let arrayLength = myArray.length
            let tempArray = []

            for (index = 0; index < arrayLength; index += chunk_size) {
                myChunk = data.slice(index, index+chunk_size);
                // Do something if you want with the group
                tempArray.push(myChunk);
            }


            
            resolve(tempArray)

        })
    }).then((result) => {
        let browserArray = []
        new Promise( async (resolve, reject) => {
            
            for (let b = 0; b < result.length; b++) {
                let b = await puppeteer.launch({headless: true})
                browserArray.push(b)
            }
            resolve(browserArray)
        }).then(async (result2) => {
            
            getRecipeDataNode(result[0], result2[0])
            getRecipeDataNode(result[1], result2[1])
            getRecipeDataNode(result[2], result2[2])
            getRecipeDataNode(result[3], result2[3])
            getRecipeDataNode(result[4], result2[4])
            
            
                
        })
            
        browserArray.forEach(e => {
            e.close()
        })

    })
        
}


getRecipeDataNodeRun(5)