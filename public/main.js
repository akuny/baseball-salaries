(function (d3) {
  // state object
  var state = {
    dataset: null,
    transformedDataset: null,
    subset: null,
    isInit: true,
    isLoading: true,
    selectedYear: "2016",
    selectedOption: "teamByYear",
  };

  // pull in data
  d3.dsv(",", "Salaries.csv")
    .then(function (data) {
      state.dataset = data;
      state.isLoading = false;
      render();
      state.isInit = false;
    })
    .catch(function (err) {
      return console.error(err);
    });

  // event handlers
  d3.select("#formatOptions").on("click", function () {
    if (this.value !== state.selectedOption) {
      var yearPicker = document.getElementById("yearPicker");
      if (
        this.value === "teamByYear" ||
        this.value === "leagueByYear" ||
        this.value === "playerByYear"
      ) {
        yearPicker.style.display = "block";
      }
      if (this.value === "teamAllYears" || this.value === "playerAllYears") {
        yearPicker.style.display = "none";
      }
      state.selectedOption = this.value;
      return render();
    }
  });

  d3.select("#yearOptions").on("click", function () {
    if (this.value !== state.selectedYear) {
      state.selectedYear = this.value;
      return render();
    }
  });

  // render function
  var render = function () {
    transformData(state.selectedOption);
    if (state.isInit) {
      populateYearDropdown();
    } else {
      eraseChart();
    }
    state.subset = pullSubset(state.selectedOption);
    return drawChart(state.subset);
  };

  // functions called by render()
  var populateYearDropdown = function () {
    var dropdown = document.getElementById("yearOptions");
    for (var year = 2016; year >= 1985; year--) {
      var option = document.createElement("option");
      option.text = year;
      option.value = year;
      dropdown.appendChild(option);
    }
  };

  var transformData = function (option) {
    switch (option) {
      case "teamByYear":
        state.transformedDataset = d3.rollup(
          state.dataset,
          function (v) {
            return d3.sum(v, function (d) {
              return d.salary;
            });
          },
          function (d) {
            return d.yearID;
          },
          function (d) {
            return d.teamID;
          }
        );
        break;
      case "leagueByYear":
        state.transformedDataset = d3.rollup(
          state.dataset,
          function (v) {
            return d3.sum(v, function (d) {
              return d.salary;
            });
          },
          function (d) {
            return d.yearID;
          },
          function (d) {
            return d.lgID;
          }
        );
        break;
      case "playerByYear":
        state.transformedDataset = d3.rollup(
          state.dataset,
          function (v) {
            return d3.sum(v, function (d) {
              return d.salary;
            });
          },
          function (d) {
            return d.yearID;
          },
          function (d) {
            return d.playerID;
          }
        );
        break;
      case "playerAllYears":
        state.transformedDataset = d3.rollup(
          state.dataset,
          function (v) {
            return d3.sum(v, function (d) {
              return d.salary;
            });
          },
          function (d) {
            return d.playerID;
          }
        );
        break;
      case "teamAllYears":
        state.transformedDataset = d3.rollup(
          state.dataset,
          function (v) {
            return d3.sum(v, function (d) {
              return d.salary;
            });
          },
          function (d) {
            return d.teamID;
          }
        );
        break;
      default:
      // console.log(option);
    }
  };

  var pullSubset = function (option) {
    var mapToArrOfObj = function (map) {
      var array = [];
      map.forEach(function (value, key) {
        array.push({ team: key, salary: value });
      });
      return array;
    };

    switch (option) {
      case "teamByYear":
      case "leagueByYear":
        var yearData = state.transformedDataset.get(state.selectedYear);
        return mapToArrOfObj(yearData);
      case "playerByYear":
        var yearData = state.transformedDataset.get(state.selectedYear);
        var result = mapToArrOfObj(yearData).sort(function (a, b) {
          return b.salary - a.salary;
        });
        return result.slice(0, 10);
      case "playerAllYears":
        var result = mapToArrOfObj(state.transformedDataset).sort(function (
          a,
          b
        ) {
          return b.salary - a.salary;
        });
        return result.slice(0, 10);
      case "teamAllYears":
        return mapToArrOfObj(state.transformedDataset);
    }
  };

  var drawChart = function (data) {
    var title = document.getElementById("title");

    switch (state.selectedOption) {
      case "teamByYear":
        title.innerHTML = state.selectedYear + " MLB Club Wages";
        break;

      case "leagueByYear":
        title.innerHTML = state.selectedYear + " MLB Wages by League";
        break;

      case "playerByYear":
        title.innerHTML = state.selectedYear + " Top 10 Earners";
        break;

      case "playerAllYears":
        title.innerHTML = "Top 10 Earners: 1985 - 2016";
        break;

      case "teamAllYears":
        title.innerHTML = "Combined Spending by MLB Clubs: 1985 - 2016";
        break;

      default:
        break;
    }

    var margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 100,
    };

    var svg = d3.select("svg");
    var width = +svg.attr("width") - margin.left - margin.right;
    var height = +svg.attr("height") - margin.top - margin.bottom;

    var g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    var y = d3.scaleLinear().rangeRound([height, 0]);

    x.domain(
      data.map(function (d) {
        return d.team;
      })
    );

    y.domain([
      0,
      d3.max(data, function (d) {
        return d.salary;
      }),
    ]);

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(11, data.salary))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("salary");

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        return x(d.team);
      })
      .attr("y", function (d) {
        return y(d.salary);
      })
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        return height - y(d.salary);
      });
  };

  var eraseChart = function () {
    d3.select("#screen").selectAll("*").remove();
  };

  // TODO format annual salary for tooltip
  var moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  window.onbeforeunload = function () {
    return (document.getElementById("yearOptions").value = 2016);
  };
})(d3);
