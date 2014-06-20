/* Burglar's Dilemma: interactive lesson of Knapsack Problem 
Allows users to pick which items they want to steal (images taken from flickr)
Displays how much of user's knapsack is filled on a neighboring pie chart
Saves interaction state when user refreshes the page 
Starts game over (with new items) when user presses a button
Plays background sounds and other sound effects */

//checks to see how page should be initialized
//determines if local storage should be used or not
function pageInitialization(){  
    var totalWeight = 0;
    var totalValue = 0;
    //if not the first time opening page or not following a start-over click
    if (localStorage.getItem('ifStorage') == 'yes') {   
        //check if local storage should be restored for each DOM and make sure DOM's properties are correct      
        var sackData = localStorage.getItem('sack');
        var houseData = localStorage.getItem('house');
        var chartData = localStorage.getItem('chart');
        if (sackData) {
            $('#sack').html(sackData);
            $('.item').attr("style","")
                      .css("display", "inline-block");   
            //calculate total weight and total value of objects in sack to restore display
            $.each($('.item img'), function() { 
                if ($(this).attr("data-location") == "sack") {
                    totalWeight += parseInt($(this).attr("data-weight"));
                    totalValue += parseInt($(this).attr("data-value")); 
                }
             });
        }
        if (houseData) {
            $('#house').html(houseData);
            $('.item').attr("style","")
                      .css("display", "inline-block");   
        } 
        if (chartData) {
            $('#chart').html(chartData);
        } 
        $('#weight').html(totalWeight);
        $('#value').html(totalValue);
    }
    //first time loading page or following a start-over click
    else {
            //prompt users to choose what they would like to steal
            var chosenItem = prompt("Please enter what you would like to steal: ","default");
            if (chosenItem != null) {
               loadItems(chosenItem); }  
    }
    //to be used in main function
    return[totalWeight, totalValue];
};

//updates the local storage of all the html on the page that may be changed
function updateLocalStorage() {
    function saveElement(object) {
        //save the object id's html
        var objectHTML = $('#'+object).html();
        localStorage.setItem(object, objectHTML);
    };
    saveElement("sack");
    saveElement("house");
    saveElement("chart");
};

//if in "house" itemBox (left), move to "sack" itemBox (right) and vice versa
function moveItem(item) { 
    if (item.attr("data-location") == "house") {
        item.attr("data-location","sack");
        //display item in new itemBox with animation
        var new_item = $(item.parent()).hide();
        $('#sack').append(new_item);
        new_item.show("slow");
    }
    else{
        item.attr("data-location","house");
        //display item in new itemBox with animation
        var new_item = $(item.parent()).hide();
        $('#house').append(new_item);
        new_item.show("slow");
    }
};


//check whether totalWeight is still under maximum weight of knapsack after new item possibly moved
function canAddToTotal(weight, totalWeight) {
    return (totalWeight + weight <=  parseInt($('.knapsack').attr("data-maxweight")));   
};


//a tasteful alert alerting the user that they have exceeded the knapsack capacity
function tastefulAlert() {
    //classic failure noise
    //from http://www.youtube.com/watch?v=iMpXAknykeg
    var audio = new Audio('SadTrombone.mp3');
    audio.play();
    $('.alert').animate({opacity: 1}, 1500);
    $('.alert').animate({opacity: 0}, 1500);
};


//d3 pie chart of knapsack contents (how much room left/how much already filled)
function updatePieChart(totalWeight){
    //used to fill in pie chart
    var maxWeight = parseInt($('.knapsack').attr("data-maxweight"));
    var dataset = [totalWeight, maxWeight- totalWeight];
    var labels = [' kg used', ' kg available'];

    var pie = d3.layout.pie();
    var color = d3.scale.ordinal()
                        .range(["red", "gray"]);
    
    //set pie chart dimensions
    var width = 348;
    var height = 348;
    var outerRadius = width / 2;
    var innerRadius = 0;
    var arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius);
    
    //update the chart from last move of user
    $("#chart").html("");
    var svg = d3.select('#chart')
                .append("svg")
                .attr("width", width)
                .attr("height", height);
    
    //set up groups
    var arcs = svg.selectAll("g.arc")
            .data(pie(dataset))
            .enter()
            .append("g")
            .attr("class", "arc")
            .attr("transform", "translate(" + outerRadius + ", " + outerRadius + ")");
    
    //draw arc paths
    arcs.append("path")
        .attr("fill", function(d, i) {
            return color(i);
        })
        .attr("d", arc);
    
    //generate text labels for each wedge
    arcs.append("text")
        .attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        //make sure text label isn't hidden (just omit label if pie slice to be covered too small)
        .text(function(d, i) {
            if ((d.value > 2) || (d.value == 0)) {
                return d.value + labels[i];
            } else {
                return d.value;
            };
    });
};

//load items of item type user has chosen to steal from flickr
function loadItems(item) {

  var url = "//api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
  var data = {
    tags: item,
    tagmode: "any",
    format: "json"
  };
  var promise = $.ajax({
    dataType: "json",
    url: url,
    data: data
  });
    
  promise.done(function(data) {
      //already supplied weights and values
      var weights=["10", "9", "4", "2", "1", "20"];
      var values=["175", "90", "20", "50", "10", "200"];
      //loop through first six image results
      for (var i = 0; i < 6; i++) {
      var imgLink = data.items[i].media.m;
      //appended images to already existing divs 
      var newImg = $('<img src="' + imgLink + '" data-value= "' + values[i] + '" data-weight= "' + weights[i] + 
      '" data-location=   house />');
      var id = i + 1;
      $('#'+id).append(newImg);
      $('#'+id).append("<br> $" + values[i] + ", " + weights[i] + "kg");
      }
  });
    
  //in case of error    
  promise.fail(function(reason) {
    console.log(reason);
  });

};
 

//happens after web page is loaded
$(function() {
    //set up page with data possibly from local storage
    var dataArray = pageInitialization();
    //if there is local storage (user isn't accessing page for first time and isn't starting over),
    //there will be no lag from getting flickr pictures, so user can go directly into the main function
    if (localStorage.getItem('ifStorage') == 'yes') {   
        mainFunction(); }
    else {
        //set flag indicating local storage data to yes
        localStorage.setItem('ifStorage', 'yes');
        //wait for images to load from flickr (there is a slight lag time)
        //if lag time not accounted for, images won't be included in the variable items below and can't be clicked
        setTimeout(function(){mainFunction()}, 1500); }
  
    function mainFunction() { 
        //get totalWeight and totalValue possibly from local storage
        var totalWeight = dataArray[0];
        var totalValue = dataArray[1];  
        updateLocalStorage();
        //burglar on creaky floor noise loops every duration of mp3 file (approx 95 seconds)
        //from https://www.youtube.com/watch?v=XBSsaK-r9nU
        var backgroundNoise = new Audio('FloorCreak.mp3');
        backgroundNoise.play();
        setInterval(function(){var backgroundNoise = new Audio('FloorCreak.mp3'); backgroundNoise.play();}, 94000);

        //controls movement of the items when user clicks each item
        var items = $('.item img');
        items.on('click', function(event) {
        var target = $(event.target);
        var weight = parseInt(target.attr('data-weight'))
        //can always move item if it's in the "sack" (right) itemBox
        if (target.attr('data-location') == "sack")
        {
            moveItem(target);
            totalWeight -= weight;
            totalValue -= parseInt(target.attr("data-value"));
            updatePieChart(totalWeight);
            $('#weight').html(totalWeight);
            $('#value').html(totalValue);
        }

        //must check if can add weight from "house" (left) itemBox to "sack" itemBox
        else if (canAddToTotal(weight, totalWeight)) 
        {
            moveItem(target);
            totalWeight += weight;
            totalValue += parseInt(target.attr("data-value"));
            updatePieChart(totalWeight);
            $('#weight').html(totalWeight);
            $('#value').html(totalValue);
        }
        else{
            tastefulAlert();
        }   
            //update local storage of all changeable html
            updateLocalStorage();
        });   

        //when user clicks start-over (pick new items) button
        var button = $('#startOver');
        button.on('click', function(event) {
            var target = $(event.target);
            //set flag indicating start-over because no local storage data
            localStorage.setItem('ifStorage', 'no');
            //reload the page
            location.reload();
          });

    };
    
});