$(document).ready(function(){

    // Handle query
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
                data = JSON.parse(data);  // change JSON string into object
                var doc_id = data.DoctorID;
                var patient_id = data.PatientID;
                var info = data.Info;
                var element = document.getElementById("recipe");
                element.innerHTML = "Doctor ID: " + doc_id + "<br />";
                element.innerHTML += "Patient ID: " + patient_id + "<br />";
                element.innerHTML += "Description: " + info;
            },

            error: function (e) {
                $('#get_recipe_btn').prop("disabled", false);
                alert('Error');
            }
        });

        return false;
    });

});
