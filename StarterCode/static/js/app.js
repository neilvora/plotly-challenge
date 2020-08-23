



// Use onchange function to extract value of selected option
function optionChanged(selectedValue) {
    var value = parseInt(selectedValue);
    buildPlot(value);
}

function buildPlot(x) {
        // Fetch json promise data
        d3.json("../data/samples.json").then(function(data) {
        

            
        // Append dropdown with default value
        d3.select('#selDataset').append('option').text('None').attr("value",'none');
        // Append dropdown with sample IDs
        for (var i = 0; i<data.samples.length; i++) {
            var dropdown = d3.select("#selDataset");
            var opt = data.samples[i].id;
            var option = dropdown.append("option").text(opt).attr("value",i);
        }
            


// ******************************************************
// *************** Selected Subject Chart ***************
// ******************************************************


        var id = data.samples[x];

        // Extract the sample_values data related to the top 10 samples for ID 940
        var sampleCounts = id.sample_values.slice(0,10);

        // Extract the top 10 otu_ids and out_labels and join them via a for loop to generate the bar chart labels
        var otuIDs = id.otu_ids.slice(0,10);
        var otuLabels = id.otu_labels.slice(0,10);
        var splitLabels = otuLabels.map(label => label.split(';'));
        var labels = splitLabels.map(genus => genus.slice(-1));
        var chartLabels = [];
        for (var i=0;i<labels.length; i++) {
            chartLabels.push(`${otuIDs[i]} : ${labels[i]}`)
        }
        

        // Demographic info
        var demographicData = data.metadata[x]
        var ID = demographicData.id
        var ethnicity = demographicData.ethnicity
        var gender = demographicData.gender
        var age = demographicData.age
        var location = demographicData.location
        var bbtype = demographicData.bbtype
        var wfreq = demographicData.wfreq

        // Select panel element and append Demographic info
        d3.select("#sample-metadata")
        .html(`ID: ${ID} <br>
        Ethnicity: ${ethnicity} <br>
        Gender: ${gender} <br>
         Age: ${age} <br>
         Location: ${location} <br>
         BBType: ${bbtype} <br>
         WFreq: ${wfreq}`)


        // Define trace, layout, and data
        var trace = {
            type: "bar",
            x: sampleCounts.reverse(),
            y: chartLabels.reverse(),
            orientation: 'h',
            hovertext: otuLabels,
            hoverinfo: "text"
        }

        var layout = {
            autosize: false,
            width: 500,
            height: 500,
            margin: {
            l: 150,
            r: 50,
            b: 100,
            t: 100,
            pad: 4
            },
            title:'Top 10 Bacteria - Selected Subject'};

        var chartData = [trace];
            
        // Plot bar chart
        Plotly.newPlot("bar1",chartData,layout);



// ******************************************************
// **************** Aggregated Bar Chart ****************
// ******************************************************

        var samples = data.samples

        // Create flattened array of all OTU IDs
        var otuIDs = samples.map(sample => sample.otu_ids)
        var otuIDsFlat = otuIDs.flat()

        // Create flattened array of microbe sample counts
        var microbeCount = samples.map(sample => sample.sample_values)
        var microbeCountFlat = microbeCount.flat()

        // Create flattened array of microbe sample counts
        var otuLabels2 = samples.map(sample => sample.otu_labels)
        var otuLabelsFlat = otuLabels2.flat()
            // Keep the genus only
            var splitOtuLabelsFlat = otuLabelsFlat.map(label => label.split(';'))
            var genusLabelsFlat = splitOtuLabelsFlat.map( genus => genus.slice(-1))
        // Create new array with otuID : genus

        var chartLabelsFlat = []
        for (var i=0;i<genusLabelsFlat.length; i++) {
            chartLabelsFlat.push(`${otuIDsFlat[i]} : ${genusLabelsFlat[i]}`)
        }

        // Reorganize the two arrays above (chartLabelsFlat and microbeCountFlat) to aggregate data

        var genusMicrobeCounts = {};


        chartLabelsFlat.forEach((genus,i) => {
            if (genus in genusMicrobeCounts) {
                genusMicrobeCounts[genus].push(microbeCountFlat[i]);
            }
            else{
                genusMicrobeCounts[genus] = [microbeCountFlat[i]];
            }
        })

        var microbeTotals = {};

        // use .reduce to aggregate totals across each key

        for (var [key, value] of Object.entries(genusMicrobeCounts)) {
           // console.log(`${key} : ${value}`)
           microbeTotals[key] = (value.reduce(function(a, b){
                return a + b;
            }, 0))
        }

        //Sort the new object by highest values

        var sortedMicrobeTotals = Object.entries(microbeTotals).sort(function(a, b) { return b[1] - a[1] })

        var top10labels = [];
        var top10values = [];
        // Slice the new array to reduce to the top 10

        for (var i=0;i<10; i++) {
            top10labels.push(Object.entries(sortedMicrobeTotals)[i][1][0])
            top10values.push(Object.entries(sortedMicrobeTotals)[i][1][1])
        }

        console.log(top10labels)
        console.log(top10values)


        // Plot new chart for aggregated values amongst all IDs and Microbes

        var trace2 = {
            type: "bar",
            x: top10values.reverse(),
            y: top10labels.reverse(),
            orientation: 'h',
        }

        var layout2 = {
            autosize: false,
            width: 500,
            height: 500,
            margin: {
            l: 150,
            r: 50,
            b: 100,
            t: 100,
            pad: 4
            },
            title:'Top 10 Bacteria - All Subjects'};

        var chartData2 = [trace2];
            
        // Plot bar chart for microbe totals
        Plotly.newPlot("bar2",chartData2,layout2);



// ******************************************************
// ******************** Bubble Chart ********************
// ******************************************************

    // Slice the bubble labels from the splitlabels array above

            //var id = data.samples[x]; - Variable declared in first chart


    // Extract the sample_values data related to the selected ID
    var bubbleSampleCounts = id.sample_values

    // Extract the OTU labels related to the selected ID, split on ';' extract the elements up to the family, and re-join them
    var bubbleOtuLabels = id.otu_labels;
    var splitBubbleLabels = bubbleOtuLabels.map(label => label.split(';'));
    var bubbleLabels = splitBubbleLabels.map(family => family.slice(0,5));
    var joinBubbleLabels = bubbleLabels.map(label => label.join())
    // var chartLabels = [];
    // for (var i=0;i<labels.length; i++) {
    //     chartLabels.push(`${otuIDs[i]} : ${labels[i]}`)
    // }
    console.log(bubbleSampleCounts)

            // Reorganize the two arrays above (bubbleSampleCounts & joinBubbleLabels) to aggregate data

            var bubbleCounts = {};


            joinBubbleLabels.forEach((family,i) => {
                if (family in bubbleCounts) {
                    bubbleCounts[family].push(bubbleSampleCounts[i]);
                }
                else{
                    bubbleCounts[family] = [bubbleSampleCounts[i]];
                }
            })
            
            console.log(bubbleCounts)

            var bubbleTotals = {};
    
            // use .reduce to aggregate totals across each key
    
            for (var [key, value] of Object.entries(bubbleCounts)) {
               // console.log(`${key} : ${value}`)
               bubbleTotals[key] = (value.reduce(function(a, b){
                    return a + b;
                }, 0))
            }
    
            // Extract chart labels and counts into two separate arrays
            bubbleChartLabels = [];
            bubbleChartCounts = [];

            for (var i=0;i<Object.keys(bubbleTotals).length; i++) {
                bubbleChartLabels.push(Object.entries(bubbleTotals)[i][0])
                bubbleChartCounts.push(Object.entries(bubbleTotals)[i][1])
            }

            console.log(bubbleChartLabels)
            console.log(bubbleChartCounts)


            // Plot bubble chart

            var trace3 = {
                x: bubbleChartCounts,
                y: bubbleChartLabels,
                mode: 'markers',
                marker:{
                    size: bubbleChartCounts.map(count => Math.sqrt(count))
                }
            };
    
            var layout3 = {
                autosize: true,
                width: 1200,
                height: 500,
                margin: {
                l: 500,
                // r: 50,
                // b: 100,
                // t: 100,
                pad: 4
                },
                font: {
                    size: 10,
                  },
                title:'Count of Bacteria by Family - Selected Subject'};
    
            var chartData3 = [trace3];
                
            // Plot bar chart for microbe totals
            Plotly.newPlot("bubble",chartData3,layout3);



    });



    }

buildPlot();

// d3.json("../data/samples.json").then(function(data) {
//     console.log(data);
//     var otu_id_totals = []
//     var otuIDs = []
//     var samples = data.samples
//     console.log(samples[0].otu_ids[0])
//     // samples.forEach( (sample,i) => {
//     //     if (!(sample.otu_ids[i] in otuIDs)) {
//     //         otuIDs.push(sample.otu_ids[i]);
//     //     }
//     // console.log(otuIDs);
//     // })
// });