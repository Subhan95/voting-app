$(document).ready(function(){
    var poll = window.location.href.split(window.location.host)[1].split('/')[2]
        console.log(poll);
    $.ajax({
        url: '/polls/api/'+poll,
        type: 'GET',
        success: function(data) {
            getChart(data)
        }
    })

    $("#tweet").click(function(){
        // https://twitter.com/intent/tweet?url=https%3A%2F%2Ffcc-voting-arthow4n.herokuapp.com%2Fpolls%2FkQWfX3rGMkABSZGHc&text=PruebaRR%20%7C%20fcc-voting&original_referer=https://fcc-voting-arthow4n.herokuapp.com/polls/kQWfX3rGMkABSZGHc
        var title = $("#title").html()
        console.log(title);
        var tweet = title+' | '+window.location.href
        var url = 'https://twitter.com/intent/tweet?hashtags=voting&text=' + encodeURIComponent(tweet)
        window.open(url, 'height=200, width=200')
    })
})

function getChart(data) {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart(data));
}

function drawChart(info) {
    setTimeout(function(){
        console.log(info);
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Options');
        data.addColumn('number', 'Votes');
        chartData = []
        for (var i=0;i<info.options.length;i++) {
            chartData.push([info.options[i], info.votes[i]])
        }
        data.addRows(chartData);

        var options = {'title': info.title,
            'width':400,
            'height':300
        };

        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    }, 3000)
}