# PlantParent
This is a web application I built / am continuing to build for my father using NodeJS. He wanted an application that could track the growth of his plants, as well as certain other physical/chemical aspects that are involved in plant maintence. I chose a web applcation since it's simplest form of a cross-platform application. Data can be easily accessed by different devices with operating systems on this application, so long as they are able to connect to the internet. For instance, a phone can be used to take a picture of a plant and upload it to the database. A laptop can then be used to add the soil composition used for that plant. For my father's case, he uses Linux as well as Windows, and Linux makes web application deployment both simple and customizable.  

Side note: I built most of this on my time off during work, and since I obviously couldn't download an IDE on company computers, I used an online IDE, you can track my progress before this git repo here https://replit.com/@cybulskm/PlantDadNODEJS.

## Running the app
Simply download the app and run npm install to ensure proper node dependencies are downloaded. 

## Key features

### Data entry tailored to chemistry
Users are able to create notes for the plants that can describe the physical aspects of their plants, or the chemcial attributes of the soil being used.

### Relational database: Plants <- Notes <- Soil Composition
Plants, Notes, and Soil Composition can be added to the database. Notes are appended to a Plant. Soil Composition is appended to a note. 
