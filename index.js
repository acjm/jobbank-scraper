

const puppeteer = require('puppeteer');

const url = 'https://www.jobbank.gc.ca/jobsearch/jobsearch?fcid=24789&fcid=25599&fcid=25725&fn=1242&fn=1243&term=administrative+assistant&page=1&sort=D';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // Get all job links
  let links = await page.evaluate(() => {
    const listings = Array.from(document.querySelectorAll('.resultJobItem'));
    return listings.map(listing => listing.href);
  });
  // check if there's a load more button
  let loadMoreButton = await page.$('#moreresultbutton');
  let jobCounter = links.length; 
  /**
   * If there's a load more button, click it and wait for the new jobs to load
   * 20 because loads infinite jobs, this take a long time to load
   * think of a cron job to get the jobs every 24 hours
   * 
   */
   while (loadMoreButton && jobCounter < 20) {
    // wait for the button to be clickable
    await page.waitForSelector('#moreresultbutton', {visible: true});
    // check if the button is disabled
    const isDisabled = await page.evaluate(() => {
      return document.querySelector("#moreresultbutton").disabled;
    });
    
    if (!isDisabled) {
      await loadMoreButton.click();
      // wait for new jobs to load
      await page.waitForSelector('.job-listing', { timeout: 5000 });
      // get new links after loading more jobs
      let newLinks = await page.evaluate(() => {
        const listings = Array.from(document.querySelectorAll('.resultJobItem'));
        return listings.map(listing => listing.href);
      });
      links = links.concat(newLinks);
      jobCounter = links.length;
    }
    loadMoreButton = await page.$('#moreresultbutton');
  }

  links = links.slice(0, 20);

  console.log(links);
  // For each link, go to the job details page, scrape the data and log it
  for (let link of links) {
    await page.goto(link);
    const jobDetails = await page.evaluate(() => {
        /**
         * Scrape the data from the page
         * @return {Object} job details
         * 
         * You can use any selector you want to get the data from the page
         */
        return {
         title: document.querySelector('h1#wb-cont span:first-child').innerText,
        };
    });

    console.log(jobDetails);
    /***
     * Save the job details to a database/json or csv file || whatever you want :D 
     */
  }

  await browser.close();
})();
