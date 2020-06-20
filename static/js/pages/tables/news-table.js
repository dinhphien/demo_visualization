const host = "localhost"
const port = "8888"
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
var pattern = /^(http|https)?:\/\/[a-zA-Z0-9-\.]+\.[a-z]{2,4}/;
$(function () {


    // get user name and token:
    var username = window.localStorage.getItem('username');
    var token =  window.localStorage.getItem('token');

    if (token == null){
        // redirect login
         window.location.replace("/login");
    }


    // handle log out action 
    $("#logout").click(function () {

        // delete local storage 
        window.localStorage.clear();

        // redirect to log in

         window.location.replace("/login");
    })

    // init news data table
    $('#newsTablePage').DataTable({
        columns: [
            { "data": "entityID" },
            { "data": "link" },
            { "data": "topics" },
        ],
        select: {
            style:    'single',
            selector: 'td'
        },
        responsive: true,
        "oLanguage": {
           "sSearch": "Filter"
         }

    });

    $("#factDetailDataTable").DataTable({
        columns: [
            { "data": "factID" },
            { "data": "subjectID" },
            { "data": "relation" },
            { "data": "objectID" },
            { "data": "timeID" },
            { "data": "locationID" },
        ],
        select: {
            style:    'single',
            selector: 'td'
        },
        responsive: true,
        "oLanguage": {
           "sSearch": "Filter"
         }
    });
    $("#entitySearchAddFactModal").DataTable({
        columns: [
            { "data": "entityID" },
            { "data": "name" },
            { "data": "description" },
        ],
        select: {
            style:    'single',
            selector: 'td'
        },
        responsive: true,
        "oLanguage": {
           "sSearch": "Filter"
         }

    });

    // handle event: clicking the search news button
    $("#searchNews").click(function () {
        // get input text search:
        var inputStringSearch = $("#inputSearchPropertyNews").val();
        if(inputStringSearch != ""){
            // fetch data from api: get news/search
            $.ajax({
                url: "http://" + host + ":" + port + "/api/news/search",
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "Authorization": token
                },
                data: JSON.stringify({"text": inputStringSearch}),
                success: function (data) {
                    // get all result pages and then update data in DataTable

                    var result = data['data'];
                    var next_page = data['next'];
                    var dataTable = $("#newsTablePage").DataTable();
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
            // fetch data from api: get all news entity limit 1000
            $.ajax({
                url: "http://" + host + ":" + port + "/api/news/",
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "Authorization": token
                },
                success: function (data) {
                    // get all result pages and then update data in DataTable

                    var result = data['data'];
                    var next_page = data['next'];
                    var dataTable = $("#newsTablePage").DataTable();
                    while(next_page!== null){
                        console.log("ok");
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
                }
           });

        }

    });
    $("#searchNews").trigger('click');


    // handle create news button:
    $("#createNewsButton").click(function () {
        urlNews = $("#newsURLCreatNewsModal").val().trim();
        topics = $("#topicsNewsCreateNewsModal").val().trim();
        if(urlNews != "" && topics != ""){
            if(pattern.test(urlNews)){
                var newsID = "news" + uuidv4(); 
                topicsString = topics.split(',')
                for (i=0; i < topicsString.length; i++){
                    topicsString[i] = topicsString[i].trim();
                }
                console.log(topicsString);

                //send ajax:
                $.ajax({
                    url: "http://" + host + ":" + port + "/api/news/",
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    headers: {
                        "Authorization": token
                    },
                    data: JSON.stringify({"entityID": newsID, "link": urlNews, "topics": topicsString}),
                    async: false,
                    success: function (data) {
                        swal("Added!", "This news has been added!", "success");
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log(textStatus);
                    }
               });


            } else {
                swal("Error!", "URL is not valid!", "error");
            }

        } else {
             swal("Error!", "URL and Topics fields are required!", "error");
        }
        
    })


    // handle update news button:
    $("#updateNews").click(function () {
        // show modal
        var selectedRows = $("#newsTablePage").DataTable().rows( { selected: true }).data();
        // console.log(selectedRows);
        if(selectedRows.length ==1 ){

            // set field values in update entity modal:
            $("#newsIDUpdateNewsModal").val(selectedRows[0]["entityID"]);
            $("#inputURLUpdateNewsModal").val(selectedRows[0]["link"]);
            $("#inputTopicsUpdateNewsModal").val(selectedRows[0]["topics"]);

            // show modal:
            $("#updateNewsModal").modal('toggle');


        } else {
            swal("Select one news to update!");
        }
    });

    // handle saving updated news:
    $("#saveUpdatedNews").click(function () {
        // get updated values:
        newsID =  $("#newsIDUpdateNewsModal").val();
        updatedURL = $("#inputURLUpdateNewsModal").val();
        updatedTopics = $("#inputTopicsUpdateNewsModal").val().split(',');
        for (i=0; i < updatedTopics.length; i++){
            updatedTopics[i] = updatedTopics[i].trim();
        }
        var updatedData = { 
                            "entityID": newsID,
                            "link": updatedURL,
                            "topics": updatedTopics}
        // send ajax:
        $.ajax({
                url: "http://" + host + ":" + port + "/api/news/" + newsID,
                type: "PUT",
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "Authorization": token
                },
                data: JSON.stringify(updatedData),
                success: function (data) {
                    // console.log(data);
                    swal("Update the selected news successfully!");
                    $("#newsTablePage").DataTable().row('.selected').data(updatedData).draw(false);
                    $("#updateNewsModal").modal('toggle'); 
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log(textStatus);
                    console.log(errorThrown);
                }
           });

    });

    // handle deleting the selected news:
    $("#deleteNews").click(function (argument) {
        var selectedRows = $("#newsTablePage").DataTable().rows( { selected: true }).data();

        if(selectedRows.length == 1){
            swal({
                title: "Are you sure?",
                text: "You will not be able to recover this news",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel!",
                closeOnConfirm: false,
                closeOnCancel: false
                }, function (isConfirm) {
                    if (isConfirm) {
                        
                        var selectedNewsId = $("#newsTablePage").DataTable().row('.selected').data()["entityID"];
                        // send ajax:
                        $.ajax({
                            url: "http://" + host + ":" + port + "/api/news/" + selectedNewsId,
                            type: "DELETE",
                            dataType: "json",
                            contentType: "application/json",
                            headers: {
                                "Authorization": token
                            },
                            async: false,
                            success: function (data) {
                               
                                $("#newsTablePage").DataTable().row('.selected').remove().draw(false);
                                swal("Deleted!", "This news has been deleted.", "success");
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                console.log(textStatus);
                                console.log(errorThrown);
                            }
                       });

                       
                    } else {
                        swal("Cancelled", "This news is safe :)", "error");
                    }
                });

        } else {
            swal("Select one news to delete!");

        }

        
    });

    // handle adding fact to the selected news:
    $("#addFactNews").click(function() {
        var selectedRows = $("#newsTablePage").DataTable().rows( { selected: true }).data();
        if (selectedRows.length == 1){
            newsID = $("#newsTablePage").DataTable().row( { selected: true }).data()["entityID"];
            $("#factInfo").attr("newsID", newsID);
            // console.log($("#factInfo").attr("newsID"));
            $("#addFactModal").modal('toggle');

        } else {
             swal("Select one news!");
        }
    });

    // handle searching entity in add fact to news modal
    $("#searchEntityAddFactModal").click(function (argument) {
        var inputStringSearch = $("#inputTextSearchAddFactModal").val();
        var typeEntity = $("#selectTypeEntityAddFactModal option:selected").text();
        // console.log(typeEntity);

        // if(inputStringSearch != ""){
        //     // fectch data from api: post entity/search
        //     $.ajax({
        //         url: "http://" + host + ":" + port + "/api/news/entity/search",
        //         type: "POST",
        //         dataType: "json",
        //         contentType: "application/json",
        //         headers: {
        //             "Authorization": token
        //         },
        //         data: JSON.stringify({"text": inputStringSearch, "type_entity": typeEntity}),
        //         success: function (data) {
        //             // update data in DataTable
        //
        //             var result = data;
        //             var dataTable = $("#entitySearchAddFactModal").DataTable();
        //             dataTable.clear();
        //             dataTable.rows.add(result);
        //             dataTable.draw();
        //         },
        //         error: function (XMLHttpRequest, textStatus, errorThrown) {
        //             console.log(textStatus);
        //         }
        //    });
        // }
        if(inputStringSearch != ""){

            // send ajax:
            var resource;
            if ( typeEntity== "Country"){
                resource = 'countrie';
            } else {
                resource = typeEntity.toLowerCase();
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
                success: function (data) {
                    // get all result pages and then update data in DataTable

                    var result = data['data'];
                    var next_page = data['next'];
                    // console.log(next_page);
                    var dataTable = $("#entitySearchAddFactModal").DataTable();
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
            if (typeEntity == "Country"){
                resource = 'countrie';
            } else {
                resource = typeEntity.toLowerCase();
            }
            $.ajax({
                url: "http://" + host + ":" + port + "/api/" + resource + "s/",
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "Authorization": token
                },
                success: function (data) {

                     // get all result pages and then update data in DataTable

                    var result = data['data'];
                    var next_page = data['next'];
                    // console.log(next_page);
                    var dataTable = $("#entitySearchAddFactModal").DataTable()
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
                }
           });

        }

        
    });

    // handle add subject, add object, add time, add location
    $("#addSubjectFact").click(function (argument) {
        var selectedRows = $("#entitySearchAddFactModal").DataTable().rows( { selected: true }).data();
        if (selectedRows.length == 1){
            entityID = $("#entitySearchAddFactModal").DataTable().row( { selected: true }).data()["entityID"];
            $("#subjectIDAddFact").val(entityID);
            $("#subjectIDAddFact").attr("entityType", $("#selectTypeEntityAddFactModal option:selected").text());

        } else {
            swal("Select one entity!");
        }
    });

    $("#addObjectFact").click(function (argument) {
        var selectedRows = $("#entitySearchAddFactModal").DataTable().rows( { selected: true }).data();
        if (selectedRows.length == 1){
            entityID = $("#entitySearchAddFactModal").DataTable().row( { selected: true }).data()["entityID"];
            $("#objectIDAddFact").val(entityID);
            $("#objectIDAddFact").attr("entityType", $("#selectTypeEntityAddFactModal option:selected").text());

        } else {
            swal("Select one entity!");
        }
    });
    $("#addTimeFact").click(function (argument) {
        var selectedRows = $("#entitySearchAddFactModal").DataTable().rows( { selected: true }).data();
        if (selectedRows.length == 1){
            entityID = $("#entitySearchAddFactModal").DataTable().row( { selected: true }).data()["entityID"];
            $("#timeIDAddFact").val(entityID);
            $("#timeIDAddFact").attr("entityType", $("#selectTypeEntityAddFactModal option:selected").text());

        } else {
            swal("Select one entity!");
        }
    });
    $("#addLocationFact").click(function (argument) {
        var selectedRows = $("#entitySearchAddFactModal").DataTable().rows( { selected: true }).data();
        if (selectedRows.length == 1){
            entityID = $("#entitySearchAddFactModal").DataTable().row( { selected: true }).data()["entityID"];
            $("#locationIDAddFact").val(entityID);
            $("#locationIDAddFact").attr("entityType", $("#selectTypeEntityAddFactModal option:selected").text());

        } else {
            swal("Select one entity!");
        }
    });

    // handle add fact: clicking add fact button
    $("#addFactToNews").click(function () {
        subID = $("#subjectIDAddFact").val().trim();
        objID = $("#objectIDAddFact").val().trim();
        if(subID != "" && objID != ""){
            subType = $("#subjectIDAddFact").attr("entityType");
            objType = $("#objectIDAddFact").attr("entityType");
            timeID = $("#timeIDAddFact").val().trim();
            timeType = $("#timeIDAddFact").attr("entityType");
            locationID = $("#locationIDAddFact").val().trim();
            locationType = $("#locationIDAddFact").attr("entityType");
            if(locationID == ""){
                locationType = "Location";
            }
            if(timeID == ""){
                timeType = "Time";
            }
            newsID = $("#factInfo").attr("newsID");
            relationType = $("#selectRelationTypeAddFact option:selected").text().trim();
            factID = "fact" + uuidv4();
            // send ajax: add fact to a news:
            $.ajax({
                url: "http://" + host + ":" + port + "/api/news/" + newsID + "/facts",
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "Authorization": token
                },
                data: JSON.stringify({"entityID": factID, "relation": relationType,
                    "time_id": timeID, "time_type": timeType, "location_id": locationID, "location_type": locationType,
                    "subject_id": subID, "subject_type": subType, "object_id": objID, "object_type": objType}),
                async: false,
                success: function (data) {
                    // update data in DataTable
                    swal("Added!", "This fact has been added.", "success");
                },
                error: function (xhr, status, error) {
                    var err = JSON.parse(xhr.responseText);
                    
                    swal("Error!", err.message, "error");
                }
           });


        } else {
            swal("Missing subject relation or object relation!");
        }
        
    });

    
    

    // handle showing detailed facts in  the selected news:
    $("#detailFact").click(function () {
        var selectedRows = $("#newsTablePage").DataTable().rows( { selected: true }).data();
        if (selectedRows.length == 1){
            newsID = $("#newsTablePage").DataTable().row( { selected: true }).data()["entityID"];

            // send ajax: get detailed facts in a news:
            $.ajax({
                    url: "http://" + host + ":" + port + "/api/news/" + newsID + "/facts",
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json",
                    headers: {
                        "Authorization": token
                    },
                    async: false,
                    success: function (data) {
                       var result = data;
                       // console.log(data);
                       var dataTable = $("#factDetailDataTable").DataTable();
                       dataTable.clear();
                       dataTable.rows.add(result);
                       dataTable.draw();
                       // show modal:
                       $("#detailFactNewsModal").modal('toggle');

                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log(textStatus);
                        console.log(errorThrown);
                    }
               });

        } else {
            swal("Select one news!");
        }
        
    });

    // handle delete a fact in a news:
    $("#deleteFactNews").click(function () {
        var selectedRows = $("#factDetailDataTable").DataTable().rows( { selected: true }).data();

        if (selectedRows.length > 0){

            var factID = $("#factDetailDataTable").DataTable().row(".selected").data()["factID"];
            // console.log(factID);
            // send ajax: delete a fact in the selected news:

            $.ajax({
                    url: "http://" + host + ":" + port + "/api/news/" + newsID + "/facts/" + factID,
                    type: "DELETE",
                    dataType: "json",
                    contentType: "application/json",
                    headers: {
                        "Authorization": token
                    },
                    async: false,
                    success: function (data) {
                       var result = data;
                       $("#factDetailDataTable").DataTable().row(".selected").remove().draw();
                       swal("Deleted!", "This fact has been deleted.", "success");

                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log(textStatus);
                        console.log(errorThrown);
                    }
               });
        } else {
            swal("Select one fact to delete!");
        }
    });



});