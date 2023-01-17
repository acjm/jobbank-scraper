const puppeteer = require('puppeteer');
const fs = require('fs/promises');

async function start(){
    // Launch a new browser instance and create a new page
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    // Navigate to the www.jobbank.gc.ca website
    await page.goto("https://www.jobbank.gc.ca/jobsearch/jobsearch?fcid=24789&fcid=25599&fcid=25725&fn=1242&fn=1243&term=administrative+assistant&page=1&sort=D");
    await page.click(".command-result-filter-overlay");
    // Save all the job posts urls on the page to an array
    const jobUrls = await page.evaluate(() => Array.from(document.querySelectorAll('.results-jobs article > a'), article => article.href));
    

    for (let i = 0; i < jobUrls.length; i++) {
        // Visit each job post page
        await page.goto(jobUrls[i]);
        // Show employer's email address
        await page.click("#applynowbutton");
        // Wait for employer's email address to show
        await page.waitForSelector("#howtoapply > p > a");
        
        // Job post data
        const jobTitle =  await page.$eval('span[property=title]', el => el.innerText);
        const location =  await page.$eval('span[property=address]', el => el.innerText);
        const salary =  await page.$eval('span[property=baseSalary]', el => el.parentElement.innerText);
        const responsibilities =  await page.$eval('div[property=responsibilities]', el => el.innerText);
        const experienceRequirements =  await page.$eval('#comparisonchart > p:nth-child(6)', el => el.innerText);
        const emailAddress =  await page.$eval('#howtoapply > p > a', el => el.innerText);
        
        // Output data
        console.log(jobTitle, location, salary, responsibilities, experienceRequirements, emailAddress);
        await fs.writeFile("jbdata.json", JSON.stringify({jobTitle, location, salary, responsibilities, experienceRequirements, emailAddress}), 'utf8');
      }

}

start();