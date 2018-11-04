function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

$(document).ready(function(){
    $('.message a').click(function(){
       $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
    });


    // Handle register
    $('.register-form button').click(function(){
        // Get data from the form
        var usernameVal = $('.register-form .name').val();
        var passwordVal = $('.register-form .password').val();
        var emailVal = $('.register-form .email').val();


        if(validateEmail(emailVal) == false) {
            alert("Email address is not valid.");
        }

        // JSONify the data
        const obj = {
            username: usernameVal,
            password: passwordVal,
            email: emailVal,
            FirstName: 'Unknown',
            LastName: 'Unknown',
            Role: 'Unknown',
            insurance: 'Unknown'
        }

        // Disable submit button (to prevent multiplication of requests)
        $('.register-form button').prop("disabled", true);

        $.ajax({
            type: "POST",
            url: "/register",
            data: JSON.stringify(obj),
            contentType: 'application/json',
            timeout: 600000,

            success: function (data) {
                alert(data.message);
                if(data.success == true) {
                    $(".register-form").get(0).reset();
                    $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
                }
                $(".register-form button").prop("disabled", false);
            },

            error: function (e) {
                alert('Error');
                $(".register-form button").prop("disabled", false);
            }
        });

        return false;
    });


    // Handle login
    $('.login-form button').click(function(){
        var usernameVal = $('.login-form .username').val();
        var passwordVal = $('.login-form .password').val();

        // JSONify the data
        const obj = {
            username: usernameVal,
            password: passwordVal
        }

        // Disable submit button (to prevent multiplication of requests)
        $('.login-form button').prop("disabled", true);

        $.ajax({
            type: "POST",
            url: "/login",
            data: JSON.stringify(obj),
            contentType: 'application/json',
            timeout: 600000,

            success: function (data) {
                alert(data.message);
                $(".login-form button").prop("disabled", false);
                if (data.success)
                    location.reload();
            },

            error: function (e) {
                alert('Error');
                $(".login-form button").prop("disabled", false);
            }
        });

        return false;
    });

});

