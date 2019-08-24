(function() {
	
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
            team: 'Rays',
            salary: 62636443
        }
    ];

    var salaries = function() {
       let a = [];
        data.forEach(function(obj) {
            a.push(obj.salary);
        });
        return a;
    };

    var x = d3.scaleLinear()
        .domain([0, d3.max(salaries())])
        .range([0, 420]);

    d3.select('.chart')
        .selectAll('div')
            .data(salaries())
        .enter().append('div')
            .style('width', function(d) {
                return x(d) + 'px';
            })
            .text(function(d) {
                return d;
            });

})();
