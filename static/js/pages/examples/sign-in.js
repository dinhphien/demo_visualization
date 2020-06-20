
const host = "localhost"
const port = "8888"

$(function () {

    $("#userLogin").click(function () {
        // hide the error message
        $("#loginInputError").hide()
    });

    $("#passwordLogin").click(function () {
        // hide the error message
        $("#loginInputError").hide()
    });


    // handle login action
    $('#loginButton').click(function () {
        // get input form:
        var username = $("#userLogin").val().trim();
        var password = $("#passwordLogin").val().trim();
        var isRememberd = $("#remembermeLogin").val();
        if(username == "" || password == ""){
            // show the error message
            $("#loginInputError").text("Missing username or password !");
            $("#loginInputError").show();
        } else {
            // send ajax login request:

            $.ajax({
                url: "http://" + host + ":" + port + "/api/auth/admin/login",
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({"username": username, "password": password}),
                success: function (data) {

                    // store token and username in localStorage
                    var result = data[0];
                    window.localStorage.clear();
                    window.localStorage.setItem('username', result['username']);
                    window.localStorage.setItem('token', result['token']);

                    // window.location = "file:///home/phien/neo4j_Demo/AdminBSBMaterialDesign/index.html";
                    // window.location.replace("file:///home/phien/neo4j_Demo/AdminBSBMaterialDesign/index.html");
                     window.location.replace("/");
                    // window.location.href = "/";

                    // window.location.href = "file:///home/phien/neo4j_Demo/AdminBSBMaterialDesign/index.html";
    
                },
                error: function (xhr, status, error) {
                    var err = JSON.parse(xhr.responseText);
                    $("#loginInputError").text(err.message);
                    $("#loginInputError").show();  
                }
           });
        }

        

       

       

    })
});