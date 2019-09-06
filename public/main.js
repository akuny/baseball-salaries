(function() {
    
    var state = {
        rawDataset: null,
        transformedDataset: null,
        subset: null,
        isLoading: true,
        selectedYear: '2016',
    };

    d3.dsv(',', 'Salaries.csv')
    .then(function(data) {
        state.dataset = data;
        state.isLoading = false;
        transformData();
        populateYearDropdown();
        state.subset = pullSubset();
        drawChart(state.subset);
    }).catch(function(err) {
        console.error(err);
    });

    d3.select('#yearOptions')
        .on('click', function() {
            if (this.value !== state.selectedYear) {
                state.selectedYear = this.value;
                transformData();
                eraseChart();
                state.subset = pullSubset();
                drawChart(state.subset);
            }
        });

    var populateYearDropdown = function() {
        var dropdown = document.getElementById('yearOptions');
        for (var year = 2016; year >= 1985; year--) {
            var option = document.createElement('option');
            option.text = year;
            option.value = year;
            dropdown.appendChild(option)
        }
    }
 
    var transformData = function() {
        state.transformedDataset = d3.rollup(state.dataset, function(v) {
            return d3.sum(v, function(d) {
                return d.salary;
            });
        }, function(d) {
            return d.yearID;
        }, function(d) {
            return d.teamID;
        });
    }

    var pullSubset = function() {
        var yearData = state.transformedDataset.get(state.selectedYear);

        var mapToArrOfObj = function(map) {
            var array = [];
            map.forEach(function(value, key) {
                array.push({team: key, salary: value})
            })
            return array;
        }

        return mapToArrOfObj(yearData);
    }

    var drawChart = function(data) {

        document.getElementById('title').innerHTML = state.selectedYear + ' MLB Club Wages'

        var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 100
        };
        
        var svg = d3.select('svg');
        var width = +svg.attr('width') - margin.left - margin.right;
        var height = +svg.attr('height') - margin.top - margin.bottom;
        var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


        var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
        var y = d3.scaleLinear().rangeRound([height, 0]);

        x.domain(data.map(function(d) { return d.team; }));

	    y.domain([0, d3.max(data, function(d) {
            return d.salary
        })]);

        g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x));

        g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(y).ticks(11, data.salary))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .attr('text-anchor', 'end')
            .text('salary');
        
        g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', function (d) {
                return x(d.team);
            })
            .attr('y', function (d) {
                return y(d.salary);
            })
            .attr('width', x.bandwidth())
            .attr('height', function (d) {
                return height - y(d.salary);
            })
        ;       
    }

    var eraseChart = function() {
        d3.select('#canvas').selectAll('*').remove();
    }

    // TODO format annual salary for tooltip
    var moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });

    window.onbeforeunload = function() {
        var dropdown = document.getElementById('yearOptions');
        dropdown.value = 2016;
    }

})();
