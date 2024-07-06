const puppeteer = require('puppeteer');

const fs = require('fs');
const { rejects } = require('assert');
const { createConnection } = require('net');
const { resolve } = require('path');
const { O_CREAT } = require('constants');
const { resourceUsage } = require('process');
const downloader = require('image-downloader')
const Jimp = require("jimp");

//let finallist = []

//let browser;


async function getRecipeMainPage() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    
    await page.goto("https://www.goodto.com/recipes", {waitUntil: "networkidle2"});

    await new Promise(r => setTimeout(r, 1000));

    let finallist = []

    do {
        const hrefs = await page.evaluate(
            () => Array.from(
                document.querySelectorAll('.listing-entry'),
            a => a.getAttribute('href').match(/^https:\/\/www\.goodto\.com\/recipes\/*/) ? a.getAttribute('href') : null
            )
        );

        hrefs.forEach(e => {
            console.log(e)
            if (e != null) {
                finallist.push(e)
                
            }
        })

        finallist.forEach(r => {
            fs.writeFile('recipelinks-tester.txt', 
                        `${r}\n`, {flag:'a'},
                    (err) => {
                        if (err) throw console.error(err);
                    }
            )
            
        })

        //console.log(finallist);
        console.log(finallist.length)

        const newPage = await page.evaluate( () => 
        document.querySelector('a[title="Next page"]').getAttribute('href'))

        console.log(newPage)

        page.goto(newPage)
        
        await new Promise(r => setTimeout(r, 1000));

    } while (await page.$('a[title="Next page"]') != null)

    

    //.match(/^https:\/\/www\.goodto\.com\/recipes\/(?!tag\/).*/)

    

    console.log(finallist);
    console.log(finallist.length)

    //browser.close()

    //return finallist

    

}

//getRecipeMainPage()

async function getRecipeSubPages() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto("https://www.goodto.com/", {waitUntil: "networkidle2"});

    await new Promise(r => setTimeout(r, 6000));

    let finallist = []

    const hrefs = await page.evaluate(
        () => Array.from(
            document.querySelectorAll('a'),
        a => a.getAttribute('href').match(/^https:\/\/www\.goodto\.com\/recipes\/tag\/*/) ? a.getAttribute('href') : null
        )
    );
    new Promise((resolve, reject) => {
        hrefs.forEach(e => {
            console.log(e)
            if (e != null) {
                let exists = false
                for (let i = 0; i < finallist.length; i++) {
                     if (finallist[i] == e) {
                            exists = true
                            break
                        }
                }
                if (exists == false) {
                    finallist.push(e)
                }
    
            }
        })
        resolve(finallist)
    }).then((result) => {
        result.forEach(e => {
            fs.writeFile('taglinksnew.txt', 
                        `${e}\n`, {flag:'a'},
                    (err) => {
                        if (err) throw console.error(err);
                    }
            )
        })
    })
                    
    
        
            

  
    console.log(finallist);
    //console.log(finallist.length)

    browser.close()

}



totalUnique = 0
totalRecipes = 0
totalchecks = 0

async function getRecipeLinksTotal() {

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    

    

    let finallist = []

    new Promise((resolve, reject) => {
        fs.readFile('tagLinksTest.txt', 'utf8', (err, data) => {
        if (err) reject(err);
    // Sending posts.txt as response
        resolve(data.split('\n'))
        })
    }).then(async (result) => {
        
        for (let i = 0;  i < result.length; i++) {
            await page.goto(result[i], {waitUntil: "networkidle2"});
    
            await new Promise(r => setTimeout(r, 1000));
    
        
    
            do {
                const hrefs = await page.evaluate(
                    () => Array.from(
                        document.querySelectorAll('.listing-entry'),
                    a => a.getAttribute('href').match(/^https:\/\/www\.goodto\.com\/recipes\/(?!tag\/) * /) ? a.getAttribute('href') : null
                    )
                );

    
                hrefs.forEach(e => {
                    //console.log(e)
                    if (e != null) {
                        totalRecipes++
                        let exists = false
                        for (let i = 0; i < finallist.length; i++) {
                            totalchecks++
                            if (finallist[i].split('|')[0] == e.split('|')[0]) {
                                exists = true
                                break
                            }
                        }
                        if (exists == false) {
                            finallist.push(e)
                            totalUnique++
                        }
                        
                    }
                })
    
                //console.log(finallist);
                console.log(`\nTotal Unique: ${totalUnique}`)
                console.log(`Total Recipes: ${totalRecipes}`)
                console.log(`Total Checks: ${totalchecks}\n`)

            
                if (await page.$('a[title="Next page"]') != null) {
                    const newPage = await page.evaluate( () => 
                        document.querySelector('a[title="Next page"]').getAttribute('href')
                    )
    
                    console.log(newPage)
        
                    await page.goto(newPage)
                    
                }
    
                await new Promise(r => setTimeout(r, 500));
    
            } while (await page.$('a[title="Next page"]') != null)
    
        }
        
    }).finally(() => {
        finallist.forEach(r => {
            fs.writeFile('recipeLinksTester.txt', 
                        `${r}\n`, {flag:'a'},
                    (err) => {
                        if (err) throw console.error(err);
                    }
            )
            
        })
        console.log(`\nTotal Unique: ${totalUnique}`)
        console.log(`Total Recipes: ${totalRecipes}`)
        console.log(`Total Checks: ${totalchecks}\n`)
    })
    
    
   
    
    //return finallist

}


async function getRecipeLinks() {
    
    browser = await puppeteer.launch({headless: true});
    

    new Promise((resolve, reject) => {
        fs.readFile('taglinks.txt', 'utf8', (err, data) => {
            if (err) reject(err);
        // Sending posts.txt as response
        resolve(data.split('\n').slice(0, -1))
        })
    }).then((result) => {
        console.log(result)
        for (let i = 0;  i < result.length; i++) {
            console.log(result[i])
            new Promise((resolve, reject) => {
                resolve(getRecipeMainPage(result[i]))
            }).then((res2) => {
                console.log(res2)
            })
            
        }   
    })


    console.log(finallist.length)

    browser.close()
}


function checkDuplicates() {

    let dataAll;
    let dataNew = []
    let ops = 0;

    fs.readFile('recipelinks.txt', 'utf8', (err, data) => {
        if (err) throw err;
    // Sending posts.txt as response
        dataAll = data.split('\n')

        for (let i = 0; i < dataAll.length; i++) {
            let exist = false
            for (let j = 0; j < dataNew.length; i++) {
                ops++
                if (dataAll[i] == dataNew[j]) {
                    exist = true
                }
                console.log(ops)
            }
            if (exist == false) {
                dataNew.push(dataAll[i])
            }
        }
    



    })

    
    dataNew.forEach( e => {
        fs.writeFile('recipelinkschecked.txt', 
                    `${e}\n`, {flag:'a'},
                (err) => {
                    if (err) throw console.error(err);
                }
        )
    })



}


function checkDuplicatesOld() {

    let dataNew;

    let ops = 0

    
    new Promise((resolve, reject) => {
        fs.readFile('recipelinks.txt', 'utf8', (err, data) => {
            if (err) throw err;
        // Sending posts.txt as response
            dataNew = data.split('\n')
    
            resolve(data.split('\n'))
        })
    }).then((result) => {
        //console.log(result.length)
        for (let e = 0; e < result.length; e++) {
            new Promise((resolve, reject) => {

                let exist = false

                fs.readFile('recipelinkschecked.txt', 'utf8', (err, data) => {
                    if (err) throw err;
                // Sending posts.txt as response
                    
                    let newF = data.split('\n')

                    console.log(newF.length)
        
                    for ( let i = 0; i < newF.length; i++) {
                        ops++
                        //console.log(newF[i])
                        //console.log(result[e])
                        if (newF[i] == result[e]) {
                            exist = true;
                            break
                        }
                        //console.log(ops)
                    }

                    resolve(exist)
        

                })

            }).then((res2) => {
                if (res2 == false) {
                    fs.writeFile('recipelinkschecked.txt', 
                            `${result[e]}\n`, {flag:'a'},
                        (err) => {
                            if (err) throw console.error(err);
                        }
                    )
                }
            })

        }
           

        })

    }
    

async function getRecipeSubPages() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto("https://www.goodto.com/", {waitUntil: "networkidle2"});

    await new Promise(r => setTimeout(r, 6000));

    let finallist = []

    const hrefs = await page.evaluate(
        () => Array.from(
            document.querySelectorAll('a'),
        a => a.getAttribute('href').match(/^https:\/\/www\.goodto\.com\/recipes\/tag\/*/) ? a.getAttribute('href') : null
        )
    );
    new Promise((resolve, reject) => {
        hrefs.forEach(e => {
            console.log(e)
            if (e != null) {
                let exists = false
                for (let i = 0; i < finallist.length; i++) {
                     if (finallist[i] == e) {
                            exists = true
                            break
                        }
                }
                if (exists == false) {
                    finallist.push(e)
                }
    
            }
        })
        resolve(finallist)
    }).then((result) => {
        result.forEach(e => {
            fs.writeFile('taglinksnew.txt', 
                        `${e}\n`, {flag:'a'},
                    (err) => {
                        if (err) throw console.error(err);
                    }
            )
        })
    })
                    
    
        
            

  
    console.log(finallist);
    //console.log(finallist.length)

    browser.close()

}


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


async function getRecipeData() {

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    let startTime = Date.now()
    let recipesCollected = 1264
    let imagesSaved = 0
    
    let recipeId = 1264

    new Promise((resolve, reject) => {
        fs.readFile('recipeLinks.txt', 'utf8', (err, data) => {
            if (err) reject(err);

    
            resolve(data.split('\n'))
        })
    }).then(async (result) => {

        
        
        for (let i = 0;  i < result.length; i++) {

            
            console.log(`\n\nLast Recipe: ${result[i-1]}`)
            console.log(`Time Elapsed: ${getTime(startTime, Date.now())}`)
            console.log(`Recipes Logged: ${recipesCollected}\n\n`)
            //console.log(`Images Saved: ${imagesSaved}\n\n`)

            recipesCollected++
            

            await page.goto(result[i], {waitUntil: "networkidle2"});
    
            //await new Promise(r => setTimeout(r, 200));

            await new Promise( async (resolve, reject) => {

                // ID | Name | Serving | Skill | Cost | 5-a-day | Preptime | Cooktime | Makes# | Calories | Fat | SatFat | Carbs | SugarCarbs | Salt | Protein | Diet (Sep by ',') | Ingredients (Sep by '$' ) | Instructions[ Sep by '$' ] | smallDesc

                let line = ``

                // Recipe ID - Start

                const id = recipeId
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
               // Get Image - Start
                /*
                const recipe__image_link = await page.evaluate(
                    () => Array.from(
                        document.querySelectorAll('.image img'),
                        a => a.getAttribute('src') != null ? a.getAttribute('src') : null
                    )
                );
                console.log(recipe__image_link)
                if (recipe__image_link[0] != null) {
                    //let viewSource = await page.goto(recipe__image_link[0])
                    //await new Promise(r => setTimeout(r, 500));
                    fs.writeFile(`./recipeImages/${recipeId}.jpg`, await(await page.goto(recipe__image_link[0], {waitUntil: 'networkidle'})).buffer(), function(err) {
                        if(err) { /*
                            fs.writeFile('recipeErrorLog.log',
                                `Last Recipe: ${result[i-1]}\n`+
                                `Time Elapsed: ${getTime(startTime, Date.now())}\n` +
                                `Recipes Logged: ${recipesCollected}\n` +
                                `Images Saved: ${imagesSaved}\n\n` +
                                `Error: ${err} \n\n`,
                            {flag:'a'},
                                (err) => {
                            if (err) console.error(err);
                                }
                            )
                            
                           console.log(err)
                        } else {
                            imagesSaved++
                        }
            
                    });
                }
                  */  

                // Get Image - Start
                /*--------------------*/

                recipeId++
                resolve(line)

                }).then((result) => {
                    fs.writeFile('recipeData.txt', 
                            `${result}\n`, {flag:'a'},
                        (err) => {
                            if (err) throw console.error(err);
                        }
                    )
                })
            }
            browser.close()           
    })
}


async function getRecipePhotos() {

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    let startTime = Date.now()
    //let recipesCollected = 1264
    let imagesSaved = 3668
    
    let recipeId = 3667

    new Promise((resolve, reject) => {
        fs.readFile('recipeLinks.txt', 'utf8', (err, data) => {
            if (err) reject(err);

    
            resolve(data.split('\n'))
        })
    }).then(async (result) => {

        
        
        for (let i = 0;  i < result.length; i++) {

            console.log(`\n\nLast Recipe: ${result[i-1]}`)
            console.log(`Time Elapsed: ${getTime(startTime, Date.now())}`)
            //console.log(`Recipes Logged: ${recipesCollected}\n\n`)
            console.log(`Images Saved: ${imagesSaved}\n\n`)

            //recipesCollected++
            

            await page.goto(result[i], {waitUntil: "networkidle2"});

            // Get Image - Start
                
                const recipe__image_link = await page.evaluate(
                    () => Array.from(
                        document.querySelectorAll('.image img'),
                        a => a.getAttribute('src') != null ? a.getAttribute('src') : null
                    )
                );
                console.log(recipe__image_link)
                if (recipe__image_link[0] != null) {

                    downloader.image({
                        url: recipe__image_link[0], dest: `/home/conner/School Stuff/CMPT 370/RecipeScraper/recipeImages/${recipeId}.jpg`})

                        /*
                    let viewSource = await page.goto(recipe__image_link[0])
                    await new Promise(r => setTimeout(r, 500));
                    page.on("response", async response => {
                        let url = response.url()
                        if (response.request().resourceType() === 'image') {
                            response.buffer().then(file => {
                                const fileName = url.split('/').pop();
                                //const filePath = path.resolve(__dirname, fileName);
                                const writeStream = fs.createWriteStream(`./recipeImages/${recipeId}.jpg`);
                                writeStream.write(file);
                            });
                        }
                    })

                    */
                    
                    /*
                    fs.writeFile(`./recipeImages/${recipeId}.jpg`, await(await page.goto(recipe__image_link[0], {waitUntil: 'networkidle2'})).buffer(), function(err) {
                        if(err) { 
                            fs.writeFile('recipeErrorLog.log',
                                `Last Recipe: ${result[i-1]}\n`+
                                `Time Elapsed: ${getTime(startTime, Date.now())}\n` +
                                `Recipes Logged: ${recipesCollected}\n` +
                                `Images Saved: ${imagesSaved}\n\n` +
                                `Error: ${err} \n\n`,
                            {flag:'a'},
                                (err) => {
                            if (err) console.error(err);
                                }
                            )
                            
                           console.log(err)
                        } else {
                            imagesSaved++
                        }
            
                    });  
                    */ 
                    imagesSaved++
                }
                recipeId++
            }
           
        })
    }




//checkDuplicates()

//getRecipeLinksTotal()

//getRecipeSubPages()
//getRecipeMainPage()
getRecipePhotos()

/*

Jimp.read(await(await page.goto(recipe__image_link[0], {waitUntil: 'networkidle2'})).buffer(), (err, image) => {
    if (err) console.log(err)
    console.log("Hit")
    image.write("./tempStore/out.jpg")
    fs.writeFile(`./recipeImages/${recipeId}.jpg`, "./tempStore/out.jpg", function(err) {
        if(err) { 
            fs.writeFile('recipeErrorLog.log',
                `Last Recipe: ${result[i-1]}\n`+
                `Time Elapsed: ${getTime(startTime, Date.now())}\n` +
                `Recipes Logged: ${recipesCollected}\n` +
                `Images Saved: ${imagesSaved}\n\n` +
                `Error: ${err} \n\n`,
            {flag:'a'},
                (err) => {
            if (err) console.error(err);
                }
            )
            
           console.log(err)
        } else {
            imagesSaved++
        }

    });   
})
*/
                





    


