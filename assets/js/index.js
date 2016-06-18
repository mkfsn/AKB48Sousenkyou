var members = {};
var $modal = $('#member-modal');

var showMemberRecords = function (name) {
  if (!(name in members))
    return;
  window.location.hash = name;

  var member = members[name];
  $('#memberModalLabel').text(name);
  $modal.modal('show');

  var x_categories = Object.keys(member);
  var ranking = {name: '順位', data: [], zIndex: 2};
  var votes = {name: '得票数', type: 'column', yAxis: 1, data: [], zIndex: 1, dataLabels: {enabled: true, inside: true}};
  $.each(member, function (year, res) {
    ranking['data'].push({name: res['rank'], y: res['rank']});
    votes['data'].push({name: res['votes'], y: res['votes']});
  });

  var series = [ranking, votes];
  var options = {
    chart: {
      renderTo: 'modal-container',
      plotBorderWidth: null,
      plotShadow: false,
      type: 'line'
    },
    title: {
      'text': '歴年記録'
    },
    xAxis: {
      categories: x_categories,
      title: {
        text: '年'
      }
    },
    yAxis: [{
      reversed: true,
      title: {
        text: ''
      }
    }, {
      opposite: true,
      title: {
        text: ''
      }
    }],
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true
        }
      }
    },
    series: series
  };

  var chart = new Highcharts.Chart(options);
}


$modal.on('shown.bs.modal', function() {
  var chart = $('#modal-container').highcharts();
  chart.reflow();
});


$modal.on('hide.bs.modal', function() {
  window.location.hash = '';
});


var options = {
  chart: {
    renderTo: 'container',
    type: 'line'
  },
  title: {
    'text': '選抜メンバー'
  },
  xAxis: {
    categories: (function(n){return Array.from(Array(n),(x,i)=> i+1)})(16),
    title: {
      text: '順位'
    }
  },
  yAxis: {
    title: {
      text: '得票数'
    }
  },
  plotOptions: {
    line: {
      dataLabels: {
        enabled: true
      }
    },
    series: {
      events: {
        click: function (e) {
          var name = e['point'].name;
          showMemberRecords(name);
        }
      }
    }
  },
  series: []
};


$(function () {
  $.getJSON('./results.json', function (json) {
    var years = Object.keys(json).sort().reverse();
    var latest_n_years = 3;
    years.forEach(function (year) {
      var data = json[year];
      var results = {name: year, data: []};
      $.each(data, function (rank, person) {
        var name = person['name'], votes = person['votes'];
        var t = ({name: name, y: votes});

        if (!(name in members))
          members[name] = {}
        members[name][year] = {rank: rank + 1, votes: votes};

        // Display only result of latest n year
        if (latest_n_years > 0) {
          latest_n_years--;
        } else {
          results['visible'] = false;
        }

        // Display only senbatsu member
        if (year > 2011 && rank < 16) {
          results['data'].push(t);
        } else if (rank < 12) {
          results['data'].push(t);
        }
      });
      options['series'].push(results);
    });
    var chart = new Highcharts.Chart(options);
  }).done(function () {
    var hash = window.location.hash.split('#')[1];
    if (hash !== undefined) {
      var name = decodeURIComponent(hash);  
      if (name in members) {
        showMemberRecords(name);
      } else {
        console.log(name, members);
      }
    } 
  });
});
