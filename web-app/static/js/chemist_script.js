$(document).ready(function(){

    ////////TEST JSON - remove later /////////
    var data2 = {Key:"1", Record:{DoctorID:"1",Info:"",Limit:"1",PatientID:"1"}};

    var doc_id = data2.Record.DoctorID;
    var patient_id = data2.Record.PatientID;
    var info = data2.Record.Info;
    var element = document.getElementById("recipe");
    element.innerHTML = "Doctor ID: " + doc_id + "<br />";
    element.innerHTML += "Patient ID: " + patient_id + "<br />";
    element.innerHTML += "Description: " + info;
    //////////////////////////////////////
    // Handle logout
    $('#get_recipe_btn').click(function(){
        var id = $('#patients_id').val();
        // Disable submit button (to prevent multiplication of requests)
        $('#get_recipe_btn').prop("disabled", true);

        $.ajax({
            type: "GET",
            url: "/chemist/get_recipe/" + id,
            timeout: 600000,

            success: function (data) {
                $('#get_recipe_btn').prop("disabled", false);
                var doc_id = data.Record.DoctorID;
                var patient_id = data.Record.PatientID;
                var info = data.Record.Info;
                var element = document.getElementById("recipe");
                element.innerHTML = "Doctor ID: " + doc_id + "<br />";
                element.innerHTML += "Patient ID: " + patient_id + "<br />";
                element.innerHTML += "Description: " + info;
            },

            error: function (e) {
                alert('Error');
            }
        });

        return false;
    });

});