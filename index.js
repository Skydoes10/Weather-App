require("dotenv").config();
const {
  inquirerMenu,
  pause,
  readInput,
  listPlaces,
} = require("./helpers/inquirer");
const Searches = require("./models/searches");

const main = async () => {
  const searches = new Searches();
  let opt;
  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        let city = await readInput("Enter a city name: ");
        const places = await searches.city(city);
        const placeId = await listPlaces(places);
        if (placeId === "0") continue;

        const placeSelected = places.find((p) => p.id === placeId);
        searches.addHistory(placeSelected.name);

        const weather = await searches.weather(placeSelected);

        console.clear();
        console.log("\nInfo about the selected place:\n".green);
        console.log("City:", placeSelected.name.green);
        console.log("Latitude:", placeSelected.lat);
        console.log("Longitude:", placeSelected.lon);
        console.log("Temperature:", weather.temp);
        console.log("Min:", weather.temp_min);
        console.log("Max:", weather.temp_max);
        console.log("Description:", weather.desc.green);
        break;
      case 2:
        searches.capitalizedHistory.forEach((city, id) => {
          let idx = `${id + 1 + "."}`.green;
          console.log(`${idx} ${city}`);
        });
        break;
    }

    if (opt !== 0) await pause();
  } while (opt !== 0);
};

main();
