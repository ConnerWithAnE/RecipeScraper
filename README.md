
### Disclaimer 
This is a web scraper made in 2022 to scrape recipe data from goodto.com. This is in no way associated with the website and was used privately to populate a recipe application for an academic project.

This is in no way intended to be used to plagerize recipes or content and is now only intended to be used as an example. As of now this no longer functions correctly as the site has changed.

## Intent

The intention of this scraper was to get a lumpsum of data to be used within a group project in the form of a recipe app.

Each subsection of the site was searched for every possible recipe. All of the links were then saved to a separate text file. This was done as a precaution as sometimes the script would crash, this way less time was wasted re-checking for recipe links. This is also why progress info was output incase a restart was required from a specific point.

Over 20 different datapoints were collected and saved into a text file separated by pipes ( "|" ). The data was then later inserted into an SQLite database for use within a Java application.
- id: Unique row id
- name
- serves
- skill
- cost
- 5-a-day
- prep time
- cooking time
- makes
- calories
- fat
- saturates
- carbohydrates
- sugars
- protein
- salt
- dietary: This consisted of the dietary catagories, these were later indexed within the database to include
  - Vegetarian
  - Vegan
  - Dairy-Free
  - Gluten-Free
