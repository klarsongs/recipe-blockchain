$(document).ready(function(){

    // Handle logout
    $('#logout').click(function(){

        // Disable submit button (to prevent multiplication of requests)
        $('#logout').prop("disabled", true);

        $.ajax({
            type: "GET",
            url: "/logout",
            timeout: 600000,

            success: function (data) {
                $('#logout').prop("disabled", false);
                location.reload();
            },

            error: function (e) {
                alert('Error');
            }
        });

        return false;
    });

});

