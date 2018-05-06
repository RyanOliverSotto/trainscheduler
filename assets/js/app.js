$(document).ready(function () {
    
    
    // Initialize Firebase
       var config = {
        apiKey: "AIzaSyA9n4KnZyf1LUeH4WFhwr032Bcy2cKO5HA",
        authDomain: "fir-trainschedule-ea28b.firebaseapp.com",
        databaseURL: "https://fir-trainschedule-ea28b.firebaseio.com",
        projectId: "fir-trainschedule-ea28b",
        storageBucket: "fir-trainschedule-ea28b.appspot.com",
        messagingSenderId: "435410058245"
    };
    firebase.initializeApp(config);

    //Initial Values Global
    var train;
    var destination;
    var frequency;
    var first;
    var calcNext = 0;
    var calcMinutesAway = 0;
    //These three variables were needed to capture edit functionality to the page
    var toggle = $("#submit").text();
    var key;
    var i = 1;
    var countDown = 61;
    var intervalId;
    // Create a variable to reference the database
    var database = firebase.database();




    // Project add data functionality is here.
    $("#submit").on("click", function () {
        event.preventDefault();
        //alert("I was clicked");
        //break;
        // Get the input values
        train = $("#formTrain").val().trim();
        //alert(train);
        destination = $("#formDestination").val().trim();
        //alert(destination);
        first = $("#formFirst").val().trim();
        frequency = parseInt($("#formFrequency").val().trim());
        if (toggle === "Submit") {
            // Save the new data in Firebase
            database.ref().push({
                train: train,
                destination: destination,
                first: first,
                frequency: frequency,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });//End push    
        }
        if (toggle === "Edit") {
            // Update existing node in Firebase
            database.ref(key).update({
                train: train,
                destination: destination,
                first: first,
                frequency: frequency,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });//End update     
            //Refresh the page
            location.reload();
        }

        //Clear the values from the form
        clearForm();
    });//End submit

    // Project listener to when new data is added to DB is here.
    database.ref().on("child_added", function (childSnapshot) {
        train = childSnapshot.val().train;
        destination = childSnapshot.val().destination;
        first = childSnapshot.val().first;
        frequency = childSnapshot.val().frequency;
        dateAdded = childSnapshot.val().dateAdded;
        var key = childSnapshot.key;
        var tBody = $("tbody");
        var tRow = $("<tr>");

        //Call the function to calculate minutes until next train and next train times
        timeCalc();

        // Methods run on jQuery selectors return the selector they we run on
        // This is why we can create and save a reference to a td in the same statement we update its text
        var trainTd = $("<td>").text(train).attr("id", "train" + i);
        var destinationTd = $("<td>").text(destination).attr("id", "destination" + i);
        var freqencyTd = $("<td>").text(frequency).attr("id", "frequency" + i);
        var nextArrival = $("<td>").text(calcNext).attr("id", "first" + i).attr("val", first);
        var minutesAway = $("<td>").text(calcMinutesAway);
        var updateBtn = $("<button>").text("Edit").attr("id", i).addClass("editBtn").attr("dataKey", key).addClass("btn-primary");
        //alert (index);
        //$("updateBtn").attr("id",key);
        var deleteBtn = $("<button>").text("Delete").attr("id", key).addClass("deleteBtn").addClass("btn-primary");
        // $("deleteBtn").attr("id",key);           
        // Append the newly created table data to the table row
        tRow.append(trainTd, destinationTd, freqencyTd, nextArrival, minutesAway, updateBtn, deleteBtn);
        // Append the table row to the table body
        tBody.append(tRow);
        i++;
    });//End ChildAdded 


    function timeCalc() {
        // Taken directly from in class assignment
        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(first, "hh:mm").subtract(1, "years");
        //console.log("First converted: ", firstTimeConverted);
        // Current Time
        var currentTime = moment();
        //console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));
        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        //console.log("DIFFERENCE IN TIME: " + diffTime);
        // Time apart (remainder)
        var tRemainder = diffTime % frequency;
        //console.log(tRemainder);
        // Minute Until Train
        //var tMinutesTillTrain = frequency - tRemainder;
        calcMinutesAway = frequency - tRemainder;
        //console.log("MINUTES TILL TRAIN: " + calcMinutesAway);
        // Next Train
        //var nextTrain = moment().add(tMinutesTillTrain, "minutes");
        calcNext = moment().add(calcMinutesAway, "minutes");
        //calcNext = moment(calcNext).format("MMM Do hh:mm:ss a");
        calcNext = moment(calcNext).format('LT');
        //calcNext = moment().format('MMMM Do YYYY, h:mm:ss a'); 
        //console.log("ARRIVAL TIME: " + moment(calcNext).format("hh:mm"));
    }

    function clearForm() {
        $("#formTrain").val("");
        $("#formDestination").val("");
        $("#formFirst").val("");
        $("#formFrequency").val("");
    };

    //$(".editBtn").on("click", function (event) {
    $("body").on("click", ".editBtn", function () {
        event.preventDefault();
        var myRow = this.id;
        key = $(this).attr("dataKey");
        toggle = "Edit";
        $("#panelTrain").text("Edit Existing Train");
        $("#submit").text(toggle);
        $("#submit").val(key);
        //alert (this.val);
        train = $("#train" + myRow).text();
        destination = $("#destination" + myRow).text();
        frequency = $("#frequency" + myRow).text();
        //alert(frequency);
        first = "";//$("#first" + myRow).text();
        console.log(train);
        console.log(destination);
        console.log(frequency);
        console.log(first);
        //console.log("train"+myRow);
        //console.log(destination);
        //console.log(frequency);
        //console.log(first);
        //$("#formFirst").removeAttr("type");
        $("#formTrain").val(train);
        $("#formDestination").val(destination);
        $("#formFirst").val(first);
        $("#formFrequency").val(frequency);
        //$("#formFirst").attr("type","time");
    });

    $("body").on("click", ".deleteBtn", function () {
        event.preventDefault();
        // alert("I was clicked");
        // alert(this.id);        
        database.ref().child(this.id).remove();
        location.reload();
    });

    $("body").on("click", "#clear", function () {
        event.preventDefault();
        clearForm();
        toggle = "Submit";
        $("#submit").text(toggle);
        $("#panelTrain").text("Add New Train");
        $("#formFirst").attr("type", "time");
    });

    //Add timer countdown logic
    run();

    function run() {
        if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(decrement, 1000);
    }

    function decrement() {
        countDown--;
        $("#timer").html("<p> Page will refresh in " + countDown + " seconds</p>");
        if (countDown === 0) {
            location.reload();
        }
    }


}); //End document ready