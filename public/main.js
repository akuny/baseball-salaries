(function() {

    var year = 2019;
	
    var data = [
        {
            team: 'Red Sox',
            salary: 277454192
        },
        {
            team: 'Cubs',
            salary: 217653335
        },
        {
            team: 'Yankees',
            salary: 217304879
        },
        {
            team: 'Dodgers',
            salary: 200501451
        },
        {
            team: 'Pirates',
            salary: 71358858
        },
        {
            team: 'Rays',
            salary: 62636443
        }
    ];

    var salaries = data.map(function(obj) {
       return  obj.salary;
    } );

    var moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });

    var x = d3.scaleLinear()
        .domain([0, d3.max(salaries)])
        .range([0, 420]);

    document.getElementById('year').innerHTML = year + ' MLB Club Payroll';

    d3.select('.chart')
        .selectAll('div')
            .data(data)
        .enter().append('div')
            .style('width', function(d) {
                return x(d.salary) + 'px';
            })
            .text(function(d) {
                return d.team + ': ' + moneyFormatter.format(d.salary);
            });

})();
