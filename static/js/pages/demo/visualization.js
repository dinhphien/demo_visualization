
const host = "192.168.99.1"
const port = "8888"
var neo4jd3;
var jsonData = {
    "results": [{
        "columns": [],
        "data": [{
            "graph": {
                "nodes": [
                {
                    "id": "6",
                    "labels": ["Device"],
                    "properties": {
                        "value": "eisman"
                    }
                }, 
                 {
                    "id": "17",
                    "labels": ["Language"],
                    "properties": {
                        "lang": "en_us"
                    }
                }, {
                    "id": "18",
                    "labels": ["Cookie"],
                    "properties": {
                        "value": "itgnxe0xmvb1tazaqmkpmfzg8m3ma62qskfwcexc"
                    }
                }, {
                    "id": "19",
                    "labels": ["Ip"],
                    "properties": {
                        "address": "127.0.0.1"
                    }
                },
                {
                    "id": "21",
                    "labels": ["zoomIn"],
                    "properties": {
                        "description": "Scroll up to zoom in.",
                        "type": "function"
                    }
                }, {
                    "id": "22",
                    "labels": ["zoomOut"],
                    "properties": {
                        "description": "Scroll down to zoom out.",
                        "type": "function"
                    }
                },
                 {
                    "id": "24",
                    "labels": ["Api"],
                    "properties": {}
                }, 
                ],
                "relationships": [
               
                {
                    "id": "18",
                    "type": "HAS_LANGUAGE",
                    "startNode": "6",
                    "endNode": "17",
                    "properties": {}
                }, {
                    "id": "19",
                    "type": "HAS_COOKIE",
                    "startNode": "6",
                    "endNode": "18",
                    "properties": {}
                }, {
                    "id": "20",
                    "type": "HAS_IP",
                    "startNode": "6",
                    "endNode": "19",
                    "properties": {}
                },
                {
                    "id": "22",
                    "type": "ZOOM_IN",
                    "startNode": "24",
                    "endNode": "21",
                    "properties": {}
                }, {
                    "id": "23",
                    "type": "ZOOM_OUT",
                    "startNode": "24",
                    "endNode": "22",
                    "properties": {}
                }, 
                ]
            }
        }]
    }],
    "errors": []
};

var config_neo4jd3 = {
    highlight: [
        {
            class: 'Fact',
        }, {
            class: 'News',
        }
    ],
    icons: {

    },
    minCollision: 60,
    neo4jData: jsonData,
    nodeRadius: 30,
    onNodeClick : function(node){
        console.log(node)
        console.log(neo4jd3)
    },
    onNodeDoubleClick: function(node) {

        // switch(node.id) {
        //     case '25':
        //         // Google
        //         window.open(node.properties.url, '_blank');
        //         break;
        //     default:
        //         var maxNodes = 5,
        //             data = neo4jd3.randomD3Data(node, maxNodes);
        //         neo4jd3.updateWithD3Data(data);
        //         break;
        // }
    },
    onRelationshipDoubleClick: function(relationship) {
        console.log('double click on relationship: ' + JSON.stringify(relationship));
    },
    zoomFit: false
};

var newsdataTableConfig = {
    columns: [
            { "data": "entityID" },
            { "data": "link" },
            { "data": "topics" },
    ],
    responsive: true,
    select: {
        style:    'multi',
        selector: 'td'
    },
    "oLanguage": {
       "sSearch": "Filter"
    },
     "ordering": false,
    "pageLength": 5

};
var entitydataTableConfig = {
     columns: [
            { "data": "entityID" },
            { "data": "name" },
            { "data": "description" },
    ],
    responsive: true,
    select: {
        style:    'single',
        selector: 'td'
    },
    "oLanguage": {
       "sSearch": "Filter"
     },
     "ordering": false,
    "pageLength": 5

};

$(document).ready(function () {

    // get user name and token:
    var username = window.localStorage.getItem('username');
    var token =  window.localStorage.getItem('token');

    if (token == null){
        // redirect login
        // window.location.replace("file:///home/phien/neo4j_Demo/AdminBSBMaterialDesign/pages/examples/sign-in.html");
        window.location.replace("/login");
        // window.location.href = "/login";
    }

    // handle log out action 
    $("#logout").click(function () {

        // delete local storage 
        window.localStorage.clear();

        // redirect to log in
        window.location.replace("/login");
        // window.location.href = "/login"

    });


    neo4jd3 = new Neo4jd3("#neo4jd3", config_neo4jd3);
    
    $('#newsDataTable').DataTable(newsdataTableConfig);
    $('#entityDataTable').DataTable(entitydataTableConfig);

    ////////////////////handle visualizing news////////////////////////////////////////////////////////

    //handle event: typing on the input IDs news field
    $("#inputNewsIDNewsTab").click(function () {

        // hide the error message
        $("#newsIDInputError").hide()
    });

    //handle event: select entity types -> set input IDs entity to null
    $("#selectEntityTypesNewsTab").change(function () {
        $("#inputEntityIDNewsTab").val("")
    })

    //handle event: typing on input ID entity -> set select entity types to null
    $("#inputEntityIDNewsTab").click(function () {
        $("#selectEntityTypesNewsTab").prev().find('li.selected').removeClass("selected")
        $("#selectEntityTypesNewsTab").val([]).trigger('change')
    })

    /////////////////////////handle clicking the search IDs news button ////////////////////////////
    $("#newsSearchButton").click(function () {
        var inputStringSearch = $("#inputTextSearchNews").val();
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
                    var dataTable = $("#newsDataTable").DataTable();
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

        }else {
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
                    var dataTable = $("#newsDataTable").DataTable();
                    console.log(next_page);
                    console.log("phien")
                    // async function getAllNews(){
                    //     // console.log(next_page);
                    //     while(next_page !== null){
                    //         data = await $.ajax({
                    //             url: next_page,
                    //             type: "GET",
                    //             dataType: "json",
                    //             contentType: "application/json",
                    //             headers: {
                    //                 "Authorization": token
                    //             },
                    //         });
                    //         console.log(data);
                    //         next_page = data['next'];
                    //         Array.prototype.push.apply(result, data['data']);
                    //     }
                    //     console.log(result);
                    //
                    // }
                    // getAllNews();
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
                        console.log('next');
                    }
                    dataTable.clear();
                    dataTable.rows.add(result);
                    dataTable.draw();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log(textStatus);
                    console.log(XMLHttpRequest.status);
                    // console.log(XMLHttpRequest);
                    if (errorThrown == "UNAUTHORIZED"){
                        window.location.replace("/login");
                    }
                }
           });

        }
    })
    $("#newsSearchButton").trigger('click');

    // handle selecting rows in news dataTable
    $("#selectNewsDataTable").click(function () {
        // get selected rows:
        var selectedRows = $("#newsDataTable").DataTable().rows( { selected: true }).data();
        if(selectedRows.length > 0){

            var selectedNewsIDs = "";
            for (i=0; i< selectedRows.length; i++){
                selectedNewsIDs = selectedNewsIDs + selectedRows[i]["entityID"] + ", " ;
            }
            console.log(selectedNewsIDs);
            // change input News IDs tab:
            $("#inputNewsIDNewsTab").val(selectedNewsIDs);
            // deselect choosing rows:
            $("#newsDataTable").DataTable().rows( { selected: true }).deselect();
        }
        // hide modal:
        $("#newsModal").modal('toggle');
             
    })




    // handle event: clicking entity search button:
    $("#entitySearchButton").click(function () {
        var inputStringSearch = $("#inputTextSearchEntity").val();
        var typeEntity = $("#selectEntityTypeSearchEntity option:selected").text();

        if(inputStringSearch != ""){
            // send ajax:
            var resource;
            if (typeEntity == "Country"){
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
    });
    $("#entitySearchButton").trigger('click');

    // handle selecting row in entity search datatable:
    $("#selectEntityDataTable").click(function () {
        // get the selected row:
        var selectedRows = $("#entityDataTable").DataTable().rows( { selected: true }).data();
        if(selectedRows.length > 0){

             // change input News IDs tab:
            $("#inputEntityIDNewsTab").val(selectedRows[0]["entityID"]);
            // deselect choosing rows:
            $("#entityDataTable").DataTable().rows( { selected: true }).deselect();

        }

        // hide modal:
        $("#entityModal").modal('toggle');

    });


    // handle event: clicking the visualize button on the news tab
    $("#visualizeNewsTabButton").click(function (argument) {
        
        // check whether or not IDs news input is already filled
        if($("#inputNewsIDNewsTab").val().trim()== ""){

            // show the error message
            $("#newsIDInputError").show()
        } else {

            // get input values:
            newsIDs = $("#inputNewsIDNewsTab").val().split(',')
            for (i=0; i < newsIDs.length; i++){
                newsIDs[i] = newsIDs[i].trim();
            }
            
            entityTypes = $("#selectEntityTypesNewsTab").val()
            entityID = $("#inputEntityIDNewsTab").val().trim()

            // fetch data from ajax:
            if (entityTypes == null && entityID == ""){
                //entity types and entity id are not null

                if(newsIDs.length == 1){

                    // using api: get all entities and their relationships in a news
                    $.ajax({
                        url : "http://" + host + ":" + port + "/api/news/" + newsIDs + "/relations",
                        type: "GET",
                        dataType: "json",
                        contentType: "application/json",
                        headers: {
                            "Authorization": token
                        },
                        success: function (data) {
                            // update neo4jd3 graph
                            var result = data;
                            console.log(result);
                            neo4jd3.updateNeo4jData(result);
                            
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            console.log(textStatus);
                            console.log(errorThrown);
                        }
                   });


                    


                } else {

                    // using api: get all entities and their relationships in a set of news
                   $.ajax({
                        url: "http://" + host + ":" + port + "/api/news/relations",
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        headers: {
                            "Authorization": token
                        },
                        data: JSON.stringify({"set_news_id": newsIDs}),
                        success: function (data) {
                            var result = data;
                            neo4jd3.updateNeo4jData(result);
                            
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            console.log(textStatus);
                            console.log(errorThrown);
                        }
                   });
                }

            } else if (entityTypes != null){
                // entitytypes is not null

                if(newsIDs.length == 1){

                    // using api: get all entities belong to specific types and their relations in a news
                    $.ajax({
                        url: "http://" + host + ":" + port + "/api/news/" + newsIDs + "/type/relations",
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        headers: {
                            "Authorization": token
                        },
                        data: JSON.stringify({"set_entity_types": entityTypes}),
                        success: function (data) {
                            var result = data;
                            // console.log(result);
                            neo4jd3.updateNeo4jData(result);

                            
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            console.log(textStatus);
                        }
                   });


                } else {

                    // using api: get all entities belong to specific types and their relations in a set of news
                    $.ajax({
                        url: "http://" + host + ":" + port + "/api/news/type/relations",
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        headers: {
                            "Authorization": token
                        },
                        data: JSON.stringify({"set_entity_types": entityTypes, "set_news_id": newsIDs}),
                        success: function (data) {
                            var result = data;
                            // console.log(result);
                            neo4jd3.updateNeo4jData(result);

                            
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            console.log(textStatus);
                        }
                   });


                }


            } else {
                // entity ID is not null

                if(newsIDs.length == 1){

                    // using api: get a specific entity and its relationships in a news
                    $.ajax({
                        url: "http://" + host + ":" + port + "/api/news/" + newsIDs +"/entity/" + entityID +"/relations",
                        type: "GET",
                        dataType: "json",
                        contentType: "application/json",
                        headers: {
                            "Authorization": token
                        },
                        success: function (data) {
                            var result = data;
                            // console.log(result);
                            neo4jd3.updateNeo4jData(result);

                            
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            console.log(textStatus);
                        }
                   });


                } else {

                    // using api: get a specific entity and its relationships in a set of news
                    $.ajax({
                        url: "http://" + host + ":" + port + "/api/news/entity/" + entityID +"/relations",
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        headers: {
                            "Authorization": token
                        },
                        data: JSON.stringify({"set_news_id": newsIDs}),
                        success: function (data) {
                            var result = data;
                            // console.log(result);
                            neo4jd3.updateNeo4jData(result);

                            
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            console.log(textStatus);
                        }
                   });


                }


            }

        }
       
    });

    ///////////////////////////// handle visualizing entity tab ///////////////////////////////////////


    // handle event: clicking the visualize button on the entity tab
    $("#visualizeEntityTabButton").click(function (argument) {
        entityIDs = $("inputEntityIDEntityTab")
        newsTopics = $("#selectNewsTopicsEntityTab").val()
        newsIDs = $("#inputNewsIDEntityTab")
        alert("successful entity");
    });
    
});
