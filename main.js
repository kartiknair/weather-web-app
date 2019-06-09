window.addEventListener("load", () => {
  let long;
  let lat;
  let temperatureDescription = document.querySelector(
    ".temperature-description"
  );
  let temperatureDegrees = document.querySelector(".temperature-degrees");
  let locationTimezone = document.querySelector(".location-timezone");
  let search = document.querySelector(".search");
  const cities = document.querySelector(".cities");

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      long = pos.coords.longitude;
      lat = pos.coords.latitude;

      const proxy = "https://cors-anywhere.herokuapp.com/";
      const api = `${proxy}https://api.darksky.net/forecast/e7fabe841528df04e830b96cb8c3b25d/${lat},${long}`;
      //   const api = `${proxy}http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=caee21eabb4ab6e8b3cc82fa1d71b8f7`;
      fetch(api)
        .then(response => {
          return response.json();
        })
        .then(data => {
          let { temperature, summary, icon } = data.currently;
          let country, city;
          fetch(`https://api.teleport.org/api/locations/${lat},${long}/`)
            .then(response => {
              return response.json();
            })
            .then(data => {
              let timezone =
                data._embedded["location:nearest-cities"][0]._links[
                  "location:nearest-city"
                ].href;

              fetch(timezone)
                .then(response => {
                  return response.json();
                })
                .then(data => {
                  city = data.name;
                  country = data._links["city:country"].name;
                  locationTimezone.innerHTML = `${city}, ${country}`;
                  temperature = (((temperature - 32) * 5) / 9).toFixed(1);
                  temperatureDescription.innerHTML = summary;
                  temperatureDegrees.innerHTML = `${temperature} &degC`;
                  setIcon(icon, document.getElementById("icon"));
                });
            });
        });
    });
  }

  function setIcon(icon, iconID) {
    const skycons = new Skycons({ color: "white" });
    icon = icon.replace(/-/g, "_").toUpperCase();
    skycons.play();
    return skycons.set(iconID, Skycons[icon]);
  }

  function cityClicked(e, city) {
    fetch(city)
      .then(response => {
        return response.json();
      })
      .then(data => {
        const latitude = data.location.latlon.latitude;
        const longitude = data.location.latlon.longitude;
        fetch(
          `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/e7fabe841528df04e830b96cb8c3b25d/${latitude},${longitude}`
        )
          .then(response => {
            return response.json();
          })
          .then(data => {
            let { temperature, summary, icon } = data.currently;
            let country, city;
            fetch(
              `https://api.teleport.org/api/locations/${latitude},${longitude}/`
            )
              .then(response => {
                return response.json();
              })
              .then(data => {
                let timezone =
                  data._embedded["location:nearest-cities"][0]._links[
                    "location:nearest-city"
                  ].href;

                fetch(timezone)
                  .then(response => {
                    return response.json();
                  })
                  .then(data => {
                    city = data.name;
                    country = data._links["city:country"].name;
                    locationTimezone.innerHTML = `${city}, ${country}`;
                    temperature = (((temperature - 32) * 5) / 9).toFixed(1);
                    temperatureDescription.innerHTML = summary;
                    temperatureDegrees.innerHTML = `${temperature} &degC`;
                    setIcon(icon, document.getElementById("icon"));
                    search.value = "";
                    cities.innerHTML = "";
                  });
              });
          });
      });
  }

  search.oninput = function() {
    if (search.value != "") {
      searchText = search.value.replace(/ /g, "%20").toLowerCase();
      fetch(`https://api.teleport.org/api/cities/?search=${searchText}`)
        .then(response => {
          return response.json();
        })
        .then(data => {
          let citiesNames = data._embedded["city:search-results"];
          cities.innerHTML = "";
          citiesNames.forEach(city => {
            let cityDiv = document.createElement("div");
            cityDiv.classList = "cityList";
            cityDiv.innerHTML = city.matching_full_name;
            cityDiv.addEventListener("click", e =>
              cityClicked(e, city._links["city:item"].href)
            );
            cities.appendChild(cityDiv);
          });
        });
    } else {
      cities.innerHTML = "";
    }
  };
});
