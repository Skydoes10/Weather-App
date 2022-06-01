const fs = require("fs");
const axios = require("axios");

class Searches {
  history = [];
  dbPath = "./db/history.json";

  constructor() {
    this.readDB();
  }

  get capitalizedHistory() {
    return this.history.map((city) => {
      let words = city.split(" ");
      words = words.map((word) => word[0].toupperCase() + word.slice(1));
      return words.join(" ");
    });
  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      lang: "en",
    };
  }

  async city(city) {
    try {
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${city}.json`,
        params: this.paramsMapbox,
      });
      const res = await instance.get();
      return res.data.features.map((place) => ({
        id: place.id,
        name: place.place_name,
        lat: place.center[1],
        lon: place.center[0],
      }));
    } catch (error) {
      return [];
    }
  }

  async weather(city) {
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: {
          lat: city.lat,
          lon: city.lon,
          appid: process.env.OPEN_WEATHER_KEY,
          lang: "en",
          units: "metric",
        },
      });
      const res = await instance.get();
      const { main, weather } = res.data;
      return {
        temp: main.temp,
        temp_min: main.temp_min,
        temp_max: main.temp_max,
        desc: weather[0].description,
      };
    } catch (error) {
      return [];
    }
  }

  addHistory(city) {
    if (this.history.includes(city.toLocaleLowerCase())) return;

    this.history = this.history.slice(0, 4);
    this.history.unshift(city.toLocaleLowerCase());
    this.saveDB();
  }

  saveDB() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.history));
  }

  readDB() {
    if (!fs.existsSync(this.dbPath)) return;

    const info = fs.readFileSync(this.dbPath, "utf8");
    const data = JSON.parse(info);
    this.history = data.history;
  }
}

module.exports = Searches;
