const host = "192.168.99.1"
const port = "8888"
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


$(function () {


    // get user name and token:
    var username = window.localStorage.getItem('username');
    var token =  window.localStorage.getItem('token');

    if (token == null){
        // redirect login
        // window.location.replace("file:///home/phien/neo4j_Demo/AdminBSBMaterialDesign/pages/examples/sign-in.html");
        window.location.replace("/login");
        // window.location.href = "/login"
    }

    // handle log out action 
    $("#logout").click(function () {

        // delete local storage 
        window.localStorage.clear();

        // redirect to log in
        // window.location.replace("file:///home/phien/neo4j_Demo/AdminBSBMaterialDesign/pages/examples/sign-in.html");
        window.location.replace("/login");
        // window.location.href = "/login"

    })

    $('.datepicker').datepicker({
        autoclose: true,
        container: '#bs_datepicker_container',
        format: 'yyyy-mm-dd'
    });

    

    $('#entityDataTable').DataTable({
        responsive: true,
        columns: [
            { "data": "entityID" },
            { "data": "name" },
            { "data": "description" },
        ],
        select: {
            style:    'multi',
            selector: 'td'
        },
        "oLanguage": {
           "sSearch": "Filter"
        },
         "ordering": false,




    });

    //handle search entity button:
    $("#searchEntityTableButton").click(function (argument) {
        var inputStringSearch = $("#inputTextSearchEntityTable").val().trim();
        var entityType = $("#selectEntityTypeEntityTable option:selected").text().trim();
        // Set title entityDataTable
        $("#entityDataTable").attr("entityType", entityType);

        if(inputStringSearch != ""){

            // send ajax:
            var resource;
            if (entityType == "Country"){
                resource = 'countrie';
            } else {
                resource = entityType.toLowerCase();
            }
            $.ajax({
                url: "http://" + host + ":" + port + "/api/" + resource + "s" + "/search",
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "Authorization": token
                },
                data: JSON.stringify({"text": inputStringSearch}),
                async: false,
                success: function (data) {
                    // get all result pages and then update data in DataTable

                    var result = data['data'];
                    var next_page = data['next'];
                    // console.log(next_page);
                    var dataTable = $("#entityDataTable").DataTable();
                    while(next_page!== null){
                        console.log("ok");
                        $.ajax({
                            url: next_page,
                            type: "POST",
                            dataType: "json",
                            contentType: "application/json",
                            headers: {
                                "Authorization": token
                            },
                            data: JSON.stringify({"text": inputStringSearch}),
                            async: false,
                            success: function (data) {
                                next_page = data['next'];
                                Array.prototype.push.apply(result, data['data']);
                            }, 
                            error: function(XMLHttpRequest, textStatus, errorThrown){

                            }
                        });
                    }
                    dataTable.clear();
                    dataTable.rows.add(result);
                    dataTable.draw(); 
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log(textStatus);
                }
           });
        } else {
            // send ajax: get all entity according to their type
            var resource;
            if (entityType == "Country"){
                resource = 'countrie';
            } else {
                resource = entityType.toLowerCase();
            }
            $.ajax({
                url: "http://" + host + ":" + port + "/api/" + resource + "s/",
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "Authorization": token
                },
                async: false,
                success: function (data) {

                     // get all result pages and then update data in DataTable

                    var result = data['data'];
                    var next_page = data['next'];
                    // console.log(next_page);
                    var dataTable = $("#entityDataTable").DataTable();
                    while(next_page!== null){
                        $.ajax({
                            url: next_page,
                            type: "GET",
                            dataType: "json",
                            contentType: "application/json",
                            headers: {
                                "Authorization": token
                            },
                            async: false,
                            success: function (data) {
                                next_page = data['next'];
                                Array.prototype.push.apply(result, data['data']);
                            }, 
                            error: function(XMLHttpRequest, textStatus, errorThrown){

                            }
                        });
                    }
                    dataTable.clear();
                    dataTable.rows.add(result);
                    dataTable.draw(); 
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log(textStatus);
                     if (errorThrown == "UNAUTHORIZED"){
                        window.location.replace("/login");
                    }
                }
           });

        }
        
    })
    $("#searchEntityTableButton").trigger('click');

    // handle creating a new entity:
    $("#createEntity").click(function () {
        var entityType = $("#selectEntityTypeEntityTable option:selected").text().trim();
        if(entityType == "Time"){

            // handle create time entity
            // set field values in update time entity modal
            $("#defaultTimeModalLabel").text("Create Time Entity");
            $("#entityTimeTypeUpdateModal").val(entityType);
            $("#updateTimeEntityModal").attr("act", "create");

            $("#IDTimeEntityUpdateModal").val('');
            $("#IDTimeEntityUpdateModal").hide();
            $("#IDEntityTimeLabel").hide();
            $("#nameTimeEntityUpdateModal").val('');

            $("#descriptionTimeEntityUpdateModal").val('');



            // show model
            $("#updateTimeEntityModal").modal('toggle');

            /////////////////////////////////////////////////////

        } else {
            // show modal:
            $("#typeEntityCreateModal").val(entityType);
            $("#createEntityModal").modal('toggle');
        }
       
    });

    // handle save button create new entity:
    $("#saveButtonCreateModal").click(function (argument) {
        var typeEntity =  $("#typeEntityCreateModal").val().trim();
        var nameNewEntity = $("#nameNewEntityCreateModal").val().trim();
        var descriptionNewEntity = $("#descriptionEntityCreateModal").val().trim();
        var entityID = typeEntity.toLowerCase() + uuidv4();
        console.log(entityID);
        if(nameNewEntity != "" && descriptionNewEntity != ""){
            var resource;
            if (typeEntity == "Country"){
                resource = 'countrie';
            } else {
                resource = typeEntity.toLowerCase();
            }
            // send ajax:
            $.ajax({
                url: "http://" + host + ":" + port + "/api/" + resource+ "s" + "/",
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "Authorization": token
                },
                data: JSON.stringify({"name": nameNewEntity, "entityID": entityID, "des": descriptionNewEntity}),
                async: false,
                success: function (data) {
                    // update data in DataTable

                    var result = data;
                    swal("Create the new entity successfully!");
                    $("#createEntityModal").modal('toggle'); 
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log(textStatus);
                }
           });


        } else {
            swal("Error!", "Name and Description fields are required!", "error");
        }
        
        
    })

    // handle updating a selected entity:
    $("#updateEntity").click(function (argument) {
        var selectedRows = $("#entityDataTable").DataTable().rows( { selected: true }).data();
        if(selectedRows.length ==1 ){

            var entityType = $("#entityDataTable").attr("entityType").trim();

            if (entityType == "Time"){
                // handle update time entity
                // set field values in update time entity modal
                $("#defaultTimeModalLabel").text("Update Time Entity");
                $("#entityTimeTypeUpdateModal").val(entityType);
                $("#updateTimeEntityModal").attr("act", "update");

                $("#IDTimeEntityUpdateModal").val(selectedRows[0]["entityID"]);
                $("#IDTimeEntityUpdateModal").show();
                 $("#IDEntityTimeLabel").show();
                $("#nameTimeEntityUpdateModal").val(selectedRows[0]["name"]);

                $("#descriptionTimeEntityUpdateModal").val(selectedRows[0]["description"]);



                // show model
                $("#updateTimeEntityModal").modal('toggle');

                /////////////////////////////////////////////////////
            } else {
                // set field values in update entity modal:
                $("#entityTypeUpdateModal").val(entityType);

                $("#nameEntityUpdateModal").val(selectedRows[0]["name"]);
                $("#descriptionEntityUpdateModal").val(selectedRows[0]["description"]);
                $("#IDEntityUpdateModal").val(selectedRows[0]["entityID"]);

                // show modal:
                $("#updateEntityModal").modal('toggle');

            }

        } else {
            swal("Select one entity to update!");
        }
    });
    // handle save button on update Time Entity Modal:
    $("#saveButtonUpdateTimeEntityModal").click(function () {

        if (updatedName != "" && updatedDescription != ""){
            var act = $("#updateTimeEntityModal").attr("act");
            if (act == "update"){
                var updatedName = $("#nameTimeEntityUpdateModal").val().trim();
                var updatedDescription = $("#descriptionTimeEntityUpdateModal").val().trim();
                var entityID = $("#IDTimeEntityUpdateModal").val().trim();
                var entityType = $("#entityTimeTypeUpdateModal").val().trim();
                var updatedData = {"entityID": entityID, "des": updatedDescription, "name": updatedName}
                // send ajax:

                $.ajax({
                    url: "http://" + host + ":" + port + "/api/" + "times" + "/" + entityID,
                    type: "PUT",
                    dataType: "json",
                    contentType: "application/json",
                    headers: {
                        "Authorization": token
                    },
                    data: JSON.stringify(updatedData),
                    async: false,
                    success: function (data) {
                        // update data in DataTable

                        var result = data;
                        swal("Update the selected entity successfully!");
                        $("#entityDataTable").DataTable().row('.selected').data({"entityID": entityID,
                                            "description": updatedDescription, "name": updatedName}).draw(false);
                        $("#updateTimeEntityModal").modal('toggle');
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log(textStatus);
                    }
               });
            } else if (act == "create"){
                var newName = $("#nameTimeEntityUpdateModal").val().trim();
                var newDescription = $("#descriptionTimeEntityUpdateModal").val().trim();
                var entityID = "time" + uuidv4();
                var newData = {"entityID": entityID, "des": newDescription, "name": newName}
                // send ajax:
                $.ajax({
                    url: "http://" + host + ":" + port + "/api/" + "times" + "/",
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    headers: {
                        "Authorization": token
                    },
                    data: JSON.stringify(newData),
                    async: false,
                    success: function (data) {
                        // update data in DataTable
                        var result = data;
                        swal("Create the new entity successfully!");
                        $("#updateTimeEntityModal").modal('toggle');
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log(textStatus);
                    }
               });


            }
        } else {
            swal("Error!", "Name and Description fields are required!", "error");
        }
    })
    // handle save button on update Entity Modal:
    $("#saveButtonUpdateEntityModal").click(function () {
        var updatedName = $("#nameEntityUpdateModal").val().trim();
        var updatedDescription = $("#descriptionEntityUpdateModal").val().trim();
        var entityID = $("#IDEntityUpdateModal").val().trim();
        var entityType = $("#entityTypeUpdateModal").val().trim();
        var updatedData = {"entityID": entityID, "des": updatedDescription, "name": updatedName}
        if (updatedName != "" && updatedDescription != ""){
            var resource;
            if (entityType == "Country"){
                resource = 'countrie';
            } else {
                resource = entityType.toLowerCase();
            }

            // send ajax:
            $.ajax({
                url: "http://" + host + ":" + port + "/api/" + resource + "s" + "/" + entityID,
                type: "PUT",
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "Authorization": token
                },
                data: JSON.stringify(updatedData),
                async: false,
                success: function (data) {
                    // update data in DataTable

                    var result = data;
                    swal("Update the selected entity successfully!");
                    $("#entityDataTable").DataTable().row('.selected').data({"entityID": entityID,
                                        "description": updatedDescription, "name": updatedName}).draw(false);
                    $("#updateEntityModal").modal('toggle'); 
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log(textStatus);
                }
           });


        } else {

            swal("Error!", "Name and Description fields are required!", "error");

        }
        
    })


    // handle deleting a selected entity:
    $("#deleteEntity").click(function (argument) {
        var selectedRows = $("#entityDataTable").DataTable().rows( { selected: true }).data();
        if(selectedRows.length == 1){

            swal({
            title: "Are you sure?",
            text: "You will not be able to recover this entity",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: false,
            closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    var entityID = $("#entityDataTable").DataTable().row('.selected').data()["entityID"];
                    // console.log(entityID);
                    var entityType = $("#entityDataTable").attr("entityType").trim();
                    var resource;
                    if (entityType == "Country"){
                        resource = 'countrie';
                    } else {
                        resource = entityType.toLowerCase();
                    }
                    // send ajax:
                    $.ajax({
                        url: "http://" + host + ":" + port + "/api/" + resource+ "s" + "/" + entityID,
                        type: "DELETE",
                        dataType: "json",
                        contentType: "application/json",
                        headers: {
                            "Authorization": token
                        },
                        async: false,
                        success: function (data) {
                           
                            $("#entityDataTable").DataTable().row('.selected').remove().draw(false);
                            swal("Deleted!", "This selected entity has been deleted.", "success");
                        },
                        error: function (xhr, status, error) {
                            var err = JSON.parse(xhr.responseText);
                            swal("Error!", err.message, "error");
                        }
                   });
                    
                } else {
                    swal("Cancelled", "This selected entity is safe :)", "error");
                }
            });

        } else {
            swal("Select one entity to delete!");
        }
        
    });

    // handle merging selected entities:
    $("#mergeEntity").click(function (argument) {
        var selectedRows = $("#entityDataTable").DataTable().rows( { selected: true }).data();
        if(selectedRows.length > 1){
            swal({
            title: "Are you sure?",
            text: "You will not be able to recover after finishing this action!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: false,
            closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    var entityType = $("#entityDataTable").attr("entityType").trim();
                    var entityIDs = []
                    for (i=0; i< selectedRows.length; i++){
                        entityIDs.push(selectedRows[i]["entityID"]);
                    }
                    var resource;
                    if (entityType == "Country"){
                        resource = 'countrie';
                    } else {
                        resource = entityType.toLowerCase();
                    }
                    // send ajax:
                    $.ajax({
                        url: "http://" + host + ":" + port + "/api/" + resource + "s" + "/merge_nodes" ,
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        headers: {
                            "Authorization": token
                        },
                        data: JSON.stringify({"set_entity_id": entityIDs}),
                        async: false,
                        success: function (data) {

                            var result = data
                            $("#entityDataTable").DataTable().rows('.selected').remove().draw(false);
                            $("#entityDataTable").DataTable().rows.add(result).draw();

                            swal("Merged!", "These selected entity has been merged  successfully!", "success");
                        },
                        error: function (xhr, status, error) {
                            var err = JSON.parse(xhr.responseText);
                            swal("Error!", err.message, "error");
                        }
                   });



                   
                } else {
                    swal("Cancelled", "", "error");
                }
            });

        } else {
            swal("Select at least two entities to merge!");
        }
        
    })


});